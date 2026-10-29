"""Traces the part library from MarathonDB weapon renders: python3 tools/trace/trace.py <renders folder>

The renders are not part of this repository. The folder should hold one sub-folder per weapon with the
transparent PNG/WebP renders named in config.json. The script flips each render so the muzzle points
right, rotates it level, cuts it into the parts listed in config.json, simplifies each outline to a
polygon, keeps the long straight panel lines inside it, finds its largest flat rectangle (the decal
position) and writes src/data/traced-shapes.js. A frame's `dark` block is everything below its belly line.
With --preview <folder> it also saves an overlay per weapon.
Needs numpy, opencv-python-headless and Pillow.
"""
import argparse, json, os
import numpy as np, cv2
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))


def load_render(folder, spec):
    """RGBA array of the render: flipped (muzzle right), rotated level, cropped to the weapon."""
    im = Image.open(os.path.join(folder, spec["file"])).convert("RGBA")
    if im.width < 1600: im = im.resize((1600, 800), Image.LANCZOS)
    im = np.array(im.transpose(Image.FLIP_LEFT_RIGHT))
    mask = im[:, :, 3] > 60
    angle = spec.get("angle")
    if angle is None:
        # Level the top edge of the middle 60% of the weapon.
        ys, xs = np.nonzero(mask); x0, x1 = xs.min(), xs.max()
        cols = np.arange(int(x0 + 0.2 * (x1 - x0)), int(x1 - 0.2 * (x1 - x0)))
        tops = np.array([np.nonzero(mask[:, c])[0].min() if mask[:, c].any() else np.nan for c in cols])
        ok = ~np.isnan(tops)
        angle = float(np.degrees(np.arctan(np.polyfit(cols[ok], tops[ok], 1)[0])))
    M = cv2.getRotationMatrix2D((800, 400), angle, 1.0)
    im = cv2.warpAffine(im, M, (1600, 800), flags=cv2.INTER_LINEAR, borderValue=(0, 0, 0, 0))
    ys, xs = np.nonzero(im[:, :, 3] > 60)
    return im[ys.min():ys.max() + 1, xs.min():xs.max() + 1]


def poly_mask(shape, r):
    pts = r if isinstance(r[0], list) else [[r[0], r[1]], [r[2], r[1]], [r[2], r[3]], [r[0], r[3]]]
    m = np.zeros(shape, np.uint8)
    cv2.fillPoly(m, [np.array(pts, np.int32)], 1)
    return m.astype(bool)


def clean(m, close=5, min_frac=0.03, hole_min=600):
    """Close small gaps, drop specks, fill pin holes (keep real openings such as trigger guards)."""
    m = m.astype(np.uint8)
    if close: m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((close, close), np.uint8))
    n, lab, stats, _ = cv2.connectedComponentsWithStats(m, 8)
    if n <= 1: return m.astype(bool)
    areas = stats[1:, cv2.CC_STAT_AREA]
    keep = np.isin(lab, [i + 1 for i, a in enumerate(areas) if a >= min_frac * areas.max()]).astype(np.uint8)
    n, lab, stats, _ = cv2.connectedComponentsWithStats(1 - keep, 4)
    for i in range(1, n):
        x, y, w, h, a = stats[i]
        if not (x == 0 or y == 0 or x + w >= m.shape[1] or y + h >= m.shape[0]) and a < hole_min: keep[lab == i] = 1
    return keep.astype(bool)


def smooth(m, k=7):
    """Rounds off the stair steps and anti-aliasing fuzz of the render's edge before tracing."""
    return cv2.GaussianBlur(m.astype(np.float32), (k, k), 0) > 0.5


def zones(m, count=1, min_frac=0.3):
    """Largest axis-aligned rectangles inside a part (decal areas): [[x, y, w, h], ...] in pixels."""
    free, out = m.copy(), []
    for _ in range(count):
        best, hgt = (0, 0, 0, 0, 0), np.zeros(free.shape[1], int)
        for y in range(free.shape[0]):
            hgt = np.where(free[y], hgt + 1, 0)
            stack = []  # largest rectangle in a histogram, row by row
            for x in range(len(hgt) + 1):
                h = hgt[x] if x < len(hgt) else 0
                start = x
                while stack and stack[-1][1] >= h:
                    start, sh = stack.pop()
                    if sh * (x - start) > best[0]: best = (sh * (x - start), start, y - sh + 1, x - start, sh)
                stack.append((start, h))
        a, x, y, w, h = best
        if not a or (out and a < min_frac * out[0][2] * out[0][3]): break
        out.append([x, y, w, h])
        free[max(0, y - 4):y + h + 4, max(0, x - 4):x + w + 4] = False
    return out


def signed_area(p):
    return 0.5 * sum(p[i][0] * p[(i + 1) % len(p)][1] - p[(i + 1) % len(p)][0] * p[i][1] for i in range(len(p)))


def outlines(m, eps, hole_min):
    """Simplified polygons. Outlines run clockwise and holes anticlockwise, so holes stay open under the nonzero rule."""
    cs, hier = cv2.findContours(smooth(m).astype(np.uint8), cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
    out = []
    for c, h in zip(cs, hier[0] if hier is not None else []):
        hole = h[3] != -1
        if cv2.contourArea(c) < (hole_min if hole else 150): continue
        p = cv2.approxPolyDP(c, eps, True)[:, 0, :].astype(float).tolist()
        if len(p) < 3: continue
        if (signed_area(p) < 0) != hole: p = p[::-1]
        out.append(p)
    return out


def to_path(polys, ox, oy, s, closed=True):
    f = lambda v: f"{round(v, 1):g}"
    return "".join("M" + "L".join(f"{f((x - ox) * s)} {f((y - oy) * s)}" for x, y in p) + ("Z" if closed else "") for p in polys)


def edge_map(rgba):
    """Strong edges inside the render (panel lines, steps between surfaces), with fine texture smoothed away first."""
    g = cv2.bilateralFilter(cv2.cvtColor(np.ascontiguousarray(rgba[..., :3]), cv2.COLOR_RGB2GRAY), 9, 40, 9)
    return cv2.Canny(g, 40, 110)


def panel_lines(edges, m, eps=2.5):
    """Long, mostly straight edge runs inside a part. Short or wiggly runs (printed text, skin artwork) are dropped."""
    e = edges.copy()
    e[~cv2.erode(m.astype(np.uint8), np.ones((11, 11), np.uint8)).astype(bool)] = 0
    cs, _ = cv2.findContours(e, cv2.RETR_LIST, cv2.CHAIN_APPROX_NONE)
    out = []
    for c in cs:
        if cv2.arcLength(c, False) < 90: continue
        p = cv2.approxPolyDP(c, eps, False)[:, 0, :].astype(float)
        x, y, w, h = cv2.boundingRect(p.astype(np.int32))
        seg = np.hypot(*np.diff(p, axis=0).T)
        if max(w, h) < 50 or len(p) > 14 or seg.mean() < 14: continue
        out.append(p.tolist())
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("renders")
    ap.add_argument("--preview")
    args = ap.parse_args()
    cfg = json.load(open(os.path.join(HERE, "config.json")))
    out = {k: {} for k in ("frame", "barrel", "magazine", "optic", "grip", "stock")}
    for key, c in cfg["weapons"].items():
        rgba = load_render(args.renders, cfg["renders"][c["src"]])
        H, W = rgba.shape[:2]
        hm, eps, s = c.get("hole_min", 500), c.get("eps", 2.2), c["len"] / W
        sil = clean(rgba[..., 3] > 110, close=5, min_frac=0.01, hole_min=hm)
        drop = np.zeros((H, W), bool)
        for r in c.get("drop", []): drop |= poly_mask((H, W), r)
        used, regions = drop.copy(), {}
        for pid, r in c.get("parts", {}).items():
            pm = poly_mask((H, W), r["poly"])
            regions[pid] = clean(pm & sil & ~drop, close=3, min_frac=0.05, hole_min=hm)
            used |= pm
        frame = clean(sil & ~used, close=3, min_frac=0.05, hole_min=hm)
        edges = edge_map(rgba)

        def build(m, ox, oy, belly=None, count=1):
            d = {"base": to_path(outlines(m, eps, hm), ox, oy, s), "lines": to_path(panel_lines(edges, m), ox, oy, s, closed=False)}
            top = m.copy()
            if belly is not None:
                # Everything below the receiver's belly line (grip, trigger guard, lower housing) is the dark polymer block.
                low = m.copy(); low[:belly] = False; top[belly:] = False
                d["dark"] = to_path(outlines(clean(low, close=0, min_frac=0.02, hole_min=hm), eps, hm), ox, oy, s)
            # Decal areas: found on a quarter-size copy shrunk away from the edges, so decals keep a margin.
            q = cv2.erode(top.astype(np.uint8), np.ones((9, 9), np.uint8))[::4, ::4].astype(bool)
            d["zones"] = [[round((4 * x - ox) * s, 1), round((4 * y - oy) * s, 1), round(4 * w * s, 1), round(4 * h * s, 1)] for x, y, w, h in zones(q, count)]
            return d
        sc = lambda v: round(v * s, 1)
        if c.get("frame"):
            ys, xs = np.nonzero(frame); fx, fy = xs.min(), ys.min()
            fr = build(frame, fx, fy, c.get("belly"), count=2)
            fr["sockets"] = {n: None if p is None else [sc(p[0] - fx), sc(p[1] - fy)] + ([sc(p[2])] if len(p) > 2 else []) for n, p in c["sockets"].items()}
            out["frame"][c["frame"]] = fr
        for pid, r in c.get("parts", {}).items():
            p = build(regions[pid], *r["origin"])
            if "tip" in r: p["tip"] = sc(r["tip"])
            if "under" in r: p["under"] = None if r["under"] is None else [sc(v) for v in r["under"]]
            out[r["slot"]][pid] = p

        if args.preview:
            os.makedirs(args.preview, exist_ok=True)
            bg = Image.new("RGBA", (W, H), (40, 40, 40, 255)); bg.alpha_composite(Image.fromarray(rgba))
            bg = Image.blend(bg, Image.new("RGBA", (W, H), (40, 40, 40, 255)), 0.55)
            d = ImageDraw.Draw(bg)
            col = {"frame": (232, 230, 223), "barrel": (194, 254, 11), "magazine": (255, 85, 0), "optic": (1, 255, 255), "stock": (234, 2, 126), "grip": (120, 90, 255)}
            for slot, m in [("frame", frame)] * bool(c.get("frame")) + [(c["parts"][k]["slot"], m) for k, m in regions.items()]:
                for p in outlines(m, eps, hm): d.line([tuple(q) for q in p + p[:1]], fill=col[slot], width=3)
            bg.convert("RGB").save(os.path.join(args.preview, f"{key}.png"))

    js = os.path.join(ROOT, "src", "data", "traced-shapes.js")
    with open(js, "w") as f:
        f.write("// Generated by tools/trace/trace.py from MarathonDB weapon renders (the renders are not included).\n")
        f.write("// Outlines and panel lines are simplified polygons in bench units; a frame's `dark` block is its lower housing below the belly line;\n// `zones` are decal positions [x, y, w, h]. Do not edit by hand.\n")
        f.write("export const TRACED = " + json.dumps(out, separators=(",", ":")).replace('},"', '},\n"') + ";\n")
    print("wrote", os.path.relpath(js, ROOT), sum(len(v) for v in out.values()), "shapes")


if __name__ == "__main__":
    main()

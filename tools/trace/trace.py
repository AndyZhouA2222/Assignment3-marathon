"""Traces the part library from MarathonDB weapon renders: python3 tools/trace/trace.py <renders folder>

The renders are not part of this repository. The folder should hold one sub-folder per weapon with its
transparent `*full.webp` skin renders; config.json names the one each weapon is cut from. The script flips
that render so the muzzle points right, rotates it level, cuts it into the parts listed in config.json,
simplifies each outline to a polygon, finds its largest flat rectangle (the decal position) and writes
src/data/traced-shapes.js. A frame's `dark` block is everything below its belly line.
Light and shadow come from all the skins of the weapon together, with the paint taken out (see `shading`),
and are saved per part as a small greyscale light map in assets/light/, which the bench lays over the
chosen paint, so the parts keep the bevels and recesses of the real models.
With --preview <folder> it also saves the shading and part outlines per weapon.
Needs numpy, opencv-python-headless and Pillow.
"""
import argparse, json, os
import numpy as np, cv2
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
LIGHT_DIR = os.path.join(ROOT, "assets", "light")


def open_rgba(folder, file):
    im = Image.open(os.path.join(folder, file)).convert("RGBA")
    if im.width < 1600: im = im.resize((1600, 800), Image.LANCZOS)
    return np.array(im)


def bbox(m):
    ys, xs = np.nonzero(m)
    return ys.min(), ys.max() + 1, xs.min(), xs.max() + 1


def register(ref, im):
    """Warps another skin's render onto the reference render (same weapon, same camera, slightly different framing)."""
    y0, y1, x0, x1 = bbox(ref[..., 3] > 110)
    b = bbox(im[..., 3] > 110)
    out = np.zeros_like(ref)
    out[y0:y1, x0:x1] = cv2.resize(im[b[0]:b[1], b[2]:b[3]], (x1 - x0, y1 - y0), interpolation=cv2.INTER_AREA)
    a, c = [cv2.GaussianBlur((x[..., 3] > 110).astype(np.float32), (0, 0), 3) for x in (ref, out)]
    M = np.eye(2, 3, dtype=np.float32)
    try: _, M = cv2.findTransformECC(a, c, M, cv2.MOTION_AFFINE, (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 200, 1e-6), None, 5)
    except cv2.error: pass
    out = cv2.warpAffine(out, M, (ref.shape[1], ref.shape[0]), flags=cv2.INTER_LINEAR + cv2.WARP_INVERSE_MAP, borderValue=(0, 0, 0, 0))
    m, r = out[..., 3] > 110, ref[..., 3] > 110
    return out, (m & r).sum() / (m | r).sum()


def poisson(gx, gy):
    """Image whose gradient best matches (gx, gy): solves the Poisson equation with a cosine transform."""
    H, W = gx.shape
    f = np.zeros((H + H % 2, W + W % 2))  # cv2.dct wants even sizes
    f[:H, :W] = gx - np.pad(gx, ((0, 0), (1, 0)))[:, :W] + gy - np.pad(gy, ((1, 0), (0, 0)))[:H]
    ky, kx = [np.cos(np.pi * np.arange(n) / n) for n in f.shape]
    den = 2 * kx[None, :] + 2 * ky[:, None] - 4
    den[0, 0] = 1
    F = cv2.dct(f) / den
    F[0, 0] = 0
    return cv2.idct(F)[:H, :W]


def shading(folder, file, ref, min_iou=0.93):
    """Light and shadow on the weapon's surfaces (0 dark .. 1 light) with the paint taken out.
    Every skin of a weapon is rendered from the same camera under the same light; only the paint and the printed
    artwork change. So the edges in the median of the skins' lightness gradients are the edges of the shape's
    shading, and integrating them gives the shading alone (Weiss, "Deriving intrinsic images from image sequences", 2001)."""
    m = ref[..., 3] > 110
    skins = [ref]
    for f in sorted(os.listdir(os.path.join(folder, os.path.dirname(file)))):
        if not f.endswith("full.webp") or f == os.path.basename(file): continue
        im = open_rgba(folder, os.path.join(os.path.dirname(file), f))
        if (im[..., 3] > 110).sum() < 1000: continue
        im, iou = register(ref, im)
        if iou >= min_iou: skins.append(im)
    gx, gy = [], []
    for im in skins:
        L = cv2.cvtColor(np.ascontiguousarray(im[..., :3]), cv2.COLOR_RGB2LAB)[..., 0].astype(np.float32) / 255
        lg = np.log(np.maximum(cv2.bilateralFilter(L, 5, 0.05, 3), 0.03)).astype(np.float64)
        gx.append(np.diff(lg, axis=1, append=lg[:, -1:])); gy.append(np.diff(lg, axis=0, append=lg[-1:]))
    gx, gy = np.median(gx, 0), np.median(gy, 0)
    gx[~(m & np.roll(m, -1, 1))] = 0; gy[~(m & np.roll(m, -1, 0))] = 0  # nothing flows across the silhouette
    u = poisson(gx, gy)
    # Take out the slow drift that integration leaves across a long weapon, keeping the shading of each surface.
    fm = m.astype(np.float64)
    u -= 0.8 * cv2.GaussianBlur(u * fm, (0, 0), 40) / np.maximum(cv2.GaussianBlur(fm, (0, 0), 40), 1e-6)
    lo, hi = np.percentile(u[m], [2, 98])
    S = np.clip((u - lo) / (hi - lo), 0, 1).astype(np.float32)
    for _ in range(2): S = cv2.bilateralFilter(S, 7, 0.08, 3)  # smooth the grain, keep the edges between surfaces
    S[~m] = 0
    return S, len(skins)


def load_render(folder, spec):
    """The render flipped (muzzle right), rotated level and cropped to the weapon: (RGBA array, shading array, skin count)."""
    raw = open_rgba(folder, spec["file"])
    shade, n = shading(folder, spec["file"], raw)
    im, shade = raw[:, ::-1].copy(), shade[:, ::-1].copy()
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
    shade = cv2.warpAffine(shade, M, (1600, 800), flags=cv2.INTER_LINEAR, borderValue=0)
    y0, y1, x0, x1 = bbox(im[:, :, 3] > 60)
    return im[y0:y1, x0:x1], shade[y0:y1, x0:x1], n


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


LIGHT_SCALE = 2  # light map pixels per bench unit, about the resolution of the renders


def light_map(shade, m, ox, oy, s, path):
    """Saves the shading of one part as a greyscale WebP and returns where it sits, [x, y, w, h] in bench units.
    Values just outside the part are spread outwards so the edge does not pick up a dark fringe when scaled."""
    y0, y1, x0, x1 = bbox(m)
    y0, x0 = max(0, y0 - 4), max(0, x0 - 4)
    y1, x1 = min(m.shape[0], y1 + 4), min(m.shape[1], x1 + 4)
    S, w = shade[y0:y1, x0:x1].astype(np.float32), m[y0:y1, x0:x1].astype(np.float32)
    filled = cv2.GaussianBlur(S * w, (0, 0), 3) / np.maximum(cv2.GaussianBlur(w, (0, 0), 3), 1e-3)
    S = np.where(w > 0, S, filled)
    size = (max(1, round((x1 - x0) * s * LIGHT_SCALE)), max(1, round((y1 - y0) * s * LIGHT_SCALE)))
    g = cv2.resize(S, size, interpolation=cv2.INTER_AREA)
    Image.fromarray((np.clip(g, 0, 1) * 255).astype(np.uint8)).save(path, quality=82, method=6)
    return [round((x0 - ox) * s, 1), round((y0 - oy) * s, 1), round((x1 - x0) * s, 1), round((y1 - y0) * s, 1)]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("renders")
    ap.add_argument("--preview")
    args = ap.parse_args()
    cfg = json.load(open(os.path.join(HERE, "config.json")))
    out = {k: {} for k in ("frame", "barrel", "magazine", "optic", "grip", "stock")}
    os.makedirs(LIGHT_DIR, exist_ok=True)
    for key, c in cfg["weapons"].items():
        rgba, shade, skins = load_render(args.renders, cfg["renders"][c["src"]])
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
        print(f"{key}: shading from {skins} skin{'s' * (skins > 1)}")

        def build(m, ox, oy, name, belly=None, count=1):
            d = {"base": to_path(outlines(m, eps, hm), ox, oy, s), "light": light_map(shade, m, ox, oy, s, os.path.join(LIGHT_DIR, f"{name}.webp"))}
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
            fr = build(frame, fx, fy, f"frame-{c['frame']}", c.get("belly"), count=2)
            fr["sockets"] = {n: None if p is None else [sc(p[0] - fx), sc(p[1] - fy)] + ([sc(p[2])] if len(p) > 2 else []) for n, p in c["sockets"].items()}
            out["frame"][c["frame"]] = fr
        for pid, r in c.get("parts", {}).items():
            p = build(regions[pid], *r["origin"], f"{r['slot']}-{pid}")
            if "tip" in r: p["tip"] = sc(r["tip"])
            if "under" in r: p["under"] = None if r["under"] is None else [sc(v) for v in r["under"]]
            out[r["slot"]][pid] = p

        if args.preview:
            os.makedirs(args.preview, exist_ok=True)
            g = (40 + 200 * shade).astype(np.uint8); g[~sil] = 40
            bg = Image.fromarray(np.dstack([g, g, g, np.full_like(g, 255)]))
            d = ImageDraw.Draw(bg)
            col = {"frame": (232, 230, 223), "barrel": (194, 254, 11), "magazine": (255, 85, 0), "optic": (1, 255, 255), "stock": (234, 2, 126), "grip": (120, 90, 255)}
            for slot, m in [("frame", frame)] * bool(c.get("frame")) + [(c["parts"][k]["slot"], m) for k, m in regions.items()]:
                for p in outlines(m, eps, hm): d.line([tuple(q) for q in p + p[:1]], fill=col[slot], width=3)
            bg.convert("RGB").save(os.path.join(args.preview, f"{key}.png"))

    js = os.path.join(ROOT, "src", "data", "traced-shapes.js")
    with open(js, "w") as f:
        f.write("// Generated by tools/trace/trace.py from MarathonDB weapon renders (the renders are not included).\n")
        f.write("// Outlines are simplified polygons in bench units; a frame's `dark` block is its lower housing below the belly line;\n// `light` is where the part's light map (assets/light/<slot>-<id>.webp) sits, [x, y, w, h]; `zones` are decal positions [x, y, w, h].\n// Do not edit by hand.\n")
        f.write("export const TRACED = " + json.dumps(out, separators=(",", ":")).replace('},"', '},\n"') + ";\n")
    print("wrote", os.path.relpath(js, ROOT), sum(len(v) for v in out.values()), "shapes")


if __name__ == "__main__":
    main()

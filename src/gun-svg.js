// Builds the SVG markup of an assembled gun: bare metal underneath, paint and decals on top
// (worn away by a noise mask), soft shading, part seams, grime and scratches. Returns strings, so it can be
// used for the bench, the range and the part thumbnails alike.
import { part } from "./parts.js";
import { make, textVariant, binarize, PALETTES } from "./lib/decal-kit.js";

export const FINISHES = {
  bone: { label: "Bone", p: "#E8E6DF", s: "#2B2B2B", a: "#C2FE0B", line: "rgba(10,10,10,.42)" },
  carbon: { label: "Carbon", p: "#2A2A2A", s: "#141414", a: "#C2FE0B", line: "rgba(255,255,255,.16)" },
  acid: { label: "Acid", p: "#C2FE0B", s: "#1C1C1C", a: "#0A0A0A", line: "rgba(10,10,10,.45)" },
  signal: { label: "Signal", p: "#FF5500", s: "#1E1E1E", a: "#F7F7F2", line: "rgba(10,10,10,.4)" },
};
const FIXED = { m: "#5F605C", k: "#0E0E0E", g: "#121A22" };
const METAL = "#77786F";
const SEAM = "rgba(8,8,8,.9)"; // outline round every part, so parts read as separate pieces
// Light from above: each part gets a soft highlight on top and a shadow underneath.
const shadeDef = id => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/>` +
  `<stop offset=".35" stop-color="#fff" stop-opacity="0"/><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>`;
export const DECAL_TINTS = ["#F7F7F2", "#0A0A0A", "#C2FE0B", "#FF5500", "#EA027E", "#3601FB", "#01FFFF"];

const ORDER = ["stock", "magazine", "grip", "barrel", "frame", "optic"];

/** Where each attached part sits, plus the open sockets and key points (muzzle tip, trigger). */
export function layout(build) {
  const frame = part("frame", build.frame);
  if (!frame) return { placed: [], sockets: [], tip: null, trigger: null, port: null };
  const S = frame.sockets, barrel = part("barrel", build.barrel);
  const at = {
    frame: [0, 0],
    barrel: S.muzzle,
    magazine: S.mag,
    optic: [S.rail[0] + S.rail[2] / 2, S.rail[1]],
    stock: S.stock,
    grip: barrel?.under ? [S.muzzle[0] + barrel.under[0], S.muzzle[1] + barrel.under[1]] : null,
  };
  const placed = ORDER.filter(slot => build[slot] && at[slot]).map(slot => {
    const p = part(slot, build[slot]);
    return { slot, part: p, x: at[slot][0], y: at[slot][1], shape: slot === "optic" ? p.draw(S.rail[2]) : p.draw() };
  });
  const sockets = ["barrel", "magazine", "optic", "grip", "stock"].filter(s => !build[s] && at[s]).map(s => ({ slot: s, x: at[s][0], y: at[s][1] }));
  return {
    placed, sockets,
    tip: barrel ? [S.muzzle[0] + barrel.tip, S.muzzle[1]] : [S.muzzle[0], S.muzzle[1]],
    trigger: S.trigger,
    port: [S.mag[0] - 10, 14],
  };
}

/** Bounding box of path data made by parts.js (absolute M/L points and circle arcs). */
export function pathBox(d, dx = 0, dy = 0, acc = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity }) {
  const re = /M(-?[\d.]+) (-?[\d.]+)a(-?[\d.]+)|[ML](-?[\d.]+) (-?[\d.]+)/g;
  let m;
  const add = (x, y) => { acc.x0 = Math.min(acc.x0, x + dx); acc.y0 = Math.min(acc.y0, y + dy); acc.x1 = Math.max(acc.x1, x + dx); acc.y1 = Math.max(acc.y1, y + dy); };
  while ((m = re.exec(d))) {
    if (m[3] !== undefined) { const x = +m[1], y = +m[2], r = +m[3]; add(x, y - r); add(x + 2 * r, y + r); }
    else add(+m[4], +m[5]);
  }
  return acc;
}
export function gunBox(placed) {
  const acc = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
  for (const p of placed) for (const f of p.shape.fills) pathBox(f.d, p.x, p.y, acc);
  return acc.x0 === Infinity ? { x0: 0, y0: 0, x1: 300, y1: 120 } : acc;
}

/* ------------------------------------------------------------------ decal areas */

const ZONE_NAMES = { barrel: "Barrel", magazine: "Magazine", optic: "Optic", grip: "Foregrip", stock: "Stock" };
/**
 * Flat areas of the assembled gun where a decal fits, in gun units: the largest rectangle inside each
 * part (found by the tracing tool), with the receiver also split into a rear and a front half.
 * Returns [{ id, label, slot, tone ("p" paint or "s" dark polymer), x, y, w, h }].
 */
export function decalZones(build) {
  const out = [];
  for (const p of layout(build).placed) {
    const z = p.part.zones?.[0];
    if (!z || z[2] < 18 || z[3] < 10) continue;
    const [x, y, w, h] = [p.x + z[0], p.y + z[1], z[2], z[3]];
    const tone = p.slot === "frame" || p.slot === "barrel" || p.slot === "stock" ? "p" : "s";
    if (p.slot === "frame") {
      out.push({ id: "rear", label: "Receiver rear", slot: "frame", tone, x, y, w: w * 0.48, h });
      out.push({ id: "receiver", label: "Receiver", slot: "frame", tone, x, y, w, h });
      out.push({ id: "front", label: "Receiver front", slot: "frame", tone, x: x + w * 0.52, y, w: w * 0.48, h });
    } else out.push({ id: p.slot, label: ZONE_NAMES[p.slot], slot: p.slot, tone, x, y, w, h });
  }
  return out;
}
/** Size and centre that fit a decal inside a zone with a margin, keeping its proportions. */
export function fitToZone(dec, zone, fill = 1) {
  const art = decalArt(dec), r = art.h / art.w;
  return { x: zone.x + zone.w / 2, y: zone.y + zone.h / 2, w: Math.max(12, Math.min(zone.w * 0.88, (zone.h * 0.8) / r) * fill), rot: 0 };
}

/* ------------------------------------------------------------------ decals */

// Decals drawn here rather than by the decal kit.
const LOCAL_DECALS = {
  // Hazard band: slanted stripes between two rules.
  hazard: () => {
    const W = 240, H = 52, band = 18;
    let body = `<rect x="0" y="0" width="${W}" height="4" fill="#fff"/><rect x="0" y="${H - 4}" width="${W}" height="4" fill="#fff"/>`;
    for (let x = -H; x < W + H; x += band * 2) {
      const pts = clipX([[x, 8], [x + band, 8], [x + band - (H - 16), H - 8], [x - (H - 16), H - 8]], 0, W);
      if (pts.length) body += `<polygon points="${pts.map(([a, b]) => `${n(a)},${n(b)}`).join(" ")}" fill="#fff"/>`;
    }
    return { w: W, h: H, body };
  },
};
/** Clips a polygon to the vertical strip lo ≤ x ≤ hi. */
function clipX(pts, lo, hi) {
  const cut = (poly, inside, edge) => poly.flatMap((p, i) => {
    const q = poly[(i + 1) % poly.length], out = [];
    if (inside(p)) out.push(p);
    if (inside(p) !== inside(q)) { const t = (edge - p[0]) / (q[0] - p[0]); out.push([edge, p[1] + t * (q[1] - p[1])]); }
    return out;
  });
  return cut(cut(pts, p => p[0] >= lo, lo), p => p[0] <= hi, hi);
}

const decalCache = new Map();
/** The decal artwork as a white-on-black fragment ({ w, h, body }); black reads as transparent once used as a mask. */
export function decalArt(dec) {
  const key = dec.text != null ? `t:${dec.variant}:${dec.text}` : `k:${dec.kind}:${dec.seed}`;
  if (!decalCache.has(key)) {
    const d = dec.text != null
      ? textVariant({ text: dec.text, variant: dec.variant ?? "display", size: 48, palette: "mask" })
      : LOCAL_DECALS[dec.kind] ? LOCAL_DECALS[dec.kind](dec) : make(dec.kind, { seed: dec.seed, palette: "mask" });
    decalCache.set(key, { w: d.w, h: d.h, body: binarize(d.body, PALETTES.mask, "white") });
  }
  return decalCache.get(key);
}
const n = v => Math.round(v * 100) / 100;
/** Size of a placed decal in gun units: `w` is its width, height follows the artwork. */
export function decalSize(dec) {
  const art = decalArt(dec);
  return { w: dec.w, h: dec.w * (art.h / art.w) };
}
export const decalTransform = dec => `translate(${n(dec.x)} ${n(dec.y)}) rotate(${n(dec.rot)}) scale(${dec.flip ? -1 : 1} 1)`;
// Each decal is its artwork used as a luminance mask over a rectangle of its tint, so black parts of the
// artwork become see-through. The mask covers the whole bench, so moving a decal only rewrites one transform.
/** The positioned artwork that goes inside a decal's mask. */
export function decalInner(dec) {
  const art = decalArt(dec), { w, h } = decalSize(dec);
  return `<g class="decal-pos" data-decal="${dec.id}" transform="${decalTransform(dec)}">` +
    `<svg x="${n(-w / 2)}" y="${n(-h / 2)}" width="${n(w)}" height="${n(h)}" viewBox="0 0 ${n(art.w)} ${n(art.h)}" overflow="visible">${art.body}</svg></g>`;
}
export function decalMarkup(dec, P) {
  const id = `${P}d${dec.id}`, R = `x="-700" y="-500" width="2200" height="1200"`;
  return `<mask id="${id}" maskUnits="userSpaceOnUse" ${R}>${decalInner(dec)}</mask><rect class="decal-ink" data-decal="${dec.id}" ${R} fill="${dec.tint}" mask="url(#${id})"/>`;
}

/* ------------------------------------------------------------------ wear */

// Scratches are a fixed list so that raising the wear slider adds marks rather than reshuffling them.
const SCRATCHES = (() => {
  let s = 7;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  return Array.from({ length: 48 }, () => { const x = -160 + r() * 760, y = -40 + r() * 170, a = (r() - 0.5) * 0.9, l = 8 + r() * 34; return [x, y, x + Math.cos(a) * l, y + Math.sin(a) * l]; });
})();

function wearDefs(P, w) {
  const t = 0.97 - 0.4 * w;          // noise level above which paint is gone
  return `<filter id="${P}chip" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="4" seed="11"/>` +
    `<feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  9 0 0 0 ${n(-9 * t)}"/><feComponentTransfer><feFuncA type="discrete" tableValues="0 1"/></feComponentTransfer></filter>` +
    `<filter id="${P}grime" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves="3" seed="2"/>` +
    `<feColorMatrix type="matrix" values="0 0 0 0 0.1  0 0 0 0 0.08  0 0 0 0 0.05  2.2 0 0 0 -1.05"/></filter>` +
    `<mask id="${P}wear" maskUnits="userSpaceOnUse" x="-600" y="-400" width="2000" height="1000"><rect x="-600" y="-400" width="2000" height="1000" fill="#fff"/>` +
    (w > 0.01 ? `<rect class="wear-chips" x="-600" y="-400" width="2000" height="1000" filter="url(#${P}chip)"/>` : "") + `</mask>` +
    shadeDef(`${P}shade`);
}

/* ------------------------------------------------------------------ gun */

// Panel lines are drawn twice, a light line just below a dark one, so they read as engraved on light and dark paint.
const linesMarkup = (paths, fin) => `<g class="lines" fill="none" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">` +
  `<g stroke="rgba(255,255,255,.16)" transform="translate(0 1.1)">${paths}</g><g stroke="${fin.line}">${paths}</g></g>`;

/**
 * Markup for one gun. opts: { finish, wear (0..1), decals: [], prefix (unique id prefix) }.
 * Returns { svg, box, lay } where box is the gun's bounding box in its own coordinates.
 */
export function gunMarkup(build, opts = {}) {
  const P = opts.prefix ?? "g-";
  const fin = FINISHES[opts.finish] ?? FINISHES.bone;
  const w = Math.max(0, Math.min(1, opts.wear ?? 0));
  const lay = layout(build);
  if (!lay.placed.length) return { svg: "", box: gunBox([]), lay };
  const color = tone => (tone === "p" || tone === "s" || tone === "a" ? fin[tone] : FIXED[tone]);
  // Every element of a part carries data-slot/x/y so the interface can slide it (snap-in, magazine drop).
  const tr = p => `data-slot="${p.slot}" data-x="${p.x}" data-y="${p.y}" transform="translate(${p.x} ${p.y})"`;

  // Paths fill with the nonzero rule: holes (trigger guards, stock cut-outs) run the opposite way round,
  // so a colour block drawn over a part never punches a hole in the metal underneath.
  let clip = "", metal = "", paint = "", shade = "", seams = "", lines = "";
  for (const p of lay.placed) {
    const all = p.shape.fills.map(f => f.d).join("");
    clip += `<path ${tr(p)} d="${all}"/>`;
    shade += `<path ${tr(p)} d="${all}"/>`;
    seams += `<path ${tr(p)} d="${all}"/>`;
    metal += `<path ${tr(p)} d="${all}"/>`;
    paint += `<g class="part part-${p.slot}" ${tr(p)}>` + p.shape.fills.map(f => `<path d="${f.d}" fill="${color(f.tone)}"/>`).join("") + `</g>`;
    if (p.slot === "frame") {
      const [tx, ty] = lay.trigger;
      paint += `<path class="trigger-blade" data-x="${tx}" data-y="${ty}" transform="translate(${tx} ${ty})" d="M-3 0L4 0L7 16L3 20L-1 18Z" fill="${FIXED.k}"/>`;
    }
    if (p.shape.lines.length) lines += `<path ${tr(p)} d="${p.shape.lines.join("")}"/>`;
  }
  const decals = (opts.decals ?? []).map(d => decalMarkup(d, P)).join("");
  const box = gunBox(lay.placed);
  const scratches = SCRATCHES.slice(0, Math.round(w * SCRATCHES.length)).map(([a, b, c, d]) => `M${n(a)} ${n(b)}L${n(c)} ${n(d)}`).join("");

  const svg = `<defs><clipPath id="${P}sil">${clip}</clipPath>${wearDefs(P, w)}</defs>` +
    `<g class="metal" fill="${METAL}">${metal}</g>` +
    `<g class="paint" mask="url(#${P}wear)">${paint}<g class="decals" clip-path="url(#${P}sil)">${decals}</g></g>` +
    `<g class="shade" fill="url(#${P}shade)">${shade}</g>` +
    `<g class="seams" fill="none" stroke="${SEAM}" stroke-width="1.6" stroke-linejoin="round">${seams}</g>` +
    linesMarkup(lines, fin) +
    (w > 0.01 ? `<g clip-path="url(#${P}sil)"><rect x="${n(box.x0)}" y="${n(box.y0)}" width="${n(box.x1 - box.x0)}" height="${n(box.y1 - box.y0)}" filter="url(#${P}grime)" opacity="${n(0.7 * w)}"/>` +
      `<path d="${scratches}" stroke="#D9DAD2" stroke-opacity=".55" stroke-width="1" fill="none"/></g>` : "");
  return { svg, box, lay };
}

/** A single part drawn on its own (for the part tray). Returns { svg, box }. */
export function partMarkup(slot, id, finish = "bone", railLen = 150) {
  const p = part(slot, id);
  const sh = slot === "optic" ? p.draw(railLen) : p.draw();
  const fin = FINISHES[finish] ?? FINISHES.bone;
  const color = tone => (tone === "p" || tone === "s" || tone === "a" ? fin[tone] : FIXED[tone]);
  const acc = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
  for (const f of sh.fills) pathBox(f.d, 0, 0, acc);
  const all = sh.fills.map(f => f.d).join(""), P = `pt-${slot}-${id}-`;
  const svg = `<defs>${shadeDef(`${P}shade`)}</defs>` +
    `<g>${sh.fills.map(f => `<path d="${f.d}" fill="${color(f.tone)}"/>`).join("")}</g>` +
    `<path d="${all}" fill="url(#${P}shade)"/><path d="${all}" fill="none" stroke="${SEAM}" stroke-width="1.6" stroke-linejoin="round"/>` +
    (sh.lines.length ? linesMarkup(`<path d="${sh.lines.join("")}"/>`, fin) : "");
  return { svg, box: acc };
}

// Builds the SVG markup of an assembled gun: bare metal underneath, paint and decals on top
// (worn away by a noise mask), panel lines, grime and scratches. Returns strings, so it can be
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

/* ------------------------------------------------------------------ decals */

const decalCache = new Map();
/** The decal artwork as a white-on-black fragment ({ w, h, body }); black reads as transparent once used as a mask. */
export function decalArt(dec) {
  const key = dec.text != null ? `t:${dec.variant}:${dec.text}` : `k:${dec.kind}:${dec.seed}`;
  if (!decalCache.has(key)) {
    const d = dec.text != null
      ? textVariant({ text: dec.text, variant: dec.variant ?? "display", size: 48, palette: "mask" })
      : make(dec.kind, { seed: dec.seed, palette: "mask" });
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

function wearDefs(P, w, silhouette) {
  const t = 0.93 - 0.36 * w;         // noise level above which paint is gone
  const edge = w < 0.02 ? 0 : 1.5 + 11 * w;
  return `<filter id="${P}chip" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="4" seed="11"/>` +
    `<feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  9 0 0 0 ${n(-9 * t)}"/><feComponentTransfer><feFuncA type="discrete" tableValues="0 1"/></feComponentTransfer></filter>` +
    `<filter id="${P}edge" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.22" numOctaves="2" seed="4" result="n"/>` +
    `<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  6 0 0 0 -2.6" result="m"/><feComposite in="SourceGraphic" in2="m" operator="in"/></filter>` +
    `<filter id="${P}grime" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves="3" seed="2"/>` +
    `<feColorMatrix type="matrix" values="0 0 0 0 0.1  0 0 0 0 0.08  0 0 0 0 0.05  2.2 0 0 0 -1.05"/></filter>` +
    `<mask id="${P}wear" maskUnits="userSpaceOnUse" x="-600" y="-400" width="2000" height="1000"><rect x="-600" y="-400" width="2000" height="1000" fill="#fff"/>` +
    (w > 0.01 ? `<rect class="wear-chips" x="-600" y="-400" width="2000" height="1000" filter="url(#${P}chip)"/>` : "") +
    (edge ? `<g filter="url(#${P}edge)" fill="none" stroke="#000" stroke-width="${n(edge)}" stroke-linejoin="round">${silhouette}</g>` : "") + `</mask>`;
}

/* ------------------------------------------------------------------ gun */

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

  let silhouette = "", clip = "", metal = "", paint = "", lines = "";
  for (const p of lay.placed) {
    const all = p.shape.fills.map(f => f.d).join("");
    silhouette += `<path ${tr(p)} d="${all}"/>`;
    clip += `<path ${tr(p)} d="${all}" fill-rule="evenodd"/>`;
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

  const svg = `<defs><clipPath id="${P}sil">${clip}</clipPath>${wearDefs(P, w, silhouette)}</defs>` +
    `<g class="metal" fill="${METAL}" fill-rule="evenodd">${metal}</g>` +
    `<g class="paint" mask="url(#${P}wear)" fill-rule="evenodd">${paint}<g class="decals" clip-path="url(#${P}sil)">${decals}</g></g>` +
    `<g class="lines" fill="none" stroke="${fin.line}" stroke-width="1.6">${lines}</g>` +
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
  const svg = `<g fill-rule="evenodd">${sh.fills.map(f => `<path d="${f.d}" fill="${color(f.tone)}"/>`).join("")}</g>` +
    (sh.lines.length ? `<path d="${sh.lines.join("")}" fill="none" stroke="${fin.line}" stroke-width="1.6"/>` : "");
  return { svg, box: acc };
}

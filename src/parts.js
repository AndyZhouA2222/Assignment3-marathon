// Part library: every weapon is a frame (receiver) plus parts that snap onto its sockets.
// Each part is cut from a real Marathon weapon and names the MarathonDB weapon it comes from,
// which also supplies its numbers. Pure module: no DOM, so it runs in Node tests too.
import { bySlug } from "./data/marathondb-weapons.js";
import { TRACED } from "./data/traced-shapes.js";

/* ------------------------------------------------------------------ geometry helpers */

const r1 = v => Math.round(v * 10) / 10;
/** Closed polygon path from [x, y] points. */
export const poly = pts => "M" + pts.map(([x, y]) => `${r1(x)} ${r1(y)}`).join("L") + "Z";
/** Rectangle with cut corners: c = [topLeft, topRight, bottomRight, bottomLeft]. */
export function box(x, y, w, h, c = [0, 0, 0, 0]) {
  const [tl, tr, br, bl] = c;
  return poly([[x + tl, y], [x + w - tr, y], [x + w, y + tr], [x + w, y + h - br], [x + w - br, y + h], [x + bl, y + h], [x, y + h - bl], [x, y + tl]]);
}

// A shape is { fills: [{ tone, d }], lines: [d] }.
// Tones: p = paint (finish colour), s = secondary polymer, m = bare steel, k = near-black,
// a = accent (lime), g = glass. Only p and s take the finish; the rest keep their colour.
const shape = (fills, lines = []) => ({ fills: fills.map(([tone, d]) => ({ tone, d })), lines });

/* ------------------------------------------------------------------ slots */

export const SLOTS = [
  { id: "frame", label: "Frame", required: true },
  { id: "barrel", label: "Barrel", required: true },
  { id: "magazine", label: "Magazine", required: true },
  { id: "optic", label: "Optic", required: false },
  { id: "grip", label: "Foregrip", required: false },
  { id: "stock", label: "Stock", required: false },
];

export const AMMO = {
  light_rounds: "Light rounds",
  heavy_rounds: "Heavy rounds",
  mips_rounds: "MIPS rounds",
  volt_cell: "Volt cell",
};

/* ------------------------------------------------------------------ traced shapes */
// Most outlines are traced from MarathonDB weapon renders by tools/trace/trace.py and simplified to
// polygons: `base` is the whole part, `dark` (frames only) the lower housing below the receiver.
// Each part keeps the attachment point of the weapon it was cut from, so parts line up on any frame.
// Paint (p) on receivers, barrels and stocks; dark polymer (s) on magazines, sights and grips.
const BASE_TONE = { frame: "p", barrel: "p", stock: "p", magazine: "s", optic: "s", grip: "s" };
const traced = (slot, id) => {
  const t = TRACED[slot][id];
  return () => shape(t.dark ? [[BASE_TONE[slot], t.base], ["s", t.dark]] : [[BASE_TONE[slot], t.base]]);
};

/* ------------------------------------------------------------------ frames */
// Frame coordinates: (0, 0) is the top-left of the receiver. Sockets say where other parts attach:
// muzzle [x, y] (barrel grows right), mag [x, y] (magazine grows down), rail [x, y, length]
// (optic sits on top), stock [x, y] (stock grows left, null = no stock mount), trigger [x, y].
const frame = f => ({ ...f, sockets: TRACED.frame[f.id].sockets, draw: traced("frame", f.id) });
const FRAMES = [
  frame({ id: "m77", name: "M77 Frame", source: "m77-assault-rifle", mode: "auto", tag: "Assault rifle" }),
  frame({ id: "brrt", name: "BRRT Frame", source: "brrt-smg", mode: "burst", burst: 5, tag: "SMG" }),
  frame({ id: "demolition", name: "Demolition Frame", source: "demolition-hmg", mode: "auto", tag: "Heavy MG" }),
  frame({ id: "hardline", name: "Hardline Frame", source: "hardline-pr", mode: "semi", tag: "Precision rifle" }),
  frame({ id: "wstr", name: "WSTR Frame", source: "wstr-combat-shotgun", mode: "semi", pellets: 8, tag: "Shotgun" }),
  frame({ id: "zeus", name: "Zeus Frame", source: "v00-zeus-rg", mode: "semi", tag: "Railgun" }),
  frame({ id: "magnum", name: "Magnum Frame", source: "magnum-mc", mode: "semi", tag: "Pistol" }),
  frame({ id: "longshot", name: "Longshot Frame", source: "longshot", mode: "semi", tag: "Sniper rifle" }),
];

/* ------------------------------------------------------------------ parts */
// Barrels: origin = muzzle socket on the bore line, growing right. `under` = foregrip mount
// (null = no room), `tip` = where the muzzle flash appears.
const barrel = b => ({ ...b, tip: TRACED.barrel[b.id].tip, under: TRACED.barrel[b.id].under, draw: traced("barrel", b.id) });
const BARRELS = [
  barrel({ id: "sb09", name: "SB-09 Stub", source: "brrt-smg", d: { a: -6, h: 6 } }),
  barrel({ id: "sn06", name: "SN-06 Snub Nose", source: "magnum-mc", d: { f: 0.02, a: -3, h: 8 } }),
  barrel({ id: "cb14", name: "CB-14 Carbine", source: "m77-assault-rifle", d: {} }),
  barrel({ id: "lf30", name: "LF-30 Longline", source: "longshot", d: { f: 0.04, a: 10, h: -6 } }),
  barrel({ id: "hs22", name: "HS-22 Breacher", source: "demolition-hmg", d: { f: 0.1, a: -3, h: -5 } }),
  barrel({ id: "qs16", name: "QS-16 Hush", source: "hardline-pr", d: { f: -0.1, a: 4, h: -2 }, suppressed: true }),
  barrel({ id: "db02", name: "DB-02 Splitter", source: "wstr-combat-shotgun", d: { f: 0.06, a: -8, h: -2 } }),
  barrel({ id: "rc50", name: "RC-50 Coilgun", source: "v00-zeus-rg", d: { f: 0.12, a: 6, h: -5 } }),
];

// Magazines: origin = top of the magazine (the socket), growing down.
const mag = m => ({ ...m, draw: traced("magazine", m.id) });
const MAGAZINES = [
  mag({ id: "lt24", name: "LT-24 Raked", source: "m77-assault-rifle", ammo: "light_rounds", cap: 24, d: {} }),
  mag({ id: "lt35", name: "LT-35 Long", source: "brrt-smg", ammo: "light_rounds", cap: 35, d: { h: -2 } }),
  mag({ id: "lt44", name: "LT-44 Belt Box", source: "retaliator-lmg", ammo: "light_rounds", cap: 44, d: { h: -8 } }),
  mag({ id: "lt04", name: "LT-04 Bolt", source: "longshot", ammo: "light_rounds", cap: 4, d: { h: 4 } }),
  mag({ id: "hv14", name: "HV-14 Box", source: "hardline-pr", ammo: "heavy_rounds", cap: 14, d: {} }),
  mag({ id: "hv20", name: "HV-20 Casket", source: "demolition-hmg", ammo: "heavy_rounds", cap: 20, d: { h: -6 } }),
  // The Magnum's magazine sits inside its grip, so only the base plate under the grip shows: drawn by hand.
  { id: "hv12", name: "HV-12 Grip Mag", source: "magnum-mc", ammo: "heavy_rounds", cap: 12, d: { h: 2 },
    draw: () => shape([["s", box(-12, -2, 24, 8, [0, 0, 2, 2])], ["p", box(-9, 1, 18, 2)]]) },
  mag({ id: "mp02", name: "MP-02 Undertube", source: "wstr-combat-shotgun", ammo: "mips_rounds", cap: 2, d: { h: 2 } }),
  mag({ id: "mp04", name: "MP-04 Ribbed Tube", source: "misriah-2442", ammo: "mips_rounds", cap: 4, d: { h: -1 } }),
  mag({ id: "vc100", name: "VC-100 Cell", source: "v00-zeus-rg", ammo: "volt_cell", cap: 100, d: { h: -3 } }),
];

// Optics: origin = centre of the frame's rail top, growing up. `len` is the rail length.
const optic = o => ({ ...o, draw: traced("optic", o.id) });
const OPTICS = [
  // Plain iron sights stretch to fit the rail, so they are drawn by hand from its length.
  { id: "is00", name: "IS-00 Iron", source: "m77-assault-rifle", zoom: 1, d: { h: 2 },
    draw: len => shape([["s", box(-len / 2 + 4, -14, 10, 14, [3, 3, 0, 0]) + box(len / 2 - 14, -18, 10, 18, [3, 3, 0, 0])]]) },
  optic({ id: "rd1", name: "RD-1 Reflex", source: "brrt-smg", zoom: 1.25, d: { a: 3 } }),
  optic({ id: "cb2", name: "CB-2 Charge Sight", source: "v00-zeus-rg", zoom: 1.5, d: { a: 4, h: -2 } }),
  optic({ id: "th16", name: "TH-1.6 Thermal", source: "v66-lookout", zoom: 1.6, d: { a: 5, h: -2 } }),
  optic({ id: "ms25", name: "MS-2.5 Midsight", source: "hardline-pr", zoom: 2.5, d: { a: 7, h: -3 } }),
  optic({ id: "ls4", name: "LS-4 Hi-Zoom", source: "longshot", zoom: 4, d: { a: 12, h: -7 } }),
];

// Foregrips: origin = the barrel's under mount, growing down.
const fgrip = g => ({ ...g, draw: traced("grip", g.id) });
const GRIPS = [
  fgrip({ id: "ag1", name: "AG-1 Angled", source: "copperhead-rf", d: { a: 1, h: 5 } }),
  fgrip({ id: "vg2", name: "VG-2 Vertical", source: "bully-smg", d: { a: 4, h: 2 } }),
  fgrip({ id: "sg3", name: "SG-3 Skid", source: "demolition-hmg", d: { a: 2, h: 3 } }),
];

// Stocks: origin = the frame's stock socket, growing left.
const stock = st => ({ ...st, draw: traced("stock", st.id) });
const STOCKS = [
  stock({ id: "sk1", name: "SK-1 Skeleton", source: "brrt-smg", d: { a: 2, h: 2 } }),
  stock({ id: "zb6", name: "ZB-6 Cell Butt", source: "v00-zeus-rg", d: { a: 4, h: 0 } }),
  stock({ id: "bk4", name: "BK-4 Block", source: "m77-assault-rifle", d: { a: 5, h: -1 } }),
  stock({ id: "st2", name: "ST-2 Fixed", source: "hardline-pr", d: { a: 6, h: -2 } }),
  stock({ id: "lp5", name: "LP-5 Cheek Rest", source: "longshot", d: { a: 8, h: -4 } }),
  stock({ id: "hp3", name: "HP-3 Brace", source: "demolition-hmg", d: { a: 9, h: -5 } }),
];

/* ------------------------------------------------------------------ catalogue */

const withSource = p => ({ ...p, sourceName: bySlug[p.source]?.name ?? p.source });
export const PARTS = {
  frame: FRAMES.map(f => {
    const w = bySlug[f.source];
    // WSTR has no accuracy score on MarathonDB (shotguns are listed without one); 35 is our estimate.
    return withSource({ ...f, ammo: w.ammo, base: { f: w.firepower, a: w.accuracy ?? 35, h: w.handling }, rpm: w.rpm, damage: w.damage, precision: w.precision, voltDrain: w.voltDrain, reload: w.reload });
  }),
  barrel: BARRELS.map(b => withSource({ ...b, range: bySlug[b.source].range })),
  magazine: MAGAZINES.map(m => withSource({ ...m, reload: bySlug[m.source].reload })),
  optic: OPTICS.map(withSource),
  grip: GRIPS.map(withSource),
  stock: STOCKS.map(withSource),
};
export const part = (slot, id) => (id ? PARTS[slot].find(p => p.id === id) ?? null : null);

/* ------------------------------------------------------------------ rules */

export const EMPTY_BUILD = { frame: null, barrel: null, magazine: null, optic: null, grip: null, stock: null };

/** Can `id` go into `slot` on this build? Returns { ok, reason }. */
export function canAttach(build, slot, id) {
  const p = part(slot, id);
  if (!p) return { ok: false, reason: "Unknown part" };
  if (slot === "frame") return { ok: true };
  const frame = part("frame", build.frame);
  if (!frame) return { ok: false, reason: "Pick a frame first. Every part mounts on it." };
  if (slot === "magazine" && p.ammo !== frame.ammo)
    return { ok: false, reason: `${frame.name} feeds ${AMMO[frame.ammo]}. ${p.name} holds ${AMMO[p.ammo]}.` };
  if (slot === "stock" && !frame.sockets.stock) return { ok: false, reason: `${frame.name} has no stock mount.` };
  if (slot === "grip") {
    const barrel = part("barrel", build.barrel);
    if (!barrel) return { ok: false, reason: "Fit a barrel first. The foregrip mounts under it." };
    if (!barrel.under) return { ok: false, reason: `${barrel.name} has no rail for a foregrip.` };
  }
  return { ok: true };
}

/**
 * Puts a part on (id) or takes it off (id = null). Parts that no longer fit fall off, and each one
 * is reported so the interface can say why. Returns { build, dropped: [{ slot, id, reason }] }.
 */
export function attach(build, slot, id) {
  const next = { ...build, [slot]: id };
  if (slot === "frame" && !id) return { build: { ...EMPTY_BUILD }, dropped: Object.entries(build).filter(([s, v]) => v && s !== "frame").map(([s, v]) => ({ slot: s, id: v, reason: "No frame to hold it" })) };
  const dropped = [];
  for (const s of ["magazine", "stock", "grip"]) {
    if (!next[s] || s === slot) continue;
    const check = canAttach(next, s, next[s]);
    if (!check.ok) { dropped.push({ slot: s, id: next[s], reason: check.reason }); next[s] = null; }
  }
  return { build: next, dropped };
}

/* ------------------------------------------------------------------ stats */

const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
/** Firepower spans 11 to 265 on MarathonDB, so it is normalised on a log scale; accuracy and handling are linear. */
export const norm = {
  f: f => clamp(Math.log(f / 10) / Math.log(26)),
  a: a => clamp((a - 30) / 80),
  h: h => clamp((h - 15) / 55),
};

/** Combined stats of a build. Missing required parts are listed in `missing`. */
export function computeStats(build) {
  const frame = part("frame", build.frame);
  const missing = SLOTS.filter(s => s.required && !build[s.id]).map(s => s.id);
  if (!frame) return { complete: false, missing, f: 0, a: 0, h: 0, fN: 0, aN: 0, hN: 0 };
  const parts = ["barrel", "magazine", "optic", "grip", "stock"].map(s => part(s, build[s])).filter(Boolean);
  let fMul = 1, a = frame.base.a, h = frame.base.h;
  for (const p of parts) { fMul *= 1 + (p.d.f ?? 0); a += p.d.a ?? 0; h += p.d.h ?? 0; }
  // A shoulder weapon with nothing on the stock mount kicks harder but swings faster.
  if (frame.sockets.stock && !build.stock) { a -= 8; h += 6; }
  const f = frame.base.f * fMul;
  a = clamp(a, 10, 130); h = clamp(h, 5, 90);
  const barrel = part("barrel", build.barrel), mag = part("magazine", build.magazine), optic = part("optic", build.optic);
  const volt = frame.ammo === "volt_cell";
  const cap = !mag ? 0 : volt ? Math.max(1, Math.floor(mag.cap / (frame.voltDrain ?? 10))) : mag.cap;
  const r = v => Math.round(v * 10) / 10;
  return {
    complete: missing.length === 0, missing,
    f: r(f), a: r(a), h: r(h), fN: norm.f(f), aN: norm.a(a), hN: norm.h(h),
    rpm: frame.rpm, mode: frame.mode, burst: frame.burst ?? 1, pellets: frame.pellets ?? 1,
    damage: r(frame.damage * fMul), precision: frame.precision,
    cap, reload: mag ? r(mag.reload * (1.3 - 0.6 * norm.h(h))) : null,
    range: barrel ? barrel.range : null, zoom: optic ? optic.zoom : 1,
    ammo: frame.ammo, volt, suppressed: !!barrel?.suppressed,
  };
}

/** How a part would change the three headline stats (for the preview chips on part cards). */
export function previewDelta(build, slot, id) {
  const before = computeStats(build);
  const after = computeStats(attach(build, slot, id).build);
  return { f: r2(after.f - before.f), a: r2(after.a - before.a), h: r2(after.h - before.h) };
}
const r2 = v => Math.round(v * 10) / 10;

export const DEFAULT_BUILD = { ...EMPTY_BUILD, frame: "m77" };

// Part library: every weapon is a frame (receiver) plus parts that snap onto its sockets.
// Shapes are original vector drawings in a Marathon-like flat style; each part names the
// MarathonDB weapon its numbers come from. Pure module: no DOM, so it runs in Node tests too.
import { bySlug } from "./data/marathondb-weapons.js";

/* ------------------------------------------------------------------ geometry helpers */

const r1 = v => Math.round(v * 10) / 10;
/** Closed polygon path from [x, y] points. */
export const poly = pts => "M" + pts.map(([x, y]) => `${r1(x)} ${r1(y)}`).join("L") + "Z";
/** Rectangle with cut corners: c = [topLeft, topRight, bottomRight, bottomLeft]. */
export function box(x, y, w, h, c = [0, 0, 0, 0]) {
  const [tl, tr, br, bl] = c;
  return poly([[x + tl, y], [x + w - tr, y], [x + w, y + tr], [x + w, y + h - br], [x + w - br, y + h], [x + bl, y + h], [x, y + h - bl], [x, y + tl]]);
}
export const circle = (cx, cy, r) =>
  `M${r1(cx - r)} ${r1(cy)}a${r1(r)} ${r1(r)} 0 1 0 ${r1(2 * r)} 0a${r1(r)} ${r1(r)} 0 1 0 ${r1(-2 * r)} 0Z`;
const line = (x1, y1, x2, y2) => `M${r1(x1)} ${r1(y1)}L${r1(x2)} ${r1(y2)}`;
const repeat = (n, f) => Array.from({ length: n }, (_, i) => f(i)).join("");

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

/* ------------------------------------------------------------------ frames */
// Frame coordinates: (0, 0) is the top-left of the housing. Sockets say where other parts attach:
// muzzle [x, y] (barrel grows right), mag [x, y] (magazine grows down), rail [x, y, length]
// (optic sits on top), stock [x, y] (stock grows left, null = no stock mount), trigger [x, y].

function grip(x, top, w = 32, h = 62, slant = 14) {
  return poly([[x, top], [x + w, top], [x + w - slant, top + h], [x - slant - 2, top + h], [x - slant - 4, top + h - 8]]);
}
function guard(x, top) {
  return poly([[x, top], [x + 46, top], [x + 50, top - 4], [x + 50, top], [x + 46, top + 28], [x, top + 28], [x, top + 24], [x + 42, top + 24], [x + 44, top + 4], [x, top + 4]]);
}
const rail = (x, y, len) => box(x, y - 7, len, 7);
const railTeeth = (x, y, len) => repeat(Math.floor(len / 12), i => line(x + 6 + i * 12, y - 7, x + 6 + i * 12, y - 2));

const FRAMES = [
  {
    id: "m77", name: "M77 Frame", source: "m77-assault-rifle", mode: "auto", tag: "Assault rifle",
    sockets: { muzzle: [300, 22], mag: [177, 78], rail: [92, 0, 150], stock: [0, 24], trigger: [116, 72] },
    draw: () => shape([
      ["p", box(0, 0, 300, 46, [8, 16, 0, 0])],
      ["s", box(18, 46, 272, 24, [0, 0, 14, 0])],
      ["s", grip(80, 70)],
      ["s", box(158, 62, 38, 16)],
      ["k", box(150, 14, 54, 14, [0, 4, 0, 4])],
      ["s", rail(92, 0, 150)],
      ["a", box(244, 32, 38, 5)],
      ["k", guard(110, 70)],
    ], [line(120, 0, 120, 46), line(222, 4, 222, 46), line(18, 58, 150, 58), railTeeth(92, 0, 150)]),
  },
  {
    id: "brrt", name: "BRRT Frame", source: "brrt-smg", mode: "burst", burst: 5, tag: "SMG",
    sockets: { muzzle: [220, 26], mag: [154, 92], rail: [126, -2, 80], stock: [0, 30], trigger: [96, 86] },
    draw: () => shape([
      ["p", box(0, 0, 220, 54, [12, 20, 0, 0])],
      ["p", box(18, -16, 96, 16, [10, 10, 0, 0])],
      ["s", box(14, 54, 198, 30, [0, 0, 16, 8])],
      ["s", grip(62, 84, 34, 58, 12)],
      ["s", box(136, 78, 36, 14)],
      ["k", box(124, 16, 60, 16)],
      ["s", rail(126, -2, 80)],
      ["a", box(30, -10, 22, 4)],
      ["k", guard(94, 84)],
    ], [line(114, 0, 114, 54), line(14, 68, 120, 68), line(190, 6, 190, 54), railTeeth(126, -2, 80)]),
  },
  {
    id: "demolition", name: "Demolition Frame", source: "demolition-hmg", mode: "auto", tag: "Heavy MG",
    sockets: { muzzle: [380, 30], mag: [230, 104], rail: [166, -40, 128], stock: [0, 34], trigger: [146, 98] },
    draw: () => shape([
      ["p", box(0, 0, 380, 62, [10, 24, 0, 0])],
      ["s", box(22, 62, 344, 34, [0, 0, 18, 0])],
      ["s", grip(108, 96, 36, 64, 14)],
      ["s", box(206, 90, 48, 14)],
      ["s", box(150, -34, 160, 34, [14, 14, 0, 0]) + box(168, -22, 124, 22)],
      ["s", rail(166, -34, 128)],
      ["k", box(40, 16, 92, 22, [0, 6, 0, 6])],
      ["a", box(320, 40, 44, 6)],
      ["k", guard(140, 96)],
    ], [line(140, 0, 140, 62), line(300, 6, 300, 62), repeat(5, i => line(48 + i * 18, 20, 48 + i * 18, 34)), railTeeth(166, -34, 128)]),
  },
  {
    id: "hardline", name: "Hardline Frame", source: "hardline-pr", mode: "semi", tag: "Precision rifle",
    sockets: { muzzle: [330, 20], mag: [200, 70], rail: [70, 0, 200], stock: [0, 20], trigger: [130, 64] },
    draw: () => shape([
      ["p", box(0, 0, 330, 40, [6, 18, 0, 0])],
      ["s", box(28, 40, 292, 22, [0, 0, 12, 0])],
      ["s", grip(96, 62, 30, 62, 16)],
      ["s", box(182, 56, 36, 14)],
      ["k", box(160, 10, 46, 12)],
      ["s", rail(70, 0, 200)],
      ["a", box(8, 12, 14, 14)],
      ["k", guard(124, 62)],
    ], [line(140, 0, 140, 40), line(260, 4, 260, 40), line(28, 52, 170, 52), railTeeth(70, 0, 200)]),
  },
  {
    id: "wstr", name: "WSTR Frame", source: "wstr-combat-shotgun", mode: "semi", pellets: 8, tag: "Shotgun",
    sockets: { muzzle: [280, 28], mag: [180, 96], rail: [60, 0, 170], stock: [0, 30], trigger: [108, 92] },
    draw: () => shape([
      ["p", box(0, 0, 280, 58, [10, 10, 0, 0])],
      ["s", box(18, 58, 254, 32, [0, 0, 20, 0])],
      ["s", grip(72, 90, 36, 60, 14)],
      ["s", box(160, 84, 40, 12)],
      ["k", box(120, 18, 74, 20, [0, 6, 0, 6])],
      ["s", rail(60, 0, 170)],
      ["a", box(214, 26, 50, 6)],
      ["k", guard(104, 90)],
    ], [line(110, 0, 110, 58), line(206, 8, 206, 58), line(18, 72, 120, 72), railTeeth(60, 0, 170)]),
  },
  {
    id: "zeus", name: "Zeus Frame", source: "v00-zeus-rg", mode: "semi", tag: "Railgun",
    sockets: { muzzle: [360, 28], mag: [220, 98], rail: [60, 0, 170], stock: [0, 30], trigger: [136, 94] },
    draw: () => shape([
      ["p", box(0, 0, 360, 60, [18, 26, 0, 0])],
      ["s", box(26, 60, 324, 32, [0, 0, 22, 12])],
      ["s", grip(100, 92, 36, 62, 14)],
      ["s", box(196, 86, 48, 12)],
      ["s", rail(60, 0, 170)],
      ["k", box(244, 14, 100, 26, [0, 8, 0, 8])],
      ["a", repeat(5, i => box(252 + i * 18, 20, 8, 14))],
      ["k", guard(130, 92)],
    ], [line(120, 0, 120, 60), line(236, 4, 236, 60), line(26, 76, 190, 76), railTeeth(60, 0, 170)]),
  },
  {
    id: "magnum", name: "Magnum Frame", source: "magnum-mc", mode: "semi", tag: "Pistol",
    sockets: { muzzle: [180, 16], mag: [26, 120], rail: [44, 0, 90], stock: null, trigger: [70, 58] },
    draw: () => shape([
      ["p", box(0, 0, 180, 34, [6, 14, 0, 0])],
      ["s", box(8, 34, 162, 22, [0, 0, 10, 0])],
      ["s", poly([[14, 56], [58, 56], [50, 120], [10, 120], [4, 112]])],
      ["k", box(110, 8, 40, 12)],
      ["s", rail(44, 0, 90)],
      ["a", box(150, 22, 20, 4)],
      ["k", guard(64, 56)],
    ], [line(100, 0, 100, 34), line(16, 46, 100, 46), line(18, 70, 50, 70), railTeeth(44, 0, 90)]),
  },
  {
    id: "longshot", name: "Longshot Frame", source: "longshot", mode: "semi", tag: "Sniper rifle",
    sockets: { muzzle: [340, 18], mag: [210, 66], rail: [70, 0, 230], stock: [0, 18], trigger: [124, 60] },
    draw: () => shape([
      ["p", box(0, 0, 340, 38, [4, 14, 0, 0])],
      ["s", box(18, 38, 312, 22, [0, 0, 10, 0])],
      ["s", grip(90, 60, 30, 62, 18)],
      ["s", box(190, 54, 40, 12)],
      ["s", rail(70, 0, 230)],
      ["s", poly([[150, 20], [170, 20], [188, 46], [180, 52]]) + circle(184, 52, 8)],
      ["a", box(300, 24, 28, 4)],
      ["k", guard(118, 60)],
    ], [line(140, 0, 140, 38), line(280, 4, 280, 38), line(18, 50, 140, 50), railTeeth(70, 0, 230)]),
  },
];

/* ------------------------------------------------------------------ parts */
// Barrels: origin = muzzle socket on the bore line, growing right. `under` = foregrip mount
// (null = no room), `tip` = where the muzzle flash appears.
const BARRELS = [
  { id: "sb09", name: "SB-09 Stub", source: "brrt-smg", d: { a: -6, h: 6 }, under: null, tip: 114,
    draw: () => shape([["p", box(0, -16, 70, 32, [0, 8, 8, 0])], ["m", box(70, -6, 24, 12)], ["m", box(94, -10, 20, 20, [0, 4, 4, 0])]],
      [line(100, -10, 100, 10), line(107, -10, 107, 10), line(20, -16, 20, 16)]) },
  { id: "cb14", name: "CB-14 Carbine", source: "m77-assault-rifle", d: {}, under: [70, 20], tip: 246,
    draw: () => shape([["p", box(0, -18, 150, 38, [0, 10, 14, 0])], ["s", box(12, 14, 118, 6)], ["k", repeat(4, i => box(22 + i * 28, -6, 16, 8))],
      ["m", box(150, -6, 70, 12)], ["m", box(220, -9, 26, 18, [0, 3, 3, 0])]], [line(60, -18, 60, 14), line(228, -9, 228, 9)]) },
  { id: "lf30", name: "LF-30 Longline", source: "longshot", d: { f: 0.04, a: 10, h: -6 }, under: [80, 16], tip: 394,
    draw: () => shape([["p", box(0, -16, 170, 32, [0, 8, 10, 0])], ["m", box(170, -7, 190, 14)], ["m", box(360, -11, 34, 22, [0, 6, 6, 0])], ["a", box(20, -4, 30, 4)]],
      [line(176, -2, 354, -2), line(176, 2, 354, 2), line(368, -11, 368, 11), line(378, -11, 378, 11), line(90, -16, 90, 16)]) },
  { id: "hs22", name: "HS-22 Breacher", source: "demolition-hmg", d: { f: 0.1, a: -3, h: -5 }, under: [90, 26], tip: 240,
    draw: () => shape([["p", box(0, -26, 210, 52, [0, 16, 16, 0]) + repeat(6, i => circle(30 + i * 28, 0, 7))], ["m", box(210, -16, 30, 32, [0, 6, 6, 0])]],
      [line(0, -14, 200, -14), line(0, 14, 200, 14), line(222, -16, 222, 16)]) },
  { id: "qs16", name: "QS-16 Hush", source: "hardline-pr", d: { f: -0.1, a: 4, h: -2 }, under: [55, 17], tip: 270, suppressed: true,
    draw: () => shape([["p", box(0, -17, 120, 34, [0, 6, 10, 0])], ["s", box(120, -15, 150, 30, [0, 10, 10, 0])], ["a", box(132, -3, 24, 6)]],
      [line(170, -15, 170, 15), line(200, -15, 200, 15), line(230, -15, 230, 15), line(40, -17, 40, 17)]) },
  { id: "db02", name: "DB-02 Splitter", source: "wstr-combat-shotgun", d: { f: 0.06, a: -8, h: -2 }, under: null, tip: 240,
    draw: () => shape([["m", box(0, -16, 240, 14) + box(0, 2, 240, 14)], ["s", box(0, -21, 240, 5)], ["p", box(40, 14, 100, 26, [0, 0, 8, 8])]],
      [repeat(6, i => line(52 + i * 14, 18, 52 + i * 14, 36))]) },
  { id: "rc50", name: "RC-50 Coilgun", source: "v00-zeus-rg", d: { f: 0.12, a: 6, h: -5 }, under: [100, 26], tip: 292,
    draw: () => shape([["s", box(0, -20, 280, 10) + box(0, 10, 280, 10)], ["m", box(0, -4, 292, 8)], ["a", box(0, -2, 282, 4)],
      ["p", repeat(6, i => box(20 + i * 42, -26, 16, 52, [3, 3, 3, 3]))]], [line(270, -20, 270, 20)]) },
];

// Magazines: origin = top centre of the magazine (the socket), growing down.
const MAGAZINES = [
  { id: "lt24", name: "LT-24 Box", source: "m77-assault-rifle", ammo: "light_rounds", cap: 24, d: {},
    draw: () => shape([["p", poly([[-16, 0], [16, 0], [22, 84], [-10, 84]])], ["k", box(-13, 84, 38, 8)]], [line(-4, 10, 0, 76), line(6, 10, 10, 76)]) },
  { id: "lt35", name: "LT-35 Curve", source: "brrt-smg", ammo: "light_rounds", cap: 35, d: { h: -2 },
    draw: () => shape([["p", poly([[-16, 0], [16, 0], [22, 40], [34, 84], [42, 112], [8, 120], [0, 92], [-10, 46]])], ["k", poly([[8, 120], [42, 112], [44, 120], [10, 128]])]],
      [line(-2, 12, 14, 100)]) },
  { id: "lt44", name: "LT-44 Drum", source: "retaliator-lmg", ammo: "light_rounds", cap: 44, d: { h: -8 },
    draw: () => shape([["s", box(-14, 0, 28, 18)], ["p", circle(4, 60, 44)], ["k", circle(4, 60, 11)]], [circle(4, 60, 30)]) },
  { id: "lt04", name: "LT-04 Bolt", source: "longshot", ammo: "light_rounds", cap: 4, d: { h: 4 },
    draw: () => shape([["p", box(-16, 0, 32, 28, [0, 0, 4, 4])], ["k", box(-18, 28, 36, 6)]]) },
  { id: "hv14", name: "HV-14 Box", source: "hardline-pr", ammo: "heavy_rounds", cap: 14, d: {},
    draw: () => shape([["p", poly([[-18, 0], [18, 0], [21, 62], [-14, 62]])], ["k", box(-16, 62, 40, 8)]], [line(0, 8, 2, 56)]) },
  { id: "hv20", name: "HV-20 Casket", source: "demolition-hmg", ammo: "heavy_rounds", cap: 20, d: { h: -6 },
    draw: () => shape([["p", box(-22, 0, 44, 96, [0, 0, 8, 0])], ["k", box(-24, 96, 48, 8)]], [line(-22, 32, 22, 32), line(-22, 64, 22, 64)]) },
  { id: "hv12", name: "HV-12 Grip Mag", source: "magnum-mc", ammo: "heavy_rounds", cap: 12, d: { h: 2 },
    draw: () => shape([["p", box(-16, 0, 32, 14, [0, 0, 4, 4])], ["k", box(-18, 14, 36, 6)]]) },
  { id: "mp02", name: "MP-02 Saddle", source: "wstr-combat-shotgun", ammo: "mips_rounds", cap: 2, d: { h: 2 },
    draw: () => shape([["s", box(-34, 0, 68, 8)], ["m", box(-30, 8, 56, 14) + box(-30, 24, 56, 14)], ["a", box(20, 8, 6, 14) + box(20, 24, 6, 14)]]) },
  { id: "mp04", name: "MP-04 Tube", source: "misriah-2442", ammo: "mips_rounds", cap: 4, d: { h: -1 },
    draw: () => shape([["p", box(-14, 0, 28, 72, [0, 0, 12, 12])]], [line(-14, 18, 14, 18), line(-14, 36, 14, 36), line(-14, 54, 14, 54)]) },
  { id: "vc100", name: "VC-100 Cell", source: "v00-zeus-rg", ammo: "volt_cell", cap: 100, d: { h: -3 },
    draw: () => shape([["p", box(-26, 0, 52, 56, [0, 0, 8, 8])], ["a", box(-20, 14, 40, 5) + box(-20, 24, 40, 5) + box(-20, 34, 40, 5)], ["k", box(-8, 56, 16, 6)]]) },
];

// Optics: origin = centre of the frame's rail top, growing up. `len` is the rail length.
const OPTICS = [
  { id: "is00", name: "IS-00 Iron", source: "m77-assault-rifle", zoom: 1, d: { h: 2 },
    draw: len => shape([["s", box(-len / 2 + 4, -14, 10, 14, [3, 3, 0, 0]) + box(len / 2 - 14, -18, 10, 18, [3, 3, 0, 0])]]) },
  { id: "rd1", name: "RD-1 Reflex", source: "brrt-smg", zoom: 1.25, d: { a: 3 },
    draw: () => shape([["s", box(-26, -8, 52, 8)], ["p", box(-24, -38, 48, 30, [4, 10, 0, 0])], ["g", box(-14, -32, 22, 18)], ["a", circle(-3, -23, 2.4)]]) },
  { id: "ms25", name: "MS-2.5 Midsight", source: "m77-assault-rifle", zoom: 2.5, d: { a: 7, h: -3 },
    draw: () => shape([["s", box(-30, -10, 14, 10) + box(16, -10, 14, 10)], ["p", box(-60, -34, 120, 22)], ["p", box(-72, -38, 18, 30, [4, 4, 4, 4]) + box(52, -40, 22, 34, [4, 4, 4, 4])],
      ["s", box(-8, -46, 16, 12)], ["g", box(70, -36, 4, 26)]], [line(-40, -34, -40, -12), line(30, -34, 30, -12)]) },
  { id: "ls4", name: "LS-4 Hi-Zoom", source: "longshot", zoom: 4, d: { a: 12, h: -7 },
    draw: () => shape([["s", box(-50, -10, 16, 10) + box(34, -10, 16, 10)], ["p", box(-90, -36, 180, 24)], ["p", box(70, -48, 38, 48, [6, 6, 6, 6]) + box(-106, -42, 26, 36, [4, 4, 4, 4])],
      ["s", box(-16, -52, 22, 16) + box(10, -44, 12, 8)], ["g", box(104, -42, 4, 36)], ["a", box(-60, -26, 26, 4)]]) },
  { id: "th16", name: "TH-1.6 Thermal", source: "v66-lookout", zoom: 1.6, d: { a: 5, h: -2 },
    draw: () => shape([["s", box(-30, -8, 60, 8)], ["p", box(-44, -48, 88, 40, [6, 14, 0, 0])], ["g", box(32, -42, 10, 28)], ["a", box(-36, -16, 40, 4)], ["k", box(-38, -40, 30, 18)]]) },
];

// Foregrips: origin = the barrel's under mount, growing down.
const GRIPS = [
  { id: "ag1", name: "AG-1 Angled", source: "copperhead-rf", d: { a: 1, h: 5 },
    draw: () => shape([["s", poly([[-30, 0], [22, 0], [26, 8], [-4, 32], [-22, 32]])]], [line(-12, 4, 6, 24)]) },
  { id: "vg2", name: "VG-2 Vertical", source: "demolition-hmg", d: { a: 4, h: 2 },
    draw: () => shape([["s", box(-18, 0, 36, 8)], ["s", box(-11, 8, 22, 58, [0, 0, 6, 6])]], [line(-11, 24, 11, 24), line(-11, 40, 11, 40)]) },
  { id: "sg3", name: "SG-3 Stub", source: "bully-smg", d: { a: 2, h: 3 },
    draw: () => shape([["s", box(-16, 0, 32, 8)], ["s", box(-12, 8, 24, 26, [0, 0, 8, 8])]]) },
];

// Stocks: origin = the frame's stock socket, growing left.
const STOCKS = [
  { id: "sk1", name: "SK-1 Skeleton", source: "brrt-smg", d: { a: 2, h: 2 },
    draw: () => shape([["s", poly([[0, -14], [-110, -18], [-128, -10], [-128, 50], [-110, 56], [-60, 40], [0, 20]]) + poly([[-20, -4], [-100, -6], [-112, 2], [-112, 38], [-70, 28], [-20, 10]])],
      ["k", box(-136, -12, 9, 64)]]) },
  { id: "st2", name: "ST-2 Fixed", source: "hardline-pr", d: { a: 6, h: -2 },
    draw: () => shape([["p", poly([[0, -16], [-120, -22], [-140, -14], [-140, 52], [-90, 52], [0, 22]])], ["s", box(-112, -32, 72, 10, [4, 4, 0, 0])], ["k", box(-148, -16, 9, 70)]],
      [line(-60, -19, -60, 38)]) },
  { id: "hp3", name: "HP-3 Brace", source: "demolition-hmg", d: { a: 9, h: -5 },
    draw: () => shape([["p", poly([[0, -18], [-130, -24], [-150, -16], [-150, 58], [-100, 58], [0, 24]])], ["k", box(-164, -26, 15, 88, [2, 2, 2, 2])], ["a", box(-162, -10, 11, 6)]],
      [line(-40, -20, -40, 30), line(-80, -22, -80, 44)]) },
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

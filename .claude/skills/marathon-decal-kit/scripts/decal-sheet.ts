// CLI: generate Marathon-style decals as SVG (optionally PNG).
// node scripts/decal-sheet.ts --mode sheet --palette mono --seed 7 --out out/sheet.svg [--png]
// node scripts/decal-sheet.ts --mode sheet --layout prop --palette lab --seed 4 --out out/prop.svg --png
// node scripts/decal-sheet.ts --mode kind --kind glyphDisc --count 12 --seed 3 --out out/glyphs.svg
// node scripts/decal-sheet.ts --mode variants --text "SEAL 014" --palette ink --out out/variants.svg
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { sheet, catalog, variantSheet, make, toSvg, KINDS, PALETTES, SHEET_LAYOUTS, place, rng, type Decal, type DecalKind, type PaletteName, type SheetLayout } from "../assets/decals.ts";

const args = new Map<string, string>();
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  if (!argv[i].startsWith("--")) continue;
  const key = argv[i].slice(2), val = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true";
  args.set(key, val);
}
const get = (k: string, d: string) => args.get(k) ?? d;

if (args.has("help")) {
  console.log(`modes: sheet | kind | variants | catalog
layouts (mode sheet): ${SHEET_LAYOUTS.join(" | ")}
kinds: ${Object.keys(KINDS).join(", ")}
palettes: ${Object.keys(PALETTES).join(", ")}
flags: --mode --layout --kind --palette --seed --count --rows --cell --text --w --no-footer --out --png --chromium <path> --no-fonts`);
  process.exit(0);
}

const mode = get("mode", "sheet");
const palette = get("palette", "mono") as PaletteName;
const seed = get("seed", "1");
const layout = get("layout", "flow") as SheetLayout;
if (!SHEET_LAYOUTS.includes(layout)) throw new Error(`unknown layout ${layout}`);
const out = get("out", `out/${mode === "sheet" ? `${layout}-` : ""}${mode}-${palette}-${seed}.svg`);
const num = (k: string) => (args.has(k) ? +get(k, "0") : undefined);

let d: Decal;
if (mode === "catalog") {
  d = catalog({ seed, palette });
} else if (mode === "variants") {
  d = variantSheet({ text: get("text", "SEAL 014"), palette, seed });
} else if (mode === "kind") {
  const kind = get("kind", "glyphDisc") as DecalKind;
  if (!(kind in KINDS)) throw new Error(`unknown kind ${kind}`);
  const count = +get("count", "12"), r = rng(seed), cols = Math.ceil(Math.sqrt(count)), cell = 160;
  let body = "";
  for (let i = 0; i < count; i++) {
    const it = make(kind, { seed: r.int(1, 1e9), palette, ...(args.has("text") ? { text: get("text", "") } : {}) });
    body += place(it, (i % cols) * cell + 16, Math.floor(i / cols) * cell + 16, cell - 32, cell - 32);
  }
  d = { kind: "grid", w: cols * cell, h: Math.ceil(count / cols) * cell, body };
} else {
  d = sheet({ seed, palette, layout, w: num("w"), count: num("count"), rows: num("rows"), cell: num("cell"), ...(args.has("no-footer") ? { footer: false as const } : {}) });
}

const svg = toSvg(d, { background: true, palette, padding: mode === "sheet" ? 0 : 32, embedFonts: !args.has("no-fonts") });
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, svg);
console.log(`wrote ${out} (${Math.round(d.w)}×${Math.round(d.h)})`);

if (args.has("png")) {
  // Either package works; the name is a variable so neither is required at type-check time.
  const load = async (name: string) => ((await import(name)) as typeof import("playwright-core")).chromium;
  let chromium: Awaited<ReturnType<typeof load>>;
  try { chromium = await load("playwright-core"); }
  catch { try { chromium = await load("playwright"); } catch { console.error("PNG export needs playwright or playwright-core installed"); process.exit(1); } }
  const exe = args.get("chromium") ?? process.env.CHROMIUM_PATH;
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  const page = await browser.newPage({ viewport: { width: Math.ceil(d.w), height: Math.ceil(d.h) } });
  await page.setContent(`<html><body style="margin:0">${svg}</body></html>`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  const png = out.replace(/\.svg$/, ".png");
  await page.screenshot({ path: png, fullPage: true });
  await browser.close();
  console.log(`wrote ${png}`);
}

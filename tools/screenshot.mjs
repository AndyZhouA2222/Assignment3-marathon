// Screenshots each built demo at desktop and mobile width; fails on console errors or horizontal overflow.
// CHROMIUM_PATH=/path/to/chrome node tools/screenshot.mjs [name ...]
import { chromium } from "playwright-core";
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { DEMOS } from "./demos.mjs";

const only = process.argv.slice(2);
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
let failed = false;
for (const d of DEMOS) {
  const file = resolve("out/demos", d.name, "index.html");
  if ((only.length && !only.includes(d.name)) || !existsSync(file)) continue;
  mkdirSync("out/shots", { recursive: true });
  for (const [label, width] of [["desktop", 1280], ["mobile", 390]]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    const errors = [];
    page.on("console", m => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", e => errors.push(String(e)));
    await page.goto(`file://${file}`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.waitForTimeout(800);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    const path = `out/shots/${d.name}-${label}.png`;
    await page.screenshot({ path, fullPage: true });
    console.log(`${path}  overflow=${overflow}px  errors=${errors.length}`);
    errors.forEach(e => console.log("  ! " + e));
    if (overflow > 0 || errors.length) failed = true;
    await page.close();
  }
}
await browser.close();
process.exit(failed ? 1 : 0);

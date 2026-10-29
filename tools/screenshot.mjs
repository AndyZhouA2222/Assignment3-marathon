// Captures the README screenshots and the demo GIF: `npm run shots`.
// Needs `npm install` (playwright-core) and a Chrome or Chromium on the machine; set CHROME_PATH
// to use a specific binary. The GIF step also needs ffmpeg, and is skipped without it.
import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, readdirSync, renameSync, rmSync } from "node:fs";
import { chromium } from "playwright-core";

const PORT = 8123;
const URL = `http://127.0.0.1:${PORT}/`;
const OUT = "docs";
mkdirSync(OUT, { recursive: true });

const server = spawn("python3", ["-m", "http.server", String(PORT), "--bind", "127.0.0.1"], { stdio: "ignore" });
const wait = ms => new Promise(r => setTimeout(r, ms));
await wait(800);

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" });
const errors = [];

try {
  // ---------- stills
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  page.on("pageerror", e => errors.push(e.message));
  await page.goto(URL);
  await page.evaluate(() => localStorage.clear());
  await page.reload(); await wait(600);
  await build(page);
  await page.hover('.card[data-id="ag1"]'); await wait(250);
  await page.screenshot({ path: `${OUT}/build.png` });
  await skin(page);
  await page.screenshot({ path: `${OUT}/skin.png` });
  await fire(page, 1400);
  await page.screenshot({ path: `${OUT}/fire.png` });
  await page.close();

  // ---------- walkthrough video, turned into a GIF
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, recordVideo: { dir: `${OUT}/.video`, size: { width: 1280, height: 800 } } });
  const v = await ctx.newPage();
  await v.goto(URL);
  await v.evaluate(() => localStorage.clear());
  await v.reload(); await wait(900);
  await v.click("#trigger"); await wait(900);            // incomplete gun jams and points at the missing slot
  await build(v, 650);
  await skin(v, 650);
  await fire(v, 2600);
  await v.keyboard.press("r"); await wait(2600);
  await ctx.close();

  const webm = readdirSync(`${OUT}/.video`).find(f => f.endsWith(".webm"));
  renameSync(`${OUT}/.video/${webm}`, `${OUT}/demo.webm`);
  rmSync(`${OUT}/.video`, { recursive: true, force: true });
  const ff = spawnSync("ffmpeg", ["-y", "-i", `${OUT}/demo.webm`, "-vf",
    "fps=10,scale=800:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=64[p];[b][p]paletteuse=dither=bayer:bayer_scale=4",
    `${OUT}/demo.gif`], { stdio: "ignore" });
  console.log(ff.status === 0 ? "wrote docs/demo.gif" : "ffmpeg not found or failed; kept docs/demo.webm only");
} finally {
  await browser.close();
  server.kill();
}
console.log(errors.length ? "page errors:\n" + errors.join("\n") : "no page errors");

async function build(p, pause = 150) {
  await p.click('.slot[data-slot="barrel"]'); await p.click('.card[data-id="cb14"]'); await wait(pause);
  await p.click('.card[data-id="hv14"]'); await wait(pause * 2);  // wrong ammo: refused with a reason
  await p.click('.card[data-id="lt24"]'); await wait(pause);
  await p.click('.slot[data-slot="optic"]'); await p.click('.card[data-id="ms25"]'); await wait(pause);
  await p.click('.slot[data-slot="stock"]'); await p.click('.card[data-id="st2"]'); await wait(pause);
  await p.click('.slot[data-slot="grip"]'); await p.click('.card[data-id="vg2"]'); await wait(pause);
}

async function skin(p, pause = 150) {
  await p.keyboard.press("2"); await wait(pause);
  const box = await p.locator("#stage").boundingBox();
  const at = (x, y) => p.mouse.click(box.x + box.width * x, box.y + box.height * y);
  await p.click('.decal-tile[data-i="0"]'); await at(0.45, 0.42); await wait(pause);
  await p.click('.decal-tile[data-i="3"]'); await at(0.62, 0.45); await wait(pause);
  await p.fill("#text-input", "runner 07"); await p.click("#text-form button"); await at(0.3, 0.45); await wait(pause);
  await p.click('#tint-seg button:nth-child(3)'); await wait(pause);
  await p.locator("#wear").fill("55"); await wait(pause * 2);
}

async function fire(p, hold) {
  await p.keyboard.press("3"); await wait(500);
  const box = await p.locator("#stage").boundingBox();
  await p.mouse.move(box.x + box.width * 0.75, box.y + box.height * 0.44);
  await p.keyboard.down("Space"); await wait(hold); await p.keyboard.up("Space"); await wait(300);
}

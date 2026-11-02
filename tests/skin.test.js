// Run with: npm test
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { decalZones, fitToZone, decalSize, layout, gunBox, pathBox } from "../src/gun-svg.js";
import { PARTS, EMPTY_BUILD } from "../src/parts.js";

const full = { frame: "m77", barrel: "cb14", magazine: "lt24", optic: "ms25", grip: "vg2", stock: "st2" };

test("a full build offers a decal position on every part, plus the receiver halves", () => {
  const ids = decalZones(full).map(z => z.id).sort();
  assert.deepEqual(ids, ["barrel", "front", "grip", "magazine", "optic", "rear", "receiver", "stock"]);
  assert.deepEqual(decalZones(EMPTY_BUILD), []);
});

test("decal positions lie on the gun", () => {
  for (const frame of PARTS.frame) {
    const build = { ...full, frame: frame.id, stock: frame.sockets.stock ? "st2" : null };
    const box = gunBox(layout(build).placed);
    for (const z of decalZones(build)) {
      assert.ok(z.x >= box.x0 - 1 && z.y >= box.y0 - 1 && z.x + z.w <= box.x1 + 1 && z.y + z.h <= box.y1 + 1, `${frame.id}/${z.id} outside the gun`);
    }
  }
});

test("a decal fitted to a position stays inside it and keeps its proportions", () => {
  for (const dec of [{ kind: "glyphDisc", seed: 4 }, { kind: "hazard", seed: 1 }, { kind: "repeatBand", seed: 4 }, { text: "RUNNER 07", variant: "display" }]) {
    for (const z of decalZones(full)) {
      const d = { ...dec, ...fitToZone(dec, z) }, { w, h } = decalSize(d);
      assert.ok(w <= z.w + 0.01 && (h <= z.h + 0.01 || w === 12), `${dec.kind ?? dec.text} too big for ${z.id}`);
      assert.ok(Math.abs(d.x - (z.x + z.w / 2)) < 0.01 && Math.abs(d.y - (z.y + z.h / 2)) < 0.01);
    }
  }
});

test("every traced part has its light map on disk, covering the whole outline", () => {
  for (const [slot, list] of Object.entries(PARTS)) for (const p of list) {
    const sh = slot === "optic" ? p.draw(150) : p.draw();
    if (!sh.light) continue;
    assert.ok(existsSync(new URL(`../${sh.light.href}`, import.meta.url)), `${sh.light.href} is missing`);
    const [x, y, w, h] = sh.light.box, b = pathBox(sh.fills.map(f => f.d).join(""));
    assert.ok(x <= b.x0 + 1 && y <= b.y0 + 1 && x + w >= b.x1 - 1 && y + h >= b.y1 - 1, `${slot} ${p.id}: light map does not cover the part`);
  }
});

test("a barrel too tall for the frame is shrunk to fit; on its own gun every barrel keeps its size", () => {
  for (const frame of PARTS.frame) for (const barrel of PARTS.barrel) {
    const { k } = layout({ ...EMPTY_BUILD, frame: frame.id, barrel: barrel.id }).placed.find(p => p.slot === "barrel");
    assert.ok(barrel.back * k <= 1.4 * frame.face + 0.01, `${barrel.id} too tall for ${frame.id}`);
    if (barrel.source === frame.source) assert.equal(k, 1, `${barrel.id} resized on its own ${frame.id}`);
  }
  const breacher = layout({ ...EMPTY_BUILD, frame: "m77", barrel: "hs22" }).placed.find(p => p.slot === "barrel");
  assert.ok(breacher.k < 0.7);
});

test("away from its own gun a foregrip hangs under the barrel, in front of the receiver", () => {
  for (const frame of PARTS.frame) for (const barrel of PARTS.barrel.filter(b => b.under)) for (const grip of PARTS.grip) {
    if (grip.source === frame.source) continue;
    const lay = layout({ ...EMPTY_BUILD, frame: frame.id, barrel: barrel.id, grip: grip.id });
    const g = lay.placed.find(p => p.slot === "grip"), b = gunBox([g]), [mx, my] = frame.sockets.muzzle;
    const at = `${grip.id} under ${barrel.id} on ${frame.id}`;
    assert.ok(b.x0 >= mx - 16 - 0.01 && b.x1 <= lay.tip[0] + 0.01, `${at}: not under the barrel`);
    assert.ok(g.y > my, `${at}: above the bore`);
  }
});

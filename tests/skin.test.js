// Run with: npm test
import test from "node:test";
import assert from "node:assert/strict";
import { decalZones, fitToZone, decalSize, layout, gunBox } from "../src/gun-svg.js";
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

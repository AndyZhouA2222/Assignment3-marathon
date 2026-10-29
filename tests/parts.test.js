// Run with: npm test
import test from "node:test";
import assert from "node:assert/strict";
import { PARTS, part, canAttach, attach, computeStats, previewDelta, breakdown, EMPTY_BUILD, DEFAULT_BUILD } from "../src/parts.js";

const rifle = { ...EMPTY_BUILD, frame: "m77", barrel: "cb14", magazine: "lt24" };

test("every part has an id, a name and a drawable shape", () => {
  for (const [slot, list] of Object.entries(PARTS)) {
    const ids = new Set();
    for (const p of list) {
      assert.ok(p.id && p.name, `${slot} part without id or name`);
      assert.ok(!ids.has(p.id), `duplicate ${slot} id ${p.id}`);
      ids.add(p.id);
      assert.ok(p.draw().fills.length, `${slot}/${p.id} has no fills`);
    }
  }
});

test("parts other than the frame need a frame", () => {
  const r = canAttach(EMPTY_BUILD, "barrel", "cb14");
  assert.equal(r.ok, false);
  assert.match(r.reason, /frame/i);
});

test("a magazine must hold the ammo the frame feeds", () => {
  assert.equal(canAttach(rifle, "magazine", "lt35").ok, true);
  const r = canAttach(rifle, "magazine", "hv14");
  assert.equal(r.ok, false);
  assert.match(r.reason, /Light rounds/);
  assert.match(r.reason, /Heavy rounds/);
});

test("traced frames have every socket; only the shotgun and the pistol lack a stock mount", () => {
  for (const f of PARTS.frame) {
    const s = f.sockets;
    for (const name of ["muzzle", "mag", "rail", "trigger"]) assert.ok(Array.isArray(s[name]), `${f.id} has no ${name} socket`);
    assert.equal(s.rail.length, 3, `${f.id} rail needs x, y and length`);
    assert.equal(s.stock === null, f.id === "wstr" || f.id === "magnum", `${f.id} stock mount`);
  }
});

test("the pistol frame has no stock mount", () => {
  const r = canAttach({ ...EMPTY_BUILD, frame: "magnum" }, "stock", "st2");
  assert.equal(r.ok, false);
});

test("a foregrip needs a barrel with a rail under it", () => {
  assert.equal(canAttach({ ...rifle, barrel: null }, "grip", "vg2").ok, false);
  assert.equal(canAttach({ ...rifle, barrel: "sb09" }, "grip", "vg2").ok, false);
  assert.equal(canAttach(rifle, "grip", "vg2").ok, true);
});

test("swapping the frame drops parts that no longer fit and says why", () => {
  const build = { ...rifle, stock: "st2", grip: "vg2" };
  const { build: next, dropped } = attach(build, "frame", "magnum");
  assert.equal(next.frame, "magnum");
  assert.equal(next.magazine, null); // light-round mag does not fit a heavy-round pistol
  assert.equal(next.stock, null);    // pistol has no stock mount
  assert.equal(next.barrel, "cb14"); // barrels fit any muzzle
  assert.deepEqual(dropped.map(d => d.slot).sort(), ["magazine", "stock"]);
  assert.ok(dropped.every(d => d.reason));
});

test("swapping to a stub barrel drops the foregrip", () => {
  const { build, dropped } = attach({ ...rifle, grip: "vg2" }, "barrel", "sb09");
  assert.equal(build.grip, null);
  assert.equal(dropped[0].slot, "grip");
});

test("removing the frame clears everything", () => {
  const { build, dropped } = attach(rifle, "frame", null);
  assert.deepEqual(build, EMPTY_BUILD);
  assert.equal(dropped.length, 2);
});

test("the default bench is a bare frame that cannot fire yet", () => {
  const s = computeStats(DEFAULT_BUILD);
  assert.equal(s.complete, false);
  assert.deepEqual(s.missing, ["barrel", "magazine"]);
});

test("a complete rifle reports stats normalised to 0..1", () => {
  const s = computeStats(rifle);
  assert.equal(s.complete, true);
  for (const k of ["fN", "aN", "hN"]) assert.ok(s[k] >= 0 && s[k] <= 1, `${k} = ${s[k]}`);
  assert.equal(s.cap, 24);
  assert.equal(s.mode, "auto");
});

test("parts move the three stats the way their cards say", () => {
  const base = computeStats(rifle);
  const scoped = computeStats({ ...rifle, optic: "ls4" });
  assert.ok(scoped.a > base.a, "a hi-zoom scope adds accuracy");
  assert.ok(scoped.h < base.h, "and costs handling");
  const breacher = computeStats({ ...rifle, barrel: "hs22" });
  assert.ok(breacher.f > base.f, "the breacher barrel adds firepower");
  const d = previewDelta(rifle, "optic", "ls4");
  assert.ok(d.a > 0 && d.h < 0);
});

test("the breakdown names every fitted part and adds up to the totals", () => {
  const build = { ...rifle, barrel: "lf30", optic: "ms25", grip: "vg2" };
  const rows = breakdown(build), s = computeStats(build);
  assert.deepEqual(rows.map(r => r.id), ["m77", "lf30", "lt24", "ms25", "vg2", null]); // null: the empty stock mount
  const sum = k => rows.reduce((t, r) => t + r[k], 0);
  assert.ok(Math.abs(sum("f") - s.f) < 0.2, `firepower ${sum("f")} vs ${s.f}`);
  assert.ok(Math.abs(sum("a") - s.a) < 0.2 && Math.abs(sum("h") - s.h) < 0.2);
  assert.equal(rows.find(r => r.id === "ms25").a, part("optic", "ms25").d.a);
});

test("leaving the stock mount empty trades accuracy for handling", () => {
  const withStock = computeStats({ ...rifle, stock: "sk1" });
  const without = computeStats(rifle);
  const sk1 = part("stock", "sk1");
  assert.equal(Math.round((withStock.a - without.a) * 10) / 10, 8 + sk1.d.a);
  assert.equal(Math.round((without.h - withStock.h) * 10) / 10, 6 - sk1.d.h);
});

test("a volt cell turns charge into shots using the frame's drain", () => {
  const s = computeStats({ ...EMPTY_BUILD, frame: "zeus", barrel: "rc50", magazine: "vc100" });
  assert.equal(s.volt, true);
  assert.ok(s.cap >= 1 && s.cap < 100);
});

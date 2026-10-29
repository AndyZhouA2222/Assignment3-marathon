import test from "node:test";
import assert from "node:assert/strict";
import { soundParams, feelParams, describe } from "../src/feel.js";

const mid = { fN: 0.5, aN: 0.5, hN: 0.5, complete: true };
const at = (k, v) => ({ ...mid, [k]: v });

test("more firepower: lower, longer, louder shot and a bigger kick", () => {
  const lo = soundParams(at("fN", 0.1)), hi = soundParams(at("fN", 0.9));
  assert.ok(hi.thumpHz < lo.thumpHz);
  assert.ok(hi.thumpDecay > lo.thumpDecay);
  assert.ok(hi.bodyGain > lo.bodyGain);
  assert.ok(hi.tail > lo.tail);
  assert.ok(feelParams(at("fN", 0.9)).kickPx > feelParams(at("fN", 0.1)).kickPx);
});

test("more accuracy: tighter crack, fewer echoes, smaller cone", () => {
  const lo = soundParams(at("aN", 0.1)), hi = soundParams(at("aN", 0.9));
  assert.ok(hi.bodyQ > lo.bodyQ);
  assert.ok(hi.rattle < lo.rattle);
  assert.ok(feelParams(at("aN", 0.9)).spreadDeg < feelParams(at("aN", 0.1)).spreadDeg);
});

test("more handling: faster mechanism, stiffer recovery, less sway", () => {
  const lo = soundParams(at("hN", 0.1)), hi = soundParams(at("hN", 0.9));
  assert.ok(hi.mechDelay < lo.mechDelay);
  const flo = feelParams(at("hN", 0.1)), fhi = feelParams(at("hN", 0.9));
  assert.ok(fhi.stiffness > flo.stiffness);
  assert.ok(fhi.swayCm < flo.swayCm);
});

test("every output is a finite number at the extremes", () => {
  for (const v of [0, 1]) {
    const s = { fN: v, aN: v, hN: v };
    for (const [k, x] of Object.entries({ ...soundParams(s), ...feelParams(s) }))
      if (typeof x === "number") assert.ok(Number.isFinite(x), `${k} at ${v}`);
  }
});

test("the readout puts the numbers into words", () => {
  const words = describe({ ...mid, suppressed: true });
  assert.deepEqual(words.map(w => w.k), ["Report", "Tone", "Kick", "Recovery"]);
  assert.match(words[0].v, /muffled/);
  assert.equal(describe({ complete: false, fN: 0 }), null);
});

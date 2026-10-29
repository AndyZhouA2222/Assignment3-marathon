// Turns the three headline stats into how the gun sounds and moves. Pure functions, no DOM.
// fN, aN, hN are firepower / accuracy / handling normalised to 0..1 (see parts.js `norm`).

const lerp = (a, b, t) => a + (b - a) * t;

/** Synth settings for one shot. */
export function soundParams(s) {
  const { fN, aN, hN } = s;
  return {
    // Firepower: lower, longer, louder body and a bigger room tail.
    thumpHz: lerp(140, 42, fN),
    thumpDecay: lerp(0.07, 0.34, fN),
    bodyGain: lerp(0.45, 1, fN),
    bodyHz: lerp(2200, 700, fN),
    tail: lerp(0.15, 1.1, fN),
    // Accuracy: a tight, focused crack versus a wide, ragged one with stray echoes.
    bodyQ: lerp(0.5, 3.2, aN),
    crackHz: lerp(2000, 5200, aN),
    rattle: Math.round(lerp(4, 0, aN)),
    // Handling: how fast and bright the mechanism cycles after the shot.
    mechDelay: lerp(0.2, 0.05, hN),
    mechHz: lerp(900, 2600, hN),
    volt: !!s.volt,
    suppressed: !!s.suppressed,
  };
}

/** Recoil, sway and spread for the firing range. Units: px for the gun sprite, degrees for spread. */
export function feelParams(s) {
  const { fN, aN, hN } = s;
  return {
    kickPx: lerp(5, 34, fN) * lerp(1.2, 0.7, aN),   // how far the gun jumps back
    kickDeg: lerp(1.5, 11, fN) * lerp(1.2, 0.6, aN), // how far the muzzle climbs
    stiffness: lerp(90, 420, hN),                   // spring pulling the gun back to rest
    damping: lerp(9, 26, hN),
    climbPerShot: lerp(0.4, 4.5, fN) * lerp(1.3, 0.5, aN), // aim drift up per shot, in cm at 10 m
    climbRecover: lerp(4, 22, hN),                  // cm per second the aim settles
    swayCm: lerp(9, 1.2, hN),                       // idle aim wobble at 10 m
    spreadDeg: lerp(1.1, 0.06, aN),                 // cone of the first shot
    bloomDeg: lerp(0.35, 0.03, aN),                 // extra cone added per shot
    bloomRecover: lerp(0.6, 3, hN),                 // degrees per second the cone shrinks
    shakePx: lerp(1, 9, fN),
    flash: lerp(0.6, 1.8, fN),
  };
}

const pick = (t, words) => words[Math.min(words.length - 1, Math.floor(t * words.length))];

/** Plain-language readout so the player can connect the numbers to what they hear and feel. */
export function describe(s) {
  if (!s.complete && !s.fN) return null;
  return [
    { k: "Report", v: pick(s.fN, ["Light snap", "Sharp crack", "Hard bark", "Deep boom"]) + (s.suppressed ? ", muffled" : s.volt ? ", electric" : "") },
    { k: "Tone", v: pick(s.aN, ["Ragged", "Loose", "Clean", "Laser clean"]) },
    { k: "Kick", v: pick(s.fN * (1.2 - 0.5 * s.aN), ["Soft", "Moderate", "Heavy", "Brutal"]) },
    { k: "Recovery", v: pick(s.hN, ["Sluggish", "Steady", "Quick", "Instant"]) },
  ];
}

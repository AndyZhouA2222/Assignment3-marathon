// Synthesised sound with the Web Audio API: no audio files. Every gunshot is built from four
// layers whose settings come from feel.js: a noise crack, a filtered noise body, a low thump and
// the mechanism clicking afterwards. Browsers only allow audio after a click or key press, so the
// context is created on the first trigger pull; if that fails the app carries on silently.

let ctx = null, master = null, verb = null, noise = null;
export const audio = { available: true, muted: false, error: null };

function setup() {
  if (ctx) return true;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) throw new Error("Web Audio is not supported in this browser");
    ctx = new AC();
    master = ctx.createDynamicsCompressor();
    master.threshold.value = -14; master.ratio.value = 6;
    const out = ctx.createGain(); out.gain.value = 0.8;
    master.connect(out).connect(ctx.destination);
    // Two seconds of white noise, reused by every layer.
    noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const ch = noise.getChannelData(0);
    for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
    // A decaying noise burst as the impulse response gives a cheap concrete-room reverb.
    const len = ctx.sampleRate * 1.6, ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3; }
    verb = ctx.createConvolver(); verb.buffer = ir; verb.connect(master);
    return true;
  } catch (e) {
    audio.available = false; audio.error = e.message; ctx = null;
    return false;
  }
}

/** Call from a user gesture. Returns false when sound cannot play. */
export function unlock() {
  if (!setup()) return false;
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return true;
}
const ready = () => !audio.muted && audio.available && ctx && ctx.state !== "closed";

function env(g, t, peak, attack, decay) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
}
function noiseSrc(t, dur) {
  const s = ctx.createBufferSource(); s.buffer = noise;
  s.start(t, Math.random() * 1.5, dur + 0.05);
  return s;
}
function filter(type, hz, q = 1) { const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = hz; f.Q.value = q; return f; }

/** One gunshot. `p` comes from feel.soundParams(stats). */
export function shot(p) {
  if (!ready()) return;
  const t = ctx.currentTime + 0.005;
  const bus = ctx.createGain(); bus.gain.value = p.suppressed ? 0.35 : 1;
  let dest = master;
  if (p.suppressed) { const lp = filter("lowpass", 1300, 0.7); lp.connect(master); dest = lp; }
  bus.connect(dest);
  const send = ctx.createGain(); send.gain.value = p.suppressed ? 0.05 : 0.12 + p.tail * 0.35; bus.connect(send).connect(verb);

  // 1. crack: very short bright noise
  const crack = noiseSrc(t, 0.02), cg = ctx.createGain();
  crack.connect(filter("highpass", p.crackHz, 0.8)).connect(cg).connect(bus);
  env(cg, t, 0.9, 0.001, 0.018);

  // 2. body: band-passed noise, or a falling electric sweep for volt weapons
  const bg = ctx.createGain();
  if (p.volt) {
    const o = ctx.createOscillator(); o.type = "sawtooth";
    o.frequency.setValueAtTime(2400, t); o.frequency.exponentialRampToValueAtTime(160, t + p.thumpDecay + 0.1);
    o.connect(filter("bandpass", 1200, 1.4)).connect(bg).connect(bus);
    o.start(t); o.stop(t + p.thumpDecay + 0.2);
  } else {
    const body = noiseSrc(t, p.thumpDecay + 0.15);
    body.connect(filter("bandpass", p.bodyHz, p.bodyQ)).connect(bg).connect(bus);
  }
  env(bg, t, p.bodyGain, 0.002, p.thumpDecay + 0.05);

  // 3. thump: pitched-down sine
  const o = ctx.createOscillator(), og = ctx.createGain();
  o.frequency.setValueAtTime(p.thumpHz * 2.4, t); o.frequency.exponentialRampToValueAtTime(p.thumpHz, t + 0.06);
  o.connect(og).connect(bus); o.start(t); o.stop(t + p.thumpDecay + 0.1);
  env(og, t, 0.6 + p.bodyGain * 0.5, 0.003, p.thumpDecay);

  // 4. rattle: stray echoes when accuracy is low
  for (let i = 0; i < p.rattle; i++) {
    const tt = t + 0.012 + Math.random() * 0.05, r = noiseSrc(tt, 0.02), rg = ctx.createGain();
    r.connect(filter("bandpass", 900 + Math.random() * 2500, 2)).connect(rg).connect(bus);
    env(rg, tt, 0.25, 0.001, 0.02);
  }
  // 5. mechanism: two clicks, faster and brighter with better handling
  click(t + p.mechDelay, p.mechHz, 0.14);
  click(t + p.mechDelay * 1.7, p.mechHz * 0.8, 0.1);
}

function click(t, hz, gain) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = "square"; o.frequency.value = hz;
  o.connect(filter("bandpass", hz, 3)).connect(g).connect(master);
  o.start(t); o.stop(t + 0.03);
  env(g, t, gain, 0.001, 0.02);
}

/** Empty chamber. */
export function dryFire() { if (ready()) { const t = ctx.currentTime; click(t, 1800, 0.25); click(t + 0.04, 1200, 0.12); } }
/** Magazine out, magazine in, charge. `secs` is the reload length. */
export function reload(secs) {
  if (!ready()) return;
  const t = ctx.currentTime;
  click(t + 0.05, 700, 0.2); click(t + secs * 0.55, 500, 0.25); click(t + secs * 0.6, 900, 0.2); click(t + secs * 0.92, 1400, 0.22);
}
/** A part locking into place. */
export function clack(heavy = 0.5) {
  if (!ready()) return;
  const t = ctx.currentTime;
  click(t, 600 + 500 * (1 - heavy), 0.25);
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(90, t + 0.08);
  o.connect(g).connect(master); o.start(t); o.stop(t + 0.1); env(g, t, 0.35, 0.002, 0.08);
}
/** A decal pressed onto the gun. */
export function stick() {
  if (!ready()) return;
  const t = ctx.currentTime, s = noiseSrc(t, 0.08), g = ctx.createGain();
  s.connect(filter("lowpass", 1400, 0.8)).connect(g).connect(master);
  env(g, t, 0.3, 0.005, 0.07);
}
/** Short UI blip; `bad` makes it a low buzz for refusals. */
export function blip(bad = false) {
  if (!ready()) return;
  const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
  o.type = bad ? "sawtooth" : "triangle"; o.frequency.value = bad ? 120 : 1320;
  o.connect(g).connect(master); o.start(t); o.stop(t + 0.12); env(g, t, bad ? 0.18 : 0.12, 0.003, bad ? 0.11 : 0.05);
}

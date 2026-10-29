// The trigger and the firing range. Pulling the trigger works on every step: on the bench you hear
// and see the gun fire; on the Fire step the shots also travel downrange to a target.
// The core loop: input (press) → checks (complete? loaded? cycled?) → response (sound, recoil, impact)
// → feedback (ammo counter, hit markers, crosshair bloom, magazine report).
import { computeStats, SLOTS } from "./parts.js";
import { soundParams, feelParams } from "./feel.js";
import * as sfx from "./audio.js";

const NS = "http://www.w3.org/2000/svg";
const DISTANCES = [10, 25, 50, 100];
const TARGET = { x: 750, y: 228 };                 // stage position of the target's chest centre
const HEAD = { x: 0, y: -40, r: 11 };               // target shape in centimetres
const TORSO = [[-25, -26], [25, -26], [31, -14], [23, 42], [-23, 42], [-31, -14]];
const inPoly = (x, y, pts) => { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
const missingLabel = ids => ids.map(id => SLOTS.find(s => s.id === id).label.toLowerCase()).join(", ");

export function createRange(app) {
  const { state, $, layers } = app;
  let stats, snd, fp;
  let ammo = 0, reloading = false, reloadStart = 0, reloadEnd = 0, lastShot = -1e9, held = false, burstLeft = 0, trigUntil = 0, cycleMsgUntil = 0;
  let kx = 0, kv = 0, rot = 0, rv = 0, shake = 0, bloom = 0, climb = 0, flashUntil = 0;
  let aim = { x: 0, y: 0 }, session, marks = [], tracers = [], casings = [];
  let jamText = "";

  const casingG = document.createElementNS(NS, "g");
  layers.root.insertBefore(casingG, layers.ui);
  const hud = { now: $("#ammo-now"), cap: $("#ammo-cap"), state: $("#ammo-state") };
  $("#hud").hidden = false;
  const trigBtn = $("#trigger");

  function refreshStats() { stats = computeStats(state.build); snd = soundParams(stats); fp = feelParams(stats); }
  function newSession() { session = { shots: 0, hits: 0, heads: 0, dmg: 0, pts: [] }; marks = []; }
  refreshStats(); ammo = stats.cap; newSession();

  const ppc = () => Math.min(6, Math.max(0.6, (4.6 * (stats.zoom || 1) * 10) / state.distance)); // px per cm on the target

  /* ---------- trigger ---------- */
  function press() {
    held = true;
    if (!sfx.unlock() && !sfx.audio.warned) { sfx.audio.warned = true; app.renderSound?.(); app.toast(`No sound in this browser (${sfx.audio.error}). Firing still works.`, "bad", 4000); }
    if (!stats.complete) return jam();
    const now = performance.now(), interval = 60000 / stats.rpm;
    if (reloading) { cycleMsgUntil = now + 500; return; }
    if (now - lastShot < interval) { cycleMsgUntil = now + 300; return; } // pressed faster than the action cycles
    if (stats.mode === "burst") { burstLeft = stats.burst; fireOne(now); burstLeft--; }
    else fireOne(now);
  }
  function release() { held = false; }

  function jam() {
    held = false;
    sfx.dryFire();
    trigBtn.classList.add("jam"); setTimeout(() => trigBtn.classList.remove("jam"), 600);
    jamText = `Jammed · no ${missingLabel(stats.missing)}`;
    app.toast(`Can't fire yet: fit a ${missingLabel(stats.missing)} first.`, "bad", 3600);
    app.goToSlot(stats.missing[0]);
    renderHud();
  }

  function fireOne(now) {
    if (ammo <= 0) { sfx.dryFire(); burstLeft = 0; held = stats.mode === "auto" ? held : false; renderHud(); return; }
    ammo--; lastShot = now; jamText = "";
    sfx.shot(snd);
    // Recoil impulse: the spring in tick() pulls the gun back; stiffness and damping come from handling.
    kv += fp.kickPx * 18; rv += fp.kickDeg * 18;
    shake = app.reducedMotion ? 0 : fp.shakePx;
    flashUntil = now + 55; trigUntil = now + 70;
    if (!stats.volt && !app.reducedMotion) spawnCasing();
    if (state.step === "fire") shootDownrange();
    bloom += fp.bloomDeg; climb += fp.climbPerShot;
    if (ammo === 0) { burstLeft = 0; setTimeout(magReport, 380); }
    renderHud();
  }

  function shootDownrange() {
    const d = state.distance, outOfRange = d > (stats.range ?? 0);
    const t = performance.now() / 1000, k = d / 10;
    const sway = swayAt(t);
    const poa = { x: aim.x + sway.x * k, y: aim.y + (sway.y - climb) * k };
    const pellets = stats.pellets, spreadDeg = (fp.spreadDeg + bloom + (pellets > 1 ? 2.2 : 0)) * (outOfRange ? 1.5 : 1);
    const radius = Math.tan((spreadDeg * Math.PI) / 180) * d * 100;
    session.shots++;
    for (let i = 0; i < pellets; i++) {
      const ang = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * radius;
      const x = poa.x + Math.cos(ang) * r, y = poa.y + Math.sin(ang) * r;
      const head = Math.hypot(x - HEAD.x, y - HEAD.y) <= HEAD.r, body = !head && inPoly(x, y, TORSO);
      const dmg = head || body ? stats.damage * (head ? stats.precision : 1) * (outOfRange ? 0.6 : 1) : 0;
      if (head || body) { session.hits++; session.pts.push([x, y]); if (head) session.heads++; session.dmg += dmg; }
      marks.push({ x, y, kind: head ? "head" : body ? "body" : "miss" });
      tracers.push({ x, y, until: performance.now() + 70 });
    }
    drawMarks(); renderReadout();
  }

  function magReport() {
    if (state.step !== "fire" || !session.shots) { app.toast("Magazine empty. Press R to reload."); return; }
    const g = groupSize();
    app.toast(`Mag report · ${session.shots} shots · ${session.hits} hits · ${session.heads} head · ${Math.round(session.dmg)} damage${g ? ` · group ${g} cm` : ""}. Press R to reload.`, "ok", 6000);
  }
  function groupSize() {
    let m = 0; const p = session.pts;
    for (let i = 0; i < p.length; i++) for (let j = i + 1; j < p.length; j++) m = Math.max(m, Math.hypot(p[i][0] - p[j][0], p[i][1] - p[j][1]));
    return p.length > 1 ? Math.round(m) : 0;
  }

  function reload() {
    if (!stats.complete) { app.toast(`Nothing to reload: fit a ${missingLabel(stats.missing)} first.`, "bad"); app.goToSlot(stats.missing[0]); return; }
    if (reloading) return;
    if (ammo === stats.cap) { app.toast("Magazine is already full."); return; }
    reloading = true; reloadStart = performance.now(); reloadEnd = reloadStart + stats.reload * 1000;
    sfx.reload(stats.reload);
    renderHud();
  }

  /* ---------- per-frame loop ---------- */
  let last = performance.now();
  function tick(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    // springs back to rest
    const ka = -fp.stiffness * kx - fp.damping * kv; kv += ka * dt; kx += kv * dt;
    const ra = -fp.stiffness * rot - fp.damping * rv; rv += ra * dt; rot += rv * dt;
    climb = Math.max(0, climb - fp.climbRecover * dt);
    bloom = Math.max(0, bloom - fp.bloomRecover * dt);
    shake *= Math.pow(0.0005, dt);

    if (stats.complete && !reloading) {
      const interval = 60000 / stats.rpm;
      if (stats.mode === "auto" && held && now - lastShot >= interval) fireOne(now);
      if (burstLeft > 0 && now - lastShot >= interval) { fireOne(now); burstLeft--; }
    }
    if (reloading) animateReload(now);

    const [px, py] = stats.complete || state.build.frame ? (app.lay?.trigger ?? [0, 0]) : [0, 0];
    layers.kick.setAttribute("transform", `translate(${(-kx).toFixed(2)} 0) rotate(${(-rot).toFixed(2)} ${px} ${py})`);
    app.stage.style.transform = shake > 0.2 ? `translate(${((Math.random() - 0.5) * shake).toFixed(1)}px, ${((Math.random() - 0.5) * shake).toFixed(1)}px)` : "";
    drawFx(now);
    drawCasings(dt);
    if (state.step === "fire") drawCrosshair(now);
    if (now < cycleMsgUntil || hud.cycling) renderHud(now);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  function animateReload(now) {
    const t = (now - reloadStart) / (reloadEnd - reloadStart);
    const drop = t < 0.25 ? t / 0.25 : t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3;
    app.offsetPart("magazine", 0, drop * 150);
    layers.gun.querySelectorAll('[data-slot="magazine"]').forEach(el => (el.style.opacity = String(1 - drop * 0.9)));
    if (t >= 1) {
      reloading = false; ammo = stats.cap; newSession(); drawMarks(); renderReadout();
      app.offsetPart("magazine", 0, 0);
      layers.gun.querySelectorAll('[data-slot="magazine"]').forEach(el => (el.style.opacity = ""));
      renderHud();
    } else if (Math.floor(now / 100) !== Math.floor((now - 16) / 100)) renderHud();
  }

  /* ---------- drawing ---------- */
  function swayAt(t) {
    const s = fp.swayCm;
    return { x: (s * (Math.sin(t * 1.3) + 0.5 * Math.sin(t * 3.1 + 1))) / 1.5, y: (s * (Math.sin(t * 1.7 + 2) + 0.5 * Math.sin(t * 2.3))) / 1.5 };
  }
  function drawFx(now) {
    const tip = app.lay?.tip;
    if (!tip || now > flashUntil) { if (layers.fx.firstChild) layers.fx.innerHTML = ""; }
    else if (!layers.fx.firstChild) {
      const s = fp.flash * (stats.suppressed ? 0.35 : 1), [x, y] = tip;
      const pts = Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2, r = (i % 2 ? 9 : 26 + Math.random() * 18) * s; return `${(x + 10 * s + Math.cos(a) * r * 1.6).toFixed(1)},${(y + Math.sin(a) * r).toFixed(1)}`; }).join(" ");
      const c1 = stats.volt ? "#01FFFF" : "#FFD27A", c2 = stats.volt ? "#C2FE0B" : "#FFFFFF";
      layers.fx.innerHTML = `<polygon points="${pts}" fill="${c1}"/><circle cx="${x + 8 * s}" cy="${y}" r="${9 * s}" fill="${c2}"/>`;
    }
    const blade = layers.gun.querySelector(".trigger-blade");
    if (blade) blade.setAttribute("transform", `translate(${blade.dataset.x} ${blade.dataset.y}) rotate(${now < trigUntil ? 22 : 0})`);
  }
  function spawnCasing() {
    const port = app.lay?.port; if (!port) return;
    casings.push({ x: port[0], y: port[1], vx: -80 - Math.random() * 60, vy: -260 - Math.random() * 90, a: 0, va: 600 + Math.random() * 400, life: 0.9 });
  }
  function drawCasings(dt) {
    if (!casings.length) { if (casingG.firstChild) casingG.innerHTML = ""; return; }
    casings = casings.filter(c => (c.life -= dt) > 0);
    for (const c of casings) { c.vy += 900 * dt; c.x += c.vx * dt; c.y += c.vy * dt; c.a += c.va * dt; }
    casingG.innerHTML = casings.map(c => `<rect x="-6" y="-2.5" width="12" height="5" fill="#C9A24A" transform="translate(${c.x.toFixed(1)} ${c.y.toFixed(1)}) rotate(${c.a.toFixed(0)})"/>`).join("");
  }
  function drawCrosshair(now) {
    const k = state.distance / 10, sway = swayAt(now / 1000), p = ppc();
    const x = TARGET.x + (aim.x + sway.x * k) * p, y = TARGET.y + (aim.y + (sway.y - climb) * k) * p;
    const spread = Math.tan(((fp.spreadDeg + bloom + (stats.pellets > 1 ? 2.2 : 0)) * Math.PI) / 180) * state.distance * 100 * p;
    const g = 6 + Math.min(60, spread);
    let ch = layers.range.querySelector(".crosshair");
    if (!ch) { ch = document.createElementNS(NS, "g"); ch.setAttribute("class", "crosshair"); layers.range.append(ch); }
    ch.innerHTML = `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${Math.max(3, spread).toFixed(1)}"/>` +
      [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([a, b]) => `<line x1="${(x + a * g).toFixed(1)}" y1="${(y + b * g).toFixed(1)}" x2="${(x + a * (g + 12)).toFixed(1)}" y2="${(y + b * (g + 12)).toFixed(1)}"/>`).join("");
    // tracers from the muzzle to where each pellet landed
    let tg = layers.range.querySelector(".tracers");
    if (!tg) { tg = document.createElementNS(NS, "g"); tg.setAttribute("class", "tracers"); layers.range.append(tg); }
    tracers = tracers.filter(t => t.until > now);
    if (tracers.length && app.lay?.tip) {
      const m = layers.gun.getCTM(), tip = new DOMPoint(...app.lay.tip).matrixTransform(m);
      tg.innerHTML = tracers.map(t => `<line class="tracer" x1="${tip.x.toFixed(1)}" y1="${tip.y.toFixed(1)}" x2="${(TARGET.x + t.x * p).toFixed(1)}" y2="${(TARGET.y + t.y * p).toFixed(1)}"/>`).join("");
    } else if (tg.firstChild) tg.innerHTML = "";
  }
  function drawMarks() {
    const g = layers.lane.querySelector(".marks"); if (!g) return;
    const p = ppc();
    g.innerHTML = marks.map(m => {
      const x = TARGET.x + m.x * p, y = TARGET.y + m.y * p;
      return m.kind === "miss" ? `<circle class="miss" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.5"/>`
        : `<path class="hit-x${m.kind === "head" ? " head" : ""}" d="M${x - 5} ${y - 5}L${x + 5} ${y + 5}M${x + 5} ${y - 5}L${x - 5} ${y + 5}"/>`;
    }).join("");
  }

  function renderLane() {
    layers.range.innerHTML = "";
    if (state.step !== "fire") { layers.lane.innerHTML = ""; renderHud(); return; }
    const p = ppc(), T = TARGET;
    const torso = TORSO.map(([x, y]) => `${(T.x + x * p).toFixed(1)},${(T.y + y * p).toFixed(1)}`).join(" ");
    let floor = "";
    for (let i = 0; i <= 8; i++) { const y = 300 + i * i * 3.5; floor += `<line class="lane-floor" x1="0" y1="${y}" x2="1000" y2="${y}"/>`; }
    for (let i = -6; i <= 6; i++) floor += `<line class="lane-floor" x1="${T.x + i * 18}" y1="300" x2="${T.x + i * 160}" y2="520"/>`;
    const rings = [0.33, 0.66].map(f => `<polygon class="target-ring" points="${TORSO.map(([x, y]) => `${(T.x + x * f * p).toFixed(1)},${(T.y + (y * f + 4) * p).toFixed(1)}`).join(" ")}"/>`).join("");
    layers.lane.innerHTML = `<g>${floor}</g><line x1="${T.x}" y1="${T.y + 42 * p}" x2="${T.x}" y2="300" stroke="#333" stroke-width="3"/>` +
      `<rect x="${T.x - 60 * p}" y="${T.y - 70 * p}" width="${120 * p}" height="${125 * p}" fill="#121212" stroke="#222"/>` +
      `<polygon points="${torso}" fill="#E8E6DF"/><circle cx="${T.x + HEAD.x * p}" cy="${T.y + HEAD.y * p}" r="${HEAD.r * p}" fill="#E8E6DF"/>${rings}` +
      `<circle cx="${T.x}" cy="${T.y + 4 * p}" r="${3 * p}" fill="#0A0A0A"/>` +
      `<text x="${T.x - 60 * p}" y="${T.y - 70 * p - 8}" fill="#8A8A85" font-family="JetBrains Mono, monospace" font-size="12" letter-spacing="1.5">TARGET // ${state.distance} M · ZOOM ${stats.zoom || 1}×</text>` +
      `<g class="marks"></g>`;
    drawMarks(); renderHud(); renderReadout();
  }

  function renderReadout() {
    $("#distance-seg").innerHTML = DISTANCES.map(d => `<button data-d="${d}" aria-pressed="${state.distance === d}">${d} m</button>`).join("");
    const inRange = stats.range && state.distance <= stats.range;
    const g = groupSize();
    const rows = [
      ["Effective range", stats.range ? `${stats.range} m` : "—"],
      ["Status", !stats.complete ? "Incomplete" : inRange ? "In range" : "Beyond range · −40% dmg"],
      ["Shots", session.shots], ["Hits", session.hits], ["Headshots", session.heads], ["Damage", Math.round(session.dmg)], ["Group", g ? `${g} cm` : "—"],
    ];
    $("#range-readout").innerHTML = rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("");
  }

  function renderHud(now = performance.now()) {
    hud.now.textContent = stats.complete ? ammo : "—";
    hud.cap.textContent = `/ ${stats.complete ? stats.cap : "—"}`;
    let text = "", bad = false;
    if (!stats.complete) { text = jamText || `Needs ${missingLabel(stats.missing)}`; bad = !!jamText; }
    else if (reloading) text = `Reloading ${Math.max(0, (reloadEnd - now) / 1000).toFixed(1)} s`;
    else if (ammo === 0) { text = "Empty · press R"; bad = true; }
    else if (now < cycleMsgUntil) text = "Cycling…";
    else text = `${stats.mode === "burst" ? `Burst ×${stats.burst}` : stats.mode} · ${stats.rpm} rpm`;
    hud.cycling = now < cycleMsgUntil;
    hud.state.textContent = text;
    hud.state.classList.toggle("bad", bad);
  }

  /* ---------- input ---------- */
  trigBtn.addEventListener("pointerdown", e => { e.preventDefault(); trigBtn.setPointerCapture(e.pointerId); press(); });
  trigBtn.addEventListener("pointerup", release);
  trigBtn.addEventListener("pointercancel", release);
  trigBtn.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); if (!e.repeat) press(); } });
  trigBtn.addEventListener("keyup", e => { if (e.key === "Enter") release(); });
  function aimAt(e) {
    const s = app.toStage(e), p = ppc();
    aim = { x: (s.x - TARGET.x) / p, y: (s.y - TARGET.y) / p };
  }
  app.stage.addEventListener("pointermove", e => { if (state.step === "fire") aimAt(e); });
  // Aim where the press lands too, so a tap on a touch screen hits where the finger is.
  app.stage.addEventListener("pointerdown", e => { if (state.step === "fire" && e.button === 0) { aimAt(e); app.stage.setPointerCapture(e.pointerId); press(); } });
  app.stage.addEventListener("pointerup", () => { if (state.step === "fire") release(); });
  app.stage.addEventListener("pointercancel", () => release());
  $("#distance-seg").addEventListener("click", e => {
    const b = e.target.closest("[data-d]"); if (!b) return;
    state.distance = +b.dataset.d; newSession(); renderLane(); app.save(); sfx.blip();
  });

  return {
    press, release, reload, renderLane,
    onBuildChange() { refreshStats(); ammo = stats.cap; reloading = false; burstLeft = 0; jamText = ""; newSession(); renderLane(); },
    onStepChange() { release(); aim = { x: 0, y: 0 }; renderLane(); },
  };
}

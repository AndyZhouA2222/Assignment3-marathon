// Gunsmith: app state, the build step and the shared stage. The skin step lives in skin.js and the
// trigger / firing range in range.js; both receive the `app` object defined at the bottom.
import { SLOTS, PARTS, part, canAttach, attach, computeStats, previewDelta, breakdown, DEFAULT_BUILD, EMPTY_BUILD } from "./parts.js";
import { gunMarkup, partMarkup, pathBox } from "./gun-svg.js";
import { describe } from "./feel.js";
import * as sfx from "./audio.js";
import { createSkin } from "./skin.js";
import { createRange } from "./range.js";

const $ = s => document.querySelector(s);
const NS = "http://www.w3.org/2000/svg";
const STORE = "gunsmith.v2"; // v2: clean default finish, decal positions
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------------------------------------------ state */

function fresh() {
  return { step: "build", build: { ...DEFAULT_BUILD }, slot: "barrel", finish: "bone", wear: 0, decals: [], nextId: 1, distance: 25, muted: false };
}
// The saved build is per browser and only a convenience: anything unreadable falls back to a fresh bench.
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE));
    if (!s || typeof s !== "object" || !s.build) return null;
    for (const slot of SLOTS) if (s.build[slot.id] && !part(slot.id, s.build[slot.id])) return null;
    return { ...fresh(), ...s };
  } catch { return null; }
}
const state = load() ?? fresh();
function save() {
  try { const { step, build, finish, wear, decals, nextId, distance, muted } = state; localStorage.setItem(STORE, JSON.stringify({ step, build, finish, wear, decals, nextId, distance, muted })); }
  catch { /* storage blocked (private mode): the bench still works, it just won't remember */ }
}

/* ------------------------------------------------------------------ feedback */

let toastTimer;
function toast(msg, kind = "ok", ms = 2800) {
  const el = $("#toast");
  el.innerHTML = "";
  const span = document.createElement("span");
  span.className = kind; span.textContent = msg;
  el.append(span);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.innerHTML = ""; }, ms);
}
function flashSlot(slot) {
  const el = document.querySelector(`.slot[data-slot="${slot}"]`);
  if (!el) return;
  el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash");
}

/* ------------------------------------------------------------------ stage */

const stage = $("#stage");
stage.innerHTML = `<g id="lane"></g><g id="callouts"></g><g id="gun-root"><g id="gun-kick"><g id="gun"></g><g id="gun-fx"></g></g><g id="gun-ui"></g></g><g id="range-ui"></g>`;
const layers = { lane: $("#lane"), callouts: $("#callouts"), root: $("#gun-root"), kick: $("#gun-kick"), gun: $("#gun"), fx: $("#gun-fx"), ui: $("#gun-ui"), range: $("#range-ui") };
let fit = { s: 1, tx: 0, ty: 0 }, lay = null;

// Areas of the 1000×520 stage the gun is fitted into. In the build step the margins hold the part callouts,
// except on narrow screens, where callouts would be too small to read and the slot list carries the numbers.
const FRAME_BOX = { build: [110, 128, 780, 250], skin: [50, 60, 900, 400], fire: [24, 290, 420, 190], narrow: [70, 70, 860, 360] };
const narrow = matchMedia("(max-width: 1000px)");

function renderGun() {
  const out = gunMarkup(state.build, { finish: state.finish, wear: state.wear, decals: state.decals, prefix: "g-" });
  layers.gun.innerHTML = out.svg;
  lay = out.lay;
  // Fit, but never zoom in past a frame-plus-barrel sized gun so adding parts doesn't make it jump around.
  const b = out.box, minW = 620, minH = 220;
  const cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2;
  const w = Math.max(b.x1 - b.x0, minW), h = Math.max(b.y1 - b.y0, minH);
  const [X, Y, W, H] = FRAME_BOX[state.step === "build" && narrow.matches ? "narrow" : state.step];
  const s = Math.min(W / w, H / h);
  fit = { s, tx: X + W / 2 - cx * s, ty: Y + H / 2 - cy * s };
  layers.root.setAttribute("transform", `translate(${fit.tx.toFixed(1)} ${fit.ty.toFixed(1)}) scale(${s.toFixed(4)})`);
  renderOverlay();
  renderCallouts();
}

/** Converts a pointer event to gun coordinates. */
function toGun(e) {
  const m = layers.root.getScreenCTM();
  if (!m) return { x: 0, y: 0 };
  const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
  return { x: p.x, y: p.y };
}
/** Converts a pointer event to stage (viewBox) coordinates. */
function toStage(e) {
  const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(stage.getScreenCTM().inverse());
  return { x: p.x, y: p.y };
}

/** Moves every element of one part by (dx, dy) in gun units: used for snapping in and magazine drops. */
function offsetPart(slot, dx, dy) {
  layers.gun.querySelectorAll(`[data-slot="${slot}"]`).forEach(el => {
    el.setAttribute("transform", `translate(${+el.dataset.x + dx} ${+el.dataset.y + dy})`);
  });
}
const SNAP_FROM = { barrel: [70, 0], magazine: [0, 60], optic: [0, -50], grip: [0, 40], stock: [-70, 0], frame: [0, -20] };
function snapIn(slot) {
  if (reducedMotion) return;
  const [fx, fy] = SNAP_FROM[slot] ?? [0, 0], t0 = performance.now(), dur = 200;
  const tick = now => {
    const t = Math.min(1, (now - t0) / dur), e = 1 - (1 - t) ** 3;
    offsetPart(slot, fx * (1 - e), fy * (1 - e));
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ------------------------------------------------------------------ build step */

let dragging = null; // { slot, id } while a part card is being dragged

function renderOverlay() {
  const ui = layers.ui;
  ui.innerHTML = "";
  if (state.step === "build" && lay) {
    const k = 1 / fit.s; // keep markers the same size on screen whatever the zoom
    for (const so of lay.sockets) {
      const g = document.createElementNS(NS, "g");
      const required = SLOTS.find(s => s.id === so.slot).required;
      g.setAttribute("class", `socket${required ? " req" : ""}${dragging?.slot === so.slot || state.slot === so.slot ? " hot" : ""}`);
      g.setAttribute("transform", `translate(${so.x} ${so.y}) scale(${k})`);
      g.dataset.slot = so.slot;
      const label = SLOTS.find(s => s.id === so.slot).label.toUpperCase();
      const below = so.slot === "magazine" || so.slot === "grip";
      g.innerHTML = `<circle r="11"/><path d="M-5 0H5M0 -5V5"/><text x="${so.slot === "stock" ? -16 : 16}" y="${below ? 26 : -14}" text-anchor="${so.slot === "stock" ? "end" : "start"}">${label}${required ? " ·REQ" : ""}</text>`;
      g.addEventListener("click", () => { state.slot = so.slot; renderBuildPanels(); renderOverlay(); });
      ui.append(g);
    }
  }
  if (state.step === "skin") skin.renderOverlay(ui);
  $("#corner-tl").textContent = `BENCH 03 // ${part("frame", state.build.frame)?.name.toUpperCase() ?? "NO FRAME"}`;
}

/* ---------- callouts: each fitted part is labelled with what it does to the three stats ---------- */

const STAT_KEYS = [["f", "FP"], ["a", "ACC"], ["h", "HDL"]];
const fmt1 = v => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(Math.round(v * 10) / 10)}`;
const CALLOUT_W = 186, CALLOUT_H = 50;
const CALLOUT_ROW = { stock: "top", frame: "top", optic: "top", barrel: "top", magazine: "bottom", grip: "bottom" };

function renderCallouts() {
  const g = layers.callouts;
  g.innerHTML = "";
  if (state.step !== "build" || !lay?.placed.length || narrow.matches) return;
  const rows = Object.fromEntries(breakdown(state.build).filter(r => r.id).map(r => [r.slot, r]));
  const items = lay.placed.map(p => {
    const b = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
    for (const f of p.shape.fills) pathBox(f.d, p.x, p.y, b);
    const ax = ((b.x0 + b.x1) / 2) * fit.s + fit.tx, ay = (b.y0 + (b.y1 - b.y0) * (p.slot === "frame" ? 0.3 : 0.5)) * fit.s + fit.ty;
    return { slot: p.slot, row: rows[p.slot], ax, ay, top: CALLOUT_ROW[p.slot] === "top" };
  });
  // Lay each row out left to right in anchor order, pushing labels apart so they never overlap.
  for (const top of [true, false]) {
    const row = items.filter(i => i.top === top).sort((a, b) => a.ax - b.ax);
    const lo = 12, hi = (top ? 988 : 810) - CALLOUT_W; // the ammo counter sits in the bottom-right corner
    row.forEach((it, i) => { it.x = Math.max(lo, it.ax - CALLOUT_W / 2, i ? row[i - 1].x + CALLOUT_W + 8 : lo); });
    for (let i = row.length - 1; i >= 0; i--) row[i].x = Math.min(row[i].x, i < row.length - 1 ? row[i + 1].x - CALLOUT_W - 8 : hi);
    row.forEach(it => { it.y = top ? 22 : 430; });
  }
  g.innerHTML = items.map(it => {
    const { row: r } = it, edge = it.top ? it.y + CALLOUT_H : it.y, lx = Math.min(Math.max(it.ax, it.x + 12), it.x + CALLOUT_W - 12);
    const mid = it.top ? edge + 14 : edge - 14;
    const chips = r.base
      ? STAT_KEYS.map(([k, l]) => `<tspan class="k">${l}</tspan> ${Math.round(r[k])}`).join("  ")
      : STAT_KEYS.filter(([k]) => Math.abs(r[k]) >= 0.05).map(([k, l]) => `<tspan class="${r[k] > 0 ? "up" : "down"}">${l} ${fmt1(r[k])}</tspan>`).join("  ") || `<tspan class="k">No stat change</tspan>`;
    return `<g class="callout${state.slot === it.slot ? " active" : ""}" data-slot="${it.slot}">` +
      `<path class="leader" d="M${it.ax} ${it.ay}V${mid}H${lx}V${edge}"/><rect class="pin" x="${it.ax - 3}" y="${it.ay - 3}" width="6" height="6"/>` +
      `<path class="box" d="M${it.x} ${it.y}h${CALLOUT_W - 8}l8 8v${CALLOUT_H - 8}h${-CALLOUT_W}z"/>` +
      `<text x="${it.x + 9}" y="${it.y + 15}" class="slot-name">${SLOTS.find(s => s.id === it.slot).label.toUpperCase()}${r.base ? " · BASE" : ""}</text>` +
      `<text x="${it.x + 9}" y="${it.y + 30}" class="part-name">${r.name.toUpperCase()}</text>` +
      `<text x="${it.x + 9}" y="${it.y + 44}" class="stat-line">${chips}</text></g>`;
  }).join("");
}

/** Highlights one part on the gun, its callout and slot, and shows on the bars what it adds. */
let focus = null;
function setFocus(slot) {
  if (slot && !state.build[slot]) slot = null;
  if (slot === focus) return;
  focus = slot;
  if (slot) layers.gun.dataset.focus = slot; else delete layers.gun.dataset.focus;
  layers.callouts.querySelectorAll(".callout").forEach(c => c.classList.toggle("focus", c.dataset.slot === slot));
  document.querySelectorAll(".slot").forEach(b => b.classList.toggle("focus", b.dataset.slot === slot));
  if (slot) renderStats(state.build, slot === "frame" ? EMPTY_BUILD : { ...state.build, [slot]: null });
  else renderStats();
}
/** The fitted part under a pointer event, if any. */
function partAt(e) {
  const p = toGun(e);
  for (const el of [...layers.gun.querySelectorAll(".metal path")].reverse()) {
    if (el.isPointInFill?.(new DOMPoint(p.x - +el.dataset.x, p.y - +el.dataset.y))) return el.dataset.slot;
  }
  return null;
}

function renderSlots() {
  const stats = computeStats(state.build), rows = breakdown(state.build);
  $("#slot-list").innerHTML = SLOTS.map(s => {
    const p = part(s.id, state.build[s.id]);
    const missing = s.required && !p, r = rows.find(x => x.slot === s.id);
    const effect = !r ? "" : r.base
      ? `<span class="effect base">${STAT_KEYS.map(([k, l]) => `${l} ${Math.round(r[k])}`).join(" · ")}</span>`
      : `<span class="effect">${chipList(r) || `<span class="chip">No stat change</span>`}</span>`;
    return `<li><button class="slot${p ? " filled" : ""}${missing ? " missing" : ""}${state.slot === s.id ? " active" : ""}" data-slot="${s.id}">
      <span class="label">${s.label}</span><span class="req">${s.required ? "REQ" : "OPT"}</span>
      <span class="value">${p ? p.name : r ? r.name : "Empty"}</span>${effect}</button></li>`;
  }).join("");
  $("#build-name").textContent = stats.complete ? "Ready" : `Missing ${stats.missing.join(", ")}`;
}

function chipList(d) {
  const c = (k, v) => (Math.abs(v) < 0.05 ? "" : `<span class="chip ${v > 0 ? "up" : "down"}">${k} ${fmt1(v)}</span>`);
  return c("FP", d.f) + c("ACC", d.a) + c("HDL", d.h);
}
function renderTray() {
  const slot = state.slot, title = SLOTS.find(s => s.id === slot).label;
  $("#tray-title").textContent = `${title} parts · click or drag onto the gun`;
  const railLen = part("frame", state.build.frame)?.sockets.rail[2] ?? 150;
  const cards = PARTS[slot].map(p => {
    const check = canAttach(state.build, slot, p.id), on = state.build[slot] === p.id;
    const { svg, box } = partMarkup(slot, p.id, state.finish, railLen), pad = 8;
    const vb = `${box.x0 - pad} ${box.y0 - pad} ${box.x1 - box.x0 + pad * 2} ${box.y1 - box.y0 + pad * 2}`;
    const extra = slot === "magazine" ? `<span class="chip">${p.ammo.replace("_", " ")}</span>` : slot === "frame" ? `<span class="chip">${p.tag}</span>` : "";
    return `<button class="card${on ? " on" : ""}${check.ok ? "" : " blocked"}" data-id="${p.id}" aria-pressed="${on}">
      <svg viewBox="${vb}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${svg}</svg>
      <span class="name">${p.name}</span><span class="src">from ${p.sourceName}</span>
      <span class="chips">${on ? `<span class="chip">Fitted</span>` : check.ok ? chipList(previewDelta(state.build, slot, p.id)) : `<span class="chip x">✕ No fit</span>`}${extra}</span>
      ${check.ok ? "" : `<span class="why">${check.reason}</span>`}</button>`;
  });
  if (slot !== "frame") cards.unshift(`<button class="card${state.build[slot] ? "" : " on"}" data-id=""><svg viewBox="0 0 10 10"></svg><span class="name">None</span><span class="src">Leave the slot empty</span><span class="chips">${state.build[slot] ? chipList(previewDelta(state.build, slot, null)) : ""}</span></button>`);
  $("#tray").innerHTML = cards.join("");
}

/** Stat bars for the current build, or the change from `base` to `preview` (green gained, orange lost). */
function renderStats(preview, base = state.build) {
  const now = computeStats(base), next = preview ? computeStats(preview) : null;
  const rows = [["f", "Firepower"], ["a", "Accuracy"], ["h", "Handling"]];
  $("#stats").innerHTML = rows.map(([k, label]) => {
    const v = now[k], vN = now[k + "N"], nv = next ? next[k] : v, nN = next ? next[k + "N"] : vN;
    const segs = Array.from({ length: 20 }, (_, i) => {
      const a = (i + 0.5) / 20 <= vN, b = (i + 0.5) / 20 <= nN;
      return `<i class="${a && b ? "on" : b ? "gain" : a ? "loss" : ""}"></i>`;
    }).join("");
    const d = Math.round((nv - v) * 10) / 10;
    const delta = next && d ? `<span class="delta ${d > 0 ? "up" : "down"}">${d > 0 ? "+" : ""}${d}</span>` : "";
    return `<div class="stat"><div class="top-line"><span class="k">${label}</span><span><span class="v">${v ? v.toFixed(1) : "—"}</span>${delta}</span></div><div class="bar" aria-label="${label} ${v}">${segs}</div></div>`;
  }).join("");
  const s = next ?? now, words = describe(s);
  $("#feel").innerHTML = words ? words.map(w => `<dt>${w.k}</dt><dd>${w.v}</dd>`).join("") : "";
  const mode = s.mode === "burst" ? `Burst ×${s.burst}` : s.mode ?? "—";
  const spec = [
    ["Mode", mode], ["Rate", s.rpm ? `${s.rpm} rpm` : "—"],
    ["Feed", s.cap ? (s.volt ? `${s.cap} shots / cell` : `${s.cap} rounds`) : "No magazine"],
    ["Reload", s.reload ? `${s.reload} s` : "—"], ["Range", s.range ? `${s.range} m` : "No barrel"],
    ["Zoom", `${s.zoom ?? 1}×`], ["Damage", s.damage ? `${s.damage}${s.pellets > 1 ? ` ×${s.pellets}` : ""}` : "—"],
  ];
  $("#specs").innerHTML = spec.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("");
}

function renderBuildPanels() { focus = null; renderSlots(); renderTray(); renderStats(); renderCallouts(); }

/** Fits, swaps or removes a part. Refusals and parts that fall off are explained in the toast. */
function choose(slot, id) {
  if (id) {
    const check = canAttach(state.build, slot, id);
    if (!check.ok) {
      toast(check.reason, "bad"); sfx.blip(true);
      if (/frame/i.test(check.reason) && !state.build.frame) flashSlot("frame");
      if (/barrel first/i.test(check.reason)) flashSlot("barrel");
      return false;
    }
  }
  const before = computeStats(state.build);
  const res = attach(state.build, slot, id);
  state.build = res.build;
  const after = computeStats(state.build);
  const msgs = [];
  if (id) {
    const d = { f: after.f - before.f, a: after.a - before.a, h: after.h - before.h };
    const fmt = (k, v) => (Math.abs(v) >= 0.05 ? ` ${k} ${v > 0 ? "+" : ""}${Math.round(v * 10) / 10}` : "");
    msgs.push(`${part(slot, id).name} fitted.${fmt("FP", d.f)}${fmt("ACC", d.a)}${fmt("HDL", d.h)}`);
    sfx.clack(after.fN);
  } else msgs.push(`${SLOTS.find(s => s.id === slot).label} removed`);
  for (const d of res.dropped) msgs.push(`${part(d.slot, d.id).name} came off: ${d.reason}`);
  toast(msgs.join("  ·  "), res.dropped.length ? "bad" : "ok", res.dropped.length ? 4200 : 2600);
  // Guide the player to the next required part that is still missing.
  if (id && slot !== "frame") {
    const nextMissing = SLOTS.find(s => s.required && !state.build[s.id]);
    if (nextMissing) state.slot = nextMissing.id;
  }
  range.onBuildChange();
  renderGun(); renderBuildPanels();
  if (id) snapIn(slot);
  save();
  return true;
}

// Slot list
$("#slot-list").addEventListener("pointerover", e => setFocus(e.target.closest(".slot")?.dataset.slot ?? null));
$("#slot-list").addEventListener("pointerleave", () => setFocus(null));
$("#slot-list").addEventListener("click", e => {
  const b = e.target.closest(".slot");
  if (!b) return;
  state.slot = b.dataset.slot; renderBuildPanels(); renderOverlay(); sfx.blip();
});

// On the bench: hovering a part or its callout highlights it, clicking opens its slot.
function openSlot(slot) { state.slot = slot; renderBuildPanels(); renderOverlay(); setFocus(slot); sfx.blip(); }
stage.addEventListener("pointermove", e => {
  if (state.step !== "build" || dragging || e.pointerType === "touch") return;
  const slot = e.target.closest?.(".callout")?.dataset.slot ?? (e.target.closest?.(".socket") ? null : partAt(e));
  setFocus(slot);
  stage.style.cursor = slot ? "pointer" : "";
});
stage.addEventListener("pointerleave", () => { if (state.step === "build") { setFocus(null); stage.style.cursor = ""; } });
stage.addEventListener("click", e => {
  if (state.step !== "build" || e.target.closest?.(".socket")) return;
  const slot = e.target.closest?.(".callout")?.dataset.slot ?? partAt(e);
  if (slot) openSlot(slot);
});

// Part cards: click to fit, or drag onto the stage.
const tray = $("#tray");
tray.addEventListener("pointerover", e => {
  const c = e.target.closest(".card");
  if (!c || dragging) return;
  const id = c.dataset.id || null;
  if (id && !canAttach(state.build, state.slot, id).ok) return renderStats();
  renderStats(attach(state.build, state.slot, id).build);
});
tray.addEventListener("pointerleave", () => { if (!dragging) renderStats(); });
tray.addEventListener("focusin", e => { const c = e.target.closest(".card"); if (c && (!c.dataset.id || canAttach(state.build, state.slot, c.dataset.id).ok)) renderStats(attach(state.build, state.slot, c.dataset.id || null).build); });
tray.addEventListener("pointerdown", e => {
  const c = e.target.closest(".card");
  if (!c || e.button !== 0) return;
  const id = c.dataset.id || null, slot = state.slot, x0 = e.clientX, y0 = e.clientY;
  let ghost = null;
  const move = ev => {
    if (!ghost && Math.hypot(ev.clientX - x0, ev.clientY - y0) > 8 && id) {
      ghost = c.cloneNode(true); ghost.classList.add("ghost-card", "card"); document.body.append(ghost);
      dragging = { slot, id }; renderOverlay();
    }
    if (ghost) { ghost.style.left = ev.clientX + "px"; ghost.style.top = ev.clientY + "px"; }
  };
  const up = ev => {
    removeEventListener("pointermove", move); removeEventListener("pointerup", up);
    if (ghost) {
      ghost.remove(); dragging = null;
      const r = stage.getBoundingClientRect();
      const over = ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom;
      if (over) choose(slot, id); else { toast("Drop the part on the gun to fit it", "bad"); renderOverlay(); }
    } else choose(slot, id);
  };
  addEventListener("pointermove", move); addEventListener("pointerup", up);
});
// Keyboard users activate cards with Enter/Space through the click above being pointer-only.
tray.addEventListener("keydown", e => {
  if ((e.key === "Enter" || e.key === " ") && e.target.closest(".card")) { e.preventDefault(); e.stopPropagation(); choose(state.slot, e.target.closest(".card").dataset.id || null); }
});

/* ------------------------------------------------------------------ steps & shell */

function setStep(step) {
  if (state.step === step) return;
  state.step = step;
  clearTimeout(toastTimer); $("#toast").innerHTML = ""; // old hints belong to the old step
  skin.leave();
  render();
  range.onStepChange();
  save();
}
function render() {
  document.querySelectorAll(".step").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.step === state.step)));
  $(".bench").dataset.step = state.step;
  stage.setAttribute("aria-label", { build: "Weapon on the bench", skin: "Weapon ready for decals", fire: "Firing range" }[state.step]);
  renderBuildPanels();
  skin.renderPanels();
  renderGun();
  range.renderLane();
}
document.querySelector(".steps").addEventListener("click", e => { const b = e.target.closest(".step"); if (b) { sfx.blip(); setStep(b.dataset.step); } });

const soundBtn = $("#sound-btn");
function renderSound() {
  sfx.audio.muted = state.muted;
  soundBtn.setAttribute("aria-pressed", String(!state.muted && sfx.audio.available));
  soundBtn.textContent = !sfx.audio.available ? "No sound" : state.muted ? "Sound off" : "Sound on";
  soundBtn.title = sfx.audio.available ? "M toggles sound" : `Sound unavailable: ${sfx.audio.error}`;
}
function toggleSound() {
  if (!sfx.audio.available) { toast(`Sound is unavailable here (${sfx.audio.error}). Everything else still works.`, "bad", 4000); return; }
  state.muted = !state.muted; renderSound(); save();
  if (!state.muted) { sfx.unlock(); sfx.blip(); }
}
soundBtn.addEventListener("click", toggleSound);

let resetArmed = 0;
$("#reset-btn").addEventListener("click", e => {
  const btn = e.currentTarget;
  if (Date.now() - resetArmed > 3000) { resetArmed = Date.now(); btn.textContent = "Click again to reset"; setTimeout(() => (btn.textContent = "Reset"), 3000); return; }
  Object.assign(state, fresh());
  try { localStorage.removeItem(STORE); } catch {}
  btn.textContent = "Reset"; resetArmed = 0;
  range.onBuildChange(); render(); toast("Bench cleared. Back to the bare M77 frame.");
});

// Shortcuts stay off while typing, but keep working when a slider or button has focus.
addEventListener("keydown", e => {
  if (e.target.matches("input:not([type=range]), select, textarea")) return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key === "1" || e.key === "2" || e.key === "3") setStep(["build", "skin", "fire"][+e.key - 1]);
  else if (e.key === "m" || e.key === "M") toggleSound();
  else if (e.key === "r" || e.key === "R") range.reload();
  else if (e.code === "Space") { e.preventDefault(); if (!e.repeat) range.press(); }
  else if (!e.target.matches("input[type=range]")) skin.onKey(e);
});
addEventListener("keyup", e => {
  if (e.code !== "Space" || e.target.matches("input:not([type=range]), select, textarea")) return;
  e.preventDefault(); // a focused button would otherwise click on Space release
  range.release();
});
addEventListener("blur", () => range.release());

/* ------------------------------------------------------------------ wiring */

const app = {
  state, $, stage, layers, toast, save, render, renderGun, renderOverlay, renderStats, flashSlot, toGun, toStage, offsetPart,
  get fit() { return fit; }, get lay() { return lay; }, reducedMotion, renderSound: () => renderSound(),
  goToSlot(slot) { state.slot = slot; if (state.step !== "build") setStep("build"); else renderBuildPanels(); flashSlot(slot); renderOverlay(); },
};
narrow.addEventListener("change", renderGun);
const skin = createSkin(app);
const range = createRange(app);
renderSound();
render();
if (state.step === "build" && !computeStats(state.build).complete) toast("Pick a barrel and a magazine, then pull the trigger", "ok", 4000);

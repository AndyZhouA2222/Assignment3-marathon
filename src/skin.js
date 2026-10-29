// Skin step: press decals from a picked library onto the gun, snap them to preset positions or apply a
// whole layout, move / size / tint them, choose a paint finish and wear the gun down.
import { TEXT_VARIANTS } from "./lib/decal-kit.js";
import { FINISHES, DECAL_TINTS, decalArt, decalSize, decalInner, decalTransform, decalZones, fitToZone } from "./gun-svg.js";
import * as sfx from "./audio.js";

// The library: decal kit designs picked for reading well on a weapon (kind + seed), in three groups.
const LIBRARY = [
  { group: "Marks", items: [["glyphDisc", 4], ["glyphDisc", 1], ["blockMark", 4], ["blockMark", 7], ["icon", 1], ["reticle", 7], ["codeBox", 4], ["bigType", 7]] },
  { group: "Codes", items: [["serialBlock", 5], ["warningLabel", 6], ["pillTag", 1], ["lockup", 3], ["stackBadge", 3], ["segmentText", 4], ["thinCode", 3], ["codeBox", 7]] },
  { group: "Bands", items: [["hazard", 1], ["chevrons", 5], ["chevrons", 2], ["barcode", 1], ["repeatBand", 4], ["repeatBand", 2], ["pixelArrow", 1], ["tape", 2]] },
].map(g => ({ ...g, items: g.items.map(([kind, seed]) => ({ kind, seed })) }));
const LIB_FLAT = LIBRARY.flatMap(g => g.items);

// Whole layouts. Each decal names the positions it prefers, in order; positions a build lacks are skipped.
// Tints: "ink" contrasts with the paint, "accent" is the finish's highlight colour, "light" is for dark polymer.
const LAYOUTS = {
  runner: { label: "Runner", decals: [
    { kind: "glyphDisc", seed: 4, at: ["stock", "rear"], tint: "ink" },
    { kind: "lockup", seed: 3, at: ["front", "barrel"], tint: "ink" },
    { kind: "segmentText", seed: 4, at: ["magazine", "grip"], tint: "light", fill: 0.9 },
  ] },
  hazard: { label: "Hazard", decals: [
    { kind: "hazard", seed: 1, at: ["rear", "stock"], tint: "accent" },
    { kind: "warningLabel", seed: 6, at: ["front"], tint: "ink" },
    { kind: "chevrons", seed: 5, at: ["barrel"], tint: "accent", fill: 0.7 },
    { kind: "hazard", seed: 1, at: ["magazine"], tint: "light", fill: 0.9 },
  ] },
  courier: { label: "Courier", decals: [
    { kind: "repeatBand", seed: 4, at: ["receiver"], tint: "accent" },
    { kind: "pillTag", seed: 1, at: ["stock", "barrel"], tint: "ink", fill: 0.8 },
    { kind: "barcode", seed: 1, at: ["magazine", "grip"], tint: "light", fill: 0.8 },
  ] },
  serial: { label: "Serial", decals: [
    { kind: "serialBlock", seed: 5, at: ["rear"], tint: "ink", fill: 0.85 },
    { kind: "codeBox", seed: 4, at: ["front"], tint: "accent", fill: 0.7 },
    { kind: "blockMark", seed: 4, at: ["stock"], tint: "ink", fill: 0.7 },
    { kind: "thinCode", seed: 3, at: ["barrel"], tint: "ink", fill: 0.8 },
  ] },
};
// Position buttons in the order they sit on the gun, back to front then underneath.
const ZONE_ORDER = ["stock", "rear", "receiver", "front", "barrel", "optic", "magazine", "grip"];

const TEXT_LOOKS = ["display", "wide", "mono", "outline", "stencil", "pixel", "segment", "inverted", "bracket", "boxed", "spaced", "slashedZero"].filter(v => TEXT_VARIANTS.includes(v));
const MAX_DECALS = 30;
const INK_FOR = { bone: "#0A0A0A", carbon: "#F7F7F2", acid: "#0A0A0A", signal: "#F7F7F2" };
const ACCENT_FOR = { bone: "#FF5500", carbon: "#C2FE0B", acid: "#0A0A0A", signal: "#0A0A0A" };

export function wearLabel(w) {
  const pct = Math.round(w * 100);
  const name = w < 0.05 ? "Factory new" : w < 0.25 ? "Minimal wear" : w < 0.5 ? "Field-tested" : w < 0.75 ? "Well-worn" : "Battle-scarred";
  return `${name} · ${pct}%`;
}

export function createSkin(app) {
  const { state, $ } = app;
  let selected = null;   // id of the selected decal
  let showZone = null;   // position whose outline is shown while its button is hovered
  let clearArmed = 0, layoutArmed = null;

  const sel = () => state.decals.find(d => d.id === selected) ?? null;
  const zones = () => decalZones(state.build).sort((a, b) => ZONE_ORDER.indexOf(a.id) - ZONE_ORDER.indexOf(b.id));
  const tintFor = (kind, zone) => (kind === "light" || zone?.tone === "s" ? (state.finish === "acid" ? "#C2FE0B" : "#F7F7F2") : kind === "accent" ? ACCENT_FOR[state.finish] : INK_FOR[state.finish]) ?? "#0A0A0A";
  // The position a decal sits in: of the areas containing its centre, the one whose centre is closest.
  const zoneOf = d => zones().filter(z => Math.abs(d.x - (z.x + z.w / 2)) <= z.w / 2 && Math.abs(d.y - (z.y + z.h / 2)) <= z.h / 2)
    .sort((a, b) => Math.hypot(d.x - a.x - a.w / 2, d.y - a.y - a.h / 2) - Math.hypot(d.x - b.x - b.w / 2, d.y - b.y - b.h / 2))[0] ?? null;

  /* ---------- panels ---------- */
  function renderLibrary() {
    $("#decal-lib").innerHTML = LIBRARY.map(g => `<p class="lib-group">${g.group}</p><div class="decal-grid">` + g.items.map(it => {
      const art = decalArt(it), i = LIB_FLAT.indexOf(it);
      return `<button class="decal-tile" data-i="${i}" title="Add ${it.kind}"><svg viewBox="0 0 ${art.w} ${art.h}" aria-hidden="true">${art.body}</svg></button>`;
    }).join("") + `</div>`).join("");
  }
  function renderLayouts() {
    $("#layout-seg").innerHTML = Object.entries(LAYOUTS).map(([k, l]) => `<button data-layout="${k}">${layoutArmed === k ? "Replace?" : l.label}</button>`).join("");
  }
  function renderEdit() {
    const d = sel();
    $("#decal-edit").hidden = !d;
    if (!d) return;
    $("#d-size").value = Math.round(d.w); $("#d-rot").value = Math.round(d.rot);
    $("#tint-seg").innerHTML = DECAL_TINTS.map(c => `<button class="swatch" data-tint="${c}" style="background:${c}" aria-pressed="${d.tint === c}" aria-label="Colour ${c}"></button>`).join("");
    const here = zoneOf(d)?.id;
    $("#pos-seg").innerHTML = zones().map(z => `<button data-zone="${z.id}" aria-pressed="${here === z.id}">${z.label}</button>`).join("") || `<span class="hint">No flat areas on this build.</span>`;
  }
  function renderPanels() {
    renderLibrary(); renderLayouts(); renderEdit();
    $("#finish-seg").innerHTML = Object.entries(FINISHES).map(([k, f]) => `<button data-finish="${k}" aria-pressed="${state.finish === k}">${f.label}</button>`).join("");
    $("#wear").value = Math.round(state.wear * 100);
    $("#wear-out").textContent = wearLabel(state.wear);
    const sv = $("#text-variant");
    if (!sv.options.length) sv.innerHTML = TEXT_LOOKS.map(v => `<option value="${v}">${v}</option>`).join("");
  }

  /* ---------- overlay on the stage ---------- */
  function renderOverlay(ui) {
    const d = sel();
    if (d) {
      const { w, h } = decalSize(d);
      ui.insertAdjacentHTML("beforeend", `<g transform="${decalTransform(d)}"><rect class="sel-box" vector-effect="non-scaling-stroke" x="${-w / 2 - 4}" y="${-h / 2 - 4}" width="${w + 8}" height="${h + 8}"/></g>`);
    }
    const z = showZone && zones().find(x => x.id === showZone);
    if (z) ui.insertAdjacentHTML("beforeend", `<rect class="zone-box" vector-effect="non-scaling-stroke" x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}"/>`);
  }

  /* ---------- hit testing ---------- */
  function decalAt(p) {
    for (let i = state.decals.length - 1; i >= 0; i--) {
      const d = state.decals[i], { w, h } = decalSize(d), a = (-d.rot * Math.PI) / 180;
      const dx = p.x - d.x, dy = p.y - d.y;
      const lx = dx * Math.cos(a) - dy * Math.sin(a), ly = dx * Math.sin(a) + dy * Math.cos(a);
      if (Math.abs(lx) <= w / 2 + 3 && Math.abs(ly) <= h / 2 + 3) return d;
    }
    return null;
  }

  /* ---------- live updates without rebuilding the whole gun ---------- */
  function refreshDecal(d) {
    const mask = app.layers.gun.querySelector(`#g-d${d.id}`), ink = app.layers.gun.querySelector(`.decal-ink[data-decal="${d.id}"]`);
    if (!mask || !ink) return app.renderGun();
    mask.innerHTML = decalInner(d);
    ink.setAttribute("fill", d.tint);
    app.renderOverlay();
  }
  function select(id) { selected = id; renderEdit(); app.renderOverlay(); }

  /** Picks a position for a new decal: wide bands go along the receiver or barrel, square marks on the stock
   *  or a receiver half, and a position that already holds a decal is used only when nothing else is free. */
  function autoZone(dec) {
    const art = decalArt(dec), wide = art.w / art.h > 3;
    const prefs = wide ? ["receiver", "barrel", "rear", "front", "magazine"] : ["stock", "rear", "front", "magazine", "barrel", "grip", "optic"];
    const all = zones(), used = new Set(state.decals.map(zoneOf).filter(Boolean).map(z => z.id));
    // The whole receiver overlaps both halves, so either one being used blocks the other.
    const taken = id => used.has(id) || (id === "receiver" && (used.has("rear") || used.has("front"))) || ((id === "rear" || id === "front") && used.has("receiver"));
    const ordered = prefs.map(id => all.find(z => z.id === id)).filter(Boolean);
    return ordered.find(z => !taken(z.id)) ?? ordered[0] ?? null;
  }
  function add(dec, zone, tint = "ink", fill = 1) {
    if (state.decals.length >= MAX_DECALS) { app.toast(`That's ${MAX_DECALS} decals. Remove one before adding more.`, "bad"); sfx.blip(true); return null; }
    const z = zone ?? autoZone(dec);
    if (!z) { app.toast("Fit a frame first. Decals go on the gun's flat areas.", "bad"); sfx.blip(true); return null; }
    const d = { id: state.nextId++, ...dec, ...fitToZone(dec, z, fill), tint: tintFor(tint, z), flip: false };
    state.decals.push(d);
    return { d, z };
  }
  function addOne(dec) {
    const res = add(dec);
    if (!res) return;
    selected = res.d.id;
    sfx.stick();
    app.renderGun(); renderEdit(); app.save();
    app.toast(`Placed on the ${res.z.label.toLowerCase()}. Pick another position on the right, or drag it.`);
  }
  function moveTo(d, z) {
    Object.assign(d, fitToZone(d, z, 1));
    if (z.tone === "s" && d.tint === INK_FOR[state.finish] && state.finish === "bone") d.tint = tintFor("light", z);
    refreshDecal(d); renderEdit(); app.save(); sfx.stick();
  }
  function applyLayout(key) {
    const L = LAYOUTS[key], all = zones(), used = new Set();
    const kept = state.decals.length;
    state.decals = [];
    let placed = 0;
    for (const item of L.decals) {
      const z = item.at.map(id => all.find(x => x.id === id)).find(x => x && !used.has(x.id));
      if (!z) continue;
      used.add(z.id);
      if (z.id === "receiver") { used.add("rear"); used.add("front"); }
      if (add({ kind: item.kind, seed: item.seed }, z, item.tint, item.fill ?? 1)) placed++;
    }
    selected = null;
    sfx.stick(); app.renderGun(); renderLayouts(); renderEdit(); app.save();
    app.toast(`${L.label} layout: ${placed} decal${placed === 1 ? "" : "s"}${kept ? `, replacing ${kept}` : ""}. Click a decal to change it.`);
  }
  function remove(id) {
    state.decals = state.decals.filter(d => d.id !== id);
    if (selected === id) selected = null;
    app.renderGun(); renderEdit(); app.save();
  }

  /* ---------- stage pointer ---------- */
  let drag = null;
  app.stage.addEventListener("pointermove", e => {
    if (state.step !== "skin") return;
    const p = app.toGun(e);
    if (drag) {
      const d = sel(); if (!d) return;
      d.x = p.x - drag.dx; d.y = p.y - drag.dy;
      const g = app.layers.gun.querySelector(`.decal-pos[data-decal="${d.id}"]`);
      if (g) g.setAttribute("transform", decalTransform(d));
      app.renderOverlay();
    }
    app.stage.style.cursor = decalAt(p) ? "move" : "default";
  });
  app.stage.addEventListener("pointerdown", e => {
    if (state.step !== "skin" || e.button !== 0) return;
    const p = app.toGun(e), d = decalAt(p);
    if (d) {
      select(d.id);
      drag = { dx: p.x - d.x, dy: p.y - d.y };
      app.stage.setPointerCapture(e.pointerId);
    } else if (selected) select(null);
  });
  app.stage.addEventListener("pointerup", () => { if (drag) { drag = null; renderEdit(); app.save(); } });

  /* ---------- panel events ---------- */
  $("#decal-lib").addEventListener("click", e => {
    const t = e.target.closest(".decal-tile"); if (!t) return;
    addOne({ ...LIB_FLAT[+t.dataset.i] });
  });
  $("#layout-seg").addEventListener("click", e => {
    const b = e.target.closest("[data-layout]"); if (!b) return;
    const key = b.dataset.layout;
    // Replacing decals the player placed asks for a second click, like Reset.
    if (state.decals.length && layoutArmed !== key) {
      layoutArmed = key; renderLayouts(); sfx.blip();
      app.toast(`Click "Replace?" again to swap your ${state.decals.length} decal${state.decals.length === 1 ? "" : "s"} for this layout.`);
      setTimeout(() => { if (layoutArmed === key) { layoutArmed = null; renderLayouts(); } }, 3000);
      return;
    }
    layoutArmed = null;
    applyLayout(key);
  });
  $("#pos-seg").addEventListener("click", e => {
    const b = e.target.closest("[data-zone]"), d = sel(); if (!b || !d) return;
    moveTo(d, zones().find(z => z.id === b.dataset.zone));
  });
  $("#pos-seg").addEventListener("pointerover", e => { const b = e.target.closest("[data-zone]"); showZone = b?.dataset.zone ?? null; app.renderOverlay(); });
  $("#pos-seg").addEventListener("pointerleave", () => { showZone = null; app.renderOverlay(); });

  $("#text-form").addEventListener("submit", e => {
    e.preventDefault();
    const input = $("#text-input"), err = $("#text-error");
    const raw = input.value, clean = raw.toUpperCase().replace(/[^A-Z0-9 .\-_/#*]/g, "").replace(/\s+/g, " ").trim();
    input.classList.remove("bad"); void input.offsetWidth;
    if (!clean) {
      err.textContent = raw.trim() ? "Only letters A–Z, numbers and . - _ / # * work on decals." : "Type a word or code first.";
      input.classList.add("bad"); sfx.blip(true); input.focus();
      return;
    }
    err.textContent = clean !== raw.toUpperCase().trim() ? `Unsupported characters were dropped: "${clean}"` : "";
    addOne({ text: clean, variant: $("#text-variant").value });
  });

  $("#finish-seg").addEventListener("click", e => {
    const b = e.target.closest("[data-finish]"); if (!b) return;
    const was = state.finish;
    state.finish = b.dataset.finish;
    // Decals still in the old finish's default colours follow the new finish, so they stay readable.
    for (const d of state.decals) {
      if (d.tint === INK_FOR[was]) d.tint = INK_FOR[state.finish];
      else if (d.tint === ACCENT_FOR[was]) d.tint = ACCENT_FOR[state.finish];
    }
    renderPanels(); app.renderGun(); app.save(); sfx.blip();
  });
  let wearFrame = 0;
  $("#wear").addEventListener("input", e => {
    state.wear = +e.target.value / 100;
    $("#wear-out").textContent = wearLabel(state.wear);
    cancelAnimationFrame(wearFrame);
    wearFrame = requestAnimationFrame(() => { app.renderGun(); app.save(); });
  });

  $("#d-size").addEventListener("input", e => { const d = sel(); if (d) { d.w = +e.target.value; refreshDecal(d); app.save(); } });
  $("#d-rot").addEventListener("input", e => { const d = sel(); if (d) { d.rot = +e.target.value; refreshDecal(d); app.save(); } });
  $("#tint-seg").addEventListener("click", e => { const b = e.target.closest("[data-tint]"); const d = sel(); if (b && d) { d.tint = b.dataset.tint; refreshDecal(d); renderEdit(); app.save(); } });
  $("#d-flip").addEventListener("click", () => { const d = sel(); if (d) { d.flip = !d.flip; refreshDecal(d); app.save(); } });
  $("#d-front").addEventListener("click", () => { const d = sel(); if (d) { state.decals = state.decals.filter(x => x !== d).concat(d); app.renderGun(); app.save(); } });
  $("#d-del").addEventListener("click", () => { if (selected) { remove(selected); sfx.blip(); } });
  $("#clear-decals").addEventListener("click", e => {
    const btn = e.currentTarget;
    if (!state.decals.length) { app.toast("There are no decals to clear."); return; }
    if (Date.now() - clearArmed > 3000) { clearArmed = Date.now(); btn.textContent = "Click again to clear"; setTimeout(() => (btn.textContent = "Clear all decals"), 3000); return; }
    state.decals = []; selected = null; clearArmed = 0; btn.textContent = "Clear all decals";
    app.renderGun(); renderEdit(); app.save(); app.toast("All decals removed.");
  });

  /* ---------- keys ---------- */
  function onKey(e) {
    if (state.step !== "skin") return;
    const d = sel();
    if (e.key === "Escape") select(null);
    else if (!d) return;
    else if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); remove(d.id); }
    else if (e.key.startsWith("Arrow")) {
      e.preventDefault();
      const step = e.shiftKey ? 10 : 1;
      if (e.key === "ArrowLeft") d.x -= step; if (e.key === "ArrowRight") d.x += step;
      if (e.key === "ArrowUp") d.y -= step; if (e.key === "ArrowDown") d.y += step;
      refreshDecal(d); app.save();
    }
  }

  return {
    renderPanels, renderOverlay, onKey,
    leave() { selected = null; drag = null; showZone = null; layoutArmed = null; app.stage.style.cursor = ""; },
  };
}

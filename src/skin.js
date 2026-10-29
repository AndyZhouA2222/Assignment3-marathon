// Skin step: pick decals from the generated library, press them onto the gun, move / size / tint
// them, choose a paint finish and wear the gun down.
import { rng, TEXT_VARIANTS } from "./lib/decal-kit.js";
import { FINISHES, DECAL_TINTS, decalArt, decalSize, decalInner, decalMarkup, decalTransform } from "./gun-svg.js";
import * as sfx from "./audio.js";

// Decal kinds that read well on a weapon, with a starting width in gun units.
const LIB_KINDS = [["glyphDisc", 36], ["pixelArrow", 54], ["chevrons", 60], ["barcode", 64], ["stripes", 70], ["reticle", 34],
  ["blockMark", 34], ["icon", 30], ["codeBox", 44], ["serialBlock", 80], ["warningLabel", 96], ["repeatBand", 110],
  ["pillTag", 70], ["stackBadge", 40], ["thinCode", 90], ["segmentText", 64], ["dotMatrix", 56], ["tape", 80]];
const TEXT_LOOKS = ["display", "wide", "mono", "outline", "stencil", "pixel", "segment", "inverted", "bracket", "boxed", "spaced", "slashedZero"].filter(v => TEXT_VARIANTS.includes(v));
const MAX_DECALS = 30;
const INK_FOR = { bone: "#0A0A0A", carbon: "#F7F7F2", acid: "#0A0A0A", signal: "#F7F7F2" };

export function wearLabel(w) {
  const pct = Math.round(w * 100);
  const name = w < 0.05 ? "Factory new" : w < 0.25 ? "Minimal wear" : w < 0.5 ? "Field-tested" : w < 0.75 ? "Well-worn" : "Battle-scarred";
  return `${name} · ${pct}%`;
}

export function createSkin(app) {
  const { state, $ } = app;
  let armed = null;      // library item waiting to be placed
  let selected = null;   // id of the selected decal
  let hover = null;      // pointer position in gun units while armed
  let clearArmed = 0;

  const library = () => { const r = rng(state.libSeed); return LIB_KINDS.map(([kind, w]) => ({ kind, seed: r.int(1, 1e6), w })); };
  const sel = () => state.decals.find(d => d.id === selected) ?? null;

  /* ---------- panels ---------- */
  function renderLibrary() {
    $("#decal-lib").innerHTML = library().map((it, i) => {
      const art = decalArt(it), on = armed && !armed.text && armed.kind === it.kind && armed.seed === it.seed;
      return `<button class="decal-tile${on ? " on" : ""}" data-i="${i}" aria-pressed="${!!on}" title="${it.kind}"><svg viewBox="0 0 ${art.w} ${art.h}" aria-hidden="true">${art.body}</svg></button>`;
    }).join("");
  }
  function renderEdit() {
    const d = sel();
    $("#decal-edit").hidden = !d;
    if (d) {
      $("#d-size").value = Math.round(d.w); $("#d-rot").value = Math.round(d.rot);
      $("#tint-seg").innerHTML = DECAL_TINTS.map(c => `<button class="swatch" data-tint="${c}" style="background:${c}" aria-pressed="${d.tint === c}" aria-label="Colour ${c}"></button>`).join("");
    }
  }
  function renderPanels() {
    renderLibrary(); renderEdit();
    $("#finish-seg").innerHTML = Object.entries(FINISHES).map(([k, f]) => `<button data-finish="${k}" aria-pressed="${state.finish === k}">${f.label}</button>`).join("");
    $("#wear").value = Math.round(state.wear * 100);
    $("#wear-out").textContent = wearLabel(state.wear);
    const sv = $("#text-variant");
    if (!sv.options.length) sv.innerHTML = TEXT_LOOKS.map(v => `<option value="${v}">${v}</option>`).join("");
  }

  /* ---------- overlay on the stage ---------- */
  function renderOverlay(ui, scale) {
    const d = sel();
    if (d) {
      const { w, h } = decalSize(d);
      ui.insertAdjacentHTML("beforeend", `<g transform="${decalTransform(d)}"><rect class="sel-box" vector-effect="non-scaling-stroke" x="${-w / 2 - 4}" y="${-h / 2 - 4}" width="${w + 8}" height="${h + 8}"/></g>`);
    }
    if (armed && hover) {
      const ok = onGun(hover);
      const pv = { ...armed, id: "pv", x: hover.x, y: hover.y, rot: 0, flip: false, tint: ok ? defaultInk() : "#FF5500" };
      ui.insertAdjacentHTML("beforeend", `<g class="preview-decal">${decalMarkup(pv, "pv-")}</g>`);
      if (!ok) { const { w, h } = decalSize(pv); ui.insertAdjacentHTML("beforeend", `<rect class="sel-box" vector-effect="non-scaling-stroke" style="stroke:#FF5500" x="${hover.x - w / 2}" y="${hover.y - h / 2}" width="${w}" height="${h}"/>`); }
    }
    void scale;
  }
  const defaultInk = () => INK_FOR[state.finish] ?? "#0A0A0A";

  /* ---------- hit testing ---------- */
  // Is a point (gun units) on the gun's body? Uses the silhouette paths of the metal layer.
  function onGun(p) {
    const paths = app.layers.gun.querySelectorAll(".metal path");
    for (const el of paths) {
      const pt = new DOMPoint(p.x - +el.dataset.x, p.y - +el.dataset.y);
      if (typeof el.isPointInFill === "function") { if (el.isPointInFill(pt)) return true; }
      else { const b = el.getBBox(); if (pt.x >= b.x && pt.x <= b.x + b.width && pt.y >= b.y && pt.y <= b.y + b.height) return true; }
    }
    return false;
  }
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
  function place(p) {
    if (state.decals.length >= MAX_DECALS) { app.toast(`That's ${MAX_DECALS} decals. Remove one before adding more.`, "bad"); sfx.blip(true); return; }
    const d = { id: state.nextId++, ...(armed.text != null ? { text: armed.text, variant: armed.variant } : { kind: armed.kind, seed: armed.seed }), x: p.x, y: p.y, w: armed.w, rot: 0, tint: defaultInk(), flip: false };
    state.decals.push(d);
    armed = null; hover = null; selected = d.id;
    sfx.stick();
    app.renderGun(); renderLibrary(); renderEdit(); app.save();
    app.toast("Decal applied. Drag to move it, or use the controls on the right.");
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
    } else if (armed) { hover = p; app.renderOverlay(); }
    app.stage.style.cursor = armed ? (onGun(p) ? "copy" : "not-allowed") : decalAt(p) ? "move" : "default";
  });
  app.stage.addEventListener("pointerleave", () => { if (armed) { hover = null; app.renderOverlay(); } });
  app.stage.addEventListener("pointerdown", e => {
    if (state.step !== "skin" || e.button !== 0) return;
    const p = app.toGun(e);
    if (armed) {
      if (onGun(p)) place(p);
      else { app.toast("Decals only stick to the gun. Click on its body.", "bad"); sfx.blip(true); }
      return;
    }
    const d = decalAt(p);
    if (d) {
      select(d.id);
      drag = { dx: p.x - d.x, dy: p.y - d.y };
      app.stage.setPointerCapture(e.pointerId);
    } else if (selected) select(null);
  });
  app.stage.addEventListener("pointerup", () => { if (drag) { drag = null; app.save(); } });

  /* ---------- panel events ---------- */
  $("#decal-lib").addEventListener("click", e => {
    const t = e.target.closest(".decal-tile"); if (!t) return;
    const it = library()[+t.dataset.i];
    const same = armed && !armed.text && armed.kind === it.kind && armed.seed === it.seed;
    armed = same ? null : it; selected = null;
    renderLibrary(); renderEdit(); app.renderOverlay(); sfx.blip();
    if (armed) app.toast("Now click on the gun to press the decal on. Esc cancels.");
  });
  $("#shuffle-btn").addEventListener("click", () => { state.libSeed++; armed = null; renderLibrary(); app.save(); sfx.blip(); });

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
    armed = { text: clean, variant: $("#text-variant").value, w: Math.min(140, 26 + clean.length * 9) };
    selected = null; renderLibrary(); renderEdit(); sfx.blip();
    app.toast(`"${clean}" is ready. Click on the gun to place it.`);
  });

  $("#finish-seg").addEventListener("click", e => {
    const b = e.target.closest("[data-finish]"); if (!b) return;
    state.finish = b.dataset.finish; renderPanels(); app.renderGun(); app.save(); sfx.blip();
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
    if (e.key === "Escape") { armed = null; hover = null; select(null); renderLibrary(); }
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
    leave() { armed = null; hover = null; selected = null; drag = null; app.stage.style.cursor = ""; },
  };
}

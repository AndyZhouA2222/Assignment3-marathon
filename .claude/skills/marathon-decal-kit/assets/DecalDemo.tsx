// Example page: the decal kit used as UI decoration, plus a sheet and the text variants.
import { useState } from "react";
import { Decal, DecalText, DecalSheet } from "./Decal.tsx";
import { PALETTES, TEXT_VARIANTS, ICONS, type PaletteName } from "./decals.ts";

const page = { background: "#0A0A0A", color: "#F7F7F2", fontFamily: "'Fraktion Mono','JetBrains Mono',monospace", padding: "32px clamp(16px,4vw,48px)", display: "grid", gap: 40, overflowX: "hidden" } as const;
const label = { font: "500 11px/1.2 'Fraktion Mono','JetBrains Mono',monospace", letterSpacing: ".12em", textTransform: "uppercase", color: "#8A8A85", margin: "0 0 12px" } as const;
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))", gap: 16, alignItems: "center" } as const;

export default function DecalDemo() {
  const [palette, setPalette] = useState<PaletteName>("mono");
  const [seed, setSeed] = useState(7);
  return (
    <main style={page}>
      <header style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "end", justifyContent: "space-between" }}>
        <div>
          <p style={label}>// Decal kit · seed {seed}</p>
          <DecalText text="SEAL 014" variant="wide" size={56} color="#F7F7F2" style={{ maxWidth: "100%" }} />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {(Object.keys(PALETTES) as PaletteName[]).map(p => (
            <button key={p} onClick={() => setPalette(p)} aria-pressed={p === palette}
              style={{ font: "500 11px/1 'Fraktion Mono','JetBrains Mono',monospace", letterSpacing: ".1em", textTransform: "uppercase", padding: "8px 10px", cursor: "pointer", border: 0,
                background: p === palette ? "#C2FE0B" : "#2B2B2B", color: p === palette ? "#0A0A0A" : "#F7F7F2" }}>{p}</button>
          ))}
          <button onClick={() => setSeed(s => s + 1)} style={{ font: "500 11px/1 'Fraktion Mono','JetBrains Mono',monospace", padding: "8px 10px", cursor: "pointer", border: "1px solid #F7F7F2", background: "none", color: "#F7F7F2" }}>RESEED →</button>
        </div>
      </header>

      <section>
        <p style={label}>Sheet · {palette}</p>
        <DecalSheet seed={seed} palette={palette} count={48} />
      </section>

      <section>
        <p style={label}>Kinds</p>
        <div style={grid}>
          {(["glyphDisc", "pixelArrow", "reticle", "blockMark", "codeBox", "barcode", "chevrons", "checker", "pillTag", "stackBadge", "dotMatrix", "ruler"] as const).map((k, i) => (
            <Decal key={k} kind={k} seed={seed * 31 + i} palette="mono" title={k} style={{ width: "100%" }} />
          ))}
        </div>
      </section>

      <section>
        <p style={label}>Icons</p>
        <div style={{ ...grid, gridTemplateColumns: "repeat(auto-fill,minmax(48px,1fr))" }}>
          {ICONS.map(name => <Decal key={name} kind="icon" name={name} size={48} palette="mono" title={name} />)}
        </div>
      </section>

      <section style={{ background: "#FFFFFF", color: "#0A0A0A", padding: 24 }}>
        <p style={{ ...label, color: "#55554f" }}>Text variants</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 24, alignItems: "start" }}>
          {TEXT_VARIANTS.filter(v => v !== "stacked" && v !== "vertical").map(v => (
            <div key={v}>
              <p style={{ ...label, color: "#9A9A9A", margin: "0 0 6px" }}>{v}</p>
              <DecalText text="ATTACH 08" variant={v} size={32} palette="ink" seed={seed} style={{ maxWidth: "100%" }} />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

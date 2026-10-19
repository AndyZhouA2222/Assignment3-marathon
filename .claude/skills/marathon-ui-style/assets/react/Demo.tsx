// Example page assembling the Marathon components.
import { useState } from "react";
import {
  MtRoot, MtNav, MtSection, MtSplit, MtButton, MtTag, MtNewsList, MtThumbRail,
  MtDataCard, MtProgress, MtMarquee, MtStripes, MtRule, MtTitle, MtEyebrow,
  MtTabBar, MtItemGrid, MtSpecTable, MtHoldButton, MtRarityChip, MtVitals, MtFactionCard,
  MtTransfer, MtCodexCard, MtExfilResult, type MtItem,
} from "./Marathon";

// Fictional item codes in the game's product-code style.
const VAULT: MtItem[] = [
  { id: "k9", name: "KVR-9 Carbine", code: "KVR-9", rarity: "deluxe", icon: "weapon", ammo: "light", type: "Assault rifle", value: 4200,
    stats: [{ k: "Damage", v: "18.5" }, { k: "Fire rate", v: "720 RPM", highlight: true }, { k: "Range", v: "38 M" }, { k: "Mag", v: "30" }] },
  { id: "dx", name: "DX44 Breacher", code: "DX44", rarity: "superior", icon: "weapon", ammo: "shotgun", type: "Shotgun", value: 7800,
    stats: [{ k: "Damage", v: "9 × 12" }, { k: "Fire rate", v: "90 RPM" }, { k: "Range", v: "12 M", highlight: true }, { k: "Mag", v: "6" }] },
  { id: "v2", name: "V2 Arc Pistol", code: "V2", rarity: "enhanced", icon: "weapon", ammo: "volt", type: "Volt sidearm", value: 1900 },
  { id: "hm", name: "Heavy Mag Mod", code: "MAG-H", rarity: "enhanced", icon: "mod", fits: true, type: "Mod", value: 650 },
  { id: "sc", name: "Scope 4×", code: "OPT-4", rarity: "deluxe", icon: "mod", fits: false, type: "Mod", value: 1200 },
  { id: "lr", name: "Light Rounds", code: "AMO-L", rarity: "standard", icon: "light", qty: 240, type: "Ammo", value: 2 },
  { id: "hr", name: "Heavy Rounds", code: "AMO-H", rarity: "standard", icon: "heavy", qty: 90, type: "Ammo", value: 4 },
  { id: "pc", name: "Patch Kit", code: "MED-2", rarity: "standard", icon: "consumable", qty: 9, type: "Consumable", value: 120 },
  { id: "cr", name: "Recon Core", code: "CR-R1", rarity: "superior", icon: "core", type: "Core", value: 5400 },
  { id: "im", name: "Neural Implant", code: "IMP-7", rarity: "prestige", icon: "implant", type: "Implant", value: 16000 },
  { id: "ky", name: "Lab Key", code: "KEY-B", rarity: "deluxe", icon: "key", type: "Key", value: 3000 },
];

export default function Demo() {
  const [slide, setSlide] = useState(0);
  const [tab, setTab] = useState("Vault");
  const [item, setItem] = useState<MtItem>(VAULT[0]);
  const [sold, setSold] = useState<string | null>(null);
  return (
    <MtRoot>
      <MtNav
        logo="Runner/OS"
        links={[{ label: "News", href: "#news" }, { label: "Store", href: "#store" }, { label: "Rewards", href: "#rewards" }]}
        current="#news"
        actions={<><MtButton variant="link" href="#lang">English</MtButton><MtButton href="#buy">Buy now</MtButton></>}
      />

      <MtSection tone="dark" meta={{ tl: "SEC.01 // DEPLOY", tr: "v2.4.1", br: "N 12°04' E 88°31'" }}>
        <MtEyebrow accent>// A PvPvE survival extraction FPS</MtEyebrow>
        <MtTitle size="mega" as="h1" scramble>Available now</MtTitle>
        <p className="mt-body">Cold, short and confident body copy. Three lines at most, written like a briefing.</p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <MtButton href="#buy" arrow>Buy now</MtButton>
          <MtButton variant="ghost">Watch trailer</MtButton>
        </div>
      </MtSection>
      <MtStripes />

      <MtSection id="news" tone="dark" eyebrow="Latest updates" title="Field reports" titleSize="h2">
        <MtNewsList items={[
          { source: "Bulletin", date: "10.19.2026", title: "Season 2: Night Marsh opens", href: "#n1" },
          { source: "Bulletin", date: "10.12.2026", title: "Patch notes 2.4.1", href: "#n2" },
          { source: "Bulletin", date: "10.01.2026", title: "Runner shell rebalance", href: "#n3" },
        ]} />
        <MtThumbRail selected={slide} onSelect={setSlide}
          items={["Season 2", "New zone: Night Marsh", "Shell gantry", "Death dealers", "Foothold"].map(label => ({ label }))} />
      </MtSection>

      <MtSection tone="bone" meta={{ tl: "TAU CETI IV // SURFACE DATA" }}>
        <MtSplit>
          <div style={{ display: "grid", gap: 20 }}>
            <MtEyebrow>Powerful. Configurable. Expendable.</MtEyebrow>
            <MtTitle>Death dealers</MtTitle>
            <p className="mt-body">Left text, right media; the next section swaps sides.</p>
            <div><MtButton variant="link" arrow href="#yt">Watch on YouTube</MtButton></div>
          </div>
          <div style={{ display: "grid", gap: 16 }}>
            <MtDataCard label="Extraction rate" value="62" unit="%" tag={<MtTag tone="magenta">Live</MtTag>}>
              <MtProgress value={0.62} label="Extraction rate" />
            </MtDataCard>
            <MtDataCard label="Runners online" value="18,204" />
          </div>
        </MtSplit>
      </MtSection>

      <MtTabBar tabs={["Loadout", "Vault", "Factions", "Codex", "Rewards", "Store"]} value={tab} onChange={setTab}
        end={<><span>CR 48,210</span><span>SILK 1,350</span></>} />
      <MtSection tone="dark" meta={{ tl: `VAULT // ${VAULT.length} / 512`, tr: "SORT: RARITY" }}>
        <MtSplit>
          <MtItemGrid items={VAULT} cells={24} selected={item.id} onSelect={setItem} />
          <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}><MtRarityChip rarity={item.rarity} /><MtEyebrow>{item.type}</MtEyebrow></div>
            <MtTitle size="h2" as="h3">{item.name}</MtTitle>
            <MtSpecTable title={`${item.code} // SPEC`} rows={item.stats ?? [{ k: "Value", v: `CR ${item.value?.toLocaleString("en-US")}`, highlight: true }]} />
            <div><MtHoldButton onConfirm={() => setSold(item.name)}>Sell · CR {item.value?.toLocaleString("en-US")}</MtHoldButton></div>
            {sold && <p className="mt-eyebrow mt-eyebrow--accent">// Sold: {sold}</p>}
          </div>
        </MtSplit>
      </MtSection>

      <MtSection tone="dark" eyebrow="HUD / Factions" title="Contracts" titleSize="h2">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
          <div style={{ display: "grid", gap: 16, alignContent: "start", padding: 20, border: "1px solid var(--mt-gray-700)" }}>
            <MtEyebrow>Runner // vitals</MtEyebrow>
            <MtVitals shield={0.3} health={0.8} heat={0.55} />
          </div>
          <MtFactionCard short="VTX" name="Vertex Agricultural" slogan="Feed the frontier." accent="var(--mt-magenta)" rank={4} progress={0.4} />
          <MtFactionCard short="ORB" name="Orbital Logistics" slogan="Everything, everywhere." accent="var(--mt-orange)" rank={9} progress={0.75} />
        </div>
      </MtSection>

      <MtTransfer destination="NIGHT MARSH" progress={0.64}
        lines={["Searching…", "Shell lock confirmed", "Molecular disassembly complete", "Transfer to destination in progress…"]} />

      <MtSection tone="dark">
        <MtSplit>
          <MtExfilResult status="exfiltrated" loot={[
            { name: "Neural Implant", rarity: "prestige", qty: 1, value: 16000 },
            { name: "Recon Core", rarity: "superior", qty: 1, value: 5400 },
            { name: "Heavy Rounds", rarity: "standard", qty: 60, value: 4 },
          ]} />
          <MtCodexCard id="0417" title="Field log">
            <p>DAY 212. THE MARSH IS QUIET AFTER DARK.</p>
            <p>SIGNAL LOST AT GRID 7-C. LEFT A MARKER BY THE PUMP HOUSE.</p>
            <p>IF YOU READ THIS, DO NOT FOLLOW THE LIGHTS</p>
          </MtCodexCard>
        </MtSplit>
      </MtSection>

      <MtRule />
      <MtSection tone="ultra" eyebrow="Influence is power" title="Advance your foothold" />
      <MtMarquee items={["Death hangs above", "Influence is power", "Run. Loot. Extract."]} />
    </MtRoot>
  );
}

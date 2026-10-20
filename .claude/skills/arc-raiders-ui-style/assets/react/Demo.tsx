// Example page assembling the ARC Raiders-style components: website sections plus in-game hub, stash and HUD.
import { useState } from "react";
import {
  ArRoot, ArSiteNav, ArSection, ArSplit, ArButton, ArStripes, ArNewsGrid, ArTabs, ArCurrency, ArPanel,
  ArItemGrid, ArItemCard, ArLegend, ArTraderCard, ArHud, ArVitals, ArCompass, ArTimer, ArWeapon, ArProgress,
  ArPlayDock, ArFooter, ArHeading, useCountdown, type Item,
} from "./ArcRaiders";

// Placeholder scenery (flat SVG landscapes) so the demo ships no game imagery.
const scene = (sky: string, ground: string, sun = "#F1AA1C") =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky}"/><stop offset="1" stop-color="#ECE2D0" stop-opacity=".55"/></linearGradient></defs><rect width="320" height="180" fill="url(#s)"/><circle cx="236" cy="70" r="22" fill="${sun}" opacity=".85"/><path d="M0 120 60 84l40 22 52-40 58 46 40-24 70 40v52H0Z" fill="${ground}" opacity=".75"/><path d="M0 146 80 118l70 20 90-26 80 30v38H0Z" fill="${ground}"/></svg>`)}`;

const ITEMS: Item[] = [
  { id: "bandage", name: "Field Bandage", rarity: "common", category: "medical", type: "Quick Use", qty: 5, stack: 10, value: 120, weight: 0.2, description: "Stops the bleeding. Mostly." },
  { id: "kestrel", name: "Kestrel I", rarity: "common", category: "weapon", art: "weapon", tier: 1, type: "Assault Rifle", value: 640, weight: 6.5, description: "Reliable, loud, easy to repair." },
  { id: "cell", name: "Power Cell", rarity: "common", category: "wrench", art: "bolt", qty: 3, stack: 5, type: "Topside Material", value: 210, weight: 0.8 },
  { id: "drill", name: "Hand Cannon II", rarity: "uncommon", category: "weapon", art: "weapon", tier: 2, type: "Hand Cannon", value: 1450, weight: 2.4 },
  { id: "light", name: "Light Shield", rarity: "uncommon", category: "shield", type: "Shield", value: 980, weight: 3.0, description: "Takes the first hit so you don't have to." },
  { id: "alloy", name: "Machine Alloy", rarity: "uncommon", category: "wrench", art: "layers", qty: 12, stack: 15, type: "Refined Material", value: 360, weight: 0.5 },
  { id: "medium", name: "Medium Shield", rarity: "rare", category: "shield", type: "Shield", value: 2600, weight: 4.5, stack: 1,
    description: "Layered composite plates salvaged from a downed machine. Absorbs sustained fire and recharges between fights." },
  { id: "defib", name: "Defibrillator", rarity: "rare", category: "medical", art: "bolt", type: "Quick Use", qty: 2, stack: 3, value: 1800, weight: 1.6 },
  { id: "rail", name: "Rail Carbine III", rarity: "epic", category: "weapon", art: "weapon", tier: 3, type: "Battle Rifle", value: 7400, weight: 7.2 },
  { id: "heavy", name: "Heavy Shield", rarity: "epic", category: "shield", type: "Shield", value: 6100, weight: 7.0 },
  { id: "cloak", name: "Photo Cloak", rarity: "epic", category: "aperture", art: "aperture", type: "Trinket", value: 5200, weight: 0.4 },
  { id: "storm", name: "Stormcaller", rarity: "legendary", category: "bolt", art: "weapon", type: "Energy Weapon", value: 18000, weight: 9.5 },
  { id: "guitar", name: "Old Guitar", rarity: "legendary", category: "aperture", art: "leaf", type: "Trinket", value: 12500, weight: 3.2 },
  { id: "core", name: "Reactor Core", rarity: "legendary", category: "wrench", art: "arc", type: "Recyclable", value: 15000, weight: 12.0 },
];

const hudBg = `linear-gradient(180deg,rgba(9,12,25,.25),rgba(9,12,25,.75)),url("${scene("#5B7A93", "#2B3530", "#F8E3B0")}")`;

export default function Demo() {
  const [tab, setTab] = useState("Stash");
  const [selected, setSelected] = useState<Item>(ITEMS[6]);
  const left = useCountdown(312);
  return (
    <ArRoot>
      <ArSiteNav logo="Topside" current="#news"
        links={[{ label: "News", href: "#news" }, { label: "Game", href: "#game" }, { label: "Media", href: "#media" }, { label: "Support", href: "#support" }]}
        actions={<ArButton href="#buy">Buy now</ArButton>} />

      <ArSection tone="campaign" style={{ minHeight: 560, alignContent: "center" }}>
        <p className="ar-eyebrow">Extraction adventure · Out now</p>
        <h1 className="ar-display">Rise to<br />the <em>surface</em></h1>
        <p className="ar-lead">The machines took the sky. Gear up underground, head topside, grab what you can and make it back before the lift closes.</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <ArButton href="#buy" arrow>Buy now</ArButton>
          <ArButton variant="outline" href="#trailer">Watch trailer</ArButton>
        </div>
        <ArStripes variant="corner" corner="br" size={340} />
      </ArSection>

      <ArSection id="news" eyebrow="Latest from the surface" title="News">
        <ArNewsGrid items={[
          { date: "Oct 14, 2026", category: "Update", title: "Cold Snap rolls in", href: "#n1", image: scene("#9DB4C8", "#3D4B57", "#FAEEE0") },
          { date: "Oct 02, 2026", category: "Patch notes", title: "Workshop rebalance", href: "#n2", image: scene("#C98A4B", "#4A3528") },
          { date: "Sep 21, 2026", category: "Community", title: "Raider of the month", href: "#n3", image: scene("#6E8F6A", "#2E3A2B", "#FCC600") },
        ]} />
      </ArSection>

      <div id="game">
        <ArTabs tabs={["Play", "Stash", "Workshop", "Traders", "Raider", "Store"]} value={tab} onChange={setTab}
          end={<><ArCurrency kind="coins" value={48210} /><ArCurrency kind="cred" value={1350} /><ArCurrency kind="tokens" value={12} /></>} />
        <ArSection tone="night" style={{ paddingTop: 40 }}>
          <ArSplit>
            <ArPanel title={`Stash · ${ITEMS.length} / 64`}>
              <ArItemGrid items={ITEMS} slots={24} selected={selected.id} onSelect={setSelected} tile={92} />
            </ArPanel>
            <ArItemCard item={selected} actions={<><ArButton variant="ghost">Inspect</ArButton><ArButton variant="ghost">Recycle</ArButton><ArButton>Sell</ArButton></>} />
          </ArSplit>
        </ArSection>
      </div>

      <ArSection tone="panel" eyebrow="In-round" title="HUD">
        <ArHud background={hudBg}
          top={<>
            <ArCompass heading={312} markers={[{ bearing: 290, icon: "hatch", label: "312m" }, { bearing: 338, icon: "pin", label: "88m", color: "var(--ar-rare)" }]} />
            <ArTimer seconds={left} />
          </>}
          vitals={<><ArVitals name="Vasquez" shield={0.4} health={0.22} /><ArVitals shield={1} health={0.86} /></>}
          weapon={<ArWeapon name="Kestrel I" ammo={24} reserve={96} />} />
      </ArSection>

      <ArSection tone="night" id="media">
        <ArSplit>
          <ArPanel glass title="Buried Quarry" style={{ backgroundImage: `linear-gradient(rgba(10,14,26,.82),rgba(10,14,26,.82)),url("${scene("#4D5C66", "#1F2A25", "#ECE2D0")}")`, backgroundSize: "cover" }}>
            <ArLegend items={[
              { icon: "elevator", label: "Cargo Elevator", primary: true }, { icon: "hatch", label: "Raider Hatch", primary: true }, "gap",
              { icon: "gear", label: "Mechanical" }, { icon: "factory", label: "Industrial" }, { icon: "bolt", label: "Electrical" },
              { icon: "medical", label: "Medical" }, { icon: "swap", label: "Commercial" }, { icon: "layers", label: "Security" },
              { icon: "arc", label: "Machines", color: "var(--ar-danger)" }, { icon: "leaf", label: "Nature" },
            ]} />
          </ArPanel>
          <div style={{ display: "grid", gap: 20, alignContent: "start" }}>
            <ArHeading as="h2">Traders</ArHeading>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16 }}>
              <ArTraderCard name="Marisol" role="Quartermaster" quote="Bring me copper and I'll forget you're late." />
              <ArTraderCard name="Odo" role="Field medic" quote="Hold still. This only hurts the first time." />
              <ArTraderCard name="Bram" role="Gunsmith" quote="If it shoots, I can make it shoot straighter." />
            </div>
          </div>
        </ArSplit>
      </ArSection>

      <ArSection tone="panel">
        <ArSplit>
          <div style={{ display: "grid", gap: 18 }}>
            <ArHeading>Raider progress</ArHeading>
            <ArProgress label="Level 23" value={6400} max={9000} display="6,400 / 9,000 XP" />
            <ArProgress label="Conditioning" value={9} max={15} display="9 / 15" color="var(--ar-uncommon)" />
            <ArProgress label="Mobility" value={5} max={15} display="5 / 15" color="var(--ar-legendary)" />
            <ArProgress label="Survival" value={12} max={15} display="12 / 15" color="var(--ar-danger)" />
          </div>
          <ArPlayDock party={["Vasquez"]} />
        </ArSplit>
      </ArSection>

      <ArSection tone="cream" style={{ justifyItems: "start" }}>
        <p className="ar-eyebrow">Squad up</p>
        <h2 className="ar-display">See you on<br />the surface</h2>
        <p className="ar-lead">Free updates, new maps and new machines all season long.</p>
        <ArButton href="#buy" arrow>Buy now</ArButton>
      </ArSection>

      <ArFooter links={[{ label: "Privacy", href: "#privacy" }, { label: "Terms", href: "#terms" }, { label: "Press", href: "#press" }]}>
        Fan-made style study. Not affiliated with Embark Studios.
      </ArFooter>
    </ArRoot>
  );
}

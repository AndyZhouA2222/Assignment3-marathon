// Example page assembling the Marathon components.
import { useState } from "react";
import {
  MtRoot, MtNav, MtSection, MtSplit, MtButton, MtTag, MtNewsList, MtThumbRail,
  MtDataCard, MtProgress, MtMarquee, MtStripes, MtRule, MtTitle, MtEyebrow,
} from "./Marathon";

export default function Demo() {
  const [slide, setSlide] = useState(0);
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

      <MtRule />
      <MtSection tone="ultra" eyebrow="Influence is power" title="Advance your foothold" />
      <MtMarquee items={["Death hangs above", "Influence is power", "Run. Loot. Extract."]} />
    </MtRoot>
  );
}

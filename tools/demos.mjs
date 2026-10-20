// Demo pages built by build-demos.mjs and captured by screenshot.mjs.
const S = ".claude/skills";
const MT_FONTS = "https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@125,400..800&family=Chakra+Petch:wght@500;700&family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@400;600;800&family=Instrument+Serif&family=VT323&display=swap";
const ARC_FONTS = "https://fonts.googleapis.com/css2?family=Urbanist:wght@600;700;800;900&family=Barlow:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Prompt:wght@600;700&display=swap";

export const DEMOS = [
  { name: "marathon-ui", entry: `${S}/marathon-ui-style/assets/react/Demo.tsx`, css: [`${S}/marathon-ui-style/assets/react/marathon.css`], fonts: MT_FONTS, title: "Marathon UI" },
  { name: "arc-raiders-ui", entry: `${S}/arc-raiders-ui-style/assets/react/Demo.tsx`, css: [`${S}/arc-raiders-ui-style/assets/react/arc.css`], fonts: ARC_FONTS, title: "ARC Raiders UI" },
  { name: "decal-kit", entry: `${S}/marathon-decal-kit/assets/DecalDemo.tsx`, css: [], fonts: MT_FONTS, title: "Marathon Decal Kit" },
];

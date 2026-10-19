# ARC Raiders UI · React

`arc.css` + `ArcRaiders.tsx` are the component library documented in `../../SKILL.md` (section 11). `Demo.tsx` assembles a sample page (website hero and news, hub tabs, stash grid with item card, HUD, map legend, traders, play dock); screenshots are in `../../references/screenshots/`.

Fonts: Urbanist, Barlow, JetBrains Mono and Prompt are the game's own free faces. The CSS uses a locally installed copy first via `local()` aliases and falls back to Google Fonts; the logo face (ITC Avant Garde Gothic Bold) is used only if installed.

The demo ships no game imagery: item art uses icon placeholders and scenery is generated SVG.

Preview from the repo root: `npm run demos && npm run shots` → `out/shots/arc-raiders-ui-*.png`.

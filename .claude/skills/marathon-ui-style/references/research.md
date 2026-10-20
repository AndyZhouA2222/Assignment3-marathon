# Marathon (Bungie, 2026): UI and graphic design research

Compiled 2026-10-19. Marathon launched 2026-03-05 (PS5, Xbox Series X|S, PC). Season 2 "Nightfall" began 2026-06-02. Bungie ended the seasonal model on 2026-09-15. The "Symbiosis" update is due 2026-12-08.

Legend:
- **[V]** verified: stated in a source I read (see Sources).
- **[I]** inferred: my extrapolation, or a community-sampled value. Treat it as approximate.

Caveat: I could not view any screenshots. Every image host (fontsinuse assets, ArtStation CDN, Steam, bungie.net, imgur, Wikimedia) is blocked by the proxy, and WebFetch cannot read images. Screen descriptions therefore come from reviews, patch notes, captions and interviews. Colour hex values are community samples, not official.

---

## 1. Style pillars and official statements

- **"Graphic Realism"** [V]. Joseph Cross (former franchise art director, left Bungie in 2025) called it "mainly a production-facing term". He described it as "a simplified/deconstructed universal design language, strong graphic design and color statements" on one side, and "realistic proportions & scale, implied functional & detail, and a generally grounded world" on the other. The goal: "creating visual 'brand' of science fiction, that (hopefully) feels fresh and stands the test of time."
- **"Graphic retro futurism"** [V]. Brian Vinton, Senior Art Director, March 2026: "kind of a fusion of retro roots, oddball cool… make the weird and unexpected look cool". He added that "the cyberpunk and techwear tones grew out of this search for freshness and surprise."
- **Influences named by Cross** [V]:
  - Games: Wipeout, Mirror's Edge, Metal Gear Solid 2, the original Marathon, Death Stranding.
  - Film and animation: Aeon Flux, Ghost in the Shell, Spider-Verse.
  - Artists and studios: The Designers Republic, Katsuhiro Otomo, Koji Morimoto, Chris Cunningham, Alberto Mielgo.
  - Other: F1 and MotoGP livery, product and apparel design, high fashion.
  - In the 2025 plagiarism response, coverage paraphrases Cross as also citing "modernism, Swiss typography, early 2000s vector art, cyberpunk, and the original Marathon trilogy."
- **ArtStation "Art Blast"** (June 2026) [V]: "Clean geometric forms, strong compositions, stark color accents, intentional negative space". Also: "we use labels, markings, patterns, and graphic hierarchy to establish readability, scale, mood, and identity."
- **"The SAUCE"** [V]. Elliot (also spelled Elliott) Gray, Bungie UI designer, X bio "fontslop merchant", posted on 2026-03-02: "Don't think for a second that we're gonna remove the SAUCE from the UI." He followed with "all jokes aside there's plenty of work we can and will do as a team to respond to player feedback about inventory management, navigation, density of info, etc." and tagged it #fontsloptakeover.
- **ViDoc (Dec 2025)** [V], per Wccftech: the aim is for every part of the game to align, "allowing controllers and interfaces to disappear." Lighting should "clearly differentiate between bright, bleached sunny days and oppressive storms."
- **Kurppa Hosk** (Stockholm agency, lead creative partner since 2021) [V]:
  - "Graphic design is truly unique to the game in a way that is totally new for the industry."
  - The factions were treated as modern brands.
  - The identity is a "living system" that absorbs seasons.
  - Deliverables: "fidelity graphics, worldbuilding iconography, faction brand identities", social templates, Discord "digital access cards", merch, website.
- **How players and press describe it** [V]:
  - "fontslop" (coined by YouTuber Kelski): "20 different combinations of fonts, boldness levels, sizes, spacing, all caps vs regular caps" on one menu page.
  - "maximalist", "dark-mode graphic design portfolio", "labelmaxxing".
  - "Y2K cyberpunk mixed with acid graphic design posters".
  - "overly saturated utilitarian sci fi, turned up to 11".
  - "health goth", "cyber runway", "menacing vibrancy".
  - Fans praise the "Evangelion" typefaces.

## 2. Typography

| Role | Typeface | Facts | Free stand-in [I] |
|---|---|---|---|
| Primary display / brand | **KH Interference** (KH Type, Kurppa Hosk's own foundry; Thomas Kurppa, Jakob Ekelund, Wille Larsson; 2021–22) | [V] Uppercase-only, **monospaced** display face on a **45° grid**. **Rounded outer corners, square inner corners.** Inspired by receipt and ticket-stub printing and low-res pixel screen type. Weights Light/Regular/Bold. Marathon uses Regular and Light. Has arrows, tnum, sups/subs, fractions, ss01–03. "Practically a brand typeface now" (Fonts In Use). | Share Tech Mono, Kode Mono, Chakra Petch (not mono) |
| 2nd heading | **Shapiro Wide 65, custom** (Oliver Jeschke, OGJ Type Design; mid-century neogrotesque) | [V] Customised with a serifed capital **I**, a **curved leg on R** and a **serifed 1**. Not used for Codex scrolling text. | Archivo at `font-stretch:125%` (Expanded) |
| 3rd heading, **in-game only** | **IvyPresto Headline Regular** (Ivy Foundry, Jan Maack) | [V] Narrow, high-contrast Garalde display serif with hairlines and a large x-height. | Instrument Serif |
| Body / data | **Fraktion Mono** Regular and Medium (Pangram Pangram, Juri Zaech) | [V] Squared-off rounds, ink traps, slashed zero, slightly playful technical mono. | Martian Mono, JetBrains Mono, IBM Plex Mono |
| Codex / lore cards | unidentified bitmap / CRT face | [V] "a 1980s phosphor screen font for these lore cards" (Tom's Guide). "A few lines of text on a greenish background, like a retro Minitel screen" (Xboxygen). | VT323, Silkscreen, Doto |
| Misc. pixel glyphs | — | [V] "pixelated exclamation points" (GamesRadar). "small, pixelated icons" (player complaint). | pixel SVG glyphs |

Fonts In Use also says the game "uses many more typefaces outside the UI", in decals and environment [V].

**Usage rules** [I], derived from the sources above:
- All-caps mono display (KH Interference) for big titles and numbers.
- Wide grotesk caps for section headers and tabs.
- A single serif word for drama or personality labels; the IvyPresto use is the likely "Evangelion" look.
- Mono for everything descriptive.
- Mix sizes and weights aggressively within one panel. That mix is the "sauce", but keep one clear focal number or title per panel. Hierarchy is the main criticism.

## 3. Colour

The colours below are not official. Several independent community palettes agree on these values, and the existing project skill `../SKILL.md` uses the same ones.

- **Acid lime, the signature colour** [I]: #C2FE0B (also sampled as #C0FC04, #C4FC04, #C2FE0C; light variant #E5FF45). It matches GamesRadar's "lime green text boxes appear across the menus" [V].
- **Hot magenta** [I]: #EA027E. A fan parody of the map-select screen used a magenta background [V].
- **Ultramarine / electric violet-blue** [I]: #3601FB (also #5200FF). Map-loading screens are known for their **blue palette** [V].
- **Safety orange** [I]: #FF5500.
- **Extra community samples** [I]: cyan #01FFFF, signal red #FF0D1A, navy #29324F, grass green #59B41D, neutral grey #8E8E8E, white #FFFFFF, black #000000.
- **Base** [V]: dark mode ("dark mode" tag on Fonts In Use; "The UI uses dark mode", GamesRadar). Shadows are "near-black" and "bright colors feel violent" (Beebom).
- **The 2025 alpha** [V] used "saturated pinks and neon yellows against cold steel blues." The world is "pastels, neon, lush vegetation", with "Neon blues and toxic greens".
- **Rarity tiers** [V] (PlayStation Runner's Guide): **Standard = grey, Enhanced = green, Deluxe = blue, Superior = purple, Prestige = gold.** There are four colourblind modes that change the rarity colours and the HUD [V]. Season 2 toned down the gear-icon colours ("subtle color palette and intensity choices", player praise) [V].

## 4. Design tokens (approximate)

```css
:root {
  /* base — dark mode is the default UI state [V]; hexes [I] */
  --mt-void:        #000000;
  --mt-black:       #0A0A0A;   /* panels */
  --mt-ink:         #141414;   /* raised panel */
  --mt-line:        #2B2B2B;   /* hairlines */
  --mt-grey:        #8E8E8E;   /* metadata */
  --mt-bone:        #E8E6DF;   /* light/print surfaces, decals [I] */
  --mt-white:       #FFFFFF;

  /* accents (community-sampled) */
  --mt-acid:        #C2FE0B;   /* signature lime: text boxes, focus, CTA */
  --mt-acid-hi:     #E5FF45;
  --mt-magenta:     #EA027E;
  --mt-ultra:       #3601FB;   /* loading / transfer screens */
  --mt-violet:      #5200FF;
  --mt-orange:      #FF5500;
  --mt-cyan:        #01FFFF;
  --mt-red:         #FF0D1A;   /* Arachne, damage, hostile */
  --mt-steel:       #29324F;   /* UESC / cold blue [I] */

  /* codex CRT [I] */
  --mt-crt-bg:      #0C1A0E;
  --mt-crt-fg:      #9CFF7A;

  /* rarity (names [V], hexes [I]) */
  --mt-r-standard:  #9A9A9A;
  --mt-r-enhanced:  #4FD34A;
  --mt-r-deluxe:    #2F8BFF;
  --mt-r-superior:  #A646FF;
  --mt-r-prestige:  #F2B705;

  /* type (originals first, free fallbacks after) */
  --mt-f-display: "KH Interference", "Share Tech Mono", "Kode Mono", monospace;
  --mt-f-wide:    "Shapiro Wide", "Shapiro 65 Light Wide", "Archivo", sans-serif; /* + font-stretch:125% */
  --mt-f-serif:   "IvyPresto Headline", "Instrument Serif", serif;
  --mt-f-mono:    "Fraktion Mono", "PP Fraktion Mono", "Martian Mono", "JetBrains Mono", monospace;
  --mt-f-pixel:   "VT323", "Silkscreen", monospace;

  --mt-fs-meta: 10px; --mt-fs-body: 13px; --mt-fs-h3: 18px; --mt-fs-h2: 32px; --mt-fs-h1: 64px;
  --mt-track-caps: .08em; --mt-track-meta: .14em;

  --mt-radius: 0;          /* hard corners; KH Interference glyphs have rounded OUTER corners only */
  --mt-cut: 10px;          /* 45° chamfer, echoes the type's 45° grid [I] */
  --mt-hair: 1px; --mt-rule: 3px;
  --mt-hazard: repeating-linear-gradient(-45deg, var(--mt-acid) 0 6px, var(--mt-void) 6px 12px);
  --mt-ease: cubic-bezier(.2,.8,0,1);
  --mt-dur-snap: 120ms; --mt-dur-panel: 220ms;
}
```

## 5. Screen-by-screen patterns

### 5.1 Lobby / main menu
- [V] There is a top tab bar; Fonts In Use's Season 2 caption mentions a "broken tab at the top" on 16:10.
- [V] Title-screen tabs: Loadouts, Factions, Codex, Rewards Pass, Store. Also Armory (shop), Vault, Customize (weapon styles, charms, stickers, shell styles), and Runner Connections (social, with a Ranked tab).
- [V] Lime-green text boxes on a dark ground.
- [V] Consoles use free-cursor navigation, criticised as slow; cursor-speed settings were added in Season 2.
- [V] Many actions are hold-to-confirm (sell, remove mod, switch menu).
- [V] The pre-run flow is zone select, then squad or solo, then the "prepare screen", which shows crewmates' loadouts and weapon styles.
- [V] Zone tiles carry a contract icon next to the zone name. Locked zones show their unlock level (Outpost at Runner level 15). Selecting a map region lists commonly found items.
- [V] Since 1.0.5 the lobby warns about overflow items and offers shortcuts to Loadout.
- [V] Season 2 "simplified and streamlined the lobby UI", merged the Loadout and Vault menus, and made Factions, Codex and Settings available during matchmaking.
- [I] Layout: a 3D shell or crew on a dark stage, with dense stacked panels on the left and right edges. Panels have mono metadata in their corners, and the focus state is an acid-lime fill with black text.

### 5.2 Runner shell select ("Shells")
- [V] Roster: Thief, Destroyer, Vandal, Assassin, Recon, Triage, plus Rook (solo/scav, basic loadout). Sentinel was added in Season 2.
- [V] Each shell has a prime/ultimate, a tactical and passives. Fonts In Use has an animated GIF of the Shells menu.
- [V] Rarity also applies to shell cosmetics (e.g. "Luxe Palace", "Overdrive-TSL", "Cyber Red").
- [I] Big shell name in KH Interference or wide caps, the role tagline in mono, and the ability list as a spec table.

### 5.3 Loadout / inventory / vault
- [V] Grid inventory: the vault upgrades to **512 grid spaces**, and items occupy cells. There is a backpack plus an overflow inventory.
- [V] Weapon tile: **ammo-type icon in the lower-right**. Barter weapons show a barter cost on the tile.
- [V] Mod tile: a **compatibility glyph in the bottom-left**. "X" means it fits no equipped weapon; a **left-pointing arrow** means it fits.
- [V] Rarity is colour-coded. Item tiles were "simplified" in Season 2.
- [V] Filter tabs include keys and backpacks. Batch select arrived in Season 2. Selecting an empty slot filters the list to compatible loot.
- [V] Implant cards list the perk first; stats are fixed by rarity from Season 2.
- [V] Complaints: near-identical icons for cores, implants and mods; no weapon comparison; hover needed for tooltips.
- [I] Tiles are square with hard corners. The rarity colour shows as a bottom bar or corner flag. Stack counts and codes sit in the corners in mono.

### 5.4 Factions / contracts
- [V] Each faction has its own menu with an overview page (Fonts In Use shows CyberAcme), a contract screen and an unlock tree. Upgrades include vault space and the shop.
- [V] Contracts are split into **Priority** and **Standard**. X activates a contract, and R3 tags salvage so its icon shows in the field.
- [V] Faction intro cinematics are by Antibody TV.
- [V] Season 2 embedded objective icons into contracts and gave the faction menu a smoother flow.
- [V] "Sponsored kits" are free pre-built loadouts from factions.
- [I] Each faction page takes on its own accent colour and logo lockup over the shared dark system.

### 5.5 Map
- [V] Overhead map with pinged activity icons that become waypoints. "DCON" appears when a contract needs it. Material-likelihood hints by region.
- [V] Zones: Perimeter, Dire Marsh, Outpost, Cryo Archive (endgame, on the UESC Marathon), Night Marsh (Season 2).

### 5.6 HUD
- [V] Hit marker is an **"X"**. A **coloured skull** marks a downed enemy ready for a finisher.
- [V] The **shield indicator is small** and hard to read; a reviewer wanted colour or numbers, as in Halo.
- [V] A Heat meter works as "reverse stamina".
- [V] A radial menu for equipment.
- [V] Contract and activity waypoint icons. Some waypoints fade while aiming down sights (1.0.5).
- [V] Revive prompt and timer.
- [V] A "Hacked" status full-screen effect, toned down in 1.0.5.
- [V] Faction objectives and nearby UESC threats are tracked. Teammates' objectives are shown to the squad.
- [V] Exfil countdown of 10 s, plus a recall window.
- [V] The Sentinel's Prey Tracker radar shows **red blips**.
- [V] Settings include a "UI refresh rate" option (High).
- [I] Data sits bottom-left (shield and health as segmented bars) and bottom-right (ammo and weapon code), with a compass or heading strip at the top. Text is small and mono, with acid or white on transparent. The KleverOwl analysis reads the text as visor-projected, which is a guess, not confirmed.

### 5.7 Extraction / results
- [V] Fonts In Use has animated captures of "A successful exfiltration" and "Bonus rewards after completing a few contracts".
- [V] There are Runner Level Up rewards and Seasonal Level reward screens. The post-run spectator camera times out after 120 s.
- [I] A full-bleed status word ("EXFILTRATED" or "LOST") in display type, followed by a tabular loot ledger in mono with rarity chips and credit totals.

### 5.8 Loading / transfer screens
- [V] Known for a **blue palette** (map-loading screens).
- [V] A large **moth-like figure** sits beside status lines: **"Searching…", "Molecular disassembly complete", "Transfer to destination in progress…"**. Notebookcheck called the effect "surreal, almost psychedelic."
- [I] A full-bleed ultramarine (#3601FB) field with a white mono status log, a progress readout and a central dithered or pixel creature.

### 5.9 Codex, Rewards Pass and store
- [V] Codex sections: Season Levels, Feats of Mastery, Titles, Weapons, Combat Utility, Salvage, Consumables, per-map challenges, Threats, Activities, Factions. Lore entries sit on CRT-style green cards.
- [V] Rewards Pass currency is **SILK**. Fonts In Use shows the battle pass and a weapon-skin unlock animation.

### 5.10 Website and marketing (Kurppa Hosk)
- [V] The navigation reads as a world document: "Fragmented transmissions, restricted zone data, and incomplete field surveys fill the navigation." The principle: "Every design decision reinforces the fiction."
- [V] Critics described "aggressive minimalism… in color and structure", an "enlarged cursor", "info tabs glued together with a slew of graphics crowding the interface", and "the anti-website".
- [V] Merch uses "dark sci-fi geometry, faction iconography, and the restrained color palette."
- [V] Other deliverables: a social-media design system and Discord digital access cards. Key art and shell renders are by Jeremy Hanna and Bungie Creative Studios. The logo is by Bungie and PlayStation Studios Creative.
- [V] KH Interference is used across marketing ("brand typeface").

## 6. Faction / corporation identities

Handlers and specialties are verified. Logo and colour specifics are mostly undocumented in text, so the accent column is my suggestion [I] unless marked otherwise. Statehornet says each faction "keeps with the extensive neon color wheel" while feeling "distinct, bespoke" [V].

| Faction (short form [V]) | Business [V] | Handler / face [V] | Documented visual cues [V] | Suggested accent [I] |
|---|---|---|---|---|
| **CyberAcme** ("CyAc") | AI and cybernetic infrastructure, consciousness upload into shells; vault, economy and cybersecurity upgrades | **ONI** (Onboard Navigational Intelligence): large, off-putting head | Slogan (back-translated from Russian): "The digital foundation of modern life" | acid lime #C2FE0B |
| **NuCaloric** Agricultural ("NuCal") | Food and consumer goods: "feed, clothe, and supply humanity" | **Gaius**: "plain, pink, expressionless head" | Pink. Kurppa Hosk produced a real "2x Drinkable Cheeseburger" | pink / magenta #EA027E |
| **Traxus** OffWorld Industries | Industrial and economic superpower; weapons and mods; investor in the original Marathon | **Vulcan** | Traxus Codex skin. RC maker Traxxas filed a trademark claim | safety orange #FF5500 |
| **MIDA** | Radical anti-establishment movement, ex-Martian revolutionaries; explosives, sabotage | **Gantry**: "fragmented and broken" transmissions | — | hazard yellow on black, glitch type |
| **Arachne** | Death cult; PvP, snipers, railguns, melee | **Charter**: multi-armed, holding weapons and a UESC soldier's heart | **"blood-red aesthetic" with "horror-movie vibes"** | red #FF0D1A |
| **Sekiguchi Genetics** | Biomata shells, Weaveform tech | **Nona**: "white, winged insect with red eyes and several arms" (Weaveworm avatar) | White and red | clinical white plus red or cyan |
| **UESC** (enemy) | Unified Earth Space Council; AI opponents | — | — | cold steel blue #29324F |

## 7. Decal / label language

Verified elements [V]:
- Labels, markings, patterns and graphic hierarchy used for "readability, scale, mood, and identity" (Art Blast).
- "logos, barcodes, and identification numbers all over" overly large machinery. Compared to a Gundam model kit's decals; "labelmaxxing". The lore explains "why everything has so many labels on it."
- **Hazard stripes** "that could stop traffic".
- An airlock seal labelled **"SEAL"** and a roll of **"ATTACH"** tape.
- A **"CAUTION: HIGH VOLTAGE"** sticker.
- Conduits **labelled with their energy output**.
- Control panels with "icons so bold they practically jump off the screen."
- "QR-code pixel art, fonts, colors" was what the 2025 plagiarism claim covered. Bungie removed the decal sheet of "icon and text elements". The word **"Aleph"** was named as a motif of the copied artist, so avoid it.
- **Pixel and receipt aesthetics**: KH Interference is built from receipt, ticket-stub and low-res pixel letterforms, has arrow glyphs and a 45° grid. The UI has pixelated "!" glyphs.
- **Product-code naming** (real item names): BRRT SMG, KKV-9SD, D54 Battle Pistol, V22 Volt Thrower, BR33 Volley Rifle, V11 Punch, Stryder M1T, WSTR Combat Shotgun, Overdrive-TSL. Patrick Bloom's ArtStation files are named `pb-brrt-smg-00N` and `pb-medic-0N` ("Marathon: BRRT SMG", "Marathon: Triage Support").

Not verified, from the task brief [I]: "LINK", "PACKAGE" and "ATTACH HERE" were not found in any text I could read. "PB-BRRT-SMG" and "PB-MEDIC" are image file names, not confirmed decal text. They fit the language, but label them as inspired-by.

Generator recipe [I]:
1. **Code box**: a framed mono serial, `[A-Z]{1,4}[0-9]{1,3}-?[A-Z0-9]{0,4}`, plus a revision tag (`REV.04`) and lot number.
2. **Warning plate**: a pictogram square, an all-caps verb (SEAL / ATTACH / CAUTION / NO STEP / VENT), a tiny mono sub-line and a 45° hazard band.
3. **Spec table**: 2–4 columns of mono key-value rows (OUTPUT 4.2kW, MASS, CLASS, BATCH), hairline rules, one row highlighted in acid.
4. **Barcode / QR-pixel block** with a human-readable number underneath.
5. **Pixel arrows and chevrons** (▶ ◀ ↗, built on a 45° grid), registration crosshairs and corner ticks.
6. **Faction lockup**: short brand (CyAc, NuCal, TRAXUS, MIDA, ARACHNE, SEKIGUCHI) in wide caps plus a slogan in serif or mono, coloured by faction accent.
7. **Composition**: dense clusters at mixed scales, one bold colour per decal, black or white or bone ground, hard edges, occasional chamfer.

## 8. Motion

- [V] Loading and transfer screens are animated and "psychedelic", with sequential status lines.
- [V] There is a Codex scrolling-text treatment.
- [V] Exfil, rewards and skin-unlock screens are animated (Fonts In Use GIFs).
- [V] The "Hacked" screen effect is a glitch overlay.
- [V] A fixed 10 s exfil countdown.
- [V] A "UI refresh rate" setting.
- [I] Fast, hard, mechanical motion: 100–250 ms with no bounce. Use stepped or terminal-style text reveals (typewriter or scramble), clip-path wipes and 1–2 frame glitch offsets. Respect reduced motion.

## 9. Post-launch UI timeline

| Date | Change |
|---|---|
| 2026-02-27 | Server Slam recap (X): "We still plan to rework the user interface after launch." The UI was the most-criticised element of the test. |
| 2026-03-02/03 | Gray's "SAUCE" post. Bungie: "Keep it coming." |
| 2026-03-16/18 (1.0.5) | Vault stack sizes raised; filter tabs for keys and backpacks; Revive prompt readability; waypoints fade on ADS; clearer contract and activity waypoint icons; Hacked effect toned down; lobby overflow warnings and Loadout shortcuts; Armory tooltips show purchase cost. |
| 2026-04-21 (1.0.6.1) | Radial selection accuracy; crewmate weapon styles on the prepare screen; barter cost on weapon tiles; bigger overflow inventory. |
| 2026-06-02 Season 2 | Lobby simplified; Loadout and Vault merged; 512-space vault; batch select; slot-filtered loot; menus usable during matchmaking; cursor-speed and privacy settings; implants perk-first; **item tiles simplified**; subtler gear-icon colours; objective icons in contracts. Destructoid called the UI "vastly improved". TechRadar said the inventory was "overhauled completely" (stacks of 9 meds and 800 ammo). |
| 2026-09-15 | Seasonal model ended. 2026-10-06 Nightfall refresh. 2026-12-08 "Symbiosis" update (social space, tutorial improvements). |

## 10. Readability lessons for a web kit [I]

The criticism centres on flattened hierarchy ("too many elements feel equally prominent"), lookalike icons, tiny shield and HUD text, and deep nesting ("5–6 menus deep"). Season 2 fixed these by simplifying tiles, toning down icon colour and merging menus while keeping the type mix.

For the kit:
- Keep the font mix, but give every panel exactly one dominant element.
- Make rarity visible on the tile itself.
- Keep body text at 12px or larger.
- Show numeric values next to segmented bars.

## 11. Reference images

Not downloaded: every image host returned proxy 403. The engineer can fetch these manually.
- Fonts In Use screenshots (Season 2, June 2026), with captions:
  - Lobby: `https://assets.fontsinuse.com/static/use-media-items/294/293690/upto-700xauto/6a36344f/Marathon%20Screenshot%202026-06-05%20-%2021-00-23-76.png`
  - Shells: `.../293691/upto-700xauto/6a36344a/Marathon%20Screenshot%202026-06-05%20-%2021-00-52-69.png`
  - CyberAcme overview (GIF): `.../293709/...`
  - HUD: `.../293703/.../Marathon%20Screenshot%202026-06-05%20-%2016-41-07-69.png`
  - Exfil success: `.../293704/.../Marathon%20Screenshot%202026-06-05%20-%2016-52-24-41.png`
  - Codex (GIF): `.../293710/...`
  - Rewards: `.../293705/...`
  - Battle pass: `.../293707/...`
  - Skin unlock (GIF): `.../293708/...`
  - Full list on https://fontsinuse.com/uses/67879/marathon-2026-video-game-1
- Patrick Bloom: `https://cdna.artstation.com/p/assets/images/images/100/032/278/large/patrick-bloom-pb-brrt-smg-001.webp` (and -002…-007) and `https://cdnb.artstation.com/p/assets/images/images/100/066/137/large/patrick-bloom-pb-medic-01.webp` (and -02…-08).
- Kurppa Hosk case study: `https://cms.abduzeedo.com/sites/default/files/inline-images/marathon_img02.jpg` (social system), `marathon_img04.jpg` (website), `marathon_img05.jpg` (Discord access cards).

## Sources (all read via WebFetch)

- Fonts In Use, Marathon (2026): https://fontsinuse.com/uses/67879/marathon-2026-video-game-1
- KH Interference: https://khtype.com/typeface/kh-interference/ · https://khtype.com/ · https://creativeboom.com/news/kh-type · https://www.kurppahosk.com/news/launching-kh-type
- Shapiro: https://www.fontshop.com/families/shapiro · Fraktion: https://pangrampangram.com/products/fraktion · IvyPresto: https://fonts.adobe.com/fonts/ivypresto-headline
- ArtStation Art Blast: https://magazine.artstation.com/2026/06/bungie-marathon-art-blast/
- Patrick Bloom: https://patrickbloom.artstation.com/ · https://patrickbloom.artstation.com/projects/5enXkw · https://patrickbloom.artstation.com/projects/Baokn9
- Aftermath concept art: https://aftermath.site/marathon-bungie-concept-art/ · karakter: https://karakter.de/marathon/ · Molly McLaughlin: https://www.mollyanneart.com/marathon-2026
- Kurppa Hosk: https://www.kurppahosk.com/work/bungie · https://abduzeedo.com/marathon-brand-identity-kurppa-hosk · https://www.creativereview.co.uk/kurppa-hosk-marketing-design-bungie-marathon/ · https://www.adsoftheworld.com/campaigns/bringing-marathon-to-life · https://www.commarts.com/exhibit/marathon-campaign-1 · https://visuelle.co.uk/bungie/
- Art direction: https://80.lv/articles/marathon-art-director-shares-the-team-s-creative-influences · https://www.psu.com/news/marathon-takes-inspiration-from-mirrors-edge-ghost-in-the-shell-more-for-its-art-style/ · https://thegamepost.com/marathon-art-style-mirrors-edge-ghost-in-the-shell/ · https://www.creativebloq.com/3d/video-game-design/bungies-art-director-explains-marathons-controversial-art-style · https://www.vice.com/en/article/bungie-marathon-art-director-responds-to-criticism-that-the-game-is-too-bleak-looking/ · https://www.space.com/entertainment/space-games/bungie-explains-marathons-graphic-retro-futurism-aesthetic-and-the-live-narrative-lessons-it-learned-from-destiny-interview · https://twistedvoxel.com/bungie-responds-to-plagiarism-accusations-surrounding-marathon-art/ · https://www.videogameschronicle.com/news/bungie-pulls-marathon-gameplay-after-art-plagiarism-storm-and-say-its-reviewing-all-art · https://gamingbolt.com/marathon-uses-decals-and-visual-style-stolen-from-independent-artist-confirms-bungie · https://gamewave.fr/marathon/le-changement-visuel-de-marathon-risque-de-lui-faire-perdre-son-identite/ · https://www.brace.design/single-post/bungie-s-marathon-an-eye-for-design
- UI debate: https://gamingbolt.com/dont-think-for-a-second-were-gonna-remove-the-sauce-says-marathon-ui-designer-about-its-look · https://kotaku.com/marathon-ui-fontslop-menus-bungie-2000675332 · https://insider-gaming.com/marathon-ui-wont-have-sauce-removed-fontslop/ · https://www.pcgamer.com/games/fps/marathon-ui-designer-declares-himself-the-fontslop-merchant-and-promises-bungie-will-never-remove-the-sauce-from-the-ui/ · https://www.pcgamer.com/games/fps/an-absolute-eyesore-marathons-biggest-issue-seems-to-be-its-poor-ui-design-thats-confusing-players-i-have-no-idea-where-im-at-what-im-looking-at/ · https://www.gamesradar.com/games/fps/the-first-ever-fontslop-game-marathon-players-are-already-sick-of-looking-at-the-upcoming-bungie-shooters-eye-sore-ui/ · https://marathonhub.gg/news/bungie-says-marathons-ui-will-improve-but-the-sauce-is-staying/ · https://www.gamenguide.com/articles/107562/20260304/bungies-marathon-sparks-fontslop-debate-players-raise-ui-ammo-ttk-concerns-ahead-launch.htm · https://www.gamepro.de/artikel/marathon-ui-kritik-bungie-verbesserung-ankuendigung,3448863.html · https://mein-mmo.de/en/marathon-wants-to-be-the-new-competitor-to-arc-raiders-but-players-complain-why-is-everything-hidden-5-6-menus-deep,1554307/ · https://mein-mmo.de/marathon-spieler-lieben-die-grafik/ · https://shazoo.ru/2026/02/28/180326/igroki-marathon-razocarovany-interfeisom-i-prosiat-bungie-uprostit-ego-kak-mozno-skoree · https://josephkerrdesign.com/bungies-overdesigned-uis-what-marathon-gets-wrong/ · https://kleverowl.com/blog/ui-ux-design/marathon-game-ui-design-principles-busy-interface/ · https://gamingbolt.com/marathon-ui-designer-fires-back-at-claims-of-halo-destiny-developers-not-being-involved
- Reviews and previews: https://www.tomsguide.com/gaming/marathon-review · https://www.techradar.com/gaming/marathon-review · https://beebom.com/marathon-review/ · https://www.gfinityesports.com/article/marathon-review-a-bold-brutal-and-neon-soaked-extraction-shooter · https://www.gfinityesports.com/article/marathon-preview-final-thoughts-and-gameplay-impressions · https://www.notebookcheck.net/Marathon-hands-on-preview.1244120.0.html · https://www.xboxygen.com/Tests/352919-test-marathon-une-course-sans-but · https://multiplayer.it/articoli/marathon-le-prime-ore-con-il-nuovo-gioco-bungie.html · https://gamers-haven.org/game-reviews/marathon/ · https://monstervine.com/2026/04/marathon-review/ · https://nukatronic.substack.com/p/the-first-steps-in-marathon · https://statehornet.com/2026/03/marathon-bungie-halo-destiny-extraction-shooter-fps-multiplayer-art-opinion-video-game/ · https://espressotonic.beehiiv.com/p/marathon-is-good
- Patches and updates: https://www.notebookcheck.net/Major-Marathon-update-1-0-5-adds-Cryo-Archive-downed-exfil-and-UI-tweaks.1253313.0.html · https://frvr.com/blog/news/marathon-1-0-6-1-patch-notes/ · https://www.shacknews.com/article/148787/sanrio-party-land-game-announcement (1.0.6.1) · https://www.vice.com/en/article/marathon-is-making-a-huge-quality-of-life-improvement-next-week/ · https://mobalytics.gg/marathon/guides/season-2-dev-update · https://www.shacknews.com/article/149331/everything-new-in-marathon-season-2 · https://destructoid.com/rocky-day-1-marathon-season-2-massive-improvement/ · https://massivelyop.com/2026/09/15/marathon-pushes-its-major-september-update-into-december-and-ends-its-seasonal-content-schedule/ · https://wccftech.com/bungies-marathon-launches-march-2026-developers-provide-updated-vision/amp/ · https://en.wikipedia.org/wiki/Marathon_(2026_video_game)
- Factions and UI guide: https://www.pcgamesn.com/marathon/factions · https://www.dexerto.com/wikis/marathon/factions/ · https://www.gamereactor.eu/?p=121208 · https://shatteredvault.com/marathon/factions/ · https://dtf.ru/games/3711068-fraktsii-v-marathon-2025 · https://www.playstation.com/en-us/games/marathon/runners-guide-marathon-tau-ceti-iv/ · https://www.dexerto.com/wikis/marathon/marathon-codex/
- Community palettes: https://www.color-hex.com/color-palette/1071008 · https://www.color-hex.com/color-palette/1058379 · https://www.color-hex.com/color-palette/1057943 · https://www.color-hex.com/color-palette/1026133
- Blocked or unreadable: marathonthegame.com (proxy), bungie.net articles (JS-only shell), gameuidatabase.com (robots), the marathonthegame fandom wiki (fetch error), all image CDNs (proxy 403).

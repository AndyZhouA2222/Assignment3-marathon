# ARC Raiders: UI / graphic design research brief

Researched 2026-10-19 for a React UI kit that evokes ARC Raiders (Embark Studios, launched 2025-10-30).

**Evidence tags used throughout**
- **[V]**: verified in a source I read (source number in brackets, see *Sources*).
- **[S]**: sampled. I measured these pixels myself from in-game captures (item tiles and the map) held in the community repo RaidTheory/arcraiders-data. Hex values are close but slightly affected by compression.
- **[I]**: inferred, or a design recommendation. This is not confirmed by a source. Treat it as a best guess.

---

## 1. Art direction in one paragraph

ARC Raiders reads as **warm, hopeful, lived-in retro-futurism**. Its "space western" world has a 1970s–80s sci-fi flavour, as opposed to sleek cyberpunk or brutalist graphic design.

- Fonts In Use says the game "embraces retro-futurism", and the logo is its clearest example [V1].
- GameSpot calls the setting "an exciting space western" in which Raiders mix cowboy dusters with astronaut helmets. The reviewer names the look **"NASA-Punk"**, praises its "function over fashion" gear, and says the world "is gorgeous and shows signs of hope" [V12].
- VidaExtra's opinion piece names **cassette futurism** as "the most defining style", meaning a future frozen in the late 70s, 80s and early 90s. It also names **NASA-punk**, **scrappunk/junkpunk** (tech built from scrap) and a "colorful 70s/80s" retro style [V13]. This is one writer's analysis, not an Embark statement.
- Official copy describes "a lethal future earth" with "climate collapse and malevolent machines" [V4]. The setting is the year 2180. Survivors live in Speranza, a *contrada* of the underground city Toledo, beneath the Rust Belt in post-apocalyptic Italy, and go up to the surface, called **Topside** [V11].
- The soundtrack is by Johan Söderqvist and Patrik Andrén, with "older analogue synthesisers, vintage arpeggios… modular ventures" and comparisons to Vangelis' *Blade Runner* [V26]. Another review calls it "synth-heavy… *Stranger Things*-style tension" [V27].
- Embark's UI philosophy is minimal and trusts the player. Chief creative officer Stefan Strandberg: "If you put a damage number on top, or a health bar, that's redundant… Now you're playing the Excel sheet of a game!" There are no enemy health bars or damage numbers; combat feedback comes from VFX and sound [V14]. The audio director says players should read threats through sound "instead of relying on UI elements" [V24].

**Keywords to design by.**
- Verified: retro-futurism, NASA-punk, space western, cassette futurism (one opinion piece), analogue synth, hopeful post-apocalypse.
- [I] Also: 70s aerospace livery, rainbow stripe, cream on navy, soft-rounded, flat, calm, readable.

**Reception of the UI itself is mixed.**
- Positive: German players call ARC the benchmark for an intuitive UI, saying it took two minutes to learn and its icons are clear [V29].
- Negative: one review says the font is small and the UI favours mouse and keyboard [V11]. Another says "important tabs hide under bland icons" and the skill tree "looks like a flat mobile chart" [V27]. A third says "the UI is a mess" [V28].
- Takeaway for the kit: **flat, calm, readable**, not ornamental.

---

## 2. Colour

### 2a. Brand and website colours (official site)
| Token | Hex | Evidence |
|---|---|---|
| Cream (primary text on dark; nav band background) | `#ECE2D0` | [V] the site's `theme-color` meta tag [V4]; listed as `text-primary-cream` [V2]; Brandfetch "Aths Special" [V3] |
| Accent gold (primary buttons, highlighted words) | `#F1AA1C` | [V2] |
| Brand red | `#D00000` | [V3] Brandfetch. The role is not stated; probably the red logo stripe or accent [I] |
| Ebony (near-black, slightly purple) | `#130918` | [V3] Brandfetch. Good choice for dark text on cream [I] |
| White (secondary text, related-story cards) | `#FFFFFF` | [V2] |
| Fan logo-generator cream | `#EAE0CD` | [V7] a fan tool, but consistent with the above |

**Stripe motif.** The logo and site use four coloured diagonal stripes.
- What the sources say about the colours:
  - Fonts In Use: green, yellow and red stand for the three skill trees, and blue stands for ARC [V1].
  - fudge.design: "red, yellow, green, and cyan" [V2].
  - A fan tool: "cyan, yellow, orange, red" [V7].
- Logo construction: ITC Avant Garde Gothic Bold with tighter spacing. The second R is "nearly cut in half to make way for the color stripes" [V1].
- The skill-tree colour code is verified: Conditioning = green, Mobility = yellow, Survival = red [V17].
- No source publishes the stripe hex values, and the stripe image (`assets.arcraiders.com/static/stripes/stripes.png`) was unreachable. The values in section 7 are approximations, matched to the in-game rarity hues [I].

### 2b. In-game surfaces and text (sampled)
| Role | Hex | Evidence |
|---|---|---|
| Deepest navy-black (stash background, item-tile bottom band) | `#090C19` | [S] |
| Panel header / solid panel | `#0A0E1A` | [S] map legend |
| Item-tile body (subtle vertical gradient) | `#131624` (top) to `#0F1221` | [S] |
| Neutral tile border (Common) | `#363C48` | [S] |
| Hairline rule after a heading | `#434248` | [S] map legend |
| Heading text (in-game) | `#FAEEE0` | [S] map legend heading |
| Icon glyph / label cream | `#F4EADB` to `#ECE2D0` | [S] tile category icons |
| Dim numeral (Common tier "I") | `#595B61` | [S] |

All in-game darks are **cool navy-black, not neutral grey**. All light text is **warm cream, not pure white** [S]. The site's own background is a "near-black campaign background" with a "warm cream" nav band [V2].

### 2c. Rarity tiers
Tier names are verified as **Common, Uncommon, Rare, Epic, Legendary** [V15][V16][V33]. The wiki also lists a niche sixth tier, **Amplified**, used only for "Amplification Module Mk. I–V" [V10]; its colour is unknown.

| Tier | Colour family (sources) | Sampled in-game hex [S] |
|---|---|---|
| Common | grey [V15], "white/gray" [V16] | `#6C6C6C` (swoosh); border `#363C48` |
| Uncommon | green [V15][V16] | `#24BA54` |
| Rare | blue [V15][V16] | `#00A8F2` (sky/cyan blue) |
| Epic | "purple/pink" [V15], purple [V16] | `#CC3096` (**magenta, not violet**) |
| Legendary | orange [V15], gold [V16] | `#FCC600` (**golden yellow**) |

### 2d. Other status colours
- **Map zone outlines** [S]: red `#E5584A` and amber `#F8B810`. These are polygons drawn around named high-value areas, such as Hydroponic Dome Complex in red and Generator Hall in amber. What red and amber mean is not confirmed [I].
- **ARC threat levels** are Low, Moderate, High, Critical and Extreme [V33 bots.json]. No source gives colours for them [I].
- **HUD**: a guide describes teammate health bars as a "white and blue gauge bar", XP pickups as a "yellow rectangle icon with XP", and map markers as "yellow, blue, or green dot" icons [V18]. This is a low-quality source but plausible.
- **Extraction icon**: it "changes color when five minutes remain and turns grey when the lift closes" [V8].

---

## 3. Typography

### 3a. Faces used (Fonts In Use [V1])
| Role | Face | Free / Google look-alike |
|---|---|---|
| Logo | **ITC Avant Garde Gothic Bold**, tightened, with a modified R | Urbanist 800–900 or Poppins 700–800, tracked `-0.02em` [I]. Questrial is close but only has weight 400 [I] |
| Headings | **Urbanist** (used most), **Prompt** | Both are on Google Fonts. I confirmed both are served |
| Body (used heavily) | **Barlow** Light / Regular / Bold | Google Fonts |
| HUD accents | **JetBrains Mono** (mostly in the HUD) | Google Fonts |

Fonts In Use credits all of these to "Embark Studios" and names no foundries [V1]. One fan site claims the logo is a custom take on an "Arc font… by Production Type" [V7]. That is unverified and contradicts Fonts In Use, so I trust [V1].

### 3b. Casing, weight and tracking
- **Website** [V2]:
  - Campaign display text: 64–80px, weight 700, **UPPERCASE**, letter-spacing 2px, line-height about 0.9.
  - Compact UI text (nav, buttons, labels): 16px, weight 600, **UPPERCASE**, letter-spacing 1.6px (0.1em).
  - Body: 16px/400, or 20px/400 with 27px line-height, in mixed case.
  - Editorial headings: 32px/400, mixed case.
- **In-game** [S]:
  - Panel titles are **bold geometric UPPERCASE** in cream, for example "DAM BATTLEGROUNDS", followed by a thin grey rule that runs to the panel edge.
  - List labels are **mixed-case Barlow Medium** ("Cargo Elevator", "Raider Hatch", "Mechanical").
  - Enemy names are stored in uppercase ("BASTION", "THE QUEEN") [V33].
- Recommendation [I]: Urbanist 700–800 uppercase, tracked +0.04–0.08em, for titles and tabs. Barlow 400–500, mixed case, for body and lists. JetBrains Mono 500 for numbers (ammo, timers, coordinates, weight, values).

---

## 4. Layout and component patterns

### 4a. Main hub (Speranza)
- Every session begins in the **Main Hub** [V20]. GameSpot describes Speranza as "a few animated menus" rather than a walkable space; loudspeakers in the menus carry worldbuilding hints [V12]. A fan recreation describes the lobby as a "clean minimal interface over an in-engine 3D preview" [V-devforum, see the note in *Sources*].
- **Navigation bar** includes *Traders*, *Workshop*, *Character Creator* and *Battle Pass* [V20]. The fandom wiki lists hub sections as *Stash, Workshop, Traders, Raider, Store* [V23]. [I] Build a horizontal tab bar of uppercase cream labels.
- **Left panel**: your *Feats* and active *Quests* [V20].
- **Bottom-right**: the *Play* button. *Fill Squad* and *Crossplay* toggles and a "+" party-invite circle sit above it [V21][V22]. A *Social* button with *Friends*, *Recent* and *Add Friend* is also at bottom-right [V21].
- **Currencies**: Coins (trader prices, stash upgrades), Cred (Feats rewards, Raider Deck items) and Raider Tokens (Raider Deck access) [V19][V33][V9].

### 4b. Item tile (the signature component) [S], measured on 128px tiles
See `images/01-item-tiles-by-rarity.png` and `02*`.
- Square with **rounded corners**, radius about 8% of the width (≈10px at 128px).
- A **1–2px border tinted by rarity**: brightest on the left and bottom-left edges, fading to a dim, desaturated mix toward the top-right. For Rare, the top edge is `#3C80B2` and the right edge `#304860`.
- **Body**: dark navy gradient (`#131624` to `#0F1221`). A **left-side tint** runs across the full height: about 30% rarity colour at the left edge, fading to navy by about 70% of the width.
- **Swoosh**: a solid rarity-colour shape fills the bottom-left corner above the band. Its curved boundary is concave and runs from the left edge at about 45% height down to the band at about 30–40% width.
- **Bottom band**: the bottom 25% of the tile is solid `#090C19`.
  - **Category glyph** at left: a cream filled pictogram about 16px at 128, for example a cross for Quick Use/medical, a shield for Shield, a wrench for materials, a lightning bolt for energy weapons, an aperture for trinkets.
  - **Tier numeral** at right: a Roman numeral, I to IV, in dim rarity-tinted grey.
- Item art: a **realistic 3D render** with a neutral, slightly desaturated look, centred and angled about 30°, no outline.
- Tiles sit edge-to-edge with about 4–6px gaps on the `#090C19` background. The base stash has **64 slots**, +24 per upgrade, +12 per completed Expedition [V9].

### 4c. Panels and legends [S] (map legend, `04-map-legend-panel.png`)
- Translucent navy panel (about `rgba(10,14,26,.85)`), radius about 10–12px at 1080p [I scaled]. The header strip is darker and holds the UPPERCASE title plus a 2px grey rule.
- Rows: a 20px circular dark icon chip with a cream glyph, then a Barlow label. Primary items get **inverted chips** (a cream rounded square with a dark glyph), as with Cargo Elevator and Raider Hatch.
- The website uses no visible shadows [V2]. Keep in-game panels flat as well: separate layers with tone, not drop shadows [I].

### 4d. Buttons and controls
- Website primary button [V2]: gold `#F1AA1C` fill, very dark uppercase 600 text tracked 1.6px, a **compact 4–5px radius, explicitly not a pill**. The secondary button is a transparent fill with a white outline and white text.
- Website rules [V2]: a 2px solid rule for section and card boundaries, and thin **gold** hairlines as editorial dividers.
- In-game [I]: a cream-filled primary CTA with navy text (the PLAY pattern); ghost buttons with a 1px cream border at about 30% opacity; tabs as uppercase text with an active underline or cream fill.

### 4e. In-round HUD [V8]
- **Compass** at top centre showing bearing. Extraction points and Raider Hatches appear on it within about 400m. A **round-end countdown** sits below it.
- **Shield and health bars** at bottom-left, with squadmates' bars shown too.
- **Weapons panel** at bottom-right: current weapon, ammo, and the last quick-use item.
- **Reticle**: a crosshair. Shotguns show a spread circle.
- The HUD can be toggled (F10 on PC). It shows **no enemy health bars and no damage numbers** [V14].
- JetBrains Mono appears here as an accent [V1].
- [I] Build a thin segmented shield bar in blue over a cream/white health bar, and mono numerals for ammo and the timer.

### 4f. Radial wheels and tabbed overlays [V8]
- Three radial wheels: **Emoji Wheel**, **Quick Use Wheel**, **Ping Wheel**.
- In-round tabbed menu: **Inventory** (loot on the left), **Crafting**, **Map**, **Logbook** (Daily and Trials panels).
- Inventory concepts: *safe pocket*, *quick use slots*, *augment*, *shield*, *backpack*, "unload backpack" [V8][V23].

### 4g. Map [S][V8]
- Desaturated blue-grey satellite terrain with white labels in Barlow, mixed case.
- Zone polygons outlined in red or amber with small icon clusters.
- Legend card at bottom-right. Legend categories are *Cargo Elevator, Raider Hatch, Mechanical, Industrial, Electrical, Medical, Commercial, Technological, Security, ARC, Nature* [S].

### 4h. Traders, Workshop, skills
- **Traders** (portrait plus inventory) [V6][V33]:
  - **Celeste**, leader of the Raiders
  - **Shani**, head of security and ARC expert
  - **Lance**, android medic
  - **Apollo**, travelling mechanic
  - **Tian Wen**, gunsmith
- Trader portraits are photoreal renders with warm, dusty, slatted light and an olive, mustard and silver wardrobe (`05-trader-celeste.png`) [S].
- **Workshop** stations: Explosives Station, Gear Bench, Gunsmith, Medical Lab, Utility Station, Refiner [V19]. **Scrappy** the rooster is the companion [V19].
- **Skill tree**: three colour-coded branches with 15 nodes each [V17][V33]. Minor nodes go up to 5 points; major nodes are single unlocks [V17].
- Other screens named on Fonts In Use [V1]: Lobby, Gunsmith, Skill trees, Loadout, Trading, Projects, Codex.

### 4i. Iconography and illustration
- **Icons**: solid, filled, rounded-geometric pictograms in a single cream colour, sitting on dark circles or rounded squares [S]. Not line icons, not pixel art. The contrast with Marathon's "small, pixelated" icons is noted by players [V29].
- **Imagery**: photoreal in-engine renders such as the drone in `06-arc-wasp.png`. Painterly concept art is not used in UI chrome [S/I].
- **Motifs**:
  - The **four-colour diagonal stripe band** in blue, green, yellow and red, entering from a corner [V2].
  - The **rarity swoosh** [S].
  - Thin rules that extend from a heading [S].
- [I] Avoid scanlines, glitch effects, barcodes and heavy grunge. If you use texture at all, keep it to faint film grain or dust.

---

## 5. Motion, feedback and sound
- Hub menus are "animated menus" over a live 3D scene [V12]. [I] Use slow, soft eases (200–350ms, `cubic-bezier(.2,.7,.2,1)`) and gentle fades and slides, not snappy glitch cuts.
- Feedback is diegetic first: smoke, sparks, shattered armour and sound [V14]. [I] Keep UI motion understated, with small scale-ups on hover (1.02) and a soft border brighten.
- Sound: grounded field recordings with a philosophy of "make the incredible feel believable" [V24][V25]; a score of warm analogue synths and arpeggios [V26]. No source describes UI click sounds [I]. If you add audio, use soft, warm synth blips, not harsh digital beeps.
- Extraction-timer colour change (see 2d) [V8]: the kit should support a time-critical state colour (amber, then grey).

---

## 6. Contrast with Bungie's Marathon (2026)
| | ARC Raiders | Marathon |
|---|---|---|
| Named style | retro-futurism / NASA-punk / space western [V1][V12] | "graphic realism", appealing to Designers Republic fans [V31][V32] |
| Palette | warm cream `#ECE2D0` on cool navy-black `#090C19`, gold `#F1AA1C`, four soft-saturated stripe colours, classic rarity colours [V2][S] | high contrast, bold colours, acid-lime accents, brutalist shapes [V31] (acid lime is from the brief and the repo's existing Marathon skill) |
| Type | geometric/grotesk sans (Urbanist/Prompt), humanist body (Barlow), mono only as accent [V1] | KH Interference display, custom Shapiro Wide, IvyPresto serif, Fraktion Mono body [V31]. Players criticised it as "fontslop" [V30] |
| Shape | **rounded** corners on tiles and panels, flat, no shadows [S][V2] | sharp, brutalist, dense, decal-heavy [V31] |
| Density | calm and sparse, "intuitive", "no learning curve" (player quotes) [V29] | busy and abstract; Bungie promised to address "density of info" [V30] |
| Imagery | photoreal props, character portraits, 70s aerospace stripes | graphic decals, barcodes, glyph systems |

**When building the kit:** drop all lime, sharp-angled chrome, barcode decals and multi-font mixing. Use one geometric sans plus Barlow, cream on navy, rounded 6–12px radii, and colour that comes only from rarity and stripes.

---

## 7. Design tokens (approximate)
```css
:root {
  /* Surfaces: cool navy-blacks [S] */
  --ar-bg-0: #090C19;          /* page / stash / tile band */
  --ar-bg-1: #0A0E1A;          /* solid panel, panel header */
  --ar-bg-2: #0F1221;          /* tile body bottom */
  --ar-bg-3: #131624;          /* tile body top, raised */
  --ar-bg-4: #1B1F2E;          /* hover / selected row [I] */
  --ar-panel-glass: rgba(10, 14, 26, 0.85);  /* over 3D/map [I] */
  --ar-line: #434248;          /* hairline rule [S] */
  --ar-line-strong: #363C48;   /* neutral border [S] */

  /* Text: warm creams [V]/[S] */
  --ar-cream: #ECE2D0;         /* brand cream, primary text [V] */
  --ar-cream-hi: #FAEEE0;      /* headings, glyphs [S] */
  --ar-cream-dim: #B9B1A3;     /* secondary text [I] */
  --ar-cream-mute: #7D7A75;    /* tertiary/disabled [I] */
  --ar-ink: #130918;           /* dark text on cream/gold [V Brandfetch] */

  /* Brand accents */
  --ar-gold: #F1AA1C;          /* primary CTA [V] */
  --ar-red: #D00000;           /* brand red [V Brandfetch] */

  /* Stripe motif: approximations [I], order blue, green, yellow, red */
  --ar-stripe-blue: #1EA7E1;
  --ar-stripe-green: #3BB54A;
  --ar-stripe-yellow: #F7C21B;
  --ar-stripe-red: #E2412F;

  /* Rarity: sampled from in-game tiles [S] */
  --ar-common: #6C6C6C;
  --ar-uncommon: #24BA54;
  --ar-rare: #00A8F2;
  --ar-epic: #CC3096;
  --ar-legendary: #FCC600;

  /* Status */
  --ar-danger: #E5584A;        /* map red zone [S] */
  --ar-warning: #F8B810;       /* map amber zone [S] */
  --ar-success: #24BA54;       /* reuse uncommon green [I] */
  --ar-info: #00A8F2;          /* reuse rare blue; shield [I] */
  --ar-skill-conditioning: var(--ar-uncommon);   /* green [V hue] */
  --ar-skill-mobility: var(--ar-legendary);      /* yellow [V hue] */
  --ar-skill-survival: var(--ar-danger);         /* red [V hue] */

  /* Type [V faces] / [I] look-alikes */
  --ar-font-logo: "Urbanist", "Poppins", "Questrial", system-ui, sans-serif; /* stand-in for ITC Avant Garde Gothic Bold */
  --ar-font-heading: "Urbanist", "Prompt", system-ui, sans-serif;
  --ar-font-body: "Barlow", system-ui, sans-serif;
  --ar-font-mono: "JetBrains Mono", ui-monospace, monospace;
  --ar-track-caps: 0.1em;      /* site UI labels: 1.6px at 16px [V] */
  --ar-track-display: 0.03em;  /* site display: 2px at 64px [V] */

  /* Shape [S]/[V] */
  --ar-radius-xs: 4px;         /* site buttons and labels [V] */
  --ar-radius-sm: 6px;
  --ar-radius-md: 8px;         /* item tile at 96–128px [S] */
  --ar-radius-lg: 12px;        /* panels / legend [S] */
  --ar-border: 1px;
  --ar-rule: 2px;              /* site section rules [V] */
  --ar-shadow: none;           /* flat [V site] */

  /* Spacing (site) [V] */
  --ar-space-1: 4px; --ar-space-2: 8px; --ar-space-3: 12px; --ar-space-4: 16px;
  --ar-space-5: 24px; --ar-space-6: 32px; --ar-space-7: 40px; --ar-space-8: 80px;

  /* Motion [I] */
  --ar-ease: cubic-bezier(.2, .7, .2, 1);
  --ar-dur-fast: 150ms; --ar-dur: 250ms; --ar-dur-slow: 400ms;
}
```

**Item-tile recipe** [S geometry, I code]:
```css
.ar-tile { --r: var(--ar-rare); --s: 96px; width: var(--s); aspect-ratio: 1; position: relative;
  border-radius: calc(var(--s) * .08); overflow: hidden;
  border: 1.5px solid color-mix(in srgb, var(--r) 45%, var(--ar-bg-2));
  background:
    linear-gradient(90deg, color-mix(in srgb, var(--r) 30%, var(--ar-bg-2)) 0%, transparent 70%),
    linear-gradient(180deg, var(--ar-bg-3), var(--ar-bg-2)); }
.ar-tile::before { /* swoosh: corner area outside a big circle */
  content: ""; position: absolute; left: 0; bottom: 25%; width: 46%; height: 46%;
  background: radial-gradient(circle at 100% 0, transparent calc(var(--s) * .475),
              var(--r) calc(var(--s) * .475 + 1px)); } /* fitted: circle centre (46%,29%), r 47.5% of tile */
.ar-tile__band { position: absolute; inset: auto 0 0 0; height: 25%; background: var(--ar-bg-0);
  display: flex; align-items: center; justify-content: space-between; padding: 0 8%; }
.ar-tile__tier { font: 500 11px var(--ar-font-mono); color: color-mix(in srgb, var(--r) 40%, #555); }
```

---

## 8. Copy tone and microcopy (verified strings)
- **Places**: Speranza, Topside, the Rust Belt, Toledo [V5][V11]. Maps: *Dam Battlegrounds, The Spaceport, Buried City, The Blue Gate, Stella Montis, Riven Tides* [V33].
- **Map conditions** [V33]:
  - Major: *Hurricane, Night Raid, Electromagnetic Storm, Cold Snap, Locked Gate, Hidden Bunker*
  - Minor: *Matriarch, Harvester, Lush Blooms, Prospecting Probes, Husk Graveyard, Uncovered Caches, Launch Tower Loot, Bird City, Beachcombing*
- **Systems**: Raider, Raider Decks, Feats, Quests, Trials, Codex, Projects, Expedition, Free Loadout, Workshop, Stash, Skill Tree, Battle Pass, Main Hub [V5][V19][V20].
- **ARC enemies** [V33]: Tick, Snitch, Pop, Wasp, Hornet, Leaper, Fireball, Rocketeer, Bombardier, Bastion, Sentinel, Shredder, Spotter, Surveyor, Turret, Matriarch, The Queen.
- **Item types** [V33][V10]: Quick Use, Topside Material, Refined Material, Recyclable, Nature, Trinket, Mods, Key, Blueprint, Augment, Shield. Weapon classes: Assault Rifle, Battle Rifle, Pistol, Hand Cannon, Sniper Rifle, LMG, Special. Weapon tiers use Roman numerals, as in *Ferro I–IV* [V33].
- **Item card fields** [V33]: Value (coins), Weight (kg), Stack Size, Rarity, Recycle / Salvage, Blueprint locked, Craft bench + level.
- **Buttons and labels**: *Play*, *Fill Squad*, *Crossplay*, *Social*, *Friends*, *Recent*, *Add Friend*, *Invite to Party*, *Send Friend Request*, *Embark ID* [V21][V22]; site: *Buy now*, *Learn more*, *Watch trailer* [V4].
- **Voice**: warm, wry and encouraging, with a frontier camaraderie.
  - Site copy: "See you topside soon Raider!", "Beware of the machines. Beware of Raiders preying on others.", "Looking dapper certainly helps, but looks alone will not be able to carry you through the dangers topside." [V5]
  - Quest copy is first-person trader voice. Celeste: "Even the slightest change to ARC's behavior could spell disaster." Tian Wen: "I have another job. It's.. about my mom." [V33]
- **Quest names** [V33]: *A Bad Feeling*, *Tribute to Toledo*, *The Major's Footlocker*, *Trash Into Treasure*, *Waking the Grid*.

---

## 9. Reference images (saved in `images/`)
The original repo files are © Embark Studios. They are community captures, for internal visual reference only and **not for shipping**. All come from `https://raw.githubusercontent.com/RaidTheory/arcraiders-data/main/…`:

| File | Source path | Shows |
|---|---|---|
| `01-item-tiles-by-rarity.png` | my contact sheet of `images/items_ingame/{bandage,ferro_i,rattler_i,arc_powercell,anvil_i,light_shield,arc_alloy,medium_shield,defibrillator,bettina_i,heavy_shield,photoelectric_cloak,hullcracker_i,jupiter,equalizer,acoustic_guitar,queen_reactor}.png` | in-game item tiles, Common to Legendary |
| `02-item-tile-legendary-jupiter-3x.png` | `images/items_ingame/jupiter.png` (WebP data), upscaled 3× | Legendary tile anatomy |
| `02b-item-tile-rare-medium-shield-3x.png` | `images/items_ingame/medium_shield.png`, upscaled 3× | Rare tile anatomy: swoosh, band, glyph, tier |
| `03-map-dam-battlegrounds.jpg` | `images/maps/legacy/dam_battlegrounds.png`, resized to 900px | map style, zone outlines, labels |
| `04-map-legend-panel.png` | crop of the same map | panel, heading, rule, icon chips, Barlow labels |
| `05-trader-celeste.png` | `images/traders/celeste.png` | trader portrait style |
| `06-arc-wasp.png` | `images/bots/arc_wasp.png` | ARC drone, photoreal imagery |

I could not get official screenshots or key art. The proxy blocked curl to arcraiders.com, fontsinuse assets, Steam, Wikimedia, imgur and Google Drive (where the press kit lives). Fonts In Use lists screenshot URLs worth opening in a browser: lobby, Gunsmith, skill trees, HUD, loadout, trading, Projects, Codex [V1].

---

## 10. Gaps and open questions
- No official style guide or UI-designer interview turned up. Game UI Database and GameRant were blocked by robots.txt, and 80.lv has no ARC Raiders UI article that I could find.
- Exact stripe hex values and order: approximate.
- Lobby tab styling, the active-tab treatment, HUD bar colours, tooltip layout and modal and notification styling are not described in text anywhere I could reach. Those parts of sections 4a, 4d and 4e marked [I] come from inference.
- The colour of the "Amplified" tier is unknown.

## Sources (actually read)
1. Fonts In Use, ARC Raiders: https://fontsinuse.com/uses/75579/arc-raiders-video-game
2. fudge.design extraction of arcraiders.com: https://fudge.design/share/arcraiders.com-design
3. Brandfetch, arcraiders.com: https://brandfetch.com/arcraiders.com
4. Official site and news: https://www.arcraiders.com/ · https://www.arcraiders.com/news/evolution-of-arc-raiders-documentary
5. Official "Everything you need to know": https://arcraiders.com/news/everything-you-need-to-know
6. Official "Meet the traders": https://arcraiders.com/en/news/meet-the-traders-blog/
7. Pixelframe logo generator (fan): https://pixelframe.design/arc-raiders/
8. ARC Raiders Wiki, Game UI: https://arcraiders.wiki/wiki/Game_UI
9. ARC Raiders Wiki, Stash: https://arcraiders.wiki/wiki/Stash
10. ARC Raiders Wiki, Items: https://arcraiders.wiki/wiki/Items
11. Wikipedia: https://en.wikipedia.org/wiki/ARC_Raiders
12. GameSpot review: https://www.gamespot.com/reviews/arc-raiders-review-us-against-the-world/1900-6418435/
13. VidaExtra (aesthetics op-ed): https://www.vidaextra.com/accion/nos-encanta-arrastrarnos-basura-eso-estamos-enamorados-este-shooter-extraccion-que-se-lanza-unos-dias
14. GamingBolt, no HP bars (Strandberg): https://gamingbolt.com/arc-raiders-lacks-enemy-hp-bars-since-embark-doesnt-want-you-playing-the-excel-sheet-of-a-game
15. Turtle Beach, rarities: https://www.turtlebeach.com/blog/all-loot-rarities-in-arc-raiders-common-rare-and-more
16. coe.gg, weapon rarity: https://coe.gg/weapon-rarity/
17. AllThings.How, skill trees: https://allthings.how/arc-raiders-skill-trees-complete-list-of-upgrades-and-unlock-paths/
18. TechWiser, icons: https://techwiser.com/arc-raiders-icons-symbols-meaning/
19. Embark support, progression: https://id.embark.games/arc-raiders/support/faq/139-game-progression-1759329960
20. Embark support, Welcome to the Rust Belt: https://id.embark.games/arc-raiders/support/faq/134-welcome-to-the-rust-belt/
21. Embark support, friends and parties: https://id.embark.games/arc-raiders/support/faq/158-friends-parties
22. Icy Veins, play with friends: https://wp-prod.icy-veins.com/how-to-play-with-friends-in-arc-raiders/
23. Fandom, Speranza: https://arc-raiders.fandom.com/wiki/Speranza
24. Unreal Engine developer interview: https://www.unrealengine.com/developer-interviews/embark-studios-build-the-award-winning-arc-raiders-with-unreal-engine?lang=de
25. Gaming Nexus, sound design: https://www.gamingnexus.com/News/70875/Embark-details-how-sound-design-is-a-cornerstone-of-ARC-Raiders
26. MainTitles, soundtrack review: https://maintitles.net/reviews/arc-raiders-and-expansion/
27. Noisy Pixel preview: https://noisypixel.net/arc-raiders-hands-on-preview/
28. PlayPile review: https://playpile.gg/blog/arc-raiders-wields-gamings-new-standard
29. Mein-MMO, Marathon UI vs ARC: https://mein-mmo.de/marathon-user-interface-diskussion/
30. Kotaku, Marathon "fontslop": https://kotaku.com/marathon-ui-fontslop-menus-bungie-2000675332
31. Fonts In Use, Marathon (2026): https://fontsinuse.com/uses/67879/marathon-2026-video-game-1
32. 80.lv, Marathon art director: https://80.lv/articles/marathon-art-director-shares-the-team-s-creative-influences
33. RaidTheory/arcraiders-data (community data and in-game captures, MIT; game content © Embark): https://github.com/RaidTheory/arcraiders-data. Read via raw files: items/*.json, trades.json, skillNodes.json, bots.json, maps.json, map-events/map-events.json, quests/*.json, images/*.
- Also read but not relied on for tokens:
  - Roblox DevForum fan lobby ("V-devforum"): https://devforum.roblox.com/t/feedback-on-my-3d-lobby-ui-heavily-inspired-by-arc-raiders/4758764
  - Sahil Modi fan UI concept: https://artofsahil.com/arc-raiders-ui
  - Embark press page (media kit on Google Drive, unreachable): https://www.embark-studios.com/press

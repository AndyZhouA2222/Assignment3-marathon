---
name: marathon-decal-kit
description: Generate Marathon-style (Bungie 2026) decals, symbols, labels and text variants as seeded SVG — glyph discs, pixel arrows, barcodes, spec tables, repeat bands, code boxes, wordmark lockups, 21 type treatments — via CLI, TypeScript import or React components.
---

# Marathon Decal Kit（马拉松风格贴花 / 符号 / 文字变体生成库）

用代码批量生成 Marathon 风格的贴花素材：符号、图标、条码、编号块、规格表、警示标签、重复带、字标组合、像素/数码管文字，以及 21 种文字变体。输出纯 SVG 字符串（可转 PNG），同一个 `seed` 永远得到同一张图。

参考来源：用户提供的 10 张参考图（`references/images/`，含 Patrick Bloom 的 Marathon 贴花表 ArtStation 作品）。元素拆解见 `references/decal-language.md`，取色见 `references/palette.md`，生成样例见 `references/samples/`。

## 1. 什么时候用
- 需要给 UI、海报、3D 道具、贴图、网页背景铺 Marathon 风格的"功能性装饰"。
- 需要一整张贴花表（sheet）、某一类符号的批量变体（kind）、或一个词的多种字体处理（variants）。
- 网页 UI 本身用 `marathon-ui-style` skill；本库负责装饰物和贴花，两者可以一起用。

## 2. 快速开始
文件都在本 skill 目录内：
- `assets/decals.ts`：生成器本体，零依赖，Node 22+ 可直接运行 `.ts`，也可被任何打包器引入。
- `assets/Decal.tsx`：React 包装（`<Decal>`、`<DecalText>`、`<DecalSheet>`）。
- `scripts/decal-sheet.ts`：命令行。

```bash
# 整张贴花表（SVG，加 --png 再导出 PNG，需要 playwright-core 或 playwright）
node scripts/decal-sheet.ts --mode sheet --palette mono --seed 7 --out out/sheet.svg --png
# 某一类的 12 个变体
node scripts/decal-sheet.ts --mode kind --kind glyphDisc --count 12 --seed 3 --out out/glyphs.svg
# 一个词的全部文字变体
node scripts/decal-sheet.ts --mode variants --text "SEAL 014" --palette ink --out out/variants.svg
# 所有种类和图标的索引页
node scripts/decal-sheet.ts --mode catalog --palette mono --out out/catalog.svg
```
参数：`--mode sheet|kind|variants|catalog`、`--kind`、`--palette`、`--seed`、`--count`、`--text`、`--w`、`--out`、`--png`、`--chromium <路径>`（或环境变量 `CHROMIUM_PATH`）、`--no-fonts`（不嵌入 Google Fonts）、`--help`。

```ts
import { make, toSvg, textVariant, sheet } from "./assets/decals.ts";
const svg = toSvg(make("glyphDisc", { seed: 4, palette: "mono" }), { background: true, palette: "mono" });
const word = toSvg(textVariant({ text: "ATTACH", variant: "stencil", size: 64 }));
```

```tsx
import { Decal, DecalText, DecalSheet } from "./assets/Decal.tsx";
<Decal kind="barcode" seed={12} palette="signal" digits />
<DecalText text="SEAL 014" variant="codeSplit" size={40} />
<DecalSheet seed="s3" palette="lab" />
```
React 组件通过 `dangerouslySetInnerHTML` 注入生成的 SVG；所有文本在 `decals.ts` 里已经做了 XML 转义。

## 3. 调色板（`PALETTES`）
| 名称 | 底 / 前景 | 用途 | 来源 |
|---|---|---|---|
| `mono` | 黑 / 白 | 默认，符号表、字标 | 参考图 01–04 |
| `ink` | 白 / 黑 | 亮底印刷、文档 | 反相 |
| `lab` | 浅灰 #C4C4C4 / 深灰 | 道具贴花表，红橙+青绿+橄榄强调 | 参考图 06、09 |
| `signal` | 黑 / 酸性绿 #C0FE0F | 品牌强调、HUD | 官网主色 |
| `medic` | 白 / 炭黑 | 医疗道具，黄+紫+钴蓝 | 参考图 07、08 |
| `atlas` | 深海军蓝 #003A54 / 白 | 道具图集，八种荧光色 | 参考图 05 |
| `hazard` | 黑 / 白 | 封条带、警示，橙红+黄绿+洋红 | 参考图 10 |

也可以传自定义 `{ bg, fg, muted, accents[] }`。

## 4. 种类（`KINDS`，`make(kind, opts)`）
所有生成器都接受 `seed` 和 `palette`；未指定的参数由 seed 随机决定。

| kind | 是什么 | 常用参数 |
|---|---|---|
| `glyphDisc` | 圆/方底上的粗块字形（参考 01 的大圆标） | `shape: circle\|square\|round`、`tile`、`size` |
| `pixelArrow` | 像素阶梯箭头 | `dir: up\|down\|left\|right\|upRight`、`cell`、`length` |
| `chevrons` | 连续箭头 ▶▶▶ | `count`、`style: solid\|line\|half` |
| `barcode` | 条码（可带数字） | `bars`、`height`、`digits` |
| `stripes` | 斜纹警示带 | `w`、`h`、`band`、`angle`、`ground` |
| `checker` / `globe` | 棋盘格 / 球面棋盘 | `cols`、`rows`、`cell` |
| `dither` | 像素抖动渐隐块 | `fade: right\|left\|none` |
| `reticle` | 准星、套准标、靶心 | `variant: plus\|crossCircle\|target\|tickRing\|register\|pip` |
| `dotMatrix` | 点阵/加号阵/叉阵 | `mark: dot\|square\|plus\|x` |
| `blockMark` | 对称像素块徽记 | `grid`、`round` |
| `bracketFrame` | 四角取景框，可嵌套其他贴花 | `inner`、`arm` |
| `ruler` | 刻度尺，带 R−/R+ 标注 | `ticks`、`labels` |
| `icon` | 24 个基础图形（见 `ICONS`） | `name`、`ground` |
| `codeBox` | 色块编号盒（大号码 / 分栏 / 叠字） | `variant: big\|split\|stack` |
| `tape` | 手撕胶带 / 刷痕色块 | `w`、`h` |
| `serialBlock` | 多行序列号 | `lines`、`style`（`codes` 里的格式） |
| `specTable` | 材料规格表（Property / Unit / 值 / 公差） | `rows` |
| `warningLabel` | NOTICE / WARNING 文字块 | `kind`、`icon` |
| `repeatBand` | SEAL-SEAL-SEAL 重复带 | `word`、`sep`、`pill`、`mark` |
| `pillTag` | 胶囊编号标签 ⊖→ 008.A | `code`、`dot`、`arrow`、`end` |
| `stackBadge` | 方块里两行叠字 | `lines` |
| `lockup` | 大字标 + Rc. 日期 + 竖排编号 + 数据栏（参考 04） | `text`、`stamp` |
| `pixelText` | 5×7 像素字 | `text`、`cell` |
| `segmentText` | 七段数码管字 | `text`、`height`、`slant` |

`ICONS`：drop, bowtie, dShape, square, circle, ring, pill, roundRect, plusSquare, xSquare, triangleUp, triangleDown, arrowUp, arrowDown, peanut, splitDiamond, brackets, bolt, hazard, asterisk, steps, tab, keyhole, hexNut。

## 5. 文字变体（`TEXT_VARIANTS`）
`plain` `wide` `mono` `display` `outline` `inverted` `bracket` `overbar` `underbar` `stacked` `vertical` `mirrored` `spaced` `slashedZero` `strike` `stencil` `distressed` `pixel` `segment` `boxed` `codeSplit`

`textVariant({ text, variant, size, color, seed, palette })` 出单个，`variantSheet({ text, size, variants, cols })` 出对比表。效果见 `references/samples/variants-ink.png`。

## 6. 字体
生成的 SVG 用 CSS 字体栈，原版字体装在本机时优先生效，否则落到免费替代：
- display：KH Interference → Chakra Petch
- wide：Shapiro Wide → Archivo（font-stretch 125%）
- mono：Fraktion Mono → JetBrains Mono
- grotesk：Neue Haas Grotesk Display → Inter；serif：IvyPresto Headline → Instrument Serif

`toSvg(d, { embedFonts: true })` 会在 SVG 里 `@import` Google Fonts，保证脱离网页也能渲染；导出 PNG 时 CLI 默认开启。宽度用 `textLength` 锁定，换字体也不会撑破版式。

## 7. 构图规则（从参考图总结）
1. **一张表只用一套调色板**：中性底 + 前景色占 80%，强调色只点在 10–20% 的元素上。
2. **大小对比要狠**：一两个大字标或大圆标，配几十个小号码、小图标、细线条。
3. **数据当装饰**：每组图形旁边配编号、批次、日期、`//`、`R−/R+`，内容可以无意义，但格式要像真的。
4. **重复制造节奏**：重复带、连续箭头、点阵、刻度尺横向铺满，打断大块。
5. **硬边优先**：直角、切角、像素阶梯。圆形只用于圆标和胶囊。
6. **做旧要克制**：`distressed`、`tape` 一张表用一两次就够。
7. **底部品牌条**：`sheet()` 默认在底部放酸性绿条（虚构公司名 + 条码 + 编号），可用 `footer: false` 关掉。

## 8. 扩展
新增一种贴花：在 `decals.ts` 写 `function myKind(o: Base & {...}): Decal`，返回 `{ kind, w, h, body }`（`body` 是不带外层 `<svg>` 的 SVG 片段，坐标从 0,0 起），然后：
1. 加进 `KINDS`；
2. 在 `SHEET_FIT` 写它在表里的相对高度，在 `SHEET_WEIGHT` 写出现频率；
3. 随机数只用传进来的 `rng(seed)`，保证可复现；文字一律经过 `esc()`。

## 9. 版权与命名
- 生成器里的公司名（`corpName`）、型号、编号全部是随机拼出来的虚构内容。**不要**复刻 Bungie、Marathon、UESC、NuCaloric 等真实标志或商标。
- `references/images/` 里的图只用于研究风格，不要直接拿去当素材发布；其中 06–08 是 Patrick Bloom 在 ArtStation 发布的作品（文件名 `pb-brrt-smg-00N`、`pb-medic-0N` 是他的作品编号，不是贴花上的文字），引用时注明作者。
- 2025 年 Bungie 承认 Marathon 测试版里有一批贴花抄袭了独立艺术家的作品并撤换。生成时只用通用的几何、编号和排版手法，不要临摹任何具体艺术家的图形；该艺术家常用的 "Aleph" 一词也不要用。

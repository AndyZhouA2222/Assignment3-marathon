---
name: marathon-ui-style
description: Build any UI (web page, app screen, dashboard, game lobby, vault, HUD, React components) in the visual style of Bungie's Marathon (2026): graphic realism, acid lime on black/bone, wide techno type, mono data labels, pixel glyphs. Separate from the ARC Raiders style.
---

# Marathon UI Style（马拉松风格 UI 规范）

参考来源：marathonthegame.com 首页结构、Fonts In Use 对 Marathon (2026) 字体和游戏内界面的记录、美术总监访谈（"graphic realism"，受 The Designers Republic、Wipeout、Ghost in the Shell、MGS2 影响）、上线后到第二赛季的界面改版报道、社区整理的品牌色。官方 CSS 未能直接读取，色值为近似值，用于风格复刻而非品牌官方规范。完整调研（含出处和可信度标注）见 `references/research.md`。

贴花、符号、文字变体用配套的 `marathon-decal-kit` skill 生成（参考图也在那里）。网页 / 官网风格见第 1–11 节，游戏内界面（大厅、仓库、HUD、传送、Codex、结算）见第 12 节。ARC Raiders 风格是另一个独立 skill（`arc-raiders-ui-style`），两者不要混用。

## 1. 风格内核
- **Graphic realism**：极简、解构的平面语言 + 可信的工业功能感。像一份军工/企业的技术文档被做成了时装海报。
- **高对比、少材质**：大面积纯黑或骨白底，一种荧光强调色做"刺"，其余全部中性。
- **粗野主义几何**：硬直角、切角、厚分割线、满版大字，不用圆角、不用柔和阴影、不用渐变玻璃拟态。
- **数据即装饰**：编号、坐标、条码、`//` 分隔符、时间戳、版本号、型号代码当作图形元素铺排。
- **企业反乌托邦语气**：文案短、全大写、命令式或宣传口号式。

## 2. Design Tokens（直接复制）
```css
:root {
  /* 底色 */
  --mt-black: #0A0A0A;      /* 主背景，暗场 */
  --mt-ink: #141414;        /* 卡片/次级面 */
  --mt-bone: #E8E6DF;       /* 亮场背景，骨白纸感 */
  --mt-white: #F7F7F2;
  --mt-gray-700: #2B2B2B;   /* 分割线(暗场) */
  --mt-gray-400: #8A8A85;   /* 次要文字/元数据 */
  /* 强调色：一屏只用一种为主 */
  --mt-acid: #C2FE0B;       /* 招牌荧光酸性绿，CTA/高亮 */
  --mt-magenta: #EA027E;    /* 警示/稀有/赛季 */
  --mt-ultra: #3601FB;      /* 电光蓝，加载/地图/全屏色块 */
  --mt-orange: #FF5500;     /* 危险/倒计时/撤离 */
  --mt-acid-hi: #E5FF45; --mt-cyan: #01FFFF; --mt-red: #FF0D1A; /* 红：敌对、阵亡 */ --mt-steel: #29324F;
  /* 稀有度（名称来自游戏，色值近似） */
  --mt-r-standard: #9A9A9A; --mt-r-enhanced: #4FD34A; --mt-r-deluxe: #2F8BFF; --mt-r-superior: #A646FF; --mt-r-prestige: #F2B705;
  /* Codex 绿色 CRT 卡 */
  --mt-crt-bg: #0C1A0E; --mt-crt-fg: #9CFF7A; --mt-font-crt: "VT323", "Silkscreen", monospace;

  /* 字体：先找本机原版（见第 3 节 @font-face 别名），没有再用免费替代 */
  --mt-font-display: "MT Display", "Chakra Petch", "Michroma", sans-serif;
  --mt-font-wide: "MT Wide", "Archivo", sans-serif;   /* Archivo 用 font-stretch:125% */
  --mt-font-serif: "MT Serif", "Instrument Serif", serif; /* 极少量点缀 */
  --mt-font-mono: "MT Mono", "JetBrains Mono", "IBM Plex Mono", monospace;

  /* 字号（桌面），移动端约 ×0.6 */
  --mt-fs-mega: clamp(56px, 10vw, 160px); /* 满版标题 */
  --mt-fs-h1: clamp(40px, 6vw, 88px);
  --mt-fs-h2: clamp(28px, 3.5vw, 48px);
  --mt-fs-h3: 20px;
  --mt-fs-body: 15px;
  --mt-fs-meta: 11px;  /* eyebrow、标签、元数据 */

  /* 间距：4px 基准，区块间距很大 */
  --mt-s1: 4px; --mt-s2: 8px; --mt-s3: 12px; --mt-s4: 16px;
  --mt-s6: 24px; --mt-s8: 32px; --mt-s12: 48px; --mt-s20: 80px; --mt-s32: 128px;

  --mt-line: 1px;       /* 细线 */
  --mt-rule: 4px;       /* 粗分隔条 */
  --mt-radius: 0;       /* 永远直角 */
  --mt-cut: 12px;       /* 切角尺寸 */
  --mt-ease: cubic-bezier(.2,.8,0,1);
}
```
Google Fonts 引入：`Chakra Petch:wght@500;700`、`Archivo:wdth,wght@125,400..800`、`JetBrains Mono:wght@400;500`、`Instrument Serif`，做 Codex 卡时再加 `VT323`。

## 3. 字体规则
### 本机原版字体自动优先（必须照做）
每个页面都要带上下面这段 `@font-face` 别名。浏览器会按 `local()` 顺序在用户电脑里找原版字体：找到就直接用原版；一个都找不到时这条 `@font-face` 失效，字体栈自动落到下一个免费替代。替代字体只有真正用到时才会下载，所以装了原版的机器不会多下载。`local()` 里同时写了全名和 PostScript 名，因为不同系统、不同授权包里的字体名写法不一样。
```css
/* Display：KH Interference */
@font-face{font-family:"MT Display";font-weight:300;src:local("KH Interference Light"),local("KHInterference-Light");}
@font-face{font-family:"MT Display";font-weight:400 900;src:local("KH Interference"),local("KH Interference Regular"),local("KHInterference-Regular"),local("KHInterference");}
/* Wide：Shapiro Wide（65 / Wide 系列） */
@font-face{font-family:"MT Wide";font-weight:400 900;src:local("Shapiro 65 Light Wide"),local("Shapiro Wide"),local("Shapiro-65LightWide"),local("Shapiro65LightWide"),local("ShapiroWide");}
/* Serif：IvyPresto Headline */
@font-face{font-family:"MT Serif";src:local("IvyPresto Headline"),local("IvyPresto Headline Regular"),local("IvyPrestoHeadline-Regular"),local("IvyPrestoHeadline");}
/* Mono：Fraktion Mono */
@font-face{font-family:"MT Mono";font-weight:400;src:local("Fraktion Mono"),local("Fraktion Mono Regular"),local("FraktionMono-Regular"),local("PPFraktionMono-Regular"),local("PP Fraktion Mono");}
@font-face{font-family:"MT Mono";font-weight:500 900;src:local("Fraktion Mono Medium"),local("FraktionMono-Medium"),local("PPFraktionMono-Medium"),local("PP Fraktion Mono Medium");}
```
- 原版生效时，Archivo 专用的 `font-stretch:125%` 对 Shapiro Wide 没有副作用，可以保留。
- 知道用户机器上字体的确切名称时（例如在 Font Book 或 `fc-list` 里看到的名字），把它补进对应的 `local()` 列表最前面。
- 非网页场景（Figma、海报、原生 App、Python 出图）：先查本机是否装了原版，macOS 用 `system_profiler SPFontsDataType | grep -iE "interference|shapiro|fraktion|ivypresto"`，Linux 用 `fc-list | grep -iE "..."`，Windows 看 `C:\Windows\Fonts` 或 `%LOCALAPPDATA%\Microsoft\Windows\Fonts`。有就用原版，没有才用第 2 节列出的免费替代，并在交付时说明用了哪一种。

### 排版规则
- 标题：display 字体，**全大写**，字重 700，`letter-spacing: -0.01em`，`line-height: 0.9`，敢于让字撑满容器甚至出血裁切。
- 次级标题/导航：wide 字体，全大写，`letter-spacing: 0.04em`。
- Eyebrow（标题上方小字）：mono，11px，全大写，`letter-spacing: 0.12em`，灰色或强调色，常带前缀如 `//`、`01 —`、`[ ]`。
- 正文：mono 或 wide 的常规字重，15px，`line-height: 1.55`，最大宽度 56ch。正文可用大小写混排。
- 数字一律等宽（`font-variant-numeric: tabular-nums`），日期写成 `10.19.2026`。
- serif 只用于一两个词的戏剧化反差（如引言），每页最多一次。IvyPresto 在游戏里只出现在局内界面（玩家说的"EVA 字体"感）。
- 原版字体特征：KH Interference 只有大写、**等宽**、画在 45° 网格上，外角圆、内角方，灵感来自小票和低分辨率像素屏；Shapiro Wide 定制了带衬线的 I 和 1、弯腿 R；Fraktion Mono 有方形圆角和斜杠零。替代字体选形似的即可，但数字务必等宽。
- 字体混排是这套风格的"灵魂"（官方 UI 设计师原话："不会去掉 SAUCE"），但每个面板必须只有一个最突出的元素，这是上线后玩家批评最多、第二赛季改得最多的地方。

## 4. 版式
- 12 栏网格，外边距 桌面 48px / 移动 16px，栏间距 16px。网格可以用 1px 线显式画出来。
- 区块节奏：`eyebrow → 巨型标题 → 短段落 → 一个 CTA/链接`，左右交替排布图片与文字（官网各功能区都是这个模板）。
- 区块之间 80–128px 留白，或用整宽 4px 强调色/黑色分隔条硬切。
- 暗场（黑底）与亮场（骨白底）交替，偶尔插入一整屏纯电光蓝或酸绿色块作为"冲击页"。
- 角标系统：每个区块四角或一角放 mono 小字元数据，例如 `TAU CETI IV // SURFACE DATA`、`SEC.03`、`v2.4.1`、坐标 `N 12°04' E 88°31'`。
- 结尾"宣言带"：整宽强调色底，全大写短句连排（可做横向跑马灯）。

## 5. 组件
**主按钮（Buy now 类）**
```css
.mt-btn{font:700 14px/1 var(--mt-font-wide);font-stretch:125%;text-transform:uppercase;letter-spacing:.08em;white-space:nowrap;
  background:var(--mt-acid);color:var(--mt-black);padding:16px 28px;border:0;border-radius:0;
  clip-path:polygon(0 0,calc(100% - var(--mt-cut)) 0,100% var(--mt-cut),100% 100%,0 100%);
  transition:background .15s var(--mt-ease),color .15s;}
.mt-btn:hover{background:var(--mt-black);color:var(--mt-acid);box-shadow:inset 0 0 0 2px var(--mt-acid);}
```
**次按钮/文字链接**：透明底 + 1px 边框，或纯文字后接 `→` / `↗`，hover 时下划线从左扫入。

**导航栏**：高 56–64px，黑底或透明叠在视频上；左 logo，中间全大写 wide 链接（NEWS / STORE / REWARDS），右侧语言选择 + 社媒图标 + 酸绿主按钮。底部 1px 灰线。

**新闻条目**：一行一条，`来源 · 日期`（mono，灰）+ 标题（wide 大写）+ 右侧 `→`；条目间 1px 分割线，hover 整行反色。

**媒体缩略图轮播**：方形 128px 缩略图，左上角编号 `01`–`05`，下方大写标签（`SEASON 2`、`NEW ZONE: NIGHT MARSH`），选中项加 2px 酸绿框。

**数据卡片**：直角，`--mt-ink` 底，1px `--mt-gray-700` 边框，一个角切掉；顶部 mono 标签条 + 条码装饰，主数值用 display 大字。

**标签/徽章**：mono 10–11px 大写，实心色块（酸绿底黑字 / 品红底白字），无圆角，内边距 2px 6px。

**HUD 进度条**：分段格子（10–20 个小方块）而不是连续条，填充用强调色。

## 6. 装饰元素（选 2–3 种，不要全上）
- 条码 / 二维码式块状图形（可用 `repeating-linear-gradient` 生成竖条）。
- 抖动（dithering）/ 半调网点 处理的图片或过渡带。
- 十字准星 `+` 标记网格交点、角落裁切线。
- 大号描边数字或巨型 logo 字局部出血。
- 斜线警示条纹 `repeating-linear-gradient(-45deg, var(--mt-acid) 0 8px, var(--mt-black) 8px 16px)`。
- 扫描线、像素噪点叠加（低透明度，≤8%）。
- 符号：`//`、`→`、`↗`、`■`、`▲`、`[ ]`、`×`。

## 7. 动效
- 快、硬、机械：150–250ms，`--mt-ease`；不做弹性回弹。
- 文字进场用逐字乱码解码（scramble）或从遮罩下切入；色块用 `clip-path` 擦除。
- hover 反色，偶尔 1–2 帧 glitch 位移（≤4px）。
- 尊重 `prefers-reduced-motion`，关闭乱码与 glitch。

## 8. 文案语气
- 全大写短句，3–5 词。示例：`POWERFUL. CONFIGURABLE. EXPENDABLE.`、`INFLUENCE IS POWER`、`DEATH HANGS ABOVE`。
- Eyebrow 写类别或世界观设定，标题写结论；正文冷静、像简报。
- 中文界面：标题用粗黑无衬线（思源黑体 Heavy / 阿里巴巴普惠体 Black），英文 eyebrow 与编号保留，形成中英混排的技术感。

## 9. 自检清单
- [ ] 页面带了第 3 节的 `@font-face` 本机原版别名，字体栈以 `MT Display / MT Wide / MT Serif / MT Mono` 开头。
- [ ] 是否只有一种主强调色占主导？强调色面积 ≤ 15%（冲击页除外）。
- [ ] 所有圆角为 0，没有柔和投影或毛玻璃。
- [ ] 每个区块都有 mono 元数据/编号点缀。
- [ ] 标题全大写且足够大，行高紧。
- [ ] 酸绿底上的文字一律用黑色；黑底上酸绿文字 ≥ 14px（对比度足够），品红/电光蓝上用白字。
- [ ] 移动端 16px 边距，标题不横向溢出（允许装饰性出血，但需 `overflow:hidden`）。

## 10. 不要做
- 不要复制 Marathon / Bungie 的 logo、角色、截图或字样作为成品素材；本规范只借鉴视觉语言。
- 不要同时堆满四种强调色。
- 不要用 Orbitron 这类过于"游戏感"的科幻字体，也不要用圆润的系统 UI 字体做标题。
- 不要用渐变、拟物或卡通插画。

## 11. React 组件库
用户要 React 界面时，直接用这套组件，不要重新手写样式。做法：
1. 把本 skill 的 `assets/react/marathon.css` 原样复制进项目（如 `src/marathon/marathon.css`），在入口文件 `import` 一次。它已经包含第 3 节的本机原版字体别名和全部 token。
2. 在 HTML `<head>` 加免费替代字体（本机有原版时不会下载）：
   `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@125,400..800&family=Chakra+Petch:wght@500;700&family=JetBrains+Mono:wght@400;500&family=Instrument+Serif&display=swap">`
3. 把 `assets/react/Marathon.tsx` 原样复制进项目，从里面导入组件。依赖只有 React 18+，TypeScript strict 下可编译；纯 JS 项目去掉类型标注即可。完整示例页是 `assets/react/Demo.tsx`，效果图在 `references/screenshots/`。
4. 整个页面包在 `<MtRoot>` 里。需要新组件时沿用 `mt-` 前缀、token 变量和第 5 节规则，在 CSS 里补类名。

| 组件 | 用途 | 关键 props |
|---|---|---|
| `MtRoot` | 页面根，设置底色、字体、等宽数字 | |
| `MtNav` | 顶部导航 | `logo` `links` `current` `actions` |
| `MtSection` | 区块，自带 eyebrow、标题和四角元数据 | `tone`: dark / bone / acid / ultra，`eyebrow` `title` `titleSize` `meta={{tl,tr,bl,br}}` |
| `MtSplit` | 左右两栏，移动端堆叠 | `reverse` |
| `MtEyebrow` / `MtTitle` | 小标题 / 全大写巨型标题 | `accent`；`size`: mega / h1 / h2，`scramble` 乱码解码进场 |
| `MtButton` | 按钮或链接 | `variant`: primary / ghost / link，`href` 有值时渲染成 `<a>`，`arrow` |
| `MtTag` | 实心小标签 | `tone`: acid / magenta / ultra / orange，`outline` |
| `MtNewsList` | 新闻列表，hover 整行酸绿反色 | `items: {source,date,title,href}[]` |
| `MtThumbRail` | 编号缩略图轮播 | `items: {label,image?}[]` `selected` `onSelect` |
| `MtDataCard` | 切角数据卡 | `label` `value` `unit` `tag`（默认显示条码） |
| `MtProgress` | 分段进度条 | `value` 取 0–1，`segments` |
| `MtBarcode` | 装饰条码，按 seed 稳定生成 | `seed` `bars` |
| `MtMarquee` | 结尾宣言跑马灯 | `items` `speed` |
| `MtStripes` / `MtRule` / `MtCrosshair` | 斜纹警示条 / 4px 酸绿分隔线 / 十字准星 | |
| `useScramble` / `useReducedMotion` | 文字乱码解码 / 减弱动效检测 | |
| **局内组件（第 12 节）** | | |
| `MtTabBar` | 大厅顶部 Tab，选中项酸绿底黑字，带 01/02 编号 | `tabs` `value` `onChange` `end` |
| `MtItemTile` / `MtItemGrid` | 仓库方格：角落编号和数量、底部稀有度条 + 右上角色块、弹药 / 适配标记 | `item: MtItem` `selected` `onSelect`；`items` `cells` |
| `MtRarityChip` | 稀有度小标签 | `rarity`: standard / enhanced / deluxe / superior / prestige |
| `MtSpecTable` | 等宽参数表，重点行酸绿底 | `rows: {k,v,highlight?}[]` `title` |
| `MtHoldButton` | 长按确认（出售、拆卸） | `duration` `onConfirm` |
| `MtVitals` | 护盾 / 生命 / 热量分段条，条旁边带数字 | `shield` `health` `heat`（0–1） |
| `MtFactionCard` | 阵营卡：缩写大字 + 衬线口号 + 声望 | `short` `name` `slogan` `accent` `rank` `progress` |
| `MtTransfer` | 电光蓝传送 / 加载屏：像素飞蛾 + 逐行状态日志 + 进度 | `lines` `progress` `destination` |
| `MtPixelMoth` | 对称像素飞蛾，按 seed 稳定生成 | `seed` `cols` `rows` `size` |
| `MtCodexCard` | 绿色 CRT 风格的 Codex 文档卡 | `id` `title` |
| `MtExfilResult` | 撤离结算：满版状态词 + 战利品账单 | `status`: exfiltrated / lost，`loot` `currency` |
| `MtPixelIcon` | 7×7 像素小图标（`MT_PIXEL_ICONS`，14 个） | `name` `size` |

所有动效都遵守 `prefers-reduced-motion`。

### 页面骨架示例
```tsx
import "./marathon/marathon.css";
import { MtRoot, MtNav, MtSection, MtSplit, MtButton, MtEyebrow, MtTitle, MtNewsList,
  MtDataCard, MtProgress, MtTag, MtStripes, MtMarquee } from "./marathon/Marathon";

export default function Page() {
  return (
    <MtRoot>
      <MtNav logo="Runner/OS" current="#news"
        links={[{ label: "News", href: "#news" }, { label: "Store", href: "#store" }]}
        actions={<MtButton href="#buy">Buy now</MtButton>} />
      <MtSection tone="dark" meta={{ tl: "SEC.01 // DEPLOY", tr: "v2.4.1" }}>
        <MtEyebrow accent>// A PvPvE survival extraction FPS</MtEyebrow>
        <MtTitle size="mega" as="h1" scramble>Available now</MtTitle>
        <p className="mt-body">Short briefing-style copy.</p>
        <MtButton href="#buy" arrow>Buy now</MtButton>
      </MtSection>
      <MtStripes />
      <MtSection id="news" eyebrow="Latest updates" title="Field reports" titleSize="h2">
        <MtNewsList items={[{ source: "Bulletin", date: "10.19.2026", title: "Season 2 opens", href: "#n1" }]} />
      </MtSection>
      <MtSection tone="bone" meta={{ tl: "TAU CETI IV // SURFACE DATA" }}>
        <MtSplit>
          <div><MtEyebrow>Powerful. Configurable. Expendable.</MtEyebrow><MtTitle>Death dealers</MtTitle></div>
          <MtDataCard label="Extraction rate" value="62" unit="%" tag={<MtTag tone="magenta">Live</MtTag>}>
            <MtProgress value={0.62} label="Extraction rate" />
          </MtDataCard>
        </MtSplit>
      </MtSection>
      <MtMarquee items={["Death hangs above", "Influence is power"]} />
    </MtRoot>
  );
}
```

## 12. 游戏内界面模式
网页之外，Marathon 的局内界面有一套自己的模式。下面的结论来自评测、补丁说明和截图说明（详见 `references/research.md`），标了"推断"的是没有一手来源的设计建议。

**大厅**
- 顶部横向 Tab：Loadout、Vault、Factions、Codex、Rewards、Store。暗底上的选中项用酸绿底黑字。
- 很多操作是**长按确认**（出售、拆卸、切换菜单），用 `MtHoldButton`。
- 第二赛季把 Loadout 和 Vault 合并、简化了大厅。做大厅时层级尽量浅，别让玩家钻五六层菜单。

**仓库（Vault）**
- 网格背包，仓库最多 512 格，物品占格子。方格硬直角，稀有度色出现在格子本身上（底部条 + 角标）。
- 武器格右下角显示弹药类型图标；配件格左下角显示适配标记：`←` 表示适配已装备武器，`X` 表示都不适配。
- 稀有度五档：Standard 灰、Enhanced 绿、Deluxe 蓝、Superior 紫、Prestige 金。游戏还有四种色盲模式，重要信息不要只靠颜色区分。
- 第二赛季简化了物品格、降低了图标颜色饱和度。格子里只放必要信息，详情放在旁边的参数表里。

**HUD**
- 命中提示是 "X"；倒地敌人头上显示彩色骷髅；有热量条（反向体力）、装备轮盘、10 秒撤离倒计时。
- 原版的护盾指示太小被大量吐槽。做 HUD 时分段条旁边一定写数字，正文不小于 12px。
- 推断：左下护盾 / 生命，右下弹药和武器代号，顶部方向条；小号等宽字，酸绿或白色，背景透明。

**传送 / 加载屏**
- 整屏电光蓝，一只大的像素飞蛾形象，旁边逐行出现状态日志："Searching…"、"Molecular disassembly complete"、"Transfer to destination in progress…"。用 `MtTransfer`。

**Codex**
- 档案卡用 80 年代绿色荧光屏字体（像 Minitel 终端），绿底绿字、扫描线、闪烁光标。用 `MtCodexCard`。

**撤离结算**（推断）
- 满版状态词（EXFILTRATED / RUNNER LOST），下面是等宽字的战利品账单、稀有度标签和合计。用 `MtExfilResult`。

**阵营**
- 每个阵营当作独立品牌：缩写 + 全称 + 口号，各自一个强调色，叠在统一的暗色系统上。只有 Arachne 的血红色有明确来源，其他阵营色是建议值。做原创项目时用自己编的阵营名，不要用官方阵营标志。

**可读性守则**（来自上线后的批评和第二赛季的修正）
- 保留字体混排，但每个面板只有一个主角。
- 图标要能互相区分，不要几种物品用几乎一样的图标。
- 数值写在条旁边，不要只靠条的长短。
- 菜单层级浅，常用操作有快捷入口。


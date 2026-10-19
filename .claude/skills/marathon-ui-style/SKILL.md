---
name: marathon-ui-style
description: Build any UI (web page, app screen, dashboard, React components) in the visual style of Bungie's Marathon (2026) site: graphic-realism, acid lime on black/bone, wide techno type, mono data labels.
---

# Marathon UI Style（马拉松风格 UI 规范）

参考来源：marathonthegame.com 首页结构、Fonts In Use 对 Marathon (2026) 字体的记录、美术总监访谈（"graphic realism"，受 The Designers Republic、Wipeout、Ghost in the Shell、MGS2 影响）、社区整理的品牌色。官方 CSS 未能直接读取，色值为近似值，用于风格复刻而非品牌官方规范。

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
Google Fonts 引入：`Chakra Petch:wght@500;700`、`Archivo:wdth,wght@125,400..800`、`JetBrains Mono:wght@400;500`、`Instrument Serif`。

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
- serif 只用于一两个词的戏剧化反差（如引言），每页最多一次。

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
1. 把下面的 `marathon.css` 原样存进项目（如 `src/marathon/marathon.css`），在入口文件 `import` 一次。它已经包含第 3 节的本机原版字体别名和全部 token。
2. 在 HTML `<head>` 加免费替代字体（本机有原版时不会下载）：
   `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@125,400..800&family=Chakra+Petch:wght@500;700&family=JetBrains+Mono:wght@400;500&family=Instrument+Serif&display=swap">`
3. 把 `Marathon.tsx` 原样存进项目，从里面导入组件。依赖只有 React 18+，TypeScript strict 下可编译；纯 JS 项目去掉类型标注即可。
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

### marathon.css
```css
/* Marathon UI: fonts (local originals first), tokens, component styles */
@font-face{font-family:"MT Display";font-weight:300;src:local("KH Interference Light"),local("KHInterference-Light");}
@font-face{font-family:"MT Display";font-weight:400 900;src:local("KH Interference"),local("KH Interference Regular"),local("KHInterference-Regular"),local("KHInterference");}
@font-face{font-family:"MT Wide";font-weight:400 900;src:local("Shapiro 65 Light Wide"),local("Shapiro Wide"),local("Shapiro-65LightWide"),local("Shapiro65LightWide"),local("ShapiroWide");}
@font-face{font-family:"MT Serif";src:local("IvyPresto Headline"),local("IvyPresto Headline Regular"),local("IvyPrestoHeadline-Regular"),local("IvyPrestoHeadline");}
@font-face{font-family:"MT Mono";font-weight:400;src:local("Fraktion Mono"),local("Fraktion Mono Regular"),local("FraktionMono-Regular"),local("PPFraktionMono-Regular"),local("PP Fraktion Mono");}
@font-face{font-family:"MT Mono";font-weight:500 900;src:local("Fraktion Mono Medium"),local("FraktionMono-Medium"),local("PPFraktionMono-Medium"),local("PP Fraktion Mono Medium");}

:root{
  --mt-black:#0A0A0A;--mt-ink:#141414;--mt-bone:#E8E6DF;--mt-white:#F7F7F2;
  --mt-gray-700:#2B2B2B;--mt-gray-400:#8A8A85;
  --mt-acid:#C2FE0B;--mt-magenta:#EA027E;--mt-ultra:#3601FB;--mt-orange:#FF5500;
  --mt-font-display:"MT Display","Chakra Petch","Michroma",sans-serif;
  --mt-font-wide:"MT Wide","Archivo",sans-serif;
  --mt-font-serif:"MT Serif","Instrument Serif",serif;
  --mt-font-mono:"MT Mono","JetBrains Mono","IBM Plex Mono",monospace;
  --mt-fs-mega:clamp(56px,10vw,160px);--mt-fs-h1:clamp(40px,6vw,88px);--mt-fs-h2:clamp(28px,3.5vw,48px);
  --mt-fs-h3:20px;--mt-fs-body:15px;--mt-fs-meta:11px;
  --mt-gutter:48px;--mt-cut:12px;--mt-ease:cubic-bezier(.2,.8,0,1);
}
@media (max-width:720px){:root{--mt-gutter:16px}}

.mt-root{background:var(--mt-black);color:var(--mt-white);font:400 var(--mt-fs-body)/1.55 var(--mt-font-mono);
  -webkit-font-smoothing:antialiased;font-variant-numeric:tabular-nums;overflow-x:hidden}
.mt-root *,.mt-root *::before,.mt-root *::after{box-sizing:border-box}

/* type */
.mt-eyebrow{font:500 var(--mt-fs-meta)/1.2 var(--mt-font-mono);text-transform:uppercase;letter-spacing:.12em;color:var(--mt-gray-400);margin:0}
.mt-eyebrow--accent{color:var(--mt-acid)}
.mt-title{font:700 var(--mt-fs-h1)/.9 var(--mt-font-display);text-transform:uppercase;letter-spacing:-.01em;margin:0;overflow-wrap:anywhere}
.mt-title--mega{font-size:var(--mt-fs-mega)}
.mt-title--h2{font-size:var(--mt-fs-h2)}
.mt-wide{font-family:var(--mt-font-wide);font-stretch:125%;text-transform:uppercase;letter-spacing:.04em}
.mt-body{max-width:56ch;margin:0}

/* button */
.mt-btn{display:inline-flex;align-items:center;gap:10px;font:700 14px/1 var(--mt-font-wide);font-stretch:125%;
  text-transform:uppercase;letter-spacing:.08em;padding:16px 28px;border:0;border-radius:0;cursor:pointer;text-decoration:none;white-space:nowrap;
  transition:background .15s var(--mt-ease),color .15s var(--mt-ease),box-shadow .15s var(--mt-ease)}
.mt-btn--primary{background:var(--mt-acid);color:var(--mt-black);
  clip-path:polygon(0 0,calc(100% - var(--mt-cut)) 0,100% var(--mt-cut),100% 100%,0 100%)}
.mt-btn--primary:hover{background:var(--mt-black);color:var(--mt-acid);box-shadow:inset 0 0 0 2px var(--mt-acid)}
.mt-btn--ghost{background:transparent;color:currentColor;box-shadow:inset 0 0 0 1px currentColor}
.mt-btn--ghost:hover{background:var(--mt-white);color:var(--mt-black)}
.mt-btn--link{background:none;color:currentColor;padding:4px 0;
  background-image:linear-gradient(currentColor,currentColor);background-size:0 1px;background-repeat:no-repeat;background-position:0 100%;
  transition:background-size .25s var(--mt-ease)}
.mt-btn--link:hover{background-size:100% 1px}
.mt-btn:focus-visible{outline:2px solid var(--mt-acid);outline-offset:3px}

/* tag */
.mt-tag{display:inline-block;font:500 10px/1.2 var(--mt-font-mono);text-transform:uppercase;letter-spacing:.1em;padding:2px 6px}
.mt-tag--acid{background:var(--mt-acid);color:var(--mt-black)}
.mt-tag--magenta{background:var(--mt-magenta);color:var(--mt-white)}
.mt-tag--ultra{background:var(--mt-ultra);color:var(--mt-white)}
.mt-tag--orange{background:var(--mt-orange);color:var(--mt-black)}
.mt-tag--outline{box-shadow:inset 0 0 0 1px currentColor}

/* nav */
.mt-nav{position:sticky;top:0;z-index:10;display:flex;align-items:center;gap:32px;height:60px;padding:0 var(--mt-gutter);
  background:var(--mt-black);border-bottom:1px solid var(--mt-gray-700)}
.mt-nav__logo{font:700 18px/1 var(--mt-font-display);text-transform:uppercase;letter-spacing:.02em;color:var(--mt-white);text-decoration:none}
.mt-nav__links{display:flex;gap:24px;list-style:none;margin:0;padding:0}
.mt-nav__links a{font:500 12px/1 var(--mt-font-wide);font-stretch:125%;text-transform:uppercase;letter-spacing:.06em;color:var(--mt-white);text-decoration:none;opacity:.75}
.mt-nav__links a:hover,.mt-nav__links a[aria-current]{opacity:1;color:var(--mt-acid)}
.mt-nav__actions{margin-left:auto;display:flex;align-items:center;gap:16px}
.mt-nav .mt-btn{padding:12px 18px;font-size:12px}
@media (max-width:720px){.mt-nav__links{display:none}}

/* section */
.mt-section{position:relative;padding:clamp(64px,10vw,128px) var(--mt-gutter);display:grid;gap:24px;overflow:hidden}
.mt-section--dark{background:var(--mt-black);color:var(--mt-white)}
.mt-section--bone{background:var(--mt-bone);color:var(--mt-black)}
.mt-section--bone .mt-eyebrow{color:#55554f}
.mt-section--acid{background:var(--mt-acid);color:var(--mt-black)}
.mt-section--acid .mt-eyebrow{color:var(--mt-black)}
.mt-section--ultra{background:var(--mt-ultra);color:var(--mt-white)}
.mt-section--ultra .mt-eyebrow{color:var(--mt-white)}
.mt-section__meta{position:absolute;font:500 10px/1 var(--mt-font-mono);text-transform:uppercase;letter-spacing:.12em;opacity:.6}
.mt-section__meta--tl{top:16px;left:var(--mt-gutter)}.mt-section__meta--tr{top:16px;right:var(--mt-gutter)}
.mt-section__meta--bl{bottom:16px;left:var(--mt-gutter)}.mt-section__meta--br{bottom:16px;right:var(--mt-gutter)}
.mt-split{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center}
.mt-split--reverse>:first-child{order:2}
@media (max-width:720px){.mt-split{grid-template-columns:1fr}.mt-split--reverse>:first-child{order:0}}
.mt-rule{height:4px;background:var(--mt-acid);border:0;margin:0}

/* news */
.mt-news{list-style:none;margin:0;padding:0;border-top:1px solid var(--mt-gray-700)}
.mt-news__item a{display:grid;grid-template-columns:180px 1fr auto;gap:24px;align-items:baseline;padding:20px 0;
  border-bottom:1px solid var(--mt-gray-700);color:inherit;text-decoration:none;transition:background .15s,color .15s}
.mt-news__item a:hover{background:var(--mt-acid);color:var(--mt-black)}
.mt-news__meta{font:500 var(--mt-fs-meta)/1.2 var(--mt-font-mono);text-transform:uppercase;letter-spacing:.12em;opacity:.65}
.mt-news__title{font:700 18px/1.2 var(--mt-font-wide);font-stretch:125%;text-transform:uppercase;letter-spacing:.02em}
@media (max-width:720px){.mt-news__item a{grid-template-columns:1fr auto}.mt-news__meta{grid-column:1/-1}}

/* thumbnails */
.mt-thumbs{display:flex;gap:12px;overflow-x:auto;padding-bottom:4px;scrollbar-width:none}
.mt-thumb{flex:0 0 128px;display:grid;gap:8px;background:none;border:0;padding:0;color:inherit;text-align:left;cursor:pointer}
.mt-thumb__img{position:relative;width:128px;height:128px;background:var(--mt-ink) center/cover;outline:1px solid var(--mt-gray-700);outline-offset:-1px}
.mt-thumb[aria-pressed="true"] .mt-thumb__img{outline:2px solid var(--mt-acid);outline-offset:-2px}
.mt-thumb__num{position:absolute;top:6px;left:6px;font:500 10px/1 var(--mt-font-mono);background:var(--mt-black);color:var(--mt-white);padding:3px 4px}
.mt-thumb__label{font:500 10px/1.3 var(--mt-font-mono);text-transform:uppercase;letter-spacing:.1em}

/* data card */
.mt-card{position:relative;background:var(--mt-ink);color:var(--mt-white);border:1px solid var(--mt-gray-700);padding:20px;display:grid;gap:12px;
  clip-path:polygon(0 0,calc(100% - 20px) 0,100% 20px,100% 100%,0 100%)}
.mt-card__head{display:flex;justify-content:space-between;align-items:center;gap:12px}
.mt-card__value{font:700 clamp(40px,5vw,64px)/.9 var(--mt-font-display);text-transform:uppercase}
.mt-card__unit{font:500 var(--mt-fs-meta)/1 var(--mt-font-mono);letter-spacing:.12em;color:var(--mt-gray-400);margin-left:6px}

/* barcode */
.mt-barcode{display:block;height:24px;width:120px;color:currentColor}

/* progress */
.mt-progress{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:3px;height:12px}
.mt-progress__seg{background:var(--mt-gray-700)}
.mt-progress__seg--on{background:var(--mt-acid)}

/* marquee */
.mt-marquee{overflow:hidden;background:var(--mt-acid);color:var(--mt-black);padding:18px 0;white-space:nowrap}
.mt-marquee__track{display:inline-flex;gap:48px;animation:mt-marquee var(--mt-marquee-speed,30s) linear infinite}
.mt-marquee__item{font:700 clamp(24px,4vw,48px)/1 var(--mt-font-display);text-transform:uppercase}
@keyframes mt-marquee{to{transform:translateX(-50%)}}

/* decor */
.mt-stripes{height:16px;background:repeating-linear-gradient(-45deg,var(--mt-acid) 0 8px,var(--mt-black) 8px 16px)}
.mt-crosshair{position:absolute;width:16px;height:16px;pointer-events:none}
.mt-crosshair::before,.mt-crosshair::after{content:"";position:absolute;background:currentColor;opacity:.5}
.mt-crosshair::before{left:7px;top:0;width:1px;height:16px}.mt-crosshair::after{top:7px;left:0;height:1px;width:16px}

@media (prefers-reduced-motion:reduce){
  .mt-marquee__track{animation:none}
  .mt-root *{transition-duration:0s!important}
}
```

### Marathon.tsx
```tsx
// Marathon UI React components. Requires marathon.css.
import {
  useEffect, useMemo, useState,
  type AnchorHTMLAttributes, type ButtonHTMLAttributes, type CSSProperties, type ReactNode,
} from "react";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

type Tone = "acid" | "magenta" | "ultra" | "orange";

/* ---------- hooks ---------- */

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#_<>[]";

/** Decodes text from random glyphs into the final string. */
export function useScramble(text: string, duration = 600, enabled = true) {
  const reduced = useReducedMotion();
  const [out, setOut] = useState(text);
  useEffect(() => {
    if (reduced || !enabled) { setOut(text); return; }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const fixed = Math.floor(p * text.length);
      setOut(text.split("").map((ch, i) =>
        i < fixed || ch === " " ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]).join(""));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, duration, reduced, enabled]);
  return out;
}

/* ---------- root & type ---------- */

export function MtRoot({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("mt-root", className)}>{children}</div>;
}

export function MtEyebrow({ children, accent }: { children: ReactNode; accent?: boolean }) {
  return <p className={cx("mt-eyebrow", accent && "mt-eyebrow--accent")}>{children}</p>;
}

export function MtTitle({ children, size = "h1", as: Tag = "h2", scramble }: {
  children: string; size?: "mega" | "h1" | "h2"; as?: "h1" | "h2" | "h3"; scramble?: boolean;
}) {
  const text = useScramble(children, 600, !!scramble);
  return (
    <Tag className={cx("mt-title", size === "mega" && "mt-title--mega", size === "h2" && "mt-title--h2")} aria-label={children}>
      <span aria-hidden>{text}</span>
    </Tag>
  );
}

/* ---------- button & tag ---------- */

type BtnVariant = "primary" | "ghost" | "link";
type BtnProps =
  | ({ href: string; variant?: BtnVariant; arrow?: boolean } & AnchorHTMLAttributes<HTMLAnchorElement>)
  | ({ href?: undefined; variant?: BtnVariant; arrow?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>);

export function MtButton({ variant = "primary", arrow, className, children, ...rest }: BtnProps) {
  const cls = cx("mt-btn", `mt-btn--${variant}`, className);
  const body = <>{children}{arrow && <span aria-hidden>→</span>}</>;
  if (rest.href !== undefined)
    return <a className={cls} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>{body}</a>;
  return <button className={cls} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>{body}</button>;
}

export function MtTag({ children, tone = "acid", outline }: { children: ReactNode; tone?: Tone; outline?: boolean }) {
  return <span className={cx("mt-tag", outline ? "mt-tag--outline" : `mt-tag--${tone}`)}>{children}</span>;
}

/* ---------- nav ---------- */

export function MtNav({ logo, links, current, actions }: {
  logo: ReactNode; links: { label: string; href: string }[]; current?: string; actions?: ReactNode;
}) {
  return (
    <nav className="mt-nav">
      <a className="mt-nav__logo" href="/">{logo}</a>
      <ul className="mt-nav__links">
        {links.map(l => (
          <li key={l.href}><a href={l.href} aria-current={l.href === current ? "page" : undefined}>{l.label}</a></li>
        ))}
      </ul>
      <div className="mt-nav__actions">{actions}</div>
    </nav>
  );
}

/* ---------- section ---------- */

type Corner = "tl" | "tr" | "bl" | "br";

export function MtSection({ tone = "dark", eyebrow, title, titleSize = "h1", meta, children, id }: {
  tone?: "dark" | "bone" | "acid" | "ultra"; eyebrow?: ReactNode; title?: string;
  titleSize?: "mega" | "h1" | "h2"; meta?: Partial<Record<Corner, ReactNode>>; children?: ReactNode; id?: string;
}) {
  return (
    <section id={id} className={cx("mt-section", `mt-section--${tone}`)}>
      {meta && (Object.keys(meta) as Corner[]).map(k =>
        <span key={k} className={`mt-section__meta mt-section__meta--${k}`} aria-hidden>{meta[k]}</span>)}
      {eyebrow && <MtEyebrow>{eyebrow}</MtEyebrow>}
      {title && <MtTitle size={titleSize}>{title}</MtTitle>}
      {children}
    </section>
  );
}

/** Two columns that stack on mobile; `reverse` swaps sides on desktop. */
export function MtSplit({ children, reverse }: { children: [ReactNode, ReactNode]; reverse?: boolean }) {
  return <div className={cx("mt-split", reverse && "mt-split--reverse")}><div>{children[0]}</div><div>{children[1]}</div></div>;
}

/* ---------- news ---------- */

export function MtNewsList({ items }: { items: { source: string; date: string; title: string; href: string }[] }) {
  return (
    <ul className="mt-news">
      {items.map(n => (
        <li key={n.href} className="mt-news__item">
          <a href={n.href}>
            <span className="mt-news__meta">{n.source} · {n.date}</span>
            <span className="mt-news__title">{n.title}</span>
            <span aria-hidden>→</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/* ---------- thumbnails ---------- */

export function MtThumbRail({ items, selected, onSelect }: {
  items: { label: string; image?: string }[]; selected: number; onSelect: (i: number) => void;
}) {
  return (
    <div className="mt-thumbs" role="group">
      {items.map((t, i) => (
        <button key={i} className="mt-thumb" aria-pressed={i === selected} onClick={() => onSelect(i)}>
          <span className="mt-thumb__img" style={t.image ? { backgroundImage: `url(${t.image})` } : undefined}>
            <span className="mt-thumb__num">{String(i + 1).padStart(2, "0")}</span>
          </span>
          <span className="mt-thumb__label">{t.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ---------- data ---------- */

/** Decorative barcode; bars derive from `seed` so it stays stable across renders. */
export function MtBarcode({ seed = "MARATHON", bars = 36 }: { seed?: string; bars?: number }) {
  const widths = useMemo(() => {
    let h = 0;
    for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return Array.from({ length: bars }, () => { h = (h * 1103515245 + 12345) >>> 0; return 1 + (h >>> 16) % 3; });
  }, [seed, bars]);
  let x = 0;
  const total = widths.reduce((a, w) => a + w * 2, 0);
  return (
    <svg className="mt-barcode" viewBox={`0 0 ${total} 24`} preserveAspectRatio="none" aria-hidden>
      {widths.map((w, i) => { const r = <rect key={i} x={x} y={0} width={w} height={24} fill="currentColor" />; x += w * 2; return r; })}
    </svg>
  );
}

export function MtDataCard({ label, value, unit, tag, children }: {
  label: string; value: ReactNode; unit?: string; tag?: ReactNode; children?: ReactNode;
}) {
  return (
    <div className="mt-card">
      <div className="mt-card__head"><MtEyebrow>{label}</MtEyebrow>{tag ?? <MtBarcode seed={label} />}</div>
      <div><span className="mt-card__value">{value}</span>{unit && <span className="mt-card__unit">{unit}</span>}</div>
      {children}
    </div>
  );
}

export function MtProgress({ value, segments = 16, label }: { value: number; segments?: number; label?: string }) {
  const on = Math.round(Math.max(0, Math.min(1, value)) * segments);
  return (
    <div className="mt-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)} aria-label={label}>
      {Array.from({ length: segments }, (_, i) =>
        <span key={i} className={cx("mt-progress__seg", i < on && "mt-progress__seg--on")} />)}
    </div>
  );
}

/* ---------- bands & decor ---------- */

export function MtMarquee({ items, speed = 30 }: { items: string[]; speed?: number }) {
  const row = [...items, ...items];
  return (
    <div className="mt-marquee" aria-label={items.join(" ")}>
      <div className="mt-marquee__track" style={{ "--mt-marquee-speed": `${speed}s` } as CSSProperties} aria-hidden>
        {row.map((t, i) => <span key={i} className="mt-marquee__item">{t}</span>)}
      </div>
    </div>
  );
}

export const MtStripes = () => <div className="mt-stripes" aria-hidden />;
export const MtRule = () => <hr className="mt-rule" />;
export const MtCrosshair = ({ style }: { style?: CSSProperties }) =>
  <span className="mt-crosshair" style={style} aria-hidden />;
```

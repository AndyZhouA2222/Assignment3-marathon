---
name: marathon-ui-style
description: Build any UI (web page, app screen, dashboard, poster-like layout) in the visual style of Bungie's Marathon (2026) site: graphic-realism, acid lime on black/bone, wide techno type, mono data labels.
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

  /* 字体（商用原字体 → 免费替代） */
  --mt-font-display: "KH Interference", "Chakra Petch", "Michroma", sans-serif;
  --mt-font-wide: "Shapiro Wide", "Archivo", sans-serif;   /* Archivo 用 font-stretch:125% */
  --mt-font-serif: "IvyPresto Headline", "Instrument Serif", serif; /* 极少量点缀 */
  --mt-font-mono: "Fraktion Mono", "JetBrains Mono", "IBM Plex Mono", monospace;

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
.mt-btn{font:700 14px/1 var(--mt-font-wide);font-stretch:125%;text-transform:uppercase;letter-spacing:.08em;
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

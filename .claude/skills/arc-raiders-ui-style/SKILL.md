---
name: arc-raiders-ui-style
description: Build any UI (web page, app screen, game hub, inventory, HUD, React components) in the visual style of Embark's ARC Raiders (2025): warm cream on cool navy, gold CTAs, rounded flat panels, rarity-coloured item tiles, four-colour retro stripes. Separate from the Marathon style.
---

# ARC Raiders UI Style（ARC Raiders 风格 UI 规范）

参考来源：Fonts In Use 的 ARC Raiders 字体记录、官网 arcraiders.com 的样式提取（fudge.design、Brandfetch）、Embark 官方 FAQ 与开发者访谈、社区数据仓库里的游戏内截图取色。完整调研、每条结论的出处和可信度标注见 `references/research.md`，参考图在 `references/images/`。官方没有公开设计规范，色值为取样近似值。

**和 Marathon 风格完全分开**：这里没有酸性绿、没有切角、没有条码贴花、不混用多种字体。两者都要做时，用两个独立的 skill，不要互相借元素（对照表见第 10 节）。

## 1. 风格内核
- **复古未来主义 / "NASA-punk" / 太空西部**：70–80 年代航天涂装、模拟合成器、卡带未来感。末日之后，但有希望。
- **暖奶油色文字 + 冷海军蓝黑底**：亮色一律是暖奶油，不用纯白；暗色一律偏蓝，不用中性灰。
- **平、圆、安静**：圆角 4–12px，扁平无投影，靠明度分层。信息少而清楚，界面"两分钟就能学会"。
- **颜色只来自三处**：金色主按钮、稀有度色、四色斜条纹。其余全是奶油和海军蓝。
- **最少 HUD**：没有敌人血条和伤害数字，战斗反馈靠特效和声音。HUD 只留指南针、撤离倒计时、护盾 / 生命、弹药。

## 2. Design Tokens（直接复制）
```css
:root {
  /* 底色：冷海军蓝黑 */
  --ar-bg-0: #090C19;   /* 页面、仓库底、物品格底栏 */
  --ar-bg-1: #0A0E1A;   /* 实心面板、面板标题条 */
  --ar-bg-2: #0F1221;   /* 物品格主体下部 */
  --ar-bg-3: #131624;   /* 物品格主体上部、抬起的面 */
  --ar-bg-4: #1B1F2E;   /* hover、选中行、进度条轨道 */
  --ar-glass: rgba(10,14,26,.85);  /* 压在地图 / 3D 场景上的面板 */
  --ar-line: #434248;          /* 标题后的细线 */
  --ar-line-strong: #363C48;   /* 普通描边 */
  /* 文字：暖奶油 */
  --ar-cream: #ECE2D0;      /* 品牌奶油、正文、官网导航条底色 */
  --ar-cream-hi: #FAEEE0;   /* 标题、图标 */
  --ar-cream-dim: #B9B1A3;  /* 次要文字 */
  --ar-cream-mute: #7D7A75; /* 未选中 / 禁用 */
  --ar-ink: #130918;        /* 奶油或金色底上的深色字 */
  /* 品牌 */
  --ar-gold: #F1AA1C;       /* 主按钮、强调词 */
  --ar-red: #D00000;
  --ar-stripe-blue: #1EA7E1; --ar-stripe-green: #3BB54A; --ar-stripe-yellow: #F7C21B; --ar-stripe-red: #E2412F;
  /* 稀有度（游戏内取色） */
  --ar-common: #6C6C6C; --ar-uncommon: #24BA54; --ar-rare: #00A8F2; --ar-epic: #CC3096; --ar-legendary: #FCC600;
  /* 状态 */
  --ar-danger: #E5584A; --ar-warning: #F8B810; --ar-success: #24BA54; --ar-info: #00A8F2;
  /* 形状与动效 */
  --ar-radius-xs: 4px; --ar-radius-sm: 6px; --ar-radius-md: 8px; --ar-radius-lg: 12px; --ar-rule: 2px;
  --ar-ease: cubic-bezier(.2,.7,.2,1); --ar-dur: 250ms;
}
```
- 稀有度五档：Common 灰、Uncommon 绿、Rare 天蓝、Epic **洋红**（不是紫）、Legendary **金黄**（不是橙）。
- 技能树三色：Conditioning 绿、Mobility 黄、Survival 红。
- 四色条纹顺序：蓝、绿、黄、红（Logo 里绿黄红代表三棵技能树，蓝代表 ARC 机器）。

## 3. 字体规则
| 角色 | 原版字体 | 说明 |
|---|---|---|
| Logo / 字标 | ITC Avant Garde Gothic Bold（收紧字距） | 商用字体；没装时用 Urbanist 900 代替 |
| 标题、标签、按钮、Tab | **Urbanist**（另有 Prompt） | 全大写，700–800，字距 0.04–0.1em |
| 正文、列表 | **Barlow** Light / Regular / Medium / Bold | 正常大小写，列表项用 Medium |
| 数字（弹药、计时、坐标、价格、重量） | **JetBrains Mono** | 只做点缀，不要大段使用 |

除 Logo 外，这些都是游戏本身用的免费字体。`arc.css` 用 `@font-face local()` 定义了 `AR Logo` / `AR Heading` / `AR Body` / `AR Mono` 四个别名：本机装了原版就直接用本机的，没装才走 Google Fonts。在 HTML `<head>` 加：
```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Urbanist:wght@600;700;800;900&family=Barlow:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Prompt:wght@600;700&display=swap">
```
排版：官网大标题 64–88px / 800 / 全大写 / 行高 0.9；UI 标签 15–16px / 600 / 全大写 / 字距 0.1em；正文 16px，导语 20/27px。一个页面最多这三种字体加 Prompt，不要再加。

## 4. 版式
- **官网**：顶部奶油色导航条（深色字），下面是近黑的"战役"底，大标题 + 金色主按钮 + 白描边次按钮。区块之间用 2px 实线，编辑性分隔用 1px 金线。
- **游戏大厅**：顶部横向 Tab（PLAY / STASH / WORKSHOP / TRADERS / RAIDER / STORE），右上角货币（Coins 金、Cred 蓝、Raider Tokens 洋红）；左侧任务与成就；右下角 PLAY 大按钮，上面是 Fill Squad / Crossplay 开关和组队圆位。
- **仓库**：物品格紧密排列，间距 4–6px，铺在 `--ar-bg-0` 上；右侧是选中物品的详情卡。
- **HUD**：顶部居中指南针 + 撤离倒计时；左下护盾（蓝色分段）+ 生命（奶油色）及队友；右下弹药和武器名。
- 边距 `clamp(16px,4vw,56px)`，桌面两栏，760px 以下单栏。

## 5. 组件
1. **物品格（招牌组件）**：正方形圆角（宽度的 8%）；稀有度描边，左边和左下最亮；主体海军蓝渐变，左侧约 30% 稀有度色光晕；左下角实心稀有度"弧形块"（大圆外的角落）；底部 25% 深色底栏，左边奶油色类别图标，右边罗马数字等级（I–IV）。物品图是写实 3D 渲染，略降饱和，居中。
2. **详情卡**：顶部 4px 稀有度色条，头部带稀有度光晕；名称 Urbanist 800 大写；类型 Barlow；属性行（Value 金币 / Weight kg / Stack size）用细线分隔，数值用等宽字；底部按钮组。
3. **面板**：圆角 12px，标题条更深，标题全大写 + 一条延伸到边缘的 2px 灰线。压在地图上时用半透明 `--ar-glass`。
4. **图例列表**：28px 深色圆形图标位 + 奶油色图标 + Barlow 文字；主要项用反色（奶油色圆角方块 + 深色图标）。
5. **按钮**：主按钮金底深字，圆角 4px，**不是胶囊**；大厅 PLAY 用奶油底深字大号；次按钮透明底 + 35% 奶油描边；官网次按钮白描边。
6. **Tab**：全大写 Urbanist 700，未选中灰奶油，选中亮奶油 + 底部 3px 奶油线。
7. **开关**：圆角轨道，开为奶油色轨道 + 深色圆点。
8. **进度条**：8px 圆角，金色或技能树颜色，标签大写、数值等宽。
9. **商人卡**：写实肖像（暖色、百叶窗光），名字大写，职务金色，一句第一人称台词。
10. **图标**：实心、圆润几何、单色奶油，放在深色圆或圆角方块上。不用线性图标，不用像素图标。

## 6. 装饰元素（克制使用）
- **四色斜条纹**：小号 `////` 跟在字标后；整条四色细带做分隔；大号从页面角落斜切进来（一屏最多一次）。
- **稀有度弧形块**和左侧光晕：只出现在物品格和详情卡上。
- **标题延长线**：面板标题后的细线。
- 背景可以有极淡的胶片颗粒。不要扫描线、故障效果、条码、重度做旧。

## 7. 动效
- 慢而柔：200–350ms，`cubic-bezier(.2,.7,.2,1)`，淡入和小位移。
- hover：物品格放大到 1.02 并提亮；按钮变色，不跳动。
- 撤离倒计时：正常奶油色，剩 5 分钟变琥珀色，关闭后变灰。
- 遵守 `prefers-reduced-motion`。

## 8. 文案语气
- 温暖、带点调侃、互相打气的拓荒者口吻："See you topside, Raider." 商人台词用第一人称。
- 标签和按钮短而直接：Play、Fill Squad、Crossplay、Inspect、Recycle、Sell。
- 游戏内词汇（Topside、Speranza、Raider、Stash、Workshop、Feats、Trials、Coins、Cred）见 `references/research.md` 第 8 节；做商用或公开作品时换成自己的词。

## 9. 自检清单
- [ ] 亮色都是暖奶油（没有 #FFFFFF 正文），暗色都偏蓝（没有中性灰面板）。
- [ ] 金色只用在主按钮和少量强调词上。
- [ ] 圆角 4–12px，没有切角、没有直角硬框、没有投影。
- [ ] 字体只有 Urbanist（+Prompt）、Barlow、JetBrains Mono，Logo 另算。
- [ ] 稀有度颜色正确：Epic 洋红、Legendary 金黄。
- [ ] 数字用等宽字，标签全大写，正文正常大小写。
- [ ] 手机宽度下无横向滚动，HUD 元素不重叠。

## 10. 不要做（以及和 Marathon 的区别）
| | ARC Raiders | Marathon |
|---|---|---|
| 气质 | 复古未来、温暖、有希望 | 图形写实、粗野、企业反乌托邦 |
| 底色 | 奶油字 + 海军蓝黑 | 纯黑 / 骨白 + 酸性绿 |
| 形状 | 圆角、扁平 | 直角、切角、密集贴花 |
| 字体 | 一种几何无衬线 + Barlow | 四种字体混排 |
| 装饰 | 四色斜条纹、稀有度弧形块 | 条码、编号、准星、符号贴花 |

- 不要用酸性绿、条码、`//` 编号装饰、切角按钮（那是 Marathon）。
- 不要用胶囊按钮、玻璃拟态、霓虹发光、赛博朋克紫粉渐变。
- 不要复刻 ARC Raiders 官方 Logo 或直接使用 `references/images/` 里的游戏素材（版权归 Embark Studios，仅供研究）。

## 11. React 组件库
用户要 React 界面时，直接用这套组件，不要重新手写样式：
1. 把本 skill 的 `assets/react/arc.css` 复制进项目（如 `src/arc/arc.css`），入口文件 `import` 一次。它包含第 3 节的字体别名和全部 token。
2. 在 HTML `<head>` 加第 3 节的 Google Fonts 链接。
3. 把 `assets/react/ArcRaiders.tsx` 复制进项目，从里面导入组件。依赖只有 React 18+，TypeScript strict 下可编译。
4. 整个页面包在 `<ArRoot>` 里。新组件沿用 `ar-` 前缀和 token 变量。

完整示例页是 `assets/react/Demo.tsx`（官网首页 + 大厅仓库 + HUD + 地图图例 + 商人 + PLAY 区），效果图在 `references/screenshots/`。

| 组件 | 用途 | 关键 props |
|---|---|---|
| `ArRoot` | 页面根：海军蓝底、奶油字、Barlow | |
| `ArSiteNav` | 官网奶油色导航条 | `logo` `links` `current` `actions` |
| `ArWordmark` | 字标 + 四色斜条纹 | `href` |
| `ArStripes` | 四色条纹 | `variant`: slash / band / corner，`corner`，`size` |
| `ArSection` / `ArSplit` | 区块 / 两栏 | `tone`: night / panel / campaign / cream，`eyebrow` `title` `lead` |
| `ArHeading` | 大写标题 + 延长线 | `as` |
| `ArPanel` | 圆角面板 | `title` `glass` |
| `ArButton` | 按钮或链接 | `variant`: primary / cream / ghost / outline / link，`size`: md / lg，`href` `arrow` |
| `ArTabs` | 大厅 Tab 栏 | `tabs` `value` `onChange` `end` |
| `ArCurrency` | 货币 | `kind`: coins / cred / tokens，`value` |
| `ArItemTile` / `ArItemGrid` | 物品格 / 仓库网格（自动补空格） | `item: Item` `selected` `onSelect`；`items` `slots` `tile` |
| `ArItemCard` | 物品详情 / 提示卡 | `item` `actions` |
| `ArRarity` | 稀有度标签 | `rarity` `solid` |
| `ArLegend` / `ArIconChip` | 地图图例 / 图标位 | `items`（`"gap"` 插入间隔）；`icon` `primary` `color` |
| `ArHud` | HUD 框架，手机上自动堆叠 | `top` `vitals` `weapon` `background` |
| `ArCompass` | 顶部指南针 | `heading` `markers` `span` |
| `ArTimer` | 撤离倒计时（自动变琥珀 / 灰） | `seconds` `label` `warnAt` |
| `ArVitals` | 护盾分段 + 生命条 | `name` `shield` `health`（0–1）`segments` |
| `ArWeapon` | 弹药和武器名 | `name` `ammo` `reserve` |
| `ArProgress` | 进度条 | `label` `value` `max` `color` `display` |
| `ArToggle` | 开关 | `label` `checked` `onChange` |
| `ArPlayDock` | 右下角 PLAY 区 | `party` `maxParty` `onPlay` |
| `ArNewsGrid` | 官网新闻卡 | `items: {date,category,title,href,image?}[]` |
| `ArTraderCard` | 商人卡 | `name` `role` `quote` `image` |
| `ArFooter` | 页脚 | `links` |
| `ArIcon` | 26 个实心图标（`AR_ICONS`） | `name` `size` `title` |
| `useCountdown` | 每秒递减的秒数 | |

`Item` 类型：`{ id, name, rarity, category, type?, tier?, qty?, image?, art?, description?, value?, weight?, stack? }`。`category` 决定底栏图标，`art` 在没有 `image` 时作为占位图。

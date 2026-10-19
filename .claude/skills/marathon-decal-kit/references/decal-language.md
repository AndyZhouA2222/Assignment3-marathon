# 贴花语言拆解（参考图 → 生成器）

每张参考图里反复出现的元素，以及在 `assets/decals.ts` 里对应的生成器。没有对应项的元素列在最后，作为后续扩展方向。

## 参考图索引
| 文件 | 内容 | 主要调色板 |
|---|---|---|
| `images/01-glyph-sheet-mono.png` | 黑底白色大圆标、块状字形、FLT CTRL / AIRFLD 粗字、球面棋盘、准星 | mono |
| `images/02-corp-atlas-mono.png` | 虚构企业 NuCaloric 的完整符号图集：上百个小图标、编号、规格块、条码、抖动块、字母表 | mono |
| `images/03-distressed-type-mono.png` | 做旧和变形字：UESC、CERT、FEED、DETACH、印章感数字、胶带 X | mono |
| `images/04-wordmark-lockup.png` | UESC 字标组合：大字标 + "Rc. 日期" + 竖排编号 + 右侧数据栏 + 刻度尺 | mono |
| `images/05-prop-atlas-navy.png` | 海军蓝底的彩色道具贴花图集：小按钮、色块、图标、LOCK 文字 | atlas |
| `images/06-pb-brrt-smg-007.webp` | Patrick Bloom：BRRT SMG 武器贴花，浅灰底，粗条、准星、编号、圆角框 | lab |
| `images/07-pb-medic-02.webp` | Patrick Bloom：医疗道具贴花，粗字 3、点阵、编号竖板、大 M | medic |
| `images/08-pb-medic-01.webp` | Patrick Bloom：医疗道具贴花，像素箭头、Mq EXC 标签、色块组、棋盘块 | medic |
| `images/09-hardware-decals-gray.png` | 硬件贴花：POWER / FILTERS 标签、斜纹、开关面板、序列号 188 B91543 | lab |
| `images/10-seal-attach-bands.png` | 封条带：LINK / ATTACH / SEAL 重复带、胶囊编号、橙色刷痕、刻度齿 | hazard |

## 元素 → 生成器
| 元素 | 出现在 | 生成器 |
|---|---|---|
| 圆形/方形底上的粗块字形 | 01、03 | `glyphDisc` |
| 像素阶梯箭头（↑ ↓ ↗） | 02、08 | `pixelArrow` |
| 连续三角箭头 ▶▶▶、`<><>` | 02、06、10 | `chevrons` |
| 条码（带或不带数字） | 02、09、10 | `barcode` |
| 斜纹警示带 | 02、09 | `stripes` |
| 棋盘格、球面棋盘 | 01、02、08 | `checker`、`globe` |
| 像素抖动渐隐块 | 02 | `dither` |
| 十字准星、套准标、靶心 | 01、06、08 | `reticle` |
| 点阵 / 加号阵 | 02、07 | `dotMatrix` |
| 对称像素徽记 | 02、06、08 | `blockMark` |
| 四角取景框 | 02、06 | `bracketFrame` |
| R−…R+ 刻度尺 | 04、10 | `ruler` |
| 小几何图标（水滴、蝴蝶结、D 形、胶囊、六角螺母…） | 02、05 | `icon`（24 个） |
| 色块编号盒（S8、B7、3） | 02、07、08 | `codeBox` |
| 手撕胶带、刷痕色块 | 03、10 | `tape` |
| 多行序列号（118 891 543 …） | 02、09 | `serialBlock` |
| Property / Unit / 值 规格表 | 02 | `specTable` |
| NOTICE / RESERVED FOR ICONOGRAPHY 文字块 | 02、03 | `warningLabel` |
| LINK-LINK / SEAL-SEAL 重复带 | 10 | `repeatBand` |
| 胶囊编号 ⊖→ 14.12、008.A | 10 | `pillTag` |
| 方块内两行叠字（FLT / CTRL） | 01、08 | `stackBadge` |
| 大字标组合（UESC Rc. 4.24.1986） | 04 | `lockup` |
| 像素字、数码管数字 | 02、03 | `pixelText`、`segmentText`、文字变体 `pixel` `segment` |
| 斜杠零 Ø、方括号 [ ]、竖排、镜像、描边、做旧 | 02、03 | 文字变体 `slashedZero` `bracket` `vertical` `mirrored` `outline` `distressed` |
| 底部酸性绿品牌条 | 06–08 | `sheet()` 的 `footer` |

## 文字词汇
- 有来源确认的贴花词：**SEAL**（气闸封条）、**ATTACH**（胶带卷）、**CAUTION: HIGH VOLTAGE**，以及标注能量输出的管线标签。
- 参考图 10 里能直接看到：LINK、ATTACH、ATTACH HERE、SEAL。
- 其余（PACKAGE、VENT、PURGE 等，见 `WORDS`）是同类风格的扩展词。

## 规律
- **编号格式**：`三位数 + 字母 + 五位数`（188 B91543）、`字母三位 + 两位数 + 空格 + 七位数`（SDR37 2445556）、`LOT // 2.1340 7 B`、`型号-*数字`（R9K-*3）。都已写进 `codes`。
- **字号层级**：每张表 1–2 个超大元素（大圆标或字标），其余元素是它的 1/4 到 1/20。
- **留白**：图集类（02、05）元素密排；道具类（06–08）元素疏、成组，每组旁边配一行小编号。
- **色彩比例**：中性底和前景色占绝大部分，强调色只出现在少数小块上；05 是例外，用八种荧光色区分道具类别。

## 还没覆盖的（扩展方向）
- 03 里的手写签名式笔迹和印章晕染。
- 09 里的开关面板、旋钮这类拟物部件。
- 02 里成段的伪代码 / 十六进制长串（目前只有 `codes.hexRow` 单行）。
- 05 里的小型彩色按钮和 LED 状态灯。

# ColorSnap Modern Beauty Editorial Design Plan

## 设计目标

这套方案用于把 ColorSnap 从当前偏模板化的高饱和美妆页面，升级为更简约、主流、有设计感的现代美妆产品体验。

核心方向是：

- 简约但不冷淡
- 美妆品牌感强，但不过度甜腻
- 结果页像一份可信的个人色彩报告
- 商品推荐自然融入分析结果，而不是突兀的货架
- 视觉系统可扩展，后续接入真实 AI、历史记录、用户档案时不需要大改

关键词：

- Modern
- Beauty
- Editorial
- Clean
- Warm
- Premium
- Explainable AI

## 目标用户感受

用户进入页面时应该感觉：

- 这个产品值得上传自拍
- 页面审美是专业和可信的
- AI 分析结果清楚、克制、可解释
- 商品推荐像 personal stylist 的建议，而不是广告堆叠

避免的感受：

- 高饱和渐变带来的廉价模板感
- 过多阴影和大圆角造成的早期网页感
- 信息密度混乱
- 结果页只有商品，没有“分析报告”的价值

## 总体视觉方向

### 当前问题

当前 UI 的主要问题：

- 粉色和荧光黄渐变面积过大，视觉刺激强
- 卡片圆角和阴影偏重，缺少现代产品的克制感
- 页面模块之间层级不够清晰
- Result 页面内容偏静态展示，没有报告结构
- 产品推荐部分更像普通购物页，而不是基于分析的推荐系统

### 新方向

新版应采用“美妆编辑部报告”的表达方式。

页面应像一份高级、清爽、可信的 beauty report：

- 白色和微暖背景作为主画布
- 柔和玫瑰色作为品牌主色
- 土调色、鼠尾草绿、暖棕作为辅助色
- 图片、色卡、分析标签作为主要视觉亮点
- 大留白和清晰分组建立高级感
- 少用大面积渐变，多用细边框、低阴影、柔和 surface

## 品牌视觉系统

### 色彩 Token

建议在全局样式中替换或补充现有 CSS variables。

```css
:root {
  --bg-page: #FFFCFA;
  --bg-soft: #F7F1EF;
  --surface: #FFFFFF;
  --surface-warm: #FFF7F5;

  --text-primary: #181414;
  --text-secondary: #6E6460;
  --text-muted: #9A8F8A;
  --text-inverse: #FFFFFF;

  --brand-primary: #D8647A;
  --brand-primary-hover: #C65368;
  --brand-primary-soft: #F4D6DC;
  --brand-primary-pale: #FBEEF1;

  --accent-clay: #9D6B53;
  --accent-sage: #7E8A6A;
  --accent-olive: #69734D;
  --accent-gold: #C69A4A;

  --border-soft: #E8DEDA;
  --border-strong: #D8C9C3;

  --success: #507A5A;
  --warning: #B87931;
  --error: #B42318;

  --shadow-soft: 0 8px 24px rgba(56, 35, 28, 0.06);
  --shadow-medium: 0 14px 36px rgba(56, 35, 28, 0.1);

  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
}
```

### 色彩使用规则

主背景：

- 页面背景使用 `--bg-page`
- 大块分区使用 `--bg-soft`
- 卡片和内容面使用 `--surface`

品牌色：

- `--brand-primary` 用于主按钮、重点文字、当前状态
- 不要把 `--brand-primary` 做成整页背景
- 不要再使用大面积粉黄渐变

辅助色：

- `--accent-clay` 用于 Warm Autumn、Deep Autumn 这类土调季型
- `--accent-sage` 用于 palette、fashion、自然感模块
- `--accent-gold` 用于 confidence、premium hint、metal recommendations

边框和阴影：

- 默认用细边框建立结构
- 阴影只用于可交互卡片或重点模块
- 大面积容器不要用重阴影

## 字体系统

### 推荐字体

首选：

```css
font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

备选：

```css
font-family: "Manrope", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

### 字号层级

```css
--font-xs: 0.75rem;
--font-sm: 0.875rem;
--font-md: 1rem;
--font-lg: 1.125rem;
--font-xl: 1.5rem;
--font-2xl: 2rem;
--font-3xl: 2.75rem;
--font-4xl: 4rem;
```

### 使用规则

- 页面标题使用 700 weight
- 模块标题使用 650 或 700 weight
- 正文使用 400 weight
- 标签、说明、metadata 使用 500 weight
- 不靠颜色单独建立层级，要结合字号、字重、位置
- 字间距保持 `letter-spacing: 0`
- 移动端不要用 viewport width 缩放字体

## 间距和布局

### 页面宽度

```css
--container-sm: 760px;
--container-md: 1040px;
--container-lg: 1200px;
```

使用建议：

- 文本型内容限制在 `760px`
- 报告页主内容限制在 `1040px`
- 商品 grid 限制在 `1200px`

### 间距 Token

```css
--space-1: 0.25rem;
--space-2: 0.5rem;
--space-3: 0.75rem;
--space-4: 1rem;
--space-5: 1.5rem;
--space-6: 2rem;
--space-7: 3rem;
--space-8: 4rem;
--space-9: 6rem;
```

### 布局原则

- 页面 section 之间至少 `4rem` 间距
- 卡片内部 padding 使用 `1rem` 到 `1.5rem`
- hero 不要做文字和图片左右硬切的模板布局
- 工具和结果页不要像 landing page，第一屏应该直接进入核心体验
- 结果页采用报告流：Summary -> Profile -> Palette -> Advice -> Products

## 组件规范

### Button

主按钮：

```css
background: var(--brand-primary);
color: var(--text-inverse);
border-radius: var(--radius-md);
padding: 0.85rem 1.2rem;
font-weight: 700;
```

次按钮：

```css
background: var(--surface);
color: var(--text-primary);
border: 1px solid var(--border-soft);
border-radius: var(--radius-md);
```

规则：

- 按钮圆角不超过 8px
- hover 使用轻微背景变化或 `translateY(-1px)`
- 不使用 pill 形状作为默认按钮
- 不使用大面积渐变按钮

### Card

卡片默认样式：

```css
background: var(--surface);
border: 1px solid var(--border-soft);
border-radius: var(--radius-md);
box-shadow: none;
```

重点卡片：

```css
box-shadow: var(--shadow-soft);
```

规则：

- 不要 cards inside cards
- 只有重复项目、结果摘要、商品、可交互模块使用 card
- 页面大 section 不做浮动卡片，应做 full-width band 或普通内容容器

### Chip

用于 attributes、season、status。

```css
background: var(--brand-primary-pale);
color: var(--text-primary);
border: 1px solid var(--brand-primary-soft);
border-radius: var(--radius-md);
padding: 0.45rem 0.65rem;
font-size: var(--font-sm);
font-weight: 600;
```

### Palette Swatch

色卡是品牌记忆点，应做得更精致。

建议结构：

- 色块高度固定
- 下方显示 color name
- 显示 use case
- hover 时只轻微抬起

色卡不要：

- 加厚重阴影
- 用过圆的大圆角
- 在色块上覆盖大量文字

## 页面改造方案

## 1. Header

目标：

- 从普通导航升级成现代品牌导航
- 更轻、更干净、更像美妆产品

视觉建议：

- 背景使用半透明白色或纯白
- 底部使用 `1px` 细边框
- fixed header 可以保留，但高度控制在 72px 左右
- Logo 使用文字型即可，避免复杂图标
- 当前页面状态用品牌色或下划线表示

导航顺序建议：

- Home
- Analysis
- Consultation
- Cart
- About

按钮：

- 右侧可以放一个主 CTA：`Start Analysis`
- 移动端保持简单菜单，不要过度动画

## 2. Home

目标：

- 从“功能展示首页”变成“现代美妆 AI 产品首页”
- 建立信任和审美

第一屏建议：

- 使用真实美妆/色彩相关图片作为视觉主角
- 文案不放在卡片里
- 背景保持干净
- CTA 明确：`Start Your Color Analysis`

Hero 文案建议：

```text
Find the colors that feel like you.
Upload a selfie and get a personal palette, beauty guidance, and product matches in minutes.
```

首屏结构：

- 左侧或居中：标题、短说明、CTA
- 背景或下方：美妆/色卡/人物图片
- 保证所有屏幕都能看到下一 section 的一点内容

后续 section：

- How it works：Upload, Analyze, Match
- What you get：Season, Palette, Beauty Advice, Products
- Example report preview：展示结果页片段

## 3. Analysis Upload Page

目标：

- 让用户放心上传照片
- 上传流程简洁、可信、低压力

布局建议：

- 页面标题区域简短
- 上传模块居中，宽度约 `720px`
- 上传框使用虚线边框或淡色 surface
- 图片预览清楚，不使用厚边框
- 上传要求以 checklist 呈现

上传模块结构：

```text
Upload a clear selfie
[ Drop area / Choose photo ]
Natural light · Face unobstructed · No heavy filter
[ Start Analysis ]
```

状态建议：

- 未选择图片：显示上传指导
- 已选择图片：显示预览和文件名
- 上传中：显示 progress/pipeline 文案
- 出错：显示温和错误信息和重试按钮

Mock AI 标签：

当前是 mock 版本，可以在页面底部小字显示：

```text
Demo mode: analysis uses a mock AI response while the live model integration is being prepared.
```

## 4. Result Page

目标：

- 结果页是整个产品的核心，应从“商品推荐页”升级成“个人色彩报告”

信息顺序：

1. Result Summary
2. Image Quality
3. Color Profile Attributes
4. Recommended Palette
5. Beauty Recommendations
6. Fashion Recommendations
7. Product Matches

### Result Summary

顶部应像报告封面。

建议布局：

```text
Warm Autumn
You look best in warm, muted, earthy tones with soft contrast.

Confidence 78%
Secondary: Soft Autumn
```

视觉建议：

- 背景使用 `--surface-warm`
- 左侧文字，右侧 confidence block
- 不使用粉黄渐变背景
- 可以放一条小型 palette strip

### Image Quality

作为可信度模块。

展示：

- Photo Quality: Passed
- Score: 87%
- Issues
- Retry advice

视觉建议：

- 通过时淡绿色边框
- 有问题时淡琥珀色边框
- 文字要实用，不要吓用户

### Attributes

展示：

- Undertone
- Brightness
- Saturation
- Contrast

建议用 chips 或 compact metric cards。

示例：

```text
Undertone Warm
Brightness Medium-low
Saturation Muted
Contrast Medium
```

### Palette

色卡模块应更有美术感。

建议：

- 每个色块固定高度
- 色卡名称清晰
- 使用场景放小字
- 一行 5 个，移动端 2 列

### Beauty Recommendations

建议按品类分组：

- Lipstick
- Blush
- Eyeshadow
- Base Makeup

每个品类用简短 bullet。

不要写太长，不要像文章。

### Fashion Recommendations

建议使用三个并列模块：

- Best Colors
- Avoid Colors
- Metals

`Avoid Colors` 不要用过强红色，避免负面感太重。

### Product Matches

商品推荐应像“matches”，不是“virtual cosmetic recommendations”。

标题建议：

```text
Recommended Product Matches
```

商品卡内容：

- 商品图
- 名称
- Shade
- Match Score
- Why it matches
- Add to Cart

视觉建议：

- 图片占比更高
- 商品卡白底
- 边框轻
- 不使用橙色大背景
- `Match Score` 用小 badge

## 5. Consultation Page

目标：

- 保持和核心流程一致，不要像独立模板页
- 更像专家服务页面

建议：

- 专家头像或照片统一比例
- 专家卡片信息简化
- 使用 `Book Consultation` 作为主按钮
- 用 softer surface，不用高饱和背景

内容顺序：

1. 专家咨询说明
2. 专家列表
3. 服务包含内容
4. FAQ 或 booking CTA

## 6. Shopping Cart

目标：

- 从普通购物车升级成 boutique checkout 感

建议：

- 白底或暖白背景
- 商品行使用细分割线
- 总价模块更清楚
- 按钮保持统一设计系统
- 空购物车状态加入回到推荐的 CTA

## 动效规范

动效应该轻，不抢戏。

允许：

- hover `translateY(-1px)`
- opacity fade
- loading skeleton
- progress indicator

避免：

- 大幅弹跳
- 强烈 neon glow
- 连续旋转装饰
- 大面积闪烁渐变

建议 transition：

```css
transition: background-color 160ms ease, border-color 160ms ease, transform 160ms ease;
```

## 图片使用规范

ColorSnap 是美妆和色彩项目，必须用图片建立信任。

建议图片类型：

- 自然光人物肖像
- 美妆产品平铺图
- 色卡、布料、妆容细节
- 暖色、自然色、柔和对比

避免图片：

- 过度 AI 生成感
- 高饱和霓虹妆容
- 暗蓝科技背景
- 和美妆无关的抽象渐变图

图片处理：

- 统一圆角 8px 或 12px
- 使用自然阴影
- 保持肤色真实
- 不要重复同一张图片代表不同内容

## 文案风格

整体文案应该像专业美妆顾问，而不是技术系统。

语气：

- 清楚
- 温和
- 自信
- 不夸张

避免：

- “革命性”
- “改变人生”
- “100% accurate”
- “AI knows your beauty”

推荐文案：

```text
Find the colors that feel like you.
```

```text
Your palette favors warm, muted shades with soft contrast.
```

```text
These products were ranked using your season, undertone, saturation, and brightness profile.
```

```text
Try another photo in natural light for a more confident result.
```

## 设计 Token 落地建议

建议先创建或整理：

- `src/styles/tokens.ts` 或继续使用 `createGlobalStyle`
- 全局 CSS variables
- Button 基础样式
- Section 基础样式
- Card 基础样式
- Text utility 样式

如果继续使用 styled-components，可以先在 `App.tsx` 的 `GlobalStyle` 中替换 token。

后续可以提取：

```text
src/components/ui/Button.tsx
src/components/ui/Card.tsx
src/components/ui/Section.tsx
src/components/ui/Badge.tsx
src/components/ui/PageHeader.tsx
```

## 分阶段实施计划

### Phase A1: Design Tokens

目标：

- 替换全局颜色 token
- 统一 radius、shadow、spacing
- 移除大面积粉黄渐变作为默认视觉

涉及文件：

- `src/App.tsx`
- `src/index.css`
- 页面内 styled-components

验收标准：

- 页面整体从高饱和变成暖白、玫瑰、土调体系
- 按钮和卡片圆角统一
- 阴影明显减少

### Phase A2: Analysis Page Redesign

目标：

- 上传体验更现代、更可信
- 明确展示照片要求和 mock AI 状态

涉及文件：

- `src/pages/Analysis.tsx`

验收标准：

- 上传模块居中、清楚
- 预览图比例稳定
- 错误和 loading 状态统一

### Phase A3: Result Report Redesign

目标：

- 把结果页改成个人色彩报告
- 强化 season、confidence、palette、recommendation 结构

涉及文件：

- `src/pages/Result.tsx`
- `src/components/analysis/*`

验收标准：

- 第一屏能清楚看到 Warm Autumn 结论
- 属性、色卡、建议、商品分区清晰
- 商品推荐有 match score 和 reason

### Phase A4: Product Cards and Cart Polish

目标：

- 商品区更 boutique
- 购物车和商品推荐风格一致

涉及文件：

- `src/components/analysis/ProductRecommendations.tsx`
- `src/pages/ShoppingCart.tsx`

验收标准：

- 商品图片更突出
- 加购按钮风格统一
- 购物车不再像默认模板页面

### Phase A5: Home and Secondary Pages

目标：

- 首页和咨询页跟新风格统一
- 提升整体作品完成度

涉及文件：

- `src/pages/Home.tsx`
- `src/pages/Consultation.tsx`
- `src/pages/About.tsx`
- `src/pages/FAQ.tsx`
- `src/components/Header.tsx`
- `src/components/Footer.tsx`

验收标准：

- 首页有清楚品牌定位和 CTA
- Header/Footer 简洁现代
- 二级页面没有旧渐变和重阴影残留

## MVP 重构优先级

如果时间有限，优先做：

1. 全局 token
2. Result 页面
3. Analysis 页面
4. Product cards
5. Header

原因：

- Result 是最能体现 AI 产品价值的页面
- Analysis 是用户转化入口
- Product cards 直接影响商业完整度
- Header 改动小但对整体质感提升明显

## 可选增强

后续可以加：

- Palette strip 下载功能
- Save result
- Before/after color comparison
- Match score explanation tooltip
- Photo quality checklist
- Result share card
- Historical palette comparison

## 最终视觉判断标准

重构完成后，打开首页和结果页，应该满足：

- 5 秒内能看出这是一个现代美妆 AI 产品
- 页面不依赖大渐变制造视觉冲击
- 结果页像报告，而不是普通商品列表
- 色卡和商品图是视觉重点
- 移动端文字不拥挤、不溢出
- 所有按钮、卡片、标签使用同一套设计语言

## 推荐最终方向

ColorSnap 最适合的最终形态是：

```text
Modern beauty report first, shopping recommendation second.
```

也就是先让用户相信分析结果，再自然地推荐适合的商品。

这会比单纯做成“上传照片后推荐彩妆”的页面更高级，也更适合作为 portfolio project 展示产品设计、AI pipeline 和前后端工程能力。

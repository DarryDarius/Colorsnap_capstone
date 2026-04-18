# ColorSnap Next Development Roadmap

本文档用于指导 ColorSnap 下一阶段开发，将现有 MVP 从“功能可跑”提升到“视觉统一、流程稳定、产品感更强、适合答辩演示”的阶段。

## 1. 当前基线

当前项目已经具备完整主链路：

```text
Home -> Analysis Upload -> AI/mock Analysis -> Result Report -> Product Recommendations -> Product Detail -> Shopping Cart -> Demo Payment
```

已完成能力：

- React + TypeScript 前端页面结构完整。
- Express 后端已提供分析、商品、健康检查 API。
- AI 分析支持 mock mode 和 OpenAI live mode。
- 结果页可展示季型、属性、调色板、美妆推荐、穿搭建议、商品推荐。
- 商品详情页支持个性化匹配原因、相关商品和外部购买链接。
- 购物车和支付页已有基础模拟流程。

主要不足：

- 首页、购物车、支付、预约页面仍保留早期视觉风格，与 Analysis、Result、ProductDetail 不统一。
- 分析服务离线、OpenAI 配置缺失、分析失败等异常状态还不够产品化。
- 商品推荐筛选维度较少，缺少价格、retailer、排序说明。
- 购物车尚未直接展示外部购买入口。
- 商品目录数量较少，对不同季型的覆盖不足。

## 2. 开发目标

下一阶段目标不是盲目增加功能，而是优先保证核心用户链路：

- 顺：用户每一步都有清晰下一步。
- 稳：服务异常、接口失败、空状态都有明确反馈。
- 美：全站视觉语言统一，符合 modern beauty editorial 风格。
- 真：推荐、购物车、购买路径更像真实产品。
- 可演示：mock mode 下也能稳定完成答辩展示。

## 3. 设计系统原则

后续页面应优先复用 `src/App.tsx` 中已有全局 tokens：

```css
--bg-page
--bg-soft
--surface
--surface-warm
--surface-sage
--text-primary
--text-secondary
--text-muted
--brand-primary
--brand-primary-hover
--brand-primary-pale
--accent-sage
--accent-olive
--accent-gold
--border-soft
--shadow-soft
--radius-md
--radius-lg
```

视觉规范：

- 页面背景使用 warm off-white / soft rose / sage 等低饱和色。
- 卡片只用于商品、表单、订单 summary、结果模块等真实内容容器。
- 按钮统一 8px 左右圆角，不再使用过度胶囊形样式。
- 避免早期粉黄大渐变作为主视觉。
- 首页、购物车、支付页要和 Analysis、Result、ProductDetail 保持一致。
- 所有移动端布局必须保证文本不溢出、不遮挡、不被按钮挤压。

## 4. 推荐开发顺序

### Phase 1: 核心链路视觉统一

优先级最高，目标是让项目第一眼像完整产品。

#### 1.1 首页 UI 重做

目标页面：

- `src/pages/Home.tsx`

当前问题：

- 视觉仍是早期粉黄渐变风格。
- 与 `Analysis`、`Result`、`ProductDetail` 的 modern beauty editorial 风格不一致。
- 首屏产品信号不够高级。

改造内容：

- 重做 Hero：
  - 使用真实图片背景，例如 `/images/hero-bg-custom.jpg` 或 `/images/index1.jpg`。
  - H1 聚焦品牌或核心功能，例如 `ColorSnap` / `AI Personal Color Analysis`。
  - 主 CTA：`Start Analysis`。
  - 次 CTA：`Explore Consultations` 或 `See How It Works`。
- 增加用户流程模块：
  - Upload Photo
  - Get Color Report
  - Shop Personalized Picks
  - Book Expert Consultation
- 增加结果预览模块：
  - 展示 season、palette swatches、recommendation preview。
- 增加底部 CTA：
  - 引导用户回到 `/analysis`。

验收标准：

- 首屏 5 秒内能看懂产品用途。
- 首页视觉与新版 Analysis/ProductDetail 一致。
- 移动端首屏 CTA 不被遮挡。
- 所有按钮和卡片使用统一 tokens。

#### 1.2 购物车视觉升级

目标页面：

- `src/pages/ShoppingCart.tsx`

当前问题：

- 视觉风格较旧。
- 商品推荐上下文在购物车中弱化。
- 空购物车状态缺少引导。

改造内容：

- 页面结构改为：

```text
PageShell
  Header Section
  Cart Layout
    Cart Items
    Order Summary
```

- 商品项展示：
  - image
  - brand
  - name
  - category / shade
  - match reason
  - price
  - quantity stepper
  - remove action
  - view details link
  - buy externally link
- Summary 展示：
  - subtotal
  - estimated total
  - checkout button
  - continue shopping button
- 空状态：
  - `Your cart is ready for personalized picks.`
  - CTA: `Start Analysis`
  - CTA: `View Latest Result` if `lastAnalysisId` exists

验收标准：

- 商品、价格、数量、总价清晰。
- 空购物车不是死路。
- 和商品详情页视觉统一。
- 移动端购物车项目纵向排列合理。

#### 1.3 支付页视觉升级

目标页面：

- `src/pages/Payment.tsx`

当前问题：

- 仍是早期表单风格。
- demo payment 属性不够明确。
- 成功状态较简单。

改造内容：

- 页面改成 checkout layout：

```text
Checkout Page
  Left: Contact + Payment Form
  Right: Order Summary
```

- 显示 demo 说明：

```text
Demo checkout - no real payment will be processed.
```

- 增加输入体验：
  - card number 分组显示。
  - expiry 限制 `MM/YY`。
  - cvv 限制 3-4 位数字。
- 成功后显示完整 confirmation state：
  - confirmation message
  - ordered items
  - back to home
  - start another analysis

验收标准：

- 用户清楚知道是 demo checkout。
- 支付成功后购物车被清空。
- 成功状态不是短暂提示，而是完整确认视图。
- 移动端左右两栏自动变单栏。

### Phase 2: 分析流程容错优化

目标是保证答辩时即使后端、OpenAI、图片输入出现问题，页面也不会尴尬卡死。

#### 2.1 Analysis 服务状态优化

目标页面：

- `src/pages/Analysis.tsx`
- `src/services/api.ts`

状态分类：

```text
openai  -> Live OpenAI analysis
mock    -> Demo analysis mode
offline -> Analysis service offline
unknown -> Checking analysis service
```

改造内容：

- health check 失败时显示 offline 状态。
- offline 时提示：

```text
Analysis service is offline. Start the backend with npm.cmd run backend:dev.
```

- offline 时禁用 `Start Analysis`，或显示明确错误说明。
- mock mode 时显示：

```text
Demo mode is active. Results are deterministic for stable local testing.
```

验收标准：

- 后端关闭时 UI 明确显示 offline。
- 用户不会看到晦涩技术错误。
- mock/openai 状态可被用户和老师识别。

#### 2.2 Result 失败和重试状态优化

目标页面：

- `src/pages/Result.tsx`

改造内容：

- 分析失败时提供：
  - `Try Again`
  - `Upload Another Photo`
  - 错误说明
- 无 analysis id 时提供：
  - `Start New Analysis`
- polling 超时或接口失败时提供：
  - retry fetch
  - back to upload

验收标准：

- `failed`、`not found`、`offline` 都有下一步。
- 用户不会停留在无法操作的错误页面。

### Phase 3: 商品推荐产品化

目标是让推荐区更像真实 personalization commerce 产品。

#### 3.1 商品推荐筛选增强

目标组件：

- `src/components/analysis/ProductRecommendations.tsx`

新增筛选：

- Category tabs:
  - All
  - Lipstick
  - Blush
  - Eyeshadow
- Price range:
  - All prices
  - Under $10
  - $10-$25
  - $25+
- Retailer:
  - All retailers
  - Sephora
  - Ulta Beauty
  - Amazon
- Sort:
  - Best Match
  - Price Low to High
  - Price High to Low

推荐说明：

```text
Sorted by palette match, undertone fit, saturation, brightness, and contrast support.
```

实现建议：

- 第一版可在前端完成筛选排序。
- 使用当前后端返回的 `score` 作为 `Best Match`。
- 后续商品数量变大后，再迁移到后端 query。

验收标准：

- 筛选组合可正常工作。
- 筛选后空状态清晰。
- 默认排序保持 best match。
- 移动端筛选控件紧凑，不挤压商品卡片。

#### 3.2 购物车支持外部购买

目标页面：

- `src/pages/ShoppingCart.tsx`
- `src/utils/cart.ts`
- `src/utils/formatters.ts`

当前数据基础：

`CartItem` 已包含：

```ts
retailerName?: string;
purchaseUrl?: string;
```

改造内容：

- 每个购物车商品显示：

```text
Buy from Sephora
Buy from Ulta Beauty
Buy from Amazon
```

- 使用 `isRealExternalUrl(item.purchaseUrl)` 判断是否显示。
- 无外部链接时隐藏按钮。
- 增加 `View Details` 链接回商品详情页。
- Summary 下方说明：

```text
ColorSnap helps you build a personalized cart. Purchases are completed through trusted retailers.
```

验收标准：

- 有真实外链的商品可直接跳外部购买。
- 没有真实链接时不会显示坏按钮。
- 外部购买和 demo checkout 不混淆。

#### 3.3 商品目录扩充

目标文件：

- `backend/src/data/products.json`

目标数量：

- 从当前约 9 个商品扩展到 20-30 个商品。

重点覆盖 season：

- Warm Autumn
- Soft Autumn
- Light Spring
- Cool Summer
- Deep Winter
- Bright Spring

每个重点 season 推荐至少覆盖：

- 2 lipstick
- 1 blush
- 1 eyeshadow

商品数据字段保持一致：

```json
{
  "id": "lip_001",
  "slug": "example-product",
  "name": "Product Name",
  "brand": "Brand",
  "category": "lipstick",
  "shade": "Shade Name",
  "image": "/images/pd1.jpg",
  "gallery": ["/images/pd1.jpg"],
  "url": "/products/example-product",
  "price": "25.00",
  "currency": "USD",
  "seasons": ["Warm Autumn"],
  "undertones": ["warm"],
  "saturation": "muted",
  "brightness": "medium",
  "contrast_support": ["medium"],
  "finish": "satin",
  "intensity": "medium",
  "use_cases": ["daily lip"],
  "ingredients_highlights": ["buildable color"],
  "description": "Long description.",
  "short_description": "Short description.",
  "why_it_matches_template": "Why it matches.",
  "retailer": {
    "name": "Sephora",
    "url": "https://example.com",
    "affiliate": false
  },
  "active": true
}
```

验收标准：

- 每个重点 season 至少能返回 4-6 个合理推荐。
- 商品图片路径有效。
- 外部购买链接有效。
- 不同 season 的推荐有明显差异。

## 5. API 列表

### 5.1 当前已实现 API

#### GET `/api/v1/health`

用途：

- 检查后端是否在线。
- 获取当前 AI 模式。

Response:

```json
{
  "status": "ok",
  "ai_mode": "mock",
  "timestamp": "2026-04-17T00:00:00.000Z"
}
```

前端使用：

- `src/pages/Analysis.tsx`
- `src/services/api.ts`

后续建议：

- 前端将请求失败映射为 `offline` 状态。

#### POST `/api/v1/analyses`

用途：

- 上传图片并创建分析任务。

Request:

```text
Content-Type: multipart/form-data

image: File
source: web
```

Response:

```json
{
  "analysis_id": "ana_...",
  "status": "processing",
  "created_at": "2026-04-17T00:00:00.000Z",
  "poll_url": "/api/v1/analyses/ana_..."
}
```

可能错误：

```json
{
  "error": {
    "code": "INVALID_IMAGE",
    "message": "Unsupported image format. Please upload a JPG, PNG, or WEBP file."
  }
}
```

前端使用：

- `src/pages/Analysis.tsx`
- `src/services/api.ts`

#### GET `/api/v1/analyses/:analysis_id`

用途：

- 获取分析状态或完整结果。

Processing Response:

```json
{
  "analysis_id": "ana_...",
  "status": "processing",
  "created_at": "2026-04-17T00:00:00.000Z"
}
```

Completed Response:

```json
{
  "analysis_id": "ana_...",
  "status": "completed",
  "season_result": {
    "primary": "Warm Autumn",
    "secondary": "Soft Autumn",
    "confidence": 0.78
  },
  "attributes": {
    "undertone": "warm",
    "brightness": "medium-low",
    "saturation": "muted",
    "contrast": "medium"
  },
  "recommended_palette": [],
  "beauty_recommendations": {},
  "fashion_recommendations": {},
  "products": []
}
```

Failed Response:

```json
{
  "analysis_id": "ana_...",
  "status": "failed",
  "error": {
    "code": "MODEL_ERROR",
    "message": "Analysis could not be completed."
  }
}
```

前端使用：

- `src/pages/Result.tsx`
- `src/services/api.ts`

#### GET `/api/v1/products/recommendations`

用途：

- 根据 season 和 attributes 获取商品推荐。

Query:

```text
season=Warm Autumn
undertone=warm
brightness=medium-low
saturation=muted
category=lipstick
limit=6
```

Response:

```json
{
  "items": [
    {
      "id": "lip_001",
      "slug": "clinique-almost-lipstick-black-honey",
      "name": "Almost Lipstick in Black Honey",
      "brand": "Clinique",
      "category": "lipstick",
      "shade": "Black Honey - Universal Berry",
      "image": "/images/pd1.jpg",
      "purchase_url": "https://www.sephora.com/...",
      "price": "25.00",
      "currency": "USD",
      "badges": ["Soft Autumn", "Warm Undertone"],
      "reason": "The transparent berry tone adds depth...",
      "score": 72
    }
  ]
}
```

当前使用情况：

- 分析完成时后端已直接把推荐商品写入 analysis result。
- 此 API 可作为后续单独刷新推荐或筛选时使用。

#### GET `/api/v1/products/:slug`

用途：

- 获取商品详情。

Optional Query:

```text
analysis_id=ana_...
```

说明：

- 如果传入 `analysis_id` 且该商品存在于分析推荐中，后端会返回个性化 `why_it_matches_you` 和 badges。

Response:

```json
{
  "id": "lip_001",
  "slug": "clinique-almost-lipstick-black-honey",
  "name": "Almost Lipstick in Black Honey",
  "brand": "Clinique",
  "category": "lipstick",
  "shade": "Black Honey - Universal Berry",
  "image": "/images/pd1.jpg",
  "gallery": ["/images/pd1.jpg"],
  "price": "25.00",
  "currency": "USD",
  "description": "A sheer berry lipstick-balm tint...",
  "short_description": "A sheer berry tint for soft depth and everyday polish.",
  "why_it_matches_you": "The transparent berry tone adds depth...",
  "best_for": ["Soft Autumn", "Warm Undertone"],
  "retailer": {
    "name": "Sephora",
    "url": "https://www.sephora.com/...",
    "affiliate": false
  },
  "related_products": []
}
```

前端使用：

- `src/pages/ProductDetail.tsx`
- `src/services/api.ts`

### 5.2 建议后续新增 API

这些不是当前阶段必须，但适合后续从 MVP 走向完整产品。

#### GET `/api/v1/products`

用途：

- 统一商品列表查询，支持后端筛选和排序。

Query:

```text
category=lipstick
season=Warm Autumn
undertone=warm
retailer=Sephora
min_price=10
max_price=25
sort=best_match
limit=12
offset=0
```

建议 Response:

```json
{
  "items": [],
  "total": 30,
  "limit": 12,
  "offset": 0
}
```

适用时机：

- 商品目录扩展到 30+ 后。
- 前端筛选逻辑开始变复杂后。

#### POST `/api/v1/bookings`

用途：

- 保存专家预约请求。

Request:

```json
{
  "expert_id": "ex1",
  "name": "User Name",
  "email": "user@example.com",
  "phone": "1234567890",
  "date": "2026-04-20",
  "time": "10:00",
  "duration": "30",
  "message": "I want help with Warm Autumn styling."
}
```

Response:

```json
{
  "booking_id": "book_...",
  "status": "requested",
  "created_at": "2026-04-17T00:00:00.000Z"
}
```

适用时机:

- 当需要让预约不只是前端模拟时。

#### POST `/api/v1/orders`

用途：

- 保存 demo checkout 订单。

Request:

```json
{
  "email": "user@example.com",
  "items": [],
  "total": "58.00",
  "demo": true
}
```

Response:

```json
{
  "order_id": "ord_...",
  "status": "confirmed",
  "demo": true,
  "created_at": "2026-04-17T00:00:00.000Z"
}
```

适用时机：

- 当希望支付页成功状态更真实，或需要展示订单历史时。

#### GET `/api/v1/analyses`

用途：

- 获取分析历史。

Query:

```text
limit=10
```

Response:

```json
{
  "items": [
    {
      "analysis_id": "ana_...",
      "status": "completed",
      "primary_season": "Warm Autumn",
      "created_at": "2026-04-17T00:00:00.000Z"
    }
  ]
}
```

适用时机：

- 引入数据库后。
- 增加用户历史页面时。

## 6. 前端模块任务清单

### Home

文件：

- `src/pages/Home.tsx`

任务：

- 移除早期粉黄渐变主视觉。
- 使用统一 tokens。
- 增加流程预览。
- 增加 sample result preview。
- 保持主 CTA 指向 `/analysis`。

### ShoppingCart

文件：

- `src/pages/ShoppingCart.tsx`
- `src/utils/cart.ts`
- `src/utils/formatters.ts`

任务：

- 重做页面结构和视觉。
- 增加 external buy link。
- 增加 view details link。
- 优化 empty state。
- 保持 localStorage cart 行为不变。

### Payment

文件：

- `src/pages/Payment.tsx`

任务：

- 重做 checkout layout。
- 添加 demo checkout notice。
- 增加成功 confirmation view。
- 优化表单输入格式。

### Analysis

文件：

- `src/pages/Analysis.tsx`
- `src/services/api.ts`

任务：

- 新增 offline 状态。
- 区分 openai/mock/offline/unknown。
- 后端离线时提供明确下一步。
- 分析提交错误更加具体。

### Result

文件：

- `src/pages/Result.tsx`

任务：

- failed 状态增加 retry。
- not found 状态增加回到 upload。
- polling 接口失败时提示用户下一步。

### ProductRecommendations

文件：

- `src/components/analysis/ProductRecommendations.tsx`

任务：

- 增加 category tabs。
- 增加 price range。
- 增加 retailer filter。
- 增加 sort。
- 增加推荐排序说明。

## 7. 后端模块任务清单

### Product Catalog

文件：

- `backend/src/data/products.json`
- `backend/src/schemas/productSchema.ts`
- `backend/src/services/productRecommendationService.ts`

任务：

- 扩充商品目录到 20-30 个。
- 保证 season/undertone/saturation/brightness/contrast_support 字段完整。
- 验证商品 schema 不报错。
- 确保推荐排序对不同 season 有明显差异。

### Health API

文件：

- `backend/src/routes/health.ts`
- `backend/src/services/aiAnalysisService.ts`

任务：

- 当前可以保留。
- 后续可增加 `model`、`openai_configured` 字段，但不要暴露密钥。

建议扩展 Response：

```json
{
  "status": "ok",
  "ai_mode": "mock",
  "model": "gpt-4.1-mini",
  "openai_configured": false,
  "timestamp": "2026-04-17T00:00:00.000Z"
}
```

### Optional Persistence

后续如果要从 demo 变成更完整产品，可新增：

- SQLite 或 MongoDB。
- 保存 analyses。
- 保存 bookings。
- 保存 demo orders。

当前阶段不是必须。

## 8. 测试和验证清单

每完成一个阶段后运行：

```bash
npm.cmd run backend:build
npm.cmd run build
npm.cmd test -- --watchAll=false
```

建议新增测试：

- `Home` renders main CTA。
- `ShoppingCart` renders empty state。
- `ShoppingCart` quantity update works。
- `Payment` renders demo notice。
- `ProductRecommendations` filters by category。
- `ProductRecommendations` filters by price。
- `ProductRecommendations` sorts by price。
- 后端 `GET /api/v1/health` returns status。
- 后端 product recommendation service returns expected category。

手动验收流程：

```text
1. npm.cmd run backend:dev
2. npm.cmd start
3. Open http://localhost:3000
4. Go Home
5. Start Analysis
6. Upload JPG/PNG/WEBP under 5MB
7. Wait for Result
8. Add recommended product to cart
9. Open Product Detail
10. Click external buy link
11. Return to Cart
12. Update quantity
13. Open Payment
14. Complete demo checkout
15. Confirm cart is cleared
```

异常流程：

```text
1. Stop backend
2. Open /analysis
3. Confirm service offline message appears
4. Try invalid file type
5. Confirm validation error appears
6. Open /result without id
7. Confirm user can return to upload
```

## 9. 建议提交拆分

推荐每个阶段单独提交，便于回滚和答辩讲解：

```text
feat: refresh home page editorial design
feat: redesign shopping cart and external purchase links
feat: refresh demo checkout experience
feat: improve analysis service error states
feat: add recommendation filters and sorting
data: expand product recommendation catalog
test: cover cart and recommendation filtering
```

## 10. 最终完成标准

完成本 roadmap 后，ColorSnap 应达到：

- 全站主要页面视觉统一。
- 主用户链路完整且顺滑。
- 后端关闭、AI 失败、结果缺失时都有专业错误状态。
- 商品推荐有筛选、排序、解释和外部购买路径。
- 商品目录能支持多个代表性季型。
- mock mode 下可以稳定完成完整答辩演示。

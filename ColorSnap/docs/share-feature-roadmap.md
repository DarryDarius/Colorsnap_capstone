# ColorSnap Share Feature Roadmap

本文档定义 ColorSnap 的分享功能成熟方案：用户可以保存照片检测结果，生成分享卡片，并通过系统分享、下载图片、复制链接、二维码等方式分享到 Instagram、微信、朋友圈、聊天软件和其他主流平台。

## 1. 产品目标

分享功能不应只是一个简单的 `Share` 按钮，而应覆盖完整结果传播链路：

- Save Result: 用户可以保存本次检测结果。
- Generate Share Card: 生成一张适合社交媒体传播的结果卡片。
- Native Share: 在移动端调用系统分享面板。
- Download Image: 下载分享卡片，适合 Instagram、小红书、朋友圈等平台手动发布。
- Copy Link: 复制结果链接，适合桌面端和不支持 Web Share API 的浏览器。
- QR Code: 生成二维码，适合微信和桌面到手机的传播场景。
- Shared Result Page: 提供 `/share/:shareId` 公共或半公开结果页。

推荐最终入口位于 `Result` 页面：

```text
Share Your Color Report
[Save Result] [Share Result] [Download Card] [Copy Link] [QR Code]
```

## 2. 主流平台现实限制

### 2.1 Web Share API

现代浏览器可通过 Web Share API 调用系统原生分享面板：

```ts
await navigator.share({
  title,
  text,
  url,
  files
});
```

关键限制：

- 需要 HTTPS 或安全上下文。
- 必须由用户点击等 user activation 触发。
- 文件分享前应使用 `navigator.canShare({ files })` 检测。
- 分享目标由操作系统决定，网页无法强制指定 Instagram、微信等具体 App。
- 桌面浏览器支持不完全，因此必须有 fallback。

### 2.2 Instagram

普通 Web App 不能稳定地直接发帖到用户 Instagram feed。

推荐做法：

```text
生成 PNG 分享卡片 -> Web Share API -> 用户选择 Instagram
```

或者：

```text
下载 PNG 分享卡片 -> 用户手动发布 Instagram
```

不建议写成：

```text
Share directly to Instagram
```

建议按钮文案：

```text
Share Card
Download for Instagram
```

如果未来要做程序化发布，需要：

- Instagram Graph API。
- Business/Creator account。
- OAuth。
- Meta App Review。
- 内容发布权限。

这不适合作为当前普通用户分享 MVP。

### 2.3 微信 / 朋友圈

微信网页分享分两类：

1. 微信内置浏览器：
   - 使用微信 JS-SDK 配置分享标题、描述、缩略图、链接。
   - 用户仍然通过微信右上角菜单完成分享。
   - 网页按钮不能可靠地直接弹出朋友圈分享。

2. 普通浏览器：
   - 无法可靠直接唤起微信分享。
   - 应提供二维码、复制链接、下载图片。

推荐策略：

```text
微信浏览器内：配置 JS-SDK share metadata
其他浏览器：QR Code + Copy Link + Download Share Card
```

## 3. 推荐总体架构

分享功能分四层：

```text
Result Data
  -> Saved Result
  -> Share Record
  -> Share Card Image
  -> Share Actions
```

### 3.1 Result Data

来源：

- `GET /api/v1/analyses/:analysis_id`

已有内容：

- primary season
- secondary season
- confidence
- attributes
- summary
- recommended palette
- beauty recommendations
- fashion recommendations
- product recommendations

### 3.2 Saved Result

用户主动保存分析结果。

建议后端记录：

```ts
type SavedResult = {
  saved_result_id: string;
  analysis_id: string;
  title: string;
  primary_season: string;
  secondary_season: string | null;
  confidence?: number;
  palette: Array<{
    name: string;
    hex: string;
    use_case: string;
  }>;
  summary: string;
  include_photo: boolean;
  created_at: string;
};
```

建议 API：

```text
POST /api/v1/saved-results
GET  /api/v1/saved-results/:saved_result_id
```

### 3.3 Share Record

用于创建可复制、可分享、可二维码访问的结果链接。

建议后端记录：

```ts
type ShareRecord = {
  share_id: string;
  analysis_id: string;
  saved_result_id?: string;
  visibility: 'public' | 'unlisted';
  title: string;
  description: string;
  primary_season: string;
  palette: Array<{
    name: string;
    hex: string;
  }>;
  image_url?: string;
  include_photo: boolean;
  created_at: string;
  expires_at?: string;
};
```

建议 API：

```text
POST /api/v1/shares
GET  /api/v1/shares/:share_id
```

建议前端页面：

```text
/share/:shareId
```

### 3.4 Share Card Image

生成适合社交媒体传播的图片。

推荐尺寸：

```text
1080 x 1350    Instagram portrait / feed
1080 x 1920    Stories / 微信朋友圈
1200 x 630     Open Graph preview
```

MVP 先做：

```text
1080 x 1350 share card
```

分享卡内容：

```text
ColorSnap
Warm Autumn
You look best in warm, muted, earthy tones.

Palette:
Terracotta / Camel / Olive / Warm Coral / Bronze

Beauty picks:
Brick Red Lipstick
Apricot Blush
Bronze Eyeshadow

colorsnap.app/share/shr_xxxxxx
```

## 4. 前端模块设计

建议新增文件：

```text
src/components/share/ShareResultPanel.tsx
src/components/share/ShareCard.tsx
src/components/share/QRCodeModal.tsx
src/pages/SharedResult.tsx
src/utils/share.ts
```

### 4.1 ShareResultPanel

位置：

```text
src/components/share/ShareResultPanel.tsx
```

职责：

- 展示保存和分享操作。
- 管理 loading/error/success 状态。
- 调用保存结果 API。
- 调用创建分享链接 API。
- 调用生成分享卡片工具。
- 调用 native share / download / copy link / QR code。

Props:

```ts
type ShareResultPanelProps = {
  analysis: AnalysisResult;
  uploadedPhoto?: string | null;
};
```

状态：

```ts
type SharePanelState = {
  isSaving: boolean;
  isGeneratingCard: boolean;
  savedResultId?: string;
  shareId?: string;
  shareUrl?: string;
  statusMessage?: string;
  errorMessage?: string;
};
```

主要按钮：

```text
Save Result
Share Result
Download Card
Copy Link
QR Code
```

### 4.2 ShareCard

位置：

```text
src/components/share/ShareCard.tsx
```

职责：

- 渲染固定比例的分享卡。
- 用于屏幕预览和导出 PNG。
- 不直接处理保存/分享逻辑。

Props:

```ts
type ShareCardProps = {
  analysis: AnalysisResult;
  shareUrl?: string;
  uploadedPhoto?: string | null;
  includePhoto?: boolean;
};
```

设计要求：

- 固定视觉比例，建议 `aspect-ratio: 4 / 5`。
- 适配导出尺寸。
- 使用 ColorSnap design tokens。
- 不默认展示用户照片，除非 `includePhoto = true`。
- 展示品牌、season、summary、palette、top product picks。

### 4.3 QRCodeModal

位置：

```text
src/components/share/QRCodeModal.tsx
```

职责：

- 展示分享链接二维码。
- 提供复制链接按钮。
- 提供关闭按钮。

实现选择：

- MVP 可使用轻量库 `qrcode` 或 `qrcode.react`。
- 如果不想加依赖，先只做 Copy Link，二维码放 Phase 3。

### 4.4 SharedResult Page

位置：

```text
src/pages/SharedResult.tsx
```

路由：

```text
/share/:shareId
```

职责：

- 根据 `shareId` 获取分享结果。
- 展示轻量公开结果。
- 提供 CTA：`Create your own ColorSnap analysis`。

页面内容：

- ColorSnap brand
- primary season
- short summary
- palette swatches
- product recommendation highlights
- optional share card image
- CTA to `/analysis`

不展示：

- email
- order
- booking
- full uploaded photo unless user explicitly included it
- private analysis internals

### 4.5 share.ts

位置：

```text
src/utils/share.ts
```

建议工具函数：

```ts
export const createPngFromElement = async (
  element: HTMLElement
): Promise<Blob>;

export const shareWithNativeSheet = async (
  options: {
    title: string;
    text: string;
    url?: string;
    file?: File;
  }
): Promise<'shared' | 'unsupported' | 'cancelled'>;

export const downloadBlob = (
  blob: Blob,
  filename: string
) => void;

export const copyToClipboard = async (
  value: string
) => Promise<void>;
```

推荐依赖：

```bash
npm install html-to-image
```

用于从 DOM 生成 PNG。

## 5. 后端 API 设计

### 5.1 POST `/api/v1/saved-results`

用途：

- 保存用户分析结果。

Request:

```json
{
  "analysis_id": "ana_...",
  "include_photo": false
}
```

Response:

```json
{
  "saved_result_id": "save_20260418_xxxxxx",
  "analysis_id": "ana_...",
  "primary_season": "Warm Autumn",
  "created_at": "2026-04-18T00:00:00.000Z"
}
```

错误：

```json
{
  "error": {
    "code": "ANALYSIS_NOT_FOUND",
    "message": "Analysis was not found."
  }
}
```

### 5.2 GET `/api/v1/saved-results/:saved_result_id`

用途：

- 获取保存结果。

Response:

```json
{
  "saved_result_id": "save_...",
  "analysis_id": "ana_...",
  "primary_season": "Warm Autumn",
  "summary": "You look best in warm, muted, earthy tones.",
  "palette": [
    {
      "name": "Terracotta",
      "hex": "#C96A4A",
      "use_case": "lipstick"
    }
  ],
  "include_photo": false,
  "created_at": "2026-04-18T00:00:00.000Z"
}
```

### 5.3 POST `/api/v1/shares`

用途：

- 创建分享记录和分享链接。

Request:

```json
{
  "analysis_id": "ana_...",
  "saved_result_id": "save_...",
  "include_photo": false,
  "share_card_image": "data:image/png;base64,..."
}
```

MVP 可以先不上传 `share_card_image`，只保存分析摘要和 palette。

Response:

```json
{
  "share_id": "shr_20260418_xxxxxx",
  "share_url": "/share/shr_20260418_xxxxxx",
  "title": "My ColorSnap Result: Warm Autumn",
  "description": "Warm, muted, earthy tones with soft contrast.",
  "created_at": "2026-04-18T00:00:00.000Z"
}
```

### 5.4 GET `/api/v1/shares/:share_id`

用途：

- 获取公开/半公开分享页数据。

Response:

```json
{
  "share_id": "shr_...",
  "title": "My ColorSnap Result: Warm Autumn",
  "description": "Warm, muted, earthy tones with soft contrast.",
  "primary_season": "Warm Autumn",
  "palette": [
    {
      "name": "Terracotta",
      "hex": "#C96A4A"
    }
  ],
  "image_url": null,
  "created_at": "2026-04-18T00:00:00.000Z"
}
```

## 6. 数据存储方案

当前项目已经使用：

```text
backend/.data/analyses.json
backend/.data/bookings.json
backend/.data/orders.json
```

分享功能可以沿用本地 JSON 持久化：

```text
backend/.data/saved-results.json
backend/.data/shares.json
```

服务层扩展：

```text
backend/src/services/storageService.ts
```

新增方法：

```ts
createSavedResultRecord(...)
getSavedResultRecord(...)
createShareRecord(...)
getShareRecord(...)
getStoredShareCount()
```

生产级可迁移到：

- SQLite
- PostgreSQL
- MongoDB
- Cloud object storage for images

## 7. 隐私和安全策略

该功能涉及用户照片和个人外观分析，必须默认保护隐私。

默认策略：

```text
include_photo = false
```

用户必须主动选择：

```text
Include my uploaded photo in the share card
```

分享页默认只展示：

- season
- palette
- summary
- top recommendations

不默认展示：

- uploaded photo
- email
- booking details
- orders
- detailed analysis internals

建议 UI 提示：

```text
Your shared result will not include your uploaded photo unless you choose to include it.
```

建议后续增强：

- Unlisted link by default。
- Expiring share links。
- Delete share record。
- Regenerate share link。
- Hide product recommendations option。

## 8. 分享流程设计

### 8.1 Native Share 优先流程

```text
User clicks Share Result
  -> ensure share record exists
  -> generate PNG card
  -> create File from PNG Blob
  -> if navigator.canShare({ files: [file] })
       share image + text + link
     else if navigator.share
       share text + link
     else
       copy link and show fallback actions
```

伪代码：

```ts
const data = {
  title: 'My ColorSnap Result',
  text: 'I discovered my personal color palette with ColorSnap.',
  url: shareUrl,
  files: [shareCardFile]
};

if (navigator.canShare?.({ files: [shareCardFile] })) {
  await navigator.share(data);
} else if (navigator.share) {
  await navigator.share({
    title: data.title,
    text: data.text,
    url: data.url
  });
} else {
  await navigator.clipboard.writeText(shareUrl);
}
```

### 8.2 Download fallback

```text
User clicks Download Card
  -> generate PNG Blob
  -> create object URL
  -> trigger <a download>
```

适合：

- Instagram desktop
- 微信朋友圈手动发图
- 小红书
- PPT/portfolio

### 8.3 Copy link fallback

```text
User clicks Copy Link
  -> ensure share record exists
  -> navigator.clipboard.writeText(shareUrl)
```

适合：

- desktop browser
- unsupported Web Share API
- chat apps

### 8.4 QR Code fallback

```text
User clicks QR Code
  -> ensure share record exists
  -> show QR modal with shareUrl
```

适合：

- 微信扫码
- desktop to mobile
- presentation demo

## 9. 分期开发计划

### Phase 1: MVP Share Card

目标：

- 用户可以在 Result 页面生成并下载分享卡。
- 用户可以用系统分享面板分享图片或链接。
- 用户可以复制链接。

任务：

- Add `ShareCard`.
- Add `ShareResultPanel`.
- Add `src/utils/share.ts`.
- Add buttons to `Result.tsx`.
- Use front-end DOM-to-PNG export.
- Fallback to download/copy link.

不做：

- 微信 JS-SDK。
- Instagram Graph API。
- QR code。
- 后端图片存储。

验收：

- Completed result 页面出现分享区。
- Download Card 能下载 PNG。
- Mobile supported browser 能调起 native share。
- Unsupported browser 能 copy link。
- 不默认包含用户照片。

### Phase 2: Saved Result and Share Link API

目标：

- 用户可以保存结果。
- 用户可以生成 `/share/:shareId` 链接。
- 分享链接可以被复制和打开。

任务：

- Add backend `saved-results` route/controller.
- Add backend `shares` route/controller.
- Extend `storageService`.
- Add frontend API methods.
- Add `SharedResult.tsx`.
- Add route in `App.tsx`.

验收：

- `POST /api/v1/saved-results` returns saved result id。
- `POST /api/v1/shares` returns share id and share url。
- `/share/:shareId` renders public result。
- Shared result page does not expose private fields。

### Phase 3: QR Code and Platform Polish

目标：

- 微信和桌面分享体验更完整。

任务：

- Add QR code modal.
- Add share link preview.
- Add `Download for Instagram` wording.
- Add `Copy WeChat Link` or `Scan with WeChat` helper text.

验收：

- Desktop users can scan QR code.
- WeChat users understand how to share.
- Instagram users can download share card.

### Phase 4: WeChat JS-SDK Integration

目标：

- 在微信内置浏览器中配置分享 metadata。

任务：

- Add backend endpoint to sign JS-SDK config:

```text
POST /api/v1/wechat/js-sdk-signature
```

- Add frontend WeChat detection.
- Load/configure WeChat JS-SDK.
- Set:

```text
updateAppMessageShareData
updateTimelineShareData
```

要求：

- 需要微信公众号/开放平台配置。
- 需要域名备案和 JS 安全域名配置。
- 本地开发只能 mock。

### Phase 5: Production Sharing

目标：

- 完整生产级分享系统。

任务：

- Account system.
- User-owned saved results.
- Cloud image storage.
- Expiring share links.
- Delete share links.
- Share analytics.
- Server-side Open Graph image generation.
- Social preview meta tags.

## 10. 测试计划

### Frontend tests

建议新增：

```text
src/components/share/ShareResultPanel.test.tsx
src/components/share/ShareCard.test.tsx
src/pages/SharedResult.test.tsx
src/utils/share.test.ts
```

覆盖：

- Share panel renders for completed analysis.
- Save Result button calls API.
- Download Card calls image export.
- Copy Link writes to clipboard.
- Native share fallback works when unsupported.
- Include photo toggle defaults to false.
- SharedResult page renders public share data.

### Backend tests

建议新增：

```text
backend/src/controllers/shareController.test.ts
backend/src/services/storageService.test.ts
```

覆盖：

- Saved result creation validates analysis id.
- Share record creation validates completed analysis.
- Share fetch returns expected public fields.
- Private fields are not exposed.

### Manual QA

```text
1. Start backend.
2. Start frontend.
3. Upload photo and complete analysis.
4. Click Save Result.
5. Click Download Card.
6. Open downloaded PNG.
7. Click Share Result on mobile browser.
8. Copy Link.
9. Open copied share link in another tab.
10. Confirm uploaded photo is not included by default.
11. Toggle include photo and regenerate card.
12. Stop backend and test fallback behavior.
```

## 11. Recommended First Implementation

对当前 ColorSnap 项目，建议先实现：

```text
Phase 1 + Phase 2 minimal
```

也就是：

- `ShareCard`
- `ShareResultPanel`
- `Download Card`
- `Native Share`
- `Copy Link`
- `POST /api/v1/shares`
- `GET /api/v1/shares/:share_id`
- `/share/:shareId`

暂不做：

- Instagram Graph API。
- 微信 JS-SDK。
- 用户账号系统。
- 云存储。

理由：

- 最适合 Capstone demo。
- 平台限制风险低。
- 用户体验成熟。
- 后续可以自然扩展到微信二维码和 Open Graph。

## 12. Suggested Commits

```text
docs: add share feature roadmap
feat: add share card and result sharing panel
feat: add share record API and public share page
feat: add qr code fallback for shared results
test: cover share card and share API flows
```

## 13. Final Success Criteria

完成后，ColorSnap 分享功能应达到：

- 用户可以保存检测结果。
- 用户可以生成漂亮的分享卡片。
- 用户可以下载图片用于 Instagram/朋友圈。
- 支持系统原生分享面板。
- 不支持原生分享时可以复制链接。
- 分享链接能打开独立结果页。
- 默认不公开用户上传照片。
- 微信/桌面场景有二维码或复制链接 fallback。
- 方案不依赖高风险平台直连 API。

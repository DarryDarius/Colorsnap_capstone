# AI Color Analysis Integration Plan

## Purpose

This document tracks the recommended AI integration approach for the ColorSnap project.

The current direction is:

- Use a multimodal model to analyze uploaded selfies
- Return structured JSON from the backend
- Render text conclusions, palette colors, and product recommendations in the React app
- Use rule-based product recommendation first
- Keep virtual try-on as a Beta add-on, not the core result

This plan is optimized for:

- A personal portfolio project
- Strong resume positioning
- Industry-standard product architecture
- Reasonable implementation scope

## Product Scope

### Core User Flow

1. User uploads a selfie on the analysis page.
2. Backend validates the image and sends it to a multimodal model.
3. Model returns structured analysis fields.
4. Backend validates and normalizes the result.
5. Backend generates product recommendations using deterministic rules.
6. Frontend shows:
   - primary and secondary season
   - undertone / brightness / saturation / contrast
   - recommended palette
   - makeup advice
   - fashion advice
   - product recommendations with links
7. User can:
   - retry with another photo
   - save the result
   - add products to cart
   - optionally try Beta virtual try-on later

### Primary Result Design

The main output should not be a generated "after makeup" image.

The primary result should be an explainable report:

- structured color analysis
- human-readable summary
- palette recommendations
- beauty and fashion guidance
- shopping recommendations

Virtual try-on can be added later as a secondary feature.

## API Design

All backend routes should use the `/api/v1` prefix.

### `POST /api/v1/analyses`

Create a new analysis from an uploaded selfie.

#### Request

Content type:

`multipart/form-data`

Fields:

- `image`: required file, supports `jpg`, `png`, `webp`
- `user_id`: optional string
- `client_session_id`: optional string
- `source`: optional string, default `web`

#### Success Response

Status:

`201 Created`

```json
{
  "analysis_id": "ana_20260408_001",
  "status": "processing",
  "created_at": "2026-04-08T22:10:00Z",
  "poll_url": "/api/v1/analyses/ana_20260408_001"
}
```

#### Error Responses

- `400` invalid request
- `413` file too large
- `422` image cannot be analyzed
- `500` internal error

```json
{
  "error": {
    "code": "INVALID_IMAGE",
    "message": "Unsupported image format."
  }
}
```

### `GET /api/v1/analyses/:analysis_id`

Fetch analysis status or completed result.

#### Completed Response

Status:

`200 OK`

```json
{
  "analysis_id": "ana_20260408_001",
  "status": "completed",
  "created_at": "2026-04-08T22:10:00Z",
  "completed_at": "2026-04-08T22:10:06Z",
  "image_quality": {
    "passed": true,
    "score": 0.87,
    "issues": [],
    "retry_advice": null
  },
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
  "summary": {
    "headline": "Warm Autumn",
    "one_liner": "You look best in warm, muted, earthy tones with soft contrast.",
    "explanations": [
      "Your overall coloring appears warm rather than cool.",
      "Muted earthy shades look more harmonious than icy or neon tones.",
      "Your contrast level appears moderate, which favors softer makeup transitions."
    ]
  },
  "recommended_palette": [
    { "name": "Terracotta", "hex": "#C96A4A", "use_case": "lipstick" },
    { "name": "Camel", "hex": "#C19A6B", "use_case": "fashion" },
    { "name": "Olive Green", "hex": "#7A8448", "use_case": "fashion" },
    { "name": "Warm Coral", "hex": "#E88973", "use_case": "blush" },
    { "name": "Bronze", "hex": "#8C6239", "use_case": "eyeshadow" }
  ],
  "beauty_recommendations": {
    "lipstick": [
      {
        "shade": "Brick Red",
        "reason": "Complements warm muted undertones."
      },
      {
        "shade": "Tomato Red",
        "reason": "Adds warmth while staying natural."
      }
    ],
    "blush": [
      {
        "shade": "Apricot",
        "reason": "Adds a healthy warm flush."
      }
    ],
    "eyeshadow": [
      {
        "shade": "Olive Brown",
        "reason": "Enhances depth without looking harsh."
      }
    ],
    "base_makeup": [
      {
        "tip": "Choose warm or neutral-warm base shades with a natural finish."
      }
    ]
  },
  "fashion_recommendations": {
    "best_colors": ["Camel", "Cream", "Olive", "Warm Beige", "Rust"],
    "avoid_colors": ["Icy Pink", "Cool Magenta", "Blue-based Purple", "Neon Brights"],
    "metals": ["Gold", "Antique Gold", "Bronze"]
  },
  "products": [
    {
      "id": "lip_001",
      "name": "ColorAura Harvest Glow Lipstick",
      "category": "lipstick",
      "shade": "Burnt Orange",
      "image": "/images/pd1.jpg",
      "reason": "Matches warm autumn tones and muted warmth.",
      "url": "https://example.com/products/lip_001",
      "score": 92
    }
  ],
  "beta_features": {
    "virtual_try_on_available": true
  }
}
```

#### Processing Response

```json
{
  "analysis_id": "ana_20260408_001",
  "status": "processing"
}
```

#### Failed Response

```json
{
  "analysis_id": "ana_20260408_001",
  "status": "failed",
  "error": {
    "code": "MODEL_TIMEOUT",
    "message": "Analysis could not be completed."
  }
}
```

### `GET /api/v1/products/recommendations`

Optional secondary endpoint for reusable recommendation fetches.

#### Query Params

- `season`: string
- `undertone`: string
- `category`: optional string
- `limit`: optional integer, default `6`

#### Response

```json
{
  "items": [
    {
      "id": "lip_001",
      "name": "ColorAura Harvest Glow Lipstick",
      "category": "lipstick",
      "shade": "Burnt Orange",
      "image": "/images/pd1.jpg",
      "reason": "Matches warm autumn tones and muted warmth.",
      "url": "https://example.com/products/lip_001",
      "score": 92
    }
  ]
}
```

### `GET /api/v1/health`

Health check endpoint.

```json
{
  "status": "ok",
  "timestamp": "2026-04-08T22:10:00Z"
}
```

## Shared Data Schema

### Enums

```ts
type AnalysisStatus = 'processing' | 'completed' | 'failed';
type Undertone = 'warm' | 'cool' | 'neutral';
type Brightness = 'low' | 'medium-low' | 'medium' | 'medium-high' | 'high';
type Saturation = 'muted' | 'medium' | 'bright';
type Contrast = 'low' | 'medium' | 'high';
type Season =
  | 'Light Spring'
  | 'Warm Spring'
  | 'Bright Spring'
  | 'Light Summer'
  | 'Cool Summer'
  | 'Soft Summer'
  | 'Soft Autumn'
  | 'Warm Autumn'
  | 'Deep Autumn'
  | 'Deep Winter'
  | 'Cool Winter'
  | 'Bright Winter';
type ProductCategory = 'lipstick' | 'blush' | 'eyeshadow' | 'base_makeup' | 'fashion';
```

### Core Types

```ts
type ImageQuality = {
  passed: boolean;
  score: number;
  issues: string[];
  retry_advice: string | null;
};

type SeasonResult = {
  primary: Season;
  secondary: Season | null;
  confidence: number;
};

type ColorAttributes = {
  undertone: Undertone;
  brightness: Brightness;
  saturation: Saturation;
  contrast: Contrast;
};

type PaletteColor = {
  name: string;
  hex: string;
  use_case: 'lipstick' | 'blush' | 'eyeshadow' | 'fashion';
};

type RecommendationItem = {
  shade?: string;
  tip?: string;
  reason?: string;
};

type ProductRecommendation = {
  id: string;
  name: string;
  category: ProductCategory;
  shade: string;
  image: string;
  reason: string;
  url: string;
  score: number;
};

type AnalysisResult = {
  analysis_id: string;
  status: AnalysisStatus;
  created_at?: string;
  completed_at?: string;
  image_quality?: ImageQuality;
  season_result?: SeasonResult;
  attributes?: ColorAttributes;
  summary?: {
    headline: string;
    one_liner: string;
    explanations: string[];
  };
  recommended_palette?: PaletteColor[];
  beauty_recommendations?: {
    lipstick: RecommendationItem[];
    blush: RecommendationItem[];
    eyeshadow: RecommendationItem[];
    base_makeup: RecommendationItem[];
  };
  fashion_recommendations?: {
    best_colors: string[];
    avoid_colors: string[];
    metals: string[];
  };
  products?: ProductRecommendation[];
  beta_features?: {
    virtual_try_on_available: boolean;
  };
  error?: {
    code: string;
    message: string;
  };
};
```

## AI Pipeline

### Target Backend Responsibilities

1. Receive uploaded image
2. Validate image format and size
3. Send image and prompt to multimodal model
4. Parse and validate returned JSON
5. Normalize output
6. Generate product recommendations using rules
7. Return a stable API response to the frontend

### Model Responsibilities

The model should only handle:

- image quality assessment
- undertone / brightness / saturation / contrast
- primary and secondary season estimate
- explanation text
- recommended and avoid color guidance
- makeup and fashion guidance

The model should not be the source of truth for product recommendation.

## Prompt Contract

The backend prompt should enforce:

- strict JSON output only
- no Markdown
- no free-form lead-in text
- confidence between `0` and `1`
- clear retry advice when image quality is poor
- no fabricated claims that cannot be inferred from the image

The model should explicitly evaluate:

- lighting
- frontal visibility
- obstruction
- blur
- possible heavy filter usage

## Product Recommendation Rules

### Recommendation Strategy

Use deterministic rule-based ranking for the first version.

Each product should include metadata such as:

- `seasons`
- `undertones`
- `saturation`
- `brightness`
- `category`

### Suggested Score Formula

```ts
score =
  seasonMatch * 3 +
  undertoneMatch * 2 +
  saturationMatch * 2 +
  brightnessMatch * 1;
```

Return the top 3 to top 6 products.

### Suggested Product Shape

```ts
type Product = {
  id: string;
  name: string;
  category: 'lipstick' | 'blush' | 'eyeshadow' | 'fashion';
  shade: string;
  image: string;
  url: string;
  seasons: string[];
  undertones: string[];
  saturation: 'muted' | 'medium' | 'bright';
  brightness: 'low' | 'medium-low' | 'medium' | 'high';
  description: string;
};
```

## Frontend and Backend Implementation Plan

### Recommended Repo Structure

```text
ColorSnap/
├── backend/
│   ├── src/
│   │   ├── app.ts
│   │   ├── server.ts
│   │   ├── routes/
│   │   │   ├── analyses.ts
│   │   │   └── health.ts
│   │   ├── controllers/
│   │   │   └── analysisController.ts
│   │   ├── services/
│   │   │   ├── aiAnalysisService.ts
│   │   │   ├── productRecommendationService.ts
│   │   │   └── storageService.ts
│   │   ├── prompts/
│   │   │   └── colorAnalysisPrompt.ts
│   │   ├── schemas/
│   │   │   ├── analysisSchema.ts
│   │   │   └── productSchema.ts
│   │   ├── data/
│   │   │   └── products.json
│   │   ├── types/
│   │   │   └── analysis.ts
│   │   └── utils/
│   │       ├── errors.ts
│   │       └── validation.ts
│   └── package.json
├── docs/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── types/
│   └── utils/
└── package.json
```

## Frontend Changes

### New Frontend Files

Add these files to the React app:

- `src/types/analysis.ts`
- `src/services/api.ts`
- `src/utils/formatters.ts`
- `src/components/analysis/AnalysisSummary.tsx`
- `src/components/analysis/AttributeChips.tsx`
- `src/components/analysis/PaletteSection.tsx`
- `src/components/analysis/BeautyRecommendations.tsx`
- `src/components/analysis/FashionRecommendations.tsx`
- `src/components/analysis/ProductRecommendations.tsx`
- `src/components/analysis/ImageQualityNotice.tsx`

### Existing Frontend Files to Refactor

#### `src/pages/Analysis.tsx`

Current state:

- reads local image
- stores preview in `localStorage`
- simulates analysis with `setTimeout`
- navigates to `/result`

Target state:

- keep local preview
- upload image through API
- receive `analysis_id`
- navigate to `/result?id=ana_xxx`

#### `src/pages/Result.tsx`

Current state:

- uses static fake products
- depends on local demo behavior

Target state:

- read `analysis_id` from query string
- fetch analysis result from API
- support `processing`, `completed`, and `failed` states
- render all content from backend response
- remove in-file static product arrays

#### `src/pages/ShoppingCart.tsx`

Can stay mostly unchanged for now.

The recommendation cards can keep using the current local cart workflow.

## Backend Changes

### New Backend Files

Create a new `backend` service with these files:

- `backend/src/app.ts`
- `backend/src/server.ts`
- `backend/src/routes/analyses.ts`
- `backend/src/routes/health.ts`
- `backend/src/controllers/analysisController.ts`
- `backend/src/services/aiAnalysisService.ts`
- `backend/src/services/productRecommendationService.ts`
- `backend/src/services/storageService.ts`
- `backend/src/prompts/colorAnalysisPrompt.ts`
- `backend/src/schemas/analysisSchema.ts`
- `backend/src/schemas/productSchema.ts`
- `backend/src/data/products.json`
- `backend/src/types/analysis.ts`
- `backend/src/utils/errors.ts`
- `backend/src/utils/validation.ts`

### Backend Layer Responsibilities

#### API Layer

Handles:

- request parsing
- routing
- upload handling
- HTTP response formatting

#### Service Layer

Handles:

- multimodal model calls
- response validation
- normalization
- product recommendation logic

#### Data Layer

Handles:

- product catalog
- saved analysis results
- future database integration

## Recommended Milestones

### Phase 1: MVP

- add backend scaffold
- implement `POST /api/v1/analyses`
- implement `GET /api/v1/analyses/:analysis_id`
- connect frontend upload flow
- connect result page to live API response
- move recommendations into backend rules

### Phase 2: Product Polish

- add image quality messaging
- persist analysis history
- improve loading and error states
- refine shopping integration

### Phase 3: Advanced Features

- Beta virtual try-on
- historical comparisons
- user profile memory
- smarter recommendation ranking

## Immediate Next Build Tasks

Recommended next implementation steps in this repo:

1. Add `backend/` scaffold and basic Express server
2. Add shared analysis types on frontend
3. Build `src/services/api.ts`
4. Refactor `src/pages/Analysis.tsx` to call the backend
5. Refactor `src/pages/Result.tsx` to render API-driven results
6. Move product recommendation data into backend `products.json`
7. Add schema validation for model output

## Resume Positioning

This project can be described as:

- Built an AI-powered personal color analysis web app using multimodal image understanding, structured JSON outputs, and rule-based product recommendations.
- Designed an end-to-end pipeline including photo quality checks, seasonal color classification, palette generation, and personalized beauty and fashion recommendations.
- Improved explainability by combining multimodal model outputs with deterministic recommendation rules and confidence-based retry guidance.


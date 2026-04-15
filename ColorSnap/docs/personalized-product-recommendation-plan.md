# Personalized Product Recommendation Plan

## Purpose

This document defines the recommended product strategy for ColorSnap using:

- a self-owned curated product catalog
- AI-generated user color analysis
- deterministic personalized ranking
- optional outbound purchase links to Amazon or other retailers

This is the recommended "Scheme A" implementation.

It is optimized for:

- strong portfolio quality
- stable user experience
- easier iteration
- lower integration risk
- clear explainability

## Why This Approach

Instead of depending on a third-party marketplace as the main product system, ColorSnap should treat products as a first-class part of its own experience.

That means:

- ColorSnap stores and displays its own product metadata
- the AI analysis creates a structured user profile
- the recommendation engine matches products to that profile
- external stores are used only as purchase destinations

This creates a better product because:

- recommendations are more controllable
- product pages can feel tailored and premium
- the UI stays consistent
- the ranking logic is explainable
- third-party API changes do not break the core experience

## Product Vision

The shopping experience should feel like a personalized beauty advisor, not a generic catalog.

Users should be able to:

1. upload a selfie
2. receive a color analysis report
3. see products ranked for their specific palette
4. understand why each product matches them
5. open a product detail page
6. click through to purchase externally if desired

## Core Recommendation Strategy

### Inputs From AI Analysis

The product recommendation layer should consume these user attributes:

- primary season
- secondary season
- undertone
- brightness
- saturation
- contrast

Optional future attributes:

- makeup intensity preference
- finish preference
- coverage preference
- budget band
- occasion

### Recommendation Philosophy

The AI model should not directly choose product SKUs.

The AI model should only provide the structured user profile and style guidance.

The backend recommendation engine should:

1. filter products by category and compatibility
2. score products using deterministic rules
3. generate a short personalized reason
4. return ranked products to the frontend

## Catalog Design

### Product Types

The first version should support:

- lipstick
- blush
- eyeshadow
- base_makeup
- fashion

Optional future additions:

- concealer
- bronzer
- highlighter
- brow products
- accessories

### Product Metadata

Each product should contain enough metadata to support personalized ranking.

Suggested product shape:

```ts
type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: 'lipstick' | 'blush' | 'eyeshadow' | 'base_makeup' | 'fashion';
  shade: string;
  image: string;
  gallery?: string[];
  price: string;
  currency: 'USD';
  description: string;
  short_description: string;
  finish?: 'matte' | 'satin' | 'dewy' | 'natural' | 'shimmer';
  intensity?: 'soft' | 'medium' | 'bold';
  seasons: Season[];
  undertones: Undertone[];
  saturation: Saturation;
  brightness: Brightness;
  contrast_support?: Contrast[];
  use_cases?: string[];
  ingredients_highlights?: string[];
  why_it_matches_template?: string;
  retailer: {
    name: string;
    url: string;
    affiliate?: boolean;
  };
  active: boolean;
};
```

### Important Design Rule

Do not store only generic product names and images.

The catalog should support:

- ranking
- filtering
- product detail pages
- recommendation explanations
- future external retailer links

## Personalization Logic

### Ranking Model

The first version should use weighted deterministic scoring.

Suggested score formula:

```ts
score =
  seasonMatch * 4 +
  undertoneMatch * 3 +
  saturationMatch * 2 +
  brightnessMatch * 2 +
  contrastMatch * 1 +
  finishMatch * 1 +
  intensityMatch * 1;
```

### Matching Rules

Recommended baseline behavior:

- strong boost for primary season matches
- medium boost for secondary season matches
- strong boost for undertone matches
- medium boost for brightness and saturation alignment
- smaller boost for contrast support
- optional boost for finish and intensity preferences

### Recommendation Explanation

Each returned product should include a user-facing reason.

Example:

```json
{
  "reason": "This soft coral blush suits your warm spring undertone, light brightness, and fresh color contrast."
}
```

The reason should reference:

- undertone
- season
- color softness or brightness
- practical use case

## Product Page Design

### Listing Cards

Each recommendation card should show:

- product image
- product name
- brand
- category
- price
- compatibility badges
- one-sentence reason
- view details button
- optional external buy button

### Compatibility Badges

Recommended badge types:

- Best for Warm Autumn
- Works for Soft Summer
- Warm Undertone
- Muted Finish
- Soft Contrast
- Everyday Pick

### Product Detail Page

Each product page should include:

- hero image
- product title and brand
- category and shade
- price
- short description
- "Why it matches you" section
- "Best for" tags
- finish and intensity info
- style tips
- related products
- external purchase button

### Why It Matches You Section

This is the key differentiator.

It should explain:

- which part of the user's profile the item matches
- why the shade is harmonious
- whether the product is subtle, bold, or versatile
- suggested styling or makeup pairing

## API Design

All product routes should continue using the `/api/v1` prefix.

### `GET /api/v1/products/recommendations`

Fetch personalized recommendations for a completed analysis.

#### Query Params

- `analysis_id`: required string
- `category`: optional string
- `limit`: optional integer

#### Example Response

```json
{
  "items": [
    {
      "id": "lip_001",
      "slug": "harvest-glow-lipstick",
      "name": "Harvest Glow Lipstick",
      "brand": "ColorAura",
      "category": "lipstick",
      "shade": "Burnt Orange",
      "image": "/images/pd1.jpg",
      "price": "18.00",
      "reason": "This warm earthy shade matches your autumn palette and soft muted intensity.",
      "score": 94,
      "badges": ["Warm Autumn", "Warm Undertone", "Muted Finish"],
      "url": "/products/harvest-glow-lipstick",
      "purchase_url": "https://example.com/products/lip_001"
    }
  ]
}
```

### `GET /api/v1/products/:slug`

Fetch the full product detail page payload.

#### Example Response

```json
{
  "id": "lip_001",
  "slug": "harvest-glow-lipstick",
  "name": "Harvest Glow Lipstick",
  "brand": "ColorAura",
  "category": "lipstick",
  "shade": "Burnt Orange",
  "image": "/images/pd1.jpg",
  "gallery": ["/images/pd1.jpg"],
  "price": "18.00",
  "description": "A soft warm brick-orange lipstick for earthy seasonal palettes.",
  "finish": "satin",
  "intensity": "medium",
  "best_for": ["Warm Autumn", "Soft Autumn", "Warm Undertone"],
  "why_it_matches_you": "This shade echoes the warm muted harmony identified in your profile and gives depth without looking harsh.",
  "retailer": {
    "name": "Amazon",
    "url": "https://example.com/products/lip_001",
    "affiliate": true
  }
}
```

## Frontend Plan

### New Pages

Recommended additions:

- `src/pages/ProductDetail.tsx`
- optional `src/pages/Recommendations.tsx`

### New Components

Recommended additions:

- `src/components/product/ProductCard.tsx`
- `src/components/product/ProductBadgeList.tsx`
- `src/components/product/ProductDetailHero.tsx`
- `src/components/product/WhyItMatches.tsx`
- `src/components/product/RelatedProducts.tsx`

### Existing Page Changes

#### `src/pages/Result.tsx`

Upgrade this page so the product section:

- feels curated rather than generic
- shows stronger matching explanations
- supports "View details"
- supports category filtering
- supports graceful empty states

#### `src/pages/ShoppingCart.tsx`

Can remain simple in the short term.

For portfolio quality, the product detail page is more important than cart complexity.

## Backend Plan

### Required Backend Changes

1. expand product metadata in `backend/src/data/products.json`
2. add richer validation in `backend/src/schemas/productSchema.ts`
3. update recommendation ranking in `backend/src/services/productRecommendationService.ts`
4. add product detail lookup service
5. add `GET /api/v1/products/:slug`
6. add personalized badges and explanations

### Optional Backend Improvements

- add lightweight analytics for clicked products
- add "similar products" lookup
- add budget filtering
- add sort modes such as `best_match`, `most_versatile`, `boldest`

## Development Milestones

### Phase 1: Catalog Upgrade

- enrich `products.json` with brand, slug, short description, finish, intensity, badges, retailer link
- validate the new product schema
- keep current recommendation output working

### Phase 2: Better Personalization

- expand ranking formula
- generate stronger product reasons
- add badges for season and undertone
- improve category filtering

### Phase 3: Product Detail Experience

- build `GET /api/v1/products/:slug`
- build the product detail page
- add related products
- add external buy button

### Phase 4: Polish

- improve visual design of product cards
- add fallback images and empty states
- add click tracking
- refine copywriting

## Immediate Next Tasks

Recommended build order in this repo:

1. upgrade product data model in `backend/src/data/products.json`
2. update `productSchema.ts` to match the richer catalog structure
3. refactor `productRecommendationService.ts` to return badges and stronger reasons
4. add a product detail API endpoint
5. build the product detail page in React
6. link recommendation cards to the detail page
7. add external retailer purchase links

## Success Criteria

Scheme A is working well when:

- two users with different color profiles see meaningfully different recommendations
- every product card explains why it fits
- product pages feel editorial and personalized
- the shopping experience stays stable even if external retailers change
- the system can later add Amazon links without redesigning the whole architecture

## Resume Positioning

This work can be described as:

- Designed a personalized commerce layer for an AI beauty app using structured color analysis, metadata-rich product modeling, and rule-based recommendation ranking.
- Built explainable product recommendations by matching user undertone, seasonal palette, brightness, saturation, and contrast to curated catalog attributes.
- Created a scalable shopping architecture that keeps recommendation logic in-house while supporting external retailer and affiliate purchase links.

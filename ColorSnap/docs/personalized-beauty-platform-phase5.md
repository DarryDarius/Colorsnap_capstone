# ColorSnap Personalized Beauty Platform

## Product Positioning

ColorSnap has been upgraded from a single AI color-analysis demo into a personalized beauty recommendation platform.

The full product flow is:

```text
Upload photo
-> AI color profile
-> beauty preferences
-> personalized product ranking
-> save products into a look
-> add full look to cart
-> book consultation with color profile and saved look context
```

## Recommendation System

The backend ranks products with a hybrid rule-based scoring model. Color profile fit remains the main signal, while shopping preferences refine the final ordering.

Scoring dimensions:

- season match
- undertone match
- saturation match
- brightness match
- contrast match
- category relevance
- preference fit

Preference signals:

- makeup style
- budget range
- shopping goal
- preferred finishes
- preferred brands
- colors to avoid

Each product card now includes:

- match score
- score breakdown
- specific match reasons
- retailer context
- saved-look action

## Look Builder

Saved Looks let users turn recommendations into routines. A look stores:

- analysis id
- look name
- occasion
- product list
- notes

Users can add products from the result page or product detail page, edit the look, remove products, delete the look, or add the full look to cart.

## Cart and Booking Loop

Cart items preserve recommendation context:

- analysis id
- match reason
- match score
- saved look id

Booking now supports a consultant brief:

- color profile
- color attributes
- selected saved look
- user questions

This makes the expert consultation part of the same product journey instead of a separate page.

## Evaluation and Quality

The eval harness now measures both color-analysis quality and recommendation quality.

Recommendation metrics:

- `product_score_valid_rate`
- `recommendation_relevance_score`
- `recommendation_reason_specificity_score`
- `recommendation_category_coverage_score`
- `generic_language_rate`

Run:

```bash
cd ColorSnap/backend
npm run build
npm run eval:color
```

## Demo Script

1. Start on the analysis page and upload a selfie.
2. Show the AI color profile, confidence, attributes, and palette.
3. Open product recommendations and explain match score + score breakdown.
4. Fill beauty preferences and re-rank recommendations.
5. Save two products to a look.
6. Open Saved Looks and add the full look to cart.
7. Open the cart and show match reason, match score, and saved-look source.
8. Book a consultation and show the consultant brief with color profile and selected look.
9. Mention eval harness metrics for analysis and recommendation quality.

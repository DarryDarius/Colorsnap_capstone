# Korean Personal Color Knowledge Base

Version: `korean-pc-v2.0`

This document is the working rulebook for ColorSnap's live personal color analysis. It is not a replacement for an in-person consultation. It defines how the app should translate a single user photo into cautious, explainable color guidance.

## Diagnostic Principles

ColorSnap must not classify a user from the photo's overall color cast. Warm room light, cool window light, wall color, clothing, filters, and camera white balance are uncertainty factors. They are not personal color evidence.

The analysis should follow the Korean personal color workflow common in K-beauty consulting:

- Start with warm/cool tendency.
- Refine with value, chroma, softness/clarity, and facial contrast.
- Compare multiple 12-season candidates rather than forcing one broad season.
- Use draping-style reasoning: better colors should make the face appear clearer and more harmonious, while weaker colors tend to increase dullness, shadow, redness, or harshness.

## Feature Axes

- `undertone`: warm, cool, neutral.
- `value`: light, medium, deep.
- `chroma`: muted, medium, bright.
- `clarity`: soft or clear.
- `contrast`: low, medium, high.
- `lighting_risk`: low, medium, high.
- `makeup_risk`: low, medium, high.
- `filter_risk`: low, medium, high.

## 12-Season Rule Summary

- Light Spring: warm or neutral, light value, medium to bright chroma, clear, low to medium contrast.
- Warm Spring: warm, light to medium value, bright chroma, clear, medium contrast.
- Bright Spring: warm or neutral, medium value, bright chroma, clear, medium to high contrast.
- Light Summer: cool or neutral, light value, muted to medium chroma, soft, low contrast.
- Cool Summer: cool, light to medium value, muted to medium chroma, soft, low to medium contrast.
- Soft Summer: cool or neutral, light to medium value, muted chroma, soft, low to medium contrast.
- Soft Autumn: warm or neutral, medium value, muted chroma, soft, low to medium contrast.
- Warm Autumn: warm, medium to deep value, muted to medium chroma, soft, medium contrast.
- Deep Autumn: warm or neutral, deep value, muted to medium chroma, soft or clear, medium to high contrast.
- Deep Winter: cool or neutral, deep value, medium to bright chroma, clear, high contrast.
- Cool Winter: cool, medium to deep value, medium to bright chroma, clear, medium to high contrast.
- Bright Winter: cool or neutral, medium to deep value, bright chroma, clear, high contrast.

## Confidence Caps

Confidence must be capped when the input photo limits reliability:

- Medium lighting risk: max 0.72.
- High lighting risk: max 0.62.
- High makeup risk: max 0.58.
- High filter risk: max 0.55.

When several caps apply, use the lowest cap and explain why.

## K-Beauty Direction

- Spring: fresh, clear, warm, lively; coral, peach, apricot, clear warm pink; dewy or satin finishes.
- Summer: cool, soft, airy, muted; mauve pink, dusty rose, lavender pink, rose beige; blurred matte or soft satin finishes.
- Autumn: warm, muted, earthy, mature; terracotta, brick rose, camel beige, olive brown, maple; velvet or matte finishes.
- Winter: cool, clear, sharp, high contrast; blue-red, berry, plum, fuchsia, cool rose; satin, clear gloss, or defined matte finishes.

## Source Notes

The project should cite Korean personal color consulting practice and Korean color/tone research in reports, not in runtime prompts. Runtime prompts use this compressed rulebook. Useful source categories:

- Korean color research on PCCS/KS tone, value, chroma, and tone perception.
- Korean personal color training or consulting materials describing warm/cool, value, chroma, clarity, contrast, and draping.
- Korean K-beauty retailers and brands that organize makeup by spring warm, summer cool, autumn warm, and winter cool tone families.

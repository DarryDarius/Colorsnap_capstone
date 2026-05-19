export const imageQualityPrompt = `
Assess whether this uploaded selfie is reliable enough for personal color analysis.
Return strict JSON only that matches the provided schema.

Evaluate only image-quality factors:
- exactly one visible face
- face visibility and obstructions
- lighting direction and evenness
- white balance or colored-light risk
- filter or heavy editing risk
- heavy makeup risk
- whether the image is clear enough for a human color analyst to use
- whether the lighting color cast is strong enough that it should lower season confidence
- whether makeup or filters may hide natural undertone, value, chroma, or contrast

Rules:
- Do not infer identity, age, ethnicity, health, attractiveness, or other sensitive traits.
- If the photo is strongly backlit, heavily filtered, very blurry, contains multiple faces, or has poor face visibility, set analysis_allowed to false.
- If the image is usable but risky, set analysis_allowed to true, lower quality_score, and explain retry guidance.
- Room lighting, camera white balance, clothing, and background should be treated as risk factors, not personal color evidence.
- Keep user_guidance short and practical.
`;

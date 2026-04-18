# ColorSnap AI Quality Improvement Plan

本文档用于指导 ColorSnap 下一阶段 AI 质量升级。目标不是简单替换 prompt，而是把当前“单次图片分析”升级为更成熟、更可评估、更符合行业主流的 AI quality pipeline。

## 1. 目标

当前 ColorSnap 已经具备可运行的 AI/mock 分析流程、严格 JSON schema、商品推荐和结果页展示。下一阶段重点是提升生成结果的准确性、稳定性、可解释性和可持续迭代能力。

核心目标：

- 降低低质量自拍导致的错误分析。
- 让模型输出不仅有结论，还有证据、候选项和不确定性。
- 用后端规则校准置信度、season 选择和推荐一致性。
- 建立 eval 数据集，量化 prompt、模型和规则调整是否真的变好。
- 为最终 capstone demo 提供更专业的 AI 产品叙事。

最终希望可以这样介绍系统：

```text
ColorSnap uses a quality-gated multimodal pipeline with structured outputs, deterministic validation, confidence calibration, and evaluation-driven iteration.
```

## 2. 当前基线

当前代码基础：

- AI service: `backend/src/services/aiAnalysisService.ts`
- Prompt: `backend/src/prompts/colorAnalysisPrompt.ts`
- Analysis schema: `backend/src/schemas/analysisSchema.ts`
- Backend analysis controller: `backend/src/controllers/analysisController.ts`
- Shared analysis types: `backend/src/types/analysis.ts` and `src/types/analysis.ts`
- Frontend result page: `src/pages/Result.tsx`
- Analysis page: `src/pages/Analysis.tsx`

已完成能力：

- Responses API 图片输入。
- `detail: high` 优先，timeout 后 fallback 到 `detail: low`。
- Strict JSON schema 输出。
- 后端 runtime validation 和 normalization。
- Mock AI 模式。
- Rule-based product recommendations。

主要不足：

- 图片质量判断和最终分析混在一次输出里。
- 结果没有足够的 evidence 和 season candidate comparison。
- confidence 主要由模型自报，缺少后端校准。
- prompt 缺少完整 12-season rubric。
- 没有 eval dataset，无法量化结果质量。
- 前端对不确定性、低质量图片、近似 season 的展示还不够产品化。

## 3. 推荐总体架构

将当前单阶段分析升级为多阶段 pipeline：

```text
User Photo
  -> Image Quality Gate
  -> Main Color Analysis
  -> Consistency Critic / Calibration
  -> Deterministic Product Matching
  -> Result UI + Feedback
  -> Eval Dataset + Prompt/Model Iteration
```

每层职责：

- Image Quality Gate: 判断图片是否适合分析，识别光线、白平衡、滤镜、遮挡、多脸、重妆风险。
- Main Color Analysis: 输出 season、attributes、palette、recommendations、evidence 和 candidates。
- Consistency Critic: 检查主分析是否自洽，尤其是 confidence、season、palette、avoid colors 和 evidence。
- Deterministic Product Matching: 保持当前后端 rule-based 商品推荐，不让模型直接选择 SKU。
- Result UI + Feedback: 展示不确定性并收集用户反馈。
- Eval Dataset: 用标注数据持续比较不同 prompt/model/rules 的质量。

## 4. 模型策略

建议将模型配置从单一 `OPENAI_MODEL` 升级为分层配置：

```env
OPENAI_MODEL_PRIMARY=gpt-5.4
OPENAI_MODEL_FAST=gpt-5.4-mini
OPENAI_REASONING_EFFORT=low
OPENAI_IMAGE_DETAIL=high
OPENAI_IMAGE_DETAIL_FALLBACK=low
OPENAI_IMAGE_DETAIL_PREMIUM=original
OPENAI_TIMEOUT_MS=30000
```

推荐使用方式：

- 默认高质量分析：`OPENAI_MODEL_PRIMARY` + `detail: high`
- 成本友好 demo：`OPENAI_MODEL_FAST` + `detail: high`
- 图片质量门控：`OPENAI_MODEL_FAST`
- consistency critic：`OPENAI_MODEL_FAST`
- 低置信度、候选 season 接近、用户请求重新增强结果时：升级到 `OPENAI_MODEL_PRIMARY`

实现建议：

- 保留 `MOCK_AI=true` 的稳定 demo 模式。
- 新增 `AI_QUALITY_MODE=fast|balanced|premium`。
- `fast`: quality gate + fast model main analysis。
- `balanced`: quality gate + primary model main analysis + deterministic calibration。
- `premium`: quality gate + primary model + critic + stricter fallback。

## 5. Image Quality Gate

第一阶段先判断图片是否值得分析。不要对明显不可靠的图片强行给高置信度 season。

新增类型：

```ts
export type ImageQualityAssessment = {
  analysis_allowed: boolean;
  quality_score: number;
  face_count: number;
  face_visibility: 'clear' | 'partial' | 'poor';
  lighting: 'natural_even' | 'warm_indoor' | 'cool_indoor' | 'backlit' | 'mixed' | 'poor';
  white_balance_risk: 'low' | 'medium' | 'high';
  filter_or_heavy_editing_risk: 'low' | 'medium' | 'high';
  makeup_risk: 'none' | 'light' | 'heavy' | 'unknown';
  retry_required_reasons: string[];
  user_guidance: string;
};
```

后端规则：

- `analysis_allowed=false`: 不继续 main analysis，返回 failed 或 quality_blocked 状态。
- `quality_score < 0.65`: 可以生成 tentative result，但 confidence 上限为 `0.65`。
- `white_balance_risk=high`: confidence 上限为 `0.72`，必须在 uncertainty 里说明。
- `filter_or_heavy_editing_risk=high`: confidence 上限为 `0.68`。
- `face_count !== 1`: 阻止分析。
- `face_visibility=poor`: 阻止分析。
- `makeup_risk=heavy`: 允许分析，但必须提示可能影响 undertone 判断。

建议前端文案：

```text
This photo may not be reliable enough for color analysis.
Try a front-facing selfie in natural daylight, without strong filters, colored lighting, or heavy shadows.
```

## 6. Main Analysis Schema 升级

当前 schema 应扩展为包含 evidence、candidate comparison 和 uncertainty。

新增字段：

```ts
export type ColorAnalysisEvidence = {
  observable_traits: {
    undertone_evidence: string[];
    contrast_evidence: string[];
    brightness_evidence: string[];
    saturation_evidence: string[];
  };
  uncertainty_factors: string[];
  top_season_candidates: Array<{
    season: Season;
    score: number;
    evidence_for: string[];
    evidence_against: string[];
  }>;
  confidence_reason: string;
};
```

建议扩展后的 `ModelAnalysisOutput`：

```ts
export type ModelAnalysisOutput = {
  image_quality: ImageQuality;
  quality_assessment?: ImageQualityAssessment;
  season_result: SeasonResult;
  attributes: ColorAttributes;
  evidence: ColorAnalysisEvidence;
  summary: {
    headline: string;
    one_liner: string;
    explanations: string[];
  };
  recommended_palette: PaletteColor[];
  beauty_recommendations: {
    lipstick: RecommendationItem[];
    blush: RecommendationItem[];
    eyeshadow: RecommendationItem[];
    base_makeup: RecommendationItem[];
  };
  fashion_recommendations: {
    best_colors: string[];
    avoid_colors: string[];
    metals: string[];
  };
  beta_features: {
    virtual_try_on_available: boolean;
  };
};
```

Schema 验收标准：

- `top_season_candidates` 至少 2 个，最多 4 个。
- candidate `score` 必须在 `0-1`。
- `season_result.primary` 必须等于最高分 candidate。
- `season_result.secondary` 应为第二高 candidate，除非分数很低。
- `uncertainty_factors` 可以为空，但低质量图片必须非空。
- `recommended_palette` 至少 5 个颜色，最多 8 个颜色。
- 所有 hex 必须匹配 `^#[0-9A-Fa-f]{6}$`。

## 7. Season Rule Calibration

不要完全依赖模型自由选择 season。建议后端维护一个 season rule table，用于校准模型输出。

示例：

```ts
const seasonRules = {
  'Light Spring': {
    undertone: ['warm', 'neutral'],
    brightness: ['high', 'medium-high'],
    saturation: ['medium', 'bright'],
    contrast: ['low', 'medium']
  },
  'Warm Spring': {
    undertone: ['warm'],
    brightness: ['medium-high', 'high'],
    saturation: ['medium', 'bright'],
    contrast: ['medium']
  },
  'Bright Spring': {
    undertone: ['warm', 'neutral'],
    brightness: ['medium-high', 'high'],
    saturation: ['bright'],
    contrast: ['medium', 'high']
  },
  'Light Summer': {
    undertone: ['cool', 'neutral'],
    brightness: ['high', 'medium-high'],
    saturation: ['muted', 'medium'],
    contrast: ['low']
  },
  'Cool Summer': {
    undertone: ['cool'],
    brightness: ['medium', 'medium-high'],
    saturation: ['muted', 'medium'],
    contrast: ['low', 'medium']
  },
  'Soft Summer': {
    undertone: ['cool', 'neutral'],
    brightness: ['medium-low', 'medium'],
    saturation: ['muted'],
    contrast: ['low', 'medium']
  },
  'Soft Autumn': {
    undertone: ['warm', 'neutral'],
    brightness: ['medium-low', 'medium'],
    saturation: ['muted'],
    contrast: ['low', 'medium']
  },
  'Warm Autumn': {
    undertone: ['warm'],
    brightness: ['medium-low', 'medium'],
    saturation: ['muted', 'medium'],
    contrast: ['medium']
  },
  'Deep Autumn': {
    undertone: ['warm', 'neutral'],
    brightness: ['low', 'medium-low'],
    saturation: ['medium'],
    contrast: ['medium', 'high']
  },
  'Deep Winter': {
    undertone: ['cool', 'neutral'],
    brightness: ['low', 'medium-low'],
    saturation: ['medium', 'bright'],
    contrast: ['high']
  },
  'Cool Winter': {
    undertone: ['cool'],
    brightness: ['medium', 'medium-high'],
    saturation: ['bright', 'medium'],
    contrast: ['high']
  },
  'Bright Winter': {
    undertone: ['cool', 'neutral'],
    brightness: ['medium-high', 'high'],
    saturation: ['bright'],
    contrast: ['high']
  }
} as const;
```

使用方式：

- 模型输出 visual attributes。
- 后端根据 attributes 给每个 season 计算 deterministic compatibility score。
- 如果模型 primary season 与 deterministic top candidates 差异过大，降低 confidence 或触发 critic。
- 如果 top 2 分数接近，前端显示 tentative language。

## 8. Confidence Calibration

后端必须校准模型自报 confidence。

建议函数：

```ts
const calibrateConfidence = ({
  modelConfidence,
  qualityAssessment,
  topCandidateGap,
  criticIssues
}: {
  modelConfidence: number;
  qualityAssessment: ImageQualityAssessment;
  topCandidateGap: number;
  criticIssues: string[];
}) => {
  let confidence = modelConfidence;

  if (qualityAssessment.quality_score < 0.65) confidence = Math.min(confidence, 0.65);
  if (qualityAssessment.white_balance_risk === 'high') confidence = Math.min(confidence, 0.72);
  if (qualityAssessment.filter_or_heavy_editing_risk === 'high') confidence = Math.min(confidence, 0.68);
  if (qualityAssessment.makeup_risk === 'heavy') confidence = Math.min(confidence, 0.74);
  if (topCandidateGap < 0.08) confidence = Math.min(confidence, 0.7);
  if (criticIssues.length > 0) confidence = Math.min(confidence, 0.76);

  return Math.max(0, Math.min(1, confidence));
};
```

UI 显示规则：

- `confidence >= 0.8`: confident result。
- `0.65 <= confidence < 0.8`: likely result。
- `< 0.65`: tentative result。

## 9. Consistency Critic

新增一个轻量自检阶段。critic 不负责重新生成完整报告，只负责找矛盾和必要修正。

输入：

- quality assessment
- main analysis JSON
- deterministic season scores
- palette rules

输出：

```ts
export type AnalysisCriticResult = {
  passed: boolean;
  issues: Array<{
    code:
      | 'CONFIDENCE_TOO_HIGH'
      | 'SEASON_EVIDENCE_MISMATCH'
      | 'PALETTE_CONTRADICTION'
      | 'GENERIC_RECOMMENDATION'
      | 'QUALITY_UNCERTAINTY_MISSING';
    severity: 'low' | 'medium' | 'high';
    message: string;
  }>;
  suggested_confidence?: number;
  suggested_primary_season?: Season;
  suggested_secondary_season?: Season | null;
};
```

Critic prompt 要点：

```text
You are a consistency reviewer for a personal color analysis JSON report.
Do not produce a new full report.
Check whether the primary season, confidence, palette, and recommendations are supported by the evidence and image quality.
Return only structured JSON.
```

自动修正规则：

- 只允许自动降低 confidence。
- 不建议自动大幅替换 primary season，除非 deterministic score 和 critic 都强烈反对。
- season 修改应保守，必要时把结果改为 tentative 并展示 secondary candidate。

## 10. Prompt 升级

当前 prompt 应拆分为三个 prompt：

```text
imageQualityPrompt.ts
colorAnalysisPrompt.ts
analysisCriticPrompt.ts
```

### 10.1 Image Quality Prompt 要点

```text
Assess whether this selfie is reliable for personal color analysis.
Focus on lighting, white balance, face visibility, filters, makeup, shadows, obstructions, and whether exactly one face is visible.
Do not infer sensitive demographic traits.
Return structured JSON only.
```

### 10.2 Main Color Analysis Prompt 要点

```text
You are a cautious personal color analyst.
Analyze visible color harmony signals from the uploaded selfie.

Follow this order internally:
1. Evaluate visible undertone, brightness/value, saturation/chroma, and contrast.
2. Compare likely 12-season candidates.
3. Choose primary and secondary season only if supported by evidence.
4. Generate palette, beauty recommendations, and fashion recommendations consistent with the chosen season.
5. Include uncertainty when lighting, filters, white balance, makeup, or image quality may affect reliability.

Do not overfit to one visible feature.
Do not give high confidence when image quality is limited.
Use practical, user-friendly language.
Return strict JSON only.
```

### 10.3 Season Rubric Prompt Snippet

Add a concise 12-season rubric to the main prompt:

```text
Light Spring: warm/neutral, light value, fresh clarity, low-medium contrast.
Warm Spring: warm, clear, sunny brightness, medium contrast.
Bright Spring: warm/neutral, very bright chroma, clear contrast.
Light Summer: cool/neutral, light value, soft cool clarity, low contrast.
Cool Summer: cool, medium-light, soft to medium chroma, low-medium contrast.
Soft Summer: cool/neutral, muted chroma, soft blended contrast.
Soft Autumn: warm/neutral, muted chroma, soft earthy contrast.
Warm Autumn: warm, muted to medium chroma, earthy depth, medium contrast.
Deep Autumn: warm/neutral, deeper value, rich earthy chroma, medium-high contrast.
Deep Winter: cool/neutral, deep value, strong contrast.
Cool Winter: cool, crisp clarity, high contrast.
Bright Winter: cool/neutral, very bright chroma, high clarity and contrast.
```

## 11. Eval Dataset

必须建立 eval，避免靠主观感觉判断质量。

建议目录：

```text
backend/evals/
  fixtures/
    images/
    color-analysis-goldset.jsonl
  runColorAnalysisEval.ts
  graders.ts
  README.md
```

JSONL 示例：

```json
{"item":{"image_path":"fixtures/images/001.jpg","expert_primary_season":"Warm Autumn","expert_secondary_season":"Soft Autumn","expected_undertone":"warm","expected_brightness":"medium-low","expected_saturation":"muted","expected_contrast":"medium","quality_label":"good","notes":"Natural light, no heavy makeup."}}
```

第一版 gold set 目标：

- 50-100 张图片。
- 至少覆盖 6 个重点 season。
- 每个重点 season 至少 6-10 张。
- 包含低质量和边界样本。

必须覆盖：

- 自然光清晰自拍。
- 室内暖光。
- 室内冷光。
- 背光。
- 滤镜。
- 重妆。
- 不同肤色、发色、眼色。
- 多脸、遮挡、低清晰度。
- 容易混淆的 season pairs：
  - Soft Autumn vs Warm Autumn
  - Soft Autumn vs Soft Summer
  - Cool Summer vs Soft Summer
  - Bright Spring vs Bright Winter
  - Deep Autumn vs Deep Winter

## 12. Eval Metrics

建议第一版指标：

```text
schema_valid_rate
quality_gate_accuracy
season_top1_accuracy
season_top2_accuracy
undertone_accuracy
brightness_accuracy
saturation_accuracy
contrast_accuracy
confidence_calibration_score
palette_consistency_score
recommendation_relevance_score
generic_language_rate
```

评分解释：

- `schema_valid_rate`: 输出是否能通过 JSON schema 和 runtime validation。
- `quality_gate_accuracy`: 是否正确拒绝/降级低质量图片。
- `season_top1_accuracy`: primary season 是否匹配专家标注。
- `season_top2_accuracy`: 专家 primary 是否出现在 top candidates 前 2。
- `attribute_accuracy`: undertone/brightness/saturation/contrast 的分类准确率。
- `confidence_calibration_score`: 高置信度错误要重罚，低置信度但候选正确可部分得分。
- `generic_language_rate`: 统计 “suits your palette”“enhances your features” 这类泛化句子比例。

本地 eval 输出：

```text
Model: gpt-5.4-mini
Prompt version: color-analysis-v2
Dataset: color-analysis-goldset-v1

schema_valid_rate: 100%
quality_gate_accuracy: 86%
season_top1_accuracy: 64%
season_top2_accuracy: 82%
undertone_accuracy: 78%
confidence_calibration_score: 0.74
generic_language_rate: 11%
```

## 13. 用户反馈闭环

结果页增加轻量反馈：

```text
Was this result helpful?
[Accurate] [Somewhat] [Not accurate]

What felt off?
[Season] [Undertone] [Palette] [Makeup suggestions] [Photo quality]
```

后端类型：

```ts
export type AnalysisFeedback = {
  feedback_id: string;
  analysis_id: string;
  rating: 1 | 2 | 3 | 4 | 5;
  issue_tags: Array<'season' | 'undertone' | 'palette' | 'makeup' | 'fashion' | 'photo_quality' | 'other'>;
  user_note?: string;
  created_at: string;
};
```

API：

```text
POST /api/v1/analyses/:analysis_id/feedback
GET  /api/v1/analyses/:analysis_id/feedback
```

用途：

- 收集失败样本。
- 筛选 `rating <= 2` 的 case 加入 eval review。
- 为后续 prompt/rule 改进提供真实依据。

## 14. 前端结果页升级

Result 页面需要展示 AI 不确定性，而不是只展示单一结论。

新增 UI 模块：

- Quality Notice: 复用并增强 `ImageQualityNotice`。
- Confidence Badge:
  - Confident
  - Likely
  - Tentative
- Candidate Comparison:
  - Primary season
  - Secondary season
  - Close alternative when top candidate gap is small
- Why this result:
  - undertone evidence
  - contrast evidence
  - brightness evidence
  - saturation evidence
- Uncertainty factors:
  - lighting
  - makeup
  - filters
  - white balance

示例文案：

```text
This result leans Warm Autumn, with Soft Autumn as a close alternative. Indoor warm lighting may affect undertone confidence.
```

## 15. 后端开发任务拆分

### Phase 1: Schema and Prompt Upgrade

目标文件：

- `backend/src/types/analysis.ts`
- `src/types/analysis.ts`
- `backend/src/schemas/analysisSchema.ts`
- `backend/src/prompts/colorAnalysisPrompt.ts`

任务：

- 增加 `ImageQualityAssessment`。
- 增加 `ColorAnalysisEvidence`。
- 增加 `top_season_candidates`。
- 扩展 JSON schema。
- 重写 prompt 为 rubric prompt。

验收：

- TypeScript build 通过。
- Mock output 更新后通过 validation。
- Live output 仍能被 parser 正确读取。

### Phase 2: Quality Gate Pipeline

目标文件：

- `backend/src/services/aiAnalysisService.ts`
- `backend/src/prompts/imageQualityPrompt.ts`

任务：

- 新增 `assessImageQuality(image)`。
- 在 main analysis 前执行 quality gate。
- 对 blocked image 返回明确错误。
- 对 low quality image 设置 confidence cap。

验收：

- 多脸、极低质量、遮挡图片不会生成高置信度结果。
- 前端能显示 retry advice。

### Phase 3: Deterministic Calibration

目标文件：

- `backend/src/services/colorSeasonCalibrationService.ts`
- `backend/src/services/aiAnalysisService.ts`

任务：

- 新增 season rule table。
- 根据 attributes 计算 deterministic season scores。
- 对比模型 candidate scores。
- 校准 confidence。

验收：

- primary season 与 evidence 明显冲突时降低 confidence。
- top 2 接近时结果自动变 tentative。

### Phase 4: Consistency Critic

目标文件：

- `backend/src/prompts/analysisCriticPrompt.ts`
- `backend/src/services/analysisCriticService.ts`
- `backend/src/services/aiAnalysisService.ts`

任务：

- 新增 critic JSON schema。
- 检查 confidence、season、palette、recommendations 是否自洽。
- 根据 critic issues 降低 confidence 或附加 uncertainty。

验收：

- critic 不生成完整报告，只输出 issues。
- high severity issue 会影响 final confidence。

### Phase 5: Eval Runner

目标文件：

- `backend/evals/README.md`
- `backend/evals/fixtures/color-analysis-goldset.jsonl`
- `backend/evals/runColorAnalysisEval.ts`
- `backend/evals/graders.ts`

任务：

- 读取 goldset。
- 调用 mock 或 live AI pipeline。
- 输出 metrics JSON。
- 支持比较两个 prompt/model 配置。

验收：

- 可以本地运行一次 eval。
- 输出 top1/top2/attribute/confidence/schema metrics。
- eval 结果可保存到 `backend/evals/results/`。

### Phase 6: Feedback Loop

目标文件：

- `backend/src/routes/analyses.ts`
- `backend/src/controllers/analysisFeedbackController.ts`
- `backend/src/services/storageService.ts`
- `src/pages/Result.tsx`
- `src/services/api.ts`

任务：

- 新增 feedback API。
- Result 页面增加反馈组件。
- 保存反馈到 local JSON storage。

验收：

- 用户可以提交结果反馈。
- 后端能按 analysis id 读取反馈。

## 16. 不建议短期做 Fine-tuning

短期不建议 fine-tune，原因：

- 当前没有足够专家标注数据。
- 主要质量问题更可能来自图片质量、prompt、schema、confidence calibration 和 eval 缺失。
- Fine-tuning 应该在 eval 数据集稳定、失败模式清楚、标注数据足够后再考虑。

推荐顺序：

```text
Prompt + Schema + Quality Gate
  -> Eval Set
  -> Model/Prompt Comparison
  -> Failure Analysis
  -> Larger Labeled Dataset
  -> Fine-tuning or preference optimization if justified
```

## 17. Demo 叙事

答辩或面试时可以这样讲：

```text
The first version used a single multimodal prompt. I upgraded it into a production-style AI quality pipeline. It first checks whether the image is reliable enough, then generates a structured report with evidence and season candidates, calibrates confidence with deterministic rules, and records evaluation metrics across a labeled dataset. Product recommendations remain deterministic, so the model explains the user profile but does not hallucinate SKUs.
```

这个叙事重点突出：

- 多模态 AI。
- Structured output。
- Quality gate。
- Deterministic validation。
- Confidence calibration。
- Evals。
- Human/user feedback loop。

## 18. 参考文档

- OpenAI Images and vision: https://developers.openai.com/api/docs/guides/images-vision
- OpenAI Structured Outputs: https://developers.openai.com/api/docs/guides/structured-outputs
- OpenAI Evals: https://developers.openai.com/api/docs/guides/evals
- OpenAI Models: https://developers.openai.com/api/docs/models


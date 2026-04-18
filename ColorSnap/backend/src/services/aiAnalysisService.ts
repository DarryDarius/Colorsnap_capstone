import * as https from 'https';
import { validateModelAnalysis } from '../schemas/analysisSchema';
import type { ImageQualityAssessment, ModelAnalysisOutput, UploadedImage } from '../types/analysis';
import { analysisCriticPrompt } from '../prompts/analysisCriticPrompt';
import { colorAnalysisPrompt } from '../prompts/colorAnalysisPrompt';
import { imageQualityPrompt } from '../prompts/imageQualityPrompt';
import { calibrateAnalysis, createQualityFromAssessment } from './colorSeasonCalibrationService';
import { ApiError } from '../utils/errors';

const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const OPENAI_API_URL = 'https://api.openai.com/v1/responses';
const DEFAULT_OPENAI_MODEL_PRIMARY = 'gpt-5.4-mini';
const DEFAULT_OPENAI_MODEL_FAST = 'gpt-5.4-mini';
const DEFAULT_REASONING_EFFORT = 'low';
const DEFAULT_TIMEOUT_MS = 30_000;

const seasonValues = [
  'Light Spring',
  'Warm Spring',
  'Bright Spring',
  'Light Summer',
  'Cool Summer',
  'Soft Summer',
  'Soft Autumn',
  'Warm Autumn',
  'Deep Autumn',
  'Deep Winter',
  'Cool Winter',
  'Bright Winter'
] as const;

const analysisJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'image_quality',
    'season_result',
    'attributes',
    'evidence',
    'summary',
    'recommended_palette',
    'beauty_recommendations',
    'fashion_recommendations',
    'beta_features'
  ],
  properties: {
    image_quality: {
      type: 'object',
      additionalProperties: false,
      required: ['passed', 'score', 'issues', 'retry_advice'],
      properties: {
        passed: { type: 'boolean' },
        score: { type: 'number' },
        issues: {
          type: 'array',
          items: { type: 'string' }
        },
        retry_advice: {
          type: ['string', 'null']
        }
      }
    },
    season_result: {
      type: 'object',
      additionalProperties: false,
      required: ['primary', 'secondary', 'confidence'],
      properties: {
        primary: {
          type: 'string',
          enum: [...seasonValues]
        },
        secondary: {
          type: ['string', 'null'],
          enum: [...seasonValues, null]
        },
        confidence: { type: 'number' }
      }
    },
    attributes: {
      type: 'object',
      additionalProperties: false,
      required: ['undertone', 'brightness', 'saturation', 'contrast'],
      properties: {
        undertone: {
          type: 'string',
          enum: ['warm', 'cool', 'neutral']
        },
        brightness: {
          type: 'string',
          enum: ['low', 'medium-low', 'medium', 'medium-high', 'high']
        },
        saturation: {
          type: 'string',
          enum: ['muted', 'medium', 'bright']
        },
        contrast: {
          type: 'string',
          enum: ['low', 'medium', 'high']
        }
      }
    },
    evidence: {
      type: 'object',
      additionalProperties: false,
      required: ['observable_traits', 'uncertainty_factors', 'top_season_candidates', 'confidence_reason'],
      properties: {
        observable_traits: {
          type: 'object',
          additionalProperties: false,
          required: ['undertone_evidence', 'contrast_evidence', 'brightness_evidence', 'saturation_evidence'],
          properties: {
            undertone_evidence: {
              type: 'array',
              items: { type: 'string' }
            },
            contrast_evidence: {
              type: 'array',
              items: { type: 'string' }
            },
            brightness_evidence: {
              type: 'array',
              items: { type: 'string' }
            },
            saturation_evidence: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        },
        uncertainty_factors: {
          type: 'array',
          items: { type: 'string' }
        },
        top_season_candidates: {
          type: 'array',
          minItems: 2,
          maxItems: 4,
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['season', 'score', 'evidence_for', 'evidence_against'],
            properties: {
              season: {
                type: 'string',
                enum: [...seasonValues]
              },
              score: { type: 'number' },
              evidence_for: {
                type: 'array',
                items: { type: 'string' }
              },
              evidence_against: {
                type: 'array',
                items: { type: 'string' }
              }
            }
          }
        },
        confidence_reason: { type: 'string' }
      }
    },
    summary: {
      type: 'object',
      additionalProperties: false,
      required: ['headline', 'one_liner', 'explanations'],
      properties: {
        headline: { type: 'string' },
        one_liner: { type: 'string' },
        explanations: {
          type: 'array',
          items: { type: 'string' }
        }
      }
    },
    recommended_palette: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'hex', 'use_case'],
        properties: {
          name: { type: 'string' },
          hex: { type: 'string' },
          use_case: {
            type: 'string',
            enum: ['lipstick', 'blush', 'eyeshadow', 'fashion']
          }
        }
      }
    },
    beauty_recommendations: {
      type: 'object',
      additionalProperties: false,
      required: ['lipstick', 'blush', 'eyeshadow', 'base_makeup'],
      properties: {
        lipstick: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['shade', 'reason'],
            properties: {
              shade: { type: 'string' },
              reason: { type: 'string' }
            }
          }
        },
        blush: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['shade', 'reason'],
            properties: {
              shade: { type: 'string' },
              reason: { type: 'string' }
            }
          }
        },
        eyeshadow: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['shade', 'reason'],
            properties: {
              shade: { type: 'string' },
              reason: { type: 'string' }
            }
          }
        },
        base_makeup: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['tip'],
            properties: {
              tip: { type: 'string' }
            }
          }
        }
      }
    },
    fashion_recommendations: {
      type: 'object',
      additionalProperties: false,
      required: ['best_colors', 'avoid_colors', 'metals'],
      properties: {
        best_colors: {
          type: 'array',
          items: { type: 'string' }
        },
        avoid_colors: {
          type: 'array',
          items: { type: 'string' }
        },
        metals: {
          type: 'array',
          items: { type: 'string' }
        }
      }
    },
    beta_features: {
      type: 'object',
      additionalProperties: false,
      required: ['virtual_try_on_available'],
      properties: {
        virtual_try_on_available: { type: 'boolean' }
      }
    }
  }
} as const;

const imageQualityJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'analysis_allowed',
    'quality_score',
    'face_count',
    'face_visibility',
    'lighting',
    'white_balance_risk',
    'filter_or_heavy_editing_risk',
    'makeup_risk',
    'retry_required_reasons',
    'user_guidance'
  ],
  properties: {
    analysis_allowed: { type: 'boolean' },
    quality_score: { type: 'number' },
    face_count: { type: 'number' },
    face_visibility: {
      type: 'string',
      enum: ['clear', 'partial', 'poor']
    },
    lighting: {
      type: 'string',
      enum: ['natural_even', 'warm_indoor', 'cool_indoor', 'backlit', 'mixed', 'poor']
    },
    white_balance_risk: {
      type: 'string',
      enum: ['low', 'medium', 'high']
    },
    filter_or_heavy_editing_risk: {
      type: 'string',
      enum: ['low', 'medium', 'high']
    },
    makeup_risk: {
      type: 'string',
      enum: ['none', 'light', 'heavy', 'unknown']
    },
    retry_required_reasons: {
      type: 'array',
      items: { type: 'string' }
    },
    user_guidance: { type: 'string' }
  }
} as const;

type OpenAiErrorBody = {
  error?: {
    message?: string;
    type?: string;
    code?: string;
  };
};

type OpenAiResponseBody = {
  output_text?: string;
  output?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      text?: string;
      refusal?: string;
    }>;
  }>;
};

export const getAiMode = () => process.env.MOCK_AI !== 'false' ? 'mock' : 'openai';

const isMockAiEnabled = () => getAiMode() === 'mock';

const getOpenAiApiKey = () => {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    throw new ApiError(500, 'OPENAI_CONFIG_MISSING', 'OPENAI_API_KEY is missing in the backend environment.');
  }

  return apiKey;
};

const getOpenAiModel = (purpose: 'primary' | 'fast' = 'primary') => {
  if (purpose === 'fast') {
    return process.env.OPENAI_MODEL_FAST?.trim() || process.env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL_FAST;
  }

  return process.env.OPENAI_MODEL_PRIMARY?.trim() || process.env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL_PRIMARY;
};

const getOpenAiReasoningEffort = () => {
  const effort = process.env.OPENAI_REASONING_EFFORT?.trim() || DEFAULT_REASONING_EFFORT;
  return ['none', 'low', 'medium', 'high', 'xhigh'].includes(effort) ? effort : DEFAULT_REASONING_EFFORT;
};

const withReasoningConfig = (payload: Record<string, unknown>, model: string) => {
  if (!model.startsWith('gpt-5')) {
    return payload;
  }

  return {
    ...payload,
    reasoning: {
      effort: getOpenAiReasoningEffort()
    }
  };
};

const getOpenAiImageDetail = (fallback: 'high' | 'low' = 'high'): 'high' | 'low' | 'auto' => {
  const detail = process.env.OPENAI_IMAGE_DETAIL?.trim();
  return detail === 'low' || detail === 'high' || detail === 'auto' ? detail : fallback;
};

const getOpenAiFallbackImageDetail = (): 'high' | 'low' | 'auto' => {
  const detail = process.env.OPENAI_IMAGE_DETAIL_FALLBACK?.trim();
  return detail === 'high' || detail === 'auto' ? detail : 'low';
};

const getOpenAiTimeoutMs = () => {
  const rawValue = process.env.OPENAI_TIMEOUT_MS?.trim();

  if (!rawValue) {
    return DEFAULT_TIMEOUT_MS;
  }

  const parsedValue = Number(rawValue);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    throw new ApiError(500, 'OPENAI_CONFIG_INVALID', 'OPENAI_TIMEOUT_MS must be a positive number.');
  }

  return parsedValue;
};

const extractStructuredText = (responseBody: OpenAiResponseBody) => {
  if (typeof responseBody.output_text === 'string' && responseBody.output_text.trim()) {
    return responseBody.output_text.trim();
  }

  const textParts: string[] = [];

  for (const outputItem of responseBody.output || []) {
    for (const contentItem of outputItem.content || []) {
      if (contentItem.type === 'refusal') {
        throw new ApiError(
          422,
          'MODEL_REFUSAL',
          contentItem.refusal || 'The model could not safely complete the image analysis.'
        );
      }

      if (contentItem.type === 'output_text' && typeof contentItem.text === 'string') {
        textParts.push(contentItem.text);
      }
    }
  }

  const combinedText = textParts.join('\n').trim();

  if (!combinedText) {
    throw new ApiError(502, 'MODEL_RESPONSE_INVALID', 'The model returned an empty analysis response.');
  }

  return combinedText;
};

const clamp = (value: number, minimum: number, maximum: number) => {
  if (Number.isNaN(value)) {
    return minimum;
  }

  return Math.min(maximum, Math.max(minimum, value));
};

const cleanString = (value: string | undefined | null, fallback: string) => {
  const normalized = value?.trim().replace(/\s+/g, ' ');
  return normalized ? normalized : fallback;
};

const cleanStringArray = (values: Array<string | undefined | null> | undefined, limit: number) => {
  return (values || [])
    .map((value) => cleanString(value, ''))
    .filter(Boolean)
    .slice(0, limit);
};

const normalizeQualityAssessment = (assessment: ImageQualityAssessment): ImageQualityAssessment => ({
  analysis_allowed: Boolean(assessment.analysis_allowed),
  quality_score: clamp(Number(assessment.quality_score ?? 0), 0, 1),
  face_count: Number.isFinite(Number(assessment.face_count)) ? Math.max(0, Math.floor(Number(assessment.face_count))) : 0,
  face_visibility: assessment.face_visibility || 'partial',
  lighting: assessment.lighting || 'mixed',
  white_balance_risk: assessment.white_balance_risk || 'medium',
  filter_or_heavy_editing_risk: assessment.filter_or_heavy_editing_risk || 'medium',
  makeup_risk: assessment.makeup_risk || 'unknown',
  retry_required_reasons: cleanStringArray(assessment.retry_required_reasons, 4),
  user_guidance: cleanString(
    assessment.user_guidance,
    'Use a front-facing selfie in natural daylight without strong filters or heavy shadows.'
  )
});

const normalizeModelAnalysis = (analysis: ModelAnalysisOutput): ModelAnalysisOutput => {
  const normalizedPalette = (analysis.recommended_palette || [])
    .map((color) => ({
      name: cleanString(color.name, 'Recommended Shade'),
      hex: /^#[0-9a-fA-F]{6}$/.test(color.hex?.trim() || '') ? color.hex.trim().toUpperCase() : '#B08968',
      use_case: color.use_case
    }))
    .slice(0, 8);

  return {
    ...analysis,
    image_quality: {
      passed: Boolean(analysis.image_quality?.passed),
      score: clamp(Number(analysis.image_quality?.score ?? 0), 0, 1),
      issues: (analysis.image_quality?.issues || []).map((issue) => cleanString(issue, '')).filter(Boolean).slice(0, 4),
      retry_advice: analysis.image_quality?.retry_advice
        ? cleanString(analysis.image_quality.retry_advice, 'Please try a clearer selfie in natural light.')
        : null
    },
    quality_assessment: analysis.quality_assessment
      ? normalizeQualityAssessment(analysis.quality_assessment)
      : undefined,
    season_result: {
      primary: analysis.season_result!.primary,
      secondary: analysis.season_result?.secondary || null,
      confidence: clamp(Number(analysis.season_result?.confidence ?? 0), 0, 1)
    },
    evidence: {
      observable_traits: {
        undertone_evidence: cleanStringArray(analysis.evidence?.observable_traits?.undertone_evidence, 4),
        contrast_evidence: cleanStringArray(analysis.evidence?.observable_traits?.contrast_evidence, 4),
        brightness_evidence: cleanStringArray(analysis.evidence?.observable_traits?.brightness_evidence, 4),
        saturation_evidence: cleanStringArray(analysis.evidence?.observable_traits?.saturation_evidence, 4)
      },
      uncertainty_factors: cleanStringArray(analysis.evidence?.uncertainty_factors, 6),
      top_season_candidates: (analysis.evidence?.top_season_candidates || [])
        .map((candidate) => ({
          season: candidate.season,
          score: clamp(Number(candidate.score ?? 0), 0, 1),
          evidence_for: cleanStringArray(candidate.evidence_for, 4),
          evidence_against: cleanStringArray(candidate.evidence_against, 4)
        }))
        .sort((first, second) => second.score - first.score)
        .slice(0, 4),
      confidence_reason: cleanString(
        analysis.evidence?.confidence_reason,
        'Confidence reflects visible image evidence and photo quality.'
      )
    },
    summary: {
      headline: cleanString(analysis.summary?.headline, analysis.season_result?.primary || 'Color Analysis'),
      one_liner: cleanString(
        analysis.summary?.one_liner,
        'Your report is ready with a cautious color analysis based on the uploaded image.'
      ),
      explanations: (analysis.summary?.explanations || [])
        .map((explanation) => cleanString(explanation, ''))
        .filter(Boolean)
        .slice(0, 4)
    },
    recommended_palette: normalizedPalette,
    beauty_recommendations: {
      lipstick: (analysis.beauty_recommendations?.lipstick || []).slice(0, 3).map((item) => ({
        shade: cleanString(item.shade, 'Balanced warm rose'),
        reason: cleanString(item.reason, 'Chosen to align with your visible color harmony.')
      })),
      blush: (analysis.beauty_recommendations?.blush || []).slice(0, 3).map((item) => ({
        shade: cleanString(item.shade, 'Soft apricot'),
        reason: cleanString(item.reason, 'Adds color without overpowering your natural contrast.')
      })),
      eyeshadow: (analysis.beauty_recommendations?.eyeshadow || []).slice(0, 3).map((item) => ({
        shade: cleanString(item.shade, 'Soft bronze'),
        reason: cleanString(item.reason, 'Keeps depth and definition in balance.')
      })),
      base_makeup: (analysis.beauty_recommendations?.base_makeup || []).slice(0, 2).map((item) => ({
        tip: cleanString(item.tip, 'Match base makeup to your neck and chest in natural light.')
      }))
    },
    fashion_recommendations: {
      best_colors: (analysis.fashion_recommendations?.best_colors || []).map((color) => cleanString(color, '')).filter(Boolean).slice(0, 6),
      avoid_colors: (analysis.fashion_recommendations?.avoid_colors || []).map((color) => cleanString(color, '')).filter(Boolean).slice(0, 6),
      metals: (analysis.fashion_recommendations?.metals || []).map((metal) => cleanString(metal, '')).filter(Boolean).slice(0, 4)
    },
    beta_features: {
      virtual_try_on_available: true
    }
  };
};

const postToOpenAi = async (payload: Record<string, unknown>): Promise<OpenAiResponseBody> => {
  const requestBody = JSON.stringify(payload);

  return new Promise((resolve, reject) => {
    let settled = false;

    const finalize = (error: Error | null, responseBody?: OpenAiResponseBody) => {
      if (settled) return;
      settled = true;

      if (error) {
        reject(error);
        return;
      }

      resolve(responseBody || {});
    };

    const request = https.request(
      OPENAI_API_URL,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getOpenAiApiKey()}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestBody)
        }
      },
      (response) => {
        const chunks: Buffer[] = [];

        response.on('data', (chunk) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });

        response.on('end', () => {
          const responseText = Buffer.concat(chunks).toString('utf8');
          const parsedBody = responseText ? JSON.parse(responseText) as OpenAiResponseBody & OpenAiErrorBody : {};

          if (!response.statusCode || response.statusCode < 200 || response.statusCode >= 300) {
            const message =
              parsedBody.error?.message || `OpenAI request failed with status ${response.statusCode || 500}.`;

            finalize(new ApiError(502, 'OPENAI_API_ERROR', message));
            return;
          }

          finalize(null, parsedBody);
        });
      }
    );

    request.setTimeout(getOpenAiTimeoutMs(), () => {
      request.destroy(new ApiError(504, 'MODEL_TIMEOUT', 'The OpenAI request timed out.'));
    });

    request.on('error', (error) => {
      finalize(
        error instanceof ApiError
          ? error
          : new ApiError(502, 'OPENAI_REQUEST_FAILED', error.message || 'Failed to contact OpenAI.')
      );
    });

    request.write(requestBody);
    request.end();
  });
};

const validateQualityAssessment = (assessment: ImageQualityAssessment) => {
  const normalized = normalizeQualityAssessment(assessment);

  if (!['clear', 'partial', 'poor'].includes(normalized.face_visibility)) {
    throw new ApiError(502, 'MODEL_RESPONSE_INVALID', 'The model returned an invalid face visibility value.');
  }

  if (!['natural_even', 'warm_indoor', 'cool_indoor', 'backlit', 'mixed', 'poor'].includes(normalized.lighting)) {
    throw new ApiError(502, 'MODEL_RESPONSE_INVALID', 'The model returned an invalid lighting value.');
  }

  return normalized;
};

const getMockQualityAssessment = (image: UploadedImage): ImageQualityAssessment => {
  const hasSmallFile = image.size < 20 * 1024;

  return {
    analysis_allowed: image.size > 0,
    quality_score: hasSmallFile ? 0.62 : 0.87,
    face_count: 1,
    face_visibility: 'clear',
    lighting: hasSmallFile ? 'mixed' : 'natural_even',
    white_balance_risk: hasSmallFile ? 'medium' : 'low',
    filter_or_heavy_editing_risk: 'low',
    makeup_risk: 'unknown',
    retry_required_reasons: hasSmallFile
      ? ['The uploaded file is quite small, so fine details may be limited.']
      : [],
    user_guidance: hasSmallFile
      ? 'For a more reliable result, upload a larger clear selfie in natural light.'
      : 'This photo is clear enough for a stable demo analysis.'
  };
};

const requestOpenAiQualityAssessment = async (
  image: UploadedImage,
  detail: 'high' | 'low' | 'auto'
): Promise<ImageQualityAssessment> => {
  const model = getOpenAiModel('fast');
  const responseBody = await postToOpenAi(withReasoningConfig({
    model,
    input: [
      {
        role: 'user',
        content: [
          { type: 'input_text', text: imageQualityPrompt },
          {
            type: 'input_image',
            image_url: `data:${image.mimeType};base64,${image.buffer.toString('base64')}`,
            detail
          }
        ]
      }
    ],
    text: {
      format: {
        type: 'json_schema',
        name: 'image_quality_assessment',
        strict: true,
        schema: imageQualityJsonSchema
      }
    }
  }, model));
  const rawText = extractStructuredText(responseBody);

  try {
    return validateQualityAssessment(JSON.parse(rawText) as ImageQualityAssessment);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      502,
      'MODEL_RESPONSE_INVALID',
      error instanceof Error ? error.message : 'The model returned invalid image quality JSON.'
    );
  }
};

export const analyzeImageWithMockAi = async (image: UploadedImage): Promise<ModelAnalysisOutput> => {
  void colorAnalysisPrompt;
  void imageQualityPrompt;
  void analysisCriticPrompt;
  await wait(900);

  const qualityAssessment = getMockQualityAssessment(image);

  const output: ModelAnalysisOutput = {
    image_quality: createQualityFromAssessment(qualityAssessment),
    quality_assessment: qualityAssessment,
    season_result: {
      primary: 'Warm Autumn',
      secondary: 'Soft Autumn',
      confidence: 0.78
    },
    attributes: {
      undertone: 'warm',
      brightness: 'medium-low',
      saturation: 'muted',
      contrast: 'medium'
    },
    evidence: {
      observable_traits: {
        undertone_evidence: ['The demo profile reads warmer than cool under the mocked analysis.'],
        contrast_evidence: ['The mocked profile uses a moderate contrast pattern.'],
        brightness_evidence: ['The demo profile is calibrated to medium-low brightness.'],
        saturation_evidence: ['Muted earthy colors are prioritized over high-chroma colors.']
      },
      uncertainty_factors: qualityAssessment.quality_score < 0.7
        ? ['The uploaded file is small, so this mock result should be treated as tentative.']
        : [],
      top_season_candidates: [
        {
          season: 'Warm Autumn',
          score: 0.86,
          evidence_for: ['Warm undertone, muted saturation, and medium contrast align with Warm Autumn.'],
          evidence_against: []
        },
        {
          season: 'Soft Autumn',
          score: 0.78,
          evidence_for: ['Muted saturation and softer contrast are also compatible with Soft Autumn.'],
          evidence_against: ['The demo result leans warmer and earthier than a fully soft-neutral profile.']
        }
      ],
      confidence_reason: 'Mock confidence is calibrated from image size, warmth, muted saturation, and candidate gap.'
    },
    summary: {
      headline: 'Warm Autumn',
      one_liner: 'You look best in warm, muted, earthy tones with soft contrast.',
      explanations: [
        'Your overall coloring appears warmer than cool in this mock analysis.',
        'Muted earthy shades create more harmony than icy, neon, or blue-based tones.',
        'Your moderate contrast favors softer makeup transitions rather than stark edges.'
      ]
    },
    recommended_palette: [
      { name: 'Terracotta', hex: '#C96A4A', use_case: 'lipstick' },
      { name: 'Camel', hex: '#C19A6B', use_case: 'fashion' },
      { name: 'Olive Green', hex: '#7A8448', use_case: 'fashion' },
      { name: 'Warm Coral', hex: '#E88973', use_case: 'blush' },
      { name: 'Bronze', hex: '#8C6239', use_case: 'eyeshadow' }
    ],
    beauty_recommendations: {
      lipstick: [
        {
          shade: 'Brick Red',
          reason: 'Complements warm muted undertones without overpowering the face.'
        },
        {
          shade: 'Warm Terracotta',
          reason: 'Adds depth while staying natural and earthy.'
        }
      ],
      blush: [
        {
          shade: 'Apricot',
          reason: 'Adds a healthy warm flush that stays soft.'
        }
      ],
      eyeshadow: [
        {
          shade: 'Olive Brown',
          reason: 'Enhances depth without looking harsh or too cool.'
        },
        {
          shade: 'Bronze',
          reason: 'Keeps the eye look warm, polished, and dimensional.'
        }
      ],
      base_makeup: [
        {
          tip: 'Choose warm or neutral-warm base shades with a natural finish.'
        }
      ]
    },
    fashion_recommendations: {
      best_colors: ['Camel', 'Cream', 'Olive', 'Warm Beige', 'Rust'],
      avoid_colors: ['Icy Pink', 'Cool Magenta', 'Blue-based Purple', 'Neon Brights'],
      metals: ['Gold', 'Antique Gold', 'Bronze']
    },
    beta_features: {
      virtual_try_on_available: true
    }
  };

  return validateModelAnalysis(calibrateAnalysis(output, qualityAssessment));
};

const requestOpenAiAnalysis = async (
  image: UploadedImage,
  detail: 'high' | 'low' | 'auto',
  qualityAssessment: ImageQualityAssessment
): Promise<ModelAnalysisOutput> => {
  const model = getOpenAiModel('primary');
  const responseBody = await postToOpenAi(withReasoningConfig({
    model,
    input: [
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: `${colorAnalysisPrompt}\n\nImage quality assessment from the first pipeline stage:\n${JSON.stringify(qualityAssessment)}`
          },
          {
            type: 'input_image',
            image_url: `data:${image.mimeType};base64,${image.buffer.toString('base64')}`,
            detail
          }
        ]
      }
    ],
    text: {
      format: {
        type: 'json_schema',
        name: 'color_analysis_report',
        strict: true,
        schema: analysisJsonSchema
      }
    }
  }, model));

  const rawText = extractStructuredText(responseBody);

  try {
    const normalizedAnalysis = normalizeModelAnalysis(JSON.parse(rawText) as ModelAnalysisOutput);
    return validateModelAnalysis(calibrateAnalysis(normalizedAnalysis, qualityAssessment));
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      502,
      'MODEL_RESPONSE_INVALID',
      error instanceof Error ? error.message : 'The model returned invalid JSON.'
    );
  }
};

export const analyzeImageWithOpenAi = async (image: UploadedImage): Promise<ModelAnalysisOutput> => {
  const detail = getOpenAiImageDetail('high');

  try {
    const qualityAssessment = await requestOpenAiQualityAssessment(image, detail);

    if (!qualityAssessment.analysis_allowed) {
      throw new ApiError(
        422,
        'IMAGE_QUALITY_BLOCKED',
        qualityAssessment.user_guidance || 'Please upload a clearer front-facing selfie before analysis.'
      );
    }

    return await requestOpenAiAnalysis(image, detail, qualityAssessment);
  } catch (error) {
    if (!(error instanceof ApiError) || error.code !== 'MODEL_TIMEOUT') {
      throw error;
    }

    console.warn('[ColorSnap] Retrying OpenAI analysis with lower image detail after timeout.');
    const fallbackDetail = getOpenAiFallbackImageDetail();
    const qualityAssessment = await requestOpenAiQualityAssessment(image, fallbackDetail);

    if (!qualityAssessment.analysis_allowed) {
      throw new ApiError(
        422,
        'IMAGE_QUALITY_BLOCKED',
        qualityAssessment.user_guidance || 'Please upload a clearer front-facing selfie before analysis.'
      );
    }

    return requestOpenAiAnalysis(image, fallbackDetail, qualityAssessment);
  }
};

export const analyzeImage = async (image: UploadedImage): Promise<ModelAnalysisOutput> => {
  if (isMockAiEnabled()) {
    return analyzeImageWithMockAi(image);
  }

  return analyzeImageWithOpenAi(image);
};

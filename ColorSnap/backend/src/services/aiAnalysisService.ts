import * as https from 'https';
import { validateModelAnalysis } from '../schemas/analysisSchema';
import type { ModelAnalysisOutput, UploadedImage } from '../types/analysis';
import { colorAnalysisPrompt } from '../prompts/colorAnalysisPrompt';
import { ApiError } from '../utils/errors';

const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const OPENAI_API_URL = 'https://api.openai.com/v1/responses';
const DEFAULT_OPENAI_MODEL = 'gpt-4.1-mini';
const DEFAULT_TIMEOUT_MS = 20_000;

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

const getOpenAiModel = () => process.env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL;

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
    season_result: {
      primary: analysis.season_result!.primary,
      secondary: analysis.season_result?.secondary || null,
      confidence: clamp(Number(analysis.season_result?.confidence ?? 0), 0, 1)
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

export const analyzeImageWithMockAi = async (image: UploadedImage): Promise<ModelAnalysisOutput> => {
  void colorAnalysisPrompt;
  await wait(900);

  const hasSmallFile = image.size < 20 * 1024;

  const output: ModelAnalysisOutput = {
    image_quality: {
      passed: !hasSmallFile,
      score: hasSmallFile ? 0.62 : 0.87,
      issues: hasSmallFile ? ['The uploaded file is quite small, so fine details may be limited.'] : [],
      retry_advice: hasSmallFile
        ? 'For a more reliable result, upload a larger clear selfie in natural light.'
        : null
    },
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

  return validateModelAnalysis(output);
};

const requestOpenAiAnalysis = async (
  image: UploadedImage,
  detail: 'high' | 'low'
): Promise<ModelAnalysisOutput> => {
  const responseBody = await postToOpenAi({
    model: getOpenAiModel(),
    input: [
      {
        role: 'user',
        content: [
          { type: 'input_text', text: colorAnalysisPrompt },
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
  });

  const rawText = extractStructuredText(responseBody);

  try {
    return validateModelAnalysis(normalizeModelAnalysis(JSON.parse(rawText) as ModelAnalysisOutput));
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
  try {
    return await requestOpenAiAnalysis(image, 'high');
  } catch (error) {
    if (!(error instanceof ApiError) || error.code !== 'MODEL_TIMEOUT') {
      throw error;
    }

    console.warn('[ColorSnap] Retrying OpenAI analysis with lower image detail after timeout.');
    return requestOpenAiAnalysis(image, 'low');
  }
};

export const analyzeImage = async (image: UploadedImage): Promise<ModelAnalysisOutput> => {
  if (isMockAiEnabled()) {
    return analyzeImageWithMockAi(image);
  }

  return analyzeImageWithOpenAi(image);
};

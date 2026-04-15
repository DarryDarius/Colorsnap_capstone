import { validateModelAnalysis } from '../schemas/analysisSchema';
import type { ModelAnalysisOutput, UploadedImage } from '../types/analysis';
import { colorAnalysisPrompt } from '../prompts/colorAnalysisPrompt';

const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

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

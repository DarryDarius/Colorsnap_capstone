import type { ModelAnalysisOutput, Season } from '../types/analysis';

const seasons = new Set<Season>([
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
]);

const undertones = new Set(['warm', 'cool', 'neutral']);
const brightnessValues = new Set(['low', 'medium-low', 'medium', 'medium-high', 'high']);
const saturations = new Set(['muted', 'medium', 'bright']);
const contrasts = new Set(['low', 'medium', 'high']);

export const validateModelAnalysis = (analysis: ModelAnalysisOutput): ModelAnalysisOutput => {
  if (!analysis.image_quality || typeof analysis.image_quality.score !== 'number') {
    throw new Error('Model output is missing image quality.');
  }

  if (!analysis.season_result || !seasons.has(analysis.season_result.primary)) {
    throw new Error('Model output is missing a valid primary season.');
  }

  if (
    analysis.season_result.secondary !== null &&
    analysis.season_result.secondary !== undefined &&
    !seasons.has(analysis.season_result.secondary)
  ) {
    throw new Error('Model output has an invalid secondary season.');
  }

  if (
    analysis.season_result.confidence < 0 ||
    analysis.season_result.confidence > 1
  ) {
    throw new Error('Model confidence must be between 0 and 1.');
  }

  if (
    !analysis.attributes ||
    !undertones.has(analysis.attributes.undertone) ||
    !brightnessValues.has(analysis.attributes.brightness) ||
    !saturations.has(analysis.attributes.saturation) ||
    !contrasts.has(analysis.attributes.contrast)
  ) {
    throw new Error('Model output has invalid color attributes.');
  }

  return analysis;
};

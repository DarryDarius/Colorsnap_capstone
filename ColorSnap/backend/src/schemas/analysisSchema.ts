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
const profileValues = new Set(['light', 'medium', 'deep']);
const profileClarities = new Set(['soft', 'clear']);
const faceVisibilityValues = new Set(['clear', 'partial', 'poor']);
const lightingValues = new Set(['natural_even', 'warm_indoor', 'cool_indoor', 'backlit', 'mixed', 'poor']);
const riskValues = new Set(['low', 'medium', 'high']);
const makeupRiskValues = new Set(['none', 'light', 'heavy', 'unknown']);

const isStringArray = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
};

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

  if (analysis.color_profile_v2) {
    if (
      !undertones.has(analysis.color_profile_v2.undertone) ||
      !profileValues.has(analysis.color_profile_v2.value) ||
      !saturations.has(analysis.color_profile_v2.chroma) ||
      !profileClarities.has(analysis.color_profile_v2.clarity) ||
      !contrasts.has(analysis.color_profile_v2.contrast) ||
      !riskValues.has(analysis.color_profile_v2.lighting_risk) ||
      !riskValues.has(analysis.color_profile_v2.makeup_risk) ||
      !riskValues.has(analysis.color_profile_v2.filter_risk)
    ) {
      throw new Error('Model output has invalid ColorProfileV2 fields.');
    }
  }

  if (analysis.quality_assessment) {
    if (
      typeof analysis.quality_assessment.analysis_allowed !== 'boolean' ||
      typeof analysis.quality_assessment.quality_score !== 'number' ||
      analysis.quality_assessment.quality_score < 0 ||
      analysis.quality_assessment.quality_score > 1 ||
      typeof analysis.quality_assessment.face_count !== 'number' ||
      !faceVisibilityValues.has(analysis.quality_assessment.face_visibility) ||
      !lightingValues.has(analysis.quality_assessment.lighting) ||
      !riskValues.has(analysis.quality_assessment.white_balance_risk) ||
      !riskValues.has(analysis.quality_assessment.filter_or_heavy_editing_risk) ||
      !makeupRiskValues.has(analysis.quality_assessment.makeup_risk) ||
      !isStringArray(analysis.quality_assessment.retry_required_reasons) ||
      typeof analysis.quality_assessment.user_guidance !== 'string'
    ) {
      throw new Error('Model output has invalid image quality assessment.');
    }
  }

  if (!analysis.evidence) {
    throw new Error('Model output is missing evidence.');
  }

  if (
    !analysis.evidence.observable_traits ||
    !isStringArray(analysis.evidence.observable_traits.undertone_evidence) ||
    !isStringArray(analysis.evidence.observable_traits.contrast_evidence) ||
    !isStringArray(analysis.evidence.observable_traits.brightness_evidence) ||
    !isStringArray(analysis.evidence.observable_traits.saturation_evidence) ||
    !isStringArray(analysis.evidence.uncertainty_factors) ||
    typeof analysis.evidence.confidence_reason !== 'string' ||
    !Array.isArray(analysis.evidence.top_season_candidates) ||
    analysis.evidence.top_season_candidates.length < 2
  ) {
    throw new Error('Model output has invalid evidence fields.');
  }

  for (const candidate of analysis.evidence.top_season_candidates) {
    if (
      !seasons.has(candidate.season) ||
      typeof candidate.score !== 'number' ||
      candidate.score < 0 ||
      candidate.score > 1 ||
      !isStringArray(candidate.evidence_for) ||
      !isStringArray(candidate.evidence_against)
    ) {
      throw new Error('Model output has invalid season candidate evidence.');
    }
  }

  return analysis;
};

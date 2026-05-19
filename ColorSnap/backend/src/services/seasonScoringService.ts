import seasonRulebook from '../data/seasonRules.json';
import type {
  AnalysisResult,
  ColorAttributes,
  ColorProfileV2,
  Contrast,
  ImageQualityAssessment,
  ModelAnalysisOutput,
  ProfileClarity,
  ProfileValue,
  RiskLevel,
  Saturation,
  Season,
  SeasonCandidate,
  Undertone
} from '../types/analysis';

type SeasonRule = {
  undertone: Undertone[];
  value: ProfileValue[];
  chroma: Saturation[];
  clarity: ProfileClarity[];
  contrast: Contrast[];
  family: 'Spring' | 'Summer' | 'Autumn' | 'Winter';
};

type Rulebook = {
  version: string;
  seasons: Record<Season, SeasonRule>;
  weights: {
    undertone: number;
    value: number;
    chroma: number;
    clarity: number;
    contrast: number;
  };
  confidenceCaps: {
    lightingRiskMedium: number;
    lightingRiskHigh: number;
    makeupRiskHigh: number;
    filterRiskHigh: number;
  };
};

const rulebook = seasonRulebook as Rulebook;

const valueOrder: ProfileValue[] = ['light', 'medium', 'deep'];
const chromaOrder: Saturation[] = ['muted', 'medium', 'bright'];
const contrastOrder: Contrast[] = ['low', 'medium', 'high'];

const clamp = (value: number, minimum: number, maximum: number) => (
  Math.min(maximum, Math.max(minimum, Number.isFinite(value) ? value : minimum))
);

const mapBrightnessToValue = (brightness: ColorAttributes['brightness']): ProfileValue => {
  if (brightness === 'high' || brightness === 'medium-high') return 'light';
  if (brightness === 'low' || brightness === 'medium-low') return 'deep';
  return 'medium';
};

const mapClarity = (chroma: Saturation, contrast: Contrast): ProfileClarity => (
  chroma === 'bright' || (chroma === 'medium' && contrast === 'high') ? 'clear' : 'soft'
);

const mapMakeupRisk = (risk: ImageQualityAssessment['makeup_risk'] | undefined): RiskLevel => {
  if (risk === 'heavy') return 'high';
  if (risk === 'light' || risk === 'unknown') return 'medium';
  return 'low';
};

const mapLightingRisk = (assessment?: ImageQualityAssessment): RiskLevel => {
  if (!assessment) return 'medium';
  if (
    assessment.white_balance_risk === 'high' ||
    assessment.lighting === 'poor' ||
    assessment.lighting === 'backlit'
  ) {
    return 'high';
  }
  if (
    assessment.white_balance_risk === 'medium' ||
    assessment.lighting === 'mixed' ||
    assessment.lighting === 'warm_indoor' ||
    assessment.lighting === 'cool_indoor'
  ) {
    return 'medium';
  }
  return 'low';
};

const getAxisScore = <T extends string>(value: T, accepted: T[], orderedValues?: T[]) => {
  if (accepted.includes(value)) return 1;

  if (orderedValues) {
    const valueIndex = orderedValues.indexOf(value);
    const closestDistance = accepted.reduce((closest, acceptedValue) => {
      const acceptedIndex = orderedValues.indexOf(acceptedValue);
      if (valueIndex < 0 || acceptedIndex < 0) return closest;
      return Math.min(closest, Math.abs(valueIndex - acceptedIndex));
    }, Number.POSITIVE_INFINITY);

    if (closestDistance === 1) return 0.45;
  }

  return 0;
};

const getUndertoneScore = (undertone: Undertone, accepted: Undertone[]) => {
  if (accepted.includes(undertone)) return 1;
  if (undertone === 'neutral') return 0.65;
  if (accepted.includes('neutral')) return 0.75;
  return 0;
};

const formatList = (items: string[]) => items.join('/');

const createAxisEvidence = (
  label: string,
  value: string,
  accepted: string[],
  score: number
) => {
  if (score >= 0.95) {
    return {
      for: `${label} aligns with ${value}.`,
      against: null
    };
  }

  if (score >= 0.45) {
    return {
      for: `${label} is close to the ${formatList(accepted)} range.`,
      against: `${label} reads as ${value}, so this candidate is not a perfect fit.`
    };
  }

  return {
    for: null,
    against: `${label} reads as ${value}, while this candidate usually expects ${formatList(accepted)}.`
  };
};

export const deriveColorProfileV2 = (
  attributes: ColorAttributes,
  qualityAssessment?: ImageQualityAssessment
): ColorProfileV2 => {
  const value = mapBrightnessToValue(attributes.brightness);
  const chroma = attributes.saturation;
  const contrast = attributes.contrast;

  return {
    undertone: attributes.undertone,
    value,
    chroma,
    clarity: mapClarity(chroma, contrast),
    contrast,
    lighting_risk: mapLightingRisk(qualityAssessment),
    makeup_risk: mapMakeupRisk(qualityAssessment?.makeup_risk),
    filter_risk: qualityAssessment?.filter_or_heavy_editing_risk || 'medium'
  };
};

const scoreSeason = (season: Season, profile: ColorProfileV2) => {
  const rule = rulebook.seasons[season];
  const axisScores = {
    undertone: getUndertoneScore(profile.undertone, rule.undertone),
    value: getAxisScore(profile.value, rule.value, valueOrder),
    chroma: getAxisScore(profile.chroma, rule.chroma, chromaOrder),
    clarity: getAxisScore(profile.clarity, rule.clarity),
    contrast: getAxisScore(profile.contrast, rule.contrast, contrastOrder)
  };
  const score = (
    axisScores.undertone * rulebook.weights.undertone +
    axisScores.value * rulebook.weights.value +
    axisScores.chroma * rulebook.weights.chroma +
    axisScores.clarity * rulebook.weights.clarity +
    axisScores.contrast * rulebook.weights.contrast
  );

  return {
    season,
    rule,
    axisScores,
    score: clamp(score, 0, 1)
  };
};

const getConfidenceCap = (profile: ColorProfileV2) => {
  const caps: Array<{ cap: number; reason: string }> = [];

  if (profile.lighting_risk === 'medium') {
    caps.push({
      cap: rulebook.confidenceCaps.lightingRiskMedium,
      reason: 'Confidence was capped because indoor or mixed lighting may shift apparent undertone.'
    });
  }

  if (profile.lighting_risk === 'high') {
    caps.push({
      cap: rulebook.confidenceCaps.lightingRiskHigh,
      reason: 'Confidence was capped because high lighting or white-balance risk may distort visible coloring.'
    });
  }

  if (profile.makeup_risk === 'high') {
    caps.push({
      cap: rulebook.confidenceCaps.makeupRiskHigh,
      reason: 'Confidence was capped because heavy makeup may obscure natural undertone and contrast.'
    });
  }

  if (profile.filter_risk === 'high') {
    caps.push({
      cap: rulebook.confidenceCaps.filterRiskHigh,
      reason: 'Confidence was capped because filter or heavy editing risk may distort facial color evidence.'
    });
  }

  return caps.sort((first, second) => first.cap - second.cap)[0] || null;
};

const createCandidate = (scored: ReturnType<typeof scoreSeason>, profile: ColorProfileV2): SeasonCandidate => {
  const evidenceFor: string[] = [];
  const evidenceAgainst: string[] = [];
  const axisEvidence = [
    createAxisEvidence('Undertone', profile.undertone, scored.rule.undertone, scored.axisScores.undertone),
    createAxisEvidence('Value', profile.value, scored.rule.value, scored.axisScores.value),
    createAxisEvidence('Chroma', profile.chroma, scored.rule.chroma, scored.axisScores.chroma),
    createAxisEvidence('Clarity', profile.clarity, scored.rule.clarity, scored.axisScores.clarity),
    createAxisEvidence('Contrast', profile.contrast, scored.rule.contrast, scored.axisScores.contrast)
  ];

  for (const evidence of axisEvidence) {
    if (evidence.for) evidenceFor.push(evidence.for);
    if (evidence.against) evidenceAgainst.push(evidence.against);
  }

  return {
    season: scored.season,
    score: Number(scored.score.toFixed(2)),
    evidence_for: evidenceFor.slice(0, 4),
    evidence_against: evidenceAgainst.slice(0, 4)
  };
};

export const applyKoreanPersonalColorScoring = (analysis: ModelAnalysisOutput): ModelAnalysisOutput => {
  if (!analysis.attributes) {
    return analysis;
  }

  const profile = deriveColorProfileV2(analysis.attributes, analysis.quality_assessment);
  const scoredSeasons = (Object.keys(rulebook.seasons) as Season[])
    .map((season) => scoreSeason(season, profile))
    .sort((first, second) => second.score - first.score);
  const topCandidates = scoredSeasons.slice(0, 4).map((scored) => createCandidate(scored, profile));
  const [primary, secondary] = topCandidates;
  const rawConfidence = clamp(
    0.46 + (primary.score * 0.4) + Math.max(0, primary.score - (secondary?.score || 0)) * 0.22,
    0.45,
    0.92
  );
  const cap = getConfidenceCap(profile);
  const confidence = cap ? Math.min(rawConfidence, cap.cap) : rawConfidence;
  const uncertaintyFactors = [
    ...(analysis.evidence?.uncertainty_factors || []),
    profile.lighting_risk !== 'low' ? `Lighting risk is ${profile.lighting_risk}; environment color is treated as uncertainty, not season evidence.` : '',
    profile.makeup_risk !== 'low' ? `Makeup risk is ${profile.makeup_risk}; natural undertone may be partially obscured.` : '',
    profile.filter_risk !== 'low' ? `Filter/editing risk is ${profile.filter_risk}; confidence is reduced if color cast is likely.` : ''
  ].filter(Boolean);

  return {
    ...analysis,
    color_profile_v2: profile,
    season_result: {
      primary: primary.season,
      secondary: secondary?.season || null,
      confidence: Number(confidence.toFixed(2))
    },
    evidence: {
      observable_traits: analysis.evidence!.observable_traits,
      uncertainty_factors: [...new Set(uncertaintyFactors)].slice(0, 8),
      top_season_candidates: topCandidates,
      confidence_reason: cap
        ? cap.reason
        : 'Confidence reflects Korean personal color rule scoring across undertone, value, chroma, clarity, and contrast.'
    },
    confidence_cap_reason: cap?.reason || null,
    rejected_evidence: secondary?.evidence_against || [],
    knowledge_base_version: rulebook.version,
    season_scoring: {
      version: rulebook.version,
      top_score_gap: Number((primary.score - (secondary?.score || 0)).toFixed(2)),
      raw_scores: scoredSeasons.map((scored) => ({
        season: scored.season,
        score: Number(scored.score.toFixed(2))
      }))
    }
  };
};

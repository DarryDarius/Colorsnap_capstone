import type {
  AnalysisCriticResult,
  ColorAttributes,
  ImageQualityAssessment,
  ModelAnalysisOutput,
  Season,
  SeasonCandidate
} from '../types/analysis';

type RuleValue<T extends string> = readonly T[];

type SeasonRule = {
  undertone: RuleValue<ColorAttributes['undertone']>;
  brightness: RuleValue<ColorAttributes['brightness']>;
  saturation: RuleValue<ColorAttributes['saturation']>;
  contrast: RuleValue<ColorAttributes['contrast']>;
};

export const seasonRules: Record<Season, SeasonRule> = {
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
};

const scoreSeasonRule = (rule: SeasonRule, attributes: ColorAttributes) => {
  const score =
    (rule.undertone.includes(attributes.undertone) ? 0.34 : 0) +
    (rule.brightness.includes(attributes.brightness) ? 0.22 : 0) +
    (rule.saturation.includes(attributes.saturation) ? 0.24 : 0) +
    (rule.contrast.includes(attributes.contrast) ? 0.2 : 0);

  return Math.round(score * 100) / 100;
};

const getTopCandidateGap = (candidates: SeasonCandidate[]) => {
  if (candidates.length < 2) {
    return 1;
  }

  return Math.max(0, candidates[0].score - candidates[1].score);
};

const buildCalibrationCandidate = (
  season: Season,
  score: number,
  attributes: ColorAttributes
): SeasonCandidate => ({
  season,
  score,
  evidence_for: [
    `Rule match score ${Math.round(score * 100)}% for ${attributes.undertone} undertone.`,
    `Checks ${attributes.brightness} brightness, ${attributes.saturation} saturation, and ${attributes.contrast} contrast.`
  ],
  evidence_against: score < 0.5 ? ['Some observed attributes do not strongly match this seasonal profile.'] : []
});

export const getDeterministicSeasonCandidates = (attributes: ColorAttributes): SeasonCandidate[] => {
  return (Object.entries(seasonRules) as Array<[Season, SeasonRule]>)
    .map(([season, rule]) => buildCalibrationCandidate(season, scoreSeasonRule(rule, attributes), attributes))
    .sort((first, second) => second.score - first.score)
    .slice(0, 4);
};

export const createQualityFromAssessment = (assessment: ImageQualityAssessment) => ({
  passed: assessment.analysis_allowed && assessment.quality_score >= 0.72,
  score: assessment.quality_score,
  issues: [
    ...assessment.retry_required_reasons,
    assessment.white_balance_risk === 'high' ? 'White balance may distort visible undertone.' : '',
    assessment.filter_or_heavy_editing_risk === 'high' ? 'Filters or heavy edits may distort natural coloring.' : '',
    assessment.makeup_risk === 'heavy' ? 'Heavy makeup may affect the visible color read.' : ''
  ].filter(Boolean).slice(0, 4),
  retry_advice: assessment.analysis_allowed && assessment.quality_score >= 0.72
    ? null
    : assessment.user_guidance
});

export const buildDeterministicCritic = (
  analysis: ModelAnalysisOutput,
  qualityAssessment: ImageQualityAssessment,
  deterministicCandidates: SeasonCandidate[]
): AnalysisCriticResult => {
  const issues: AnalysisCriticResult['issues'] = [];
  const primarySeason = analysis.season_result?.primary;
  const modelConfidence = analysis.season_result?.confidence ?? 0;
  const deterministicTopSeason = deterministicCandidates[0]?.season;
  const topCandidateGap = getTopCandidateGap(analysis.evidence?.top_season_candidates || deterministicCandidates);

  if (qualityAssessment.quality_score < 0.65 && modelConfidence > 0.65) {
    issues.push({
      code: 'CONFIDENCE_TOO_HIGH',
      severity: 'high',
      message: 'Confidence is too high for a low-quality image.'
    });
  }

  if (qualityAssessment.white_balance_risk === 'high' && modelConfidence > 0.72) {
    issues.push({
      code: 'CONFIDENCE_TOO_HIGH',
      severity: 'medium',
      message: 'White balance risk should cap the confidence.'
    });
  }

  if (primarySeason && deterministicTopSeason && primarySeason !== deterministicTopSeason) {
    const primaryDeterministicScore = deterministicCandidates.find((candidate) => candidate.season === primarySeason)?.score || 0;

    if (primaryDeterministicScore < 0.58) {
      issues.push({
        code: 'SEASON_EVIDENCE_MISMATCH',
        severity: 'medium',
        message: 'The selected season is not strongly supported by deterministic attribute rules.'
      });
    }
  }

  if (topCandidateGap < 0.08 && modelConfidence > 0.7) {
    issues.push({
      code: 'CONFIDENCE_TOO_HIGH',
      severity: 'medium',
      message: 'The top season candidates are close, so the result should be presented as tentative.'
    });
  }

  if (
    (qualityAssessment.white_balance_risk === 'high' || qualityAssessment.filter_or_heavy_editing_risk === 'high') &&
    (analysis.evidence?.uncertainty_factors || []).length === 0
  ) {
    issues.push({
      code: 'QUALITY_UNCERTAINTY_MISSING',
      severity: 'medium',
      message: 'Image-quality risks should be included in the uncertainty factors.'
    });
  }

  return {
    passed: issues.length === 0,
    issues,
    suggested_confidence: issues.length > 0
      ? Math.min(modelConfidence, qualityAssessment.quality_score, topCandidateGap < 0.08 ? 0.7 : 1)
      : undefined
  };
};

export const calibrateAnalysis = (
  analysis: ModelAnalysisOutput,
  qualityAssessment: ImageQualityAssessment
): ModelAnalysisOutput => {
  const deterministicCandidates = analysis.attributes
    ? getDeterministicSeasonCandidates(analysis.attributes)
    : [];
  const mergedCandidates = [
    ...(analysis.evidence?.top_season_candidates || []),
    ...deterministicCandidates.filter((candidate) => (
      !(analysis.evidence?.top_season_candidates || []).some((existing) => existing.season === candidate.season)
    ))
  ].sort((first, second) => second.score - first.score).slice(0, 4);
  const topCandidateGap = getTopCandidateGap(mergedCandidates);
  const critic = buildDeterministicCritic(analysis, qualityAssessment, deterministicCandidates);
  const uncertaintyFactors = new Set(analysis.evidence?.uncertainty_factors || []);

  if (qualityAssessment.white_balance_risk === 'high') {
    uncertaintyFactors.add('White balance may shift the apparent undertone.');
  }

  if (qualityAssessment.filter_or_heavy_editing_risk === 'high') {
    uncertaintyFactors.add('Filters or edits may change visible chroma and value.');
  }

  if (qualityAssessment.makeup_risk === 'heavy') {
    uncertaintyFactors.add('Heavy makeup may affect undertone and contrast cues.');
  }

  if (topCandidateGap < 0.08 && mergedCandidates[1]) {
    uncertaintyFactors.add(`${mergedCandidates[1].season} is a close alternative.`);
  }

  const confidenceCaps = [
    1,
    qualityAssessment.quality_score < 0.65 ? 0.65 : 1,
    qualityAssessment.white_balance_risk === 'high' ? 0.72 : 1,
    qualityAssessment.filter_or_heavy_editing_risk === 'high' ? 0.68 : 1,
    qualityAssessment.makeup_risk === 'heavy' ? 0.74 : 1,
    topCandidateGap < 0.08 ? 0.7 : 1,
    critic.suggested_confidence ?? 1
  ];
  const calibratedConfidence = Math.max(
    0,
    Math.min(analysis.season_result?.confidence ?? 0, ...confidenceCaps)
  );

  return {
    ...analysis,
    image_quality: createQualityFromAssessment(qualityAssessment),
    quality_assessment: qualityAssessment,
    critic,
    season_result: analysis.season_result
      ? {
        ...analysis.season_result,
        secondary: analysis.season_result.secondary || mergedCandidates[1]?.season || null,
        confidence: Math.round(calibratedConfidence * 100) / 100
      }
      : analysis.season_result,
    evidence: {
      observable_traits: analysis.evidence?.observable_traits || {
        undertone_evidence: [],
        contrast_evidence: [],
        brightness_evidence: [],
        saturation_evidence: []
      },
      uncertainty_factors: Array.from(uncertaintyFactors).slice(0, 6),
      top_season_candidates: mergedCandidates,
      confidence_reason: analysis.evidence?.confidence_reason || 'Confidence was calibrated from image quality, candidate gap, and consistency checks.'
    }
  };
};


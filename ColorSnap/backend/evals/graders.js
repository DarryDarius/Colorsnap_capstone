const getTopCandidateSeasons = (analysis) => (
  analysis && analysis.evidence && Array.isArray(analysis.evidence.top_season_candidates)
    ? analysis.evidence.top_season_candidates.map((candidate) => candidate.season)
    : []
);

const roundMetric = (value) => Math.round(value * 1000) / 1000;

const average = (values) => {
  if (values.length === 0) return 0;
  return roundMetric(values.reduce((sum, value) => sum + value, 0) / values.length);
};

const averageBooleanMetric = (cases, key) => {
  if (cases.length === 0) return 0;
  return average(cases.map((item) => (item.scores[key] ? 1 : 0)));
};

const gradeQualityGate = (item, analysis) => {
  const qualityPassed = Boolean(analysis.image_quality && analysis.image_quality.passed);
  const analysisAllowed = Boolean(analysis.quality_assessment && analysis.quality_assessment.analysis_allowed);

  if (item.quality_label === 'good') {
    return qualityPassed;
  }

  if (item.quality_label === 'usable') {
    return analysisAllowed && !qualityPassed;
  }

  if (item.quality_label === 'low_quality') {
    return analysisAllowed && !qualityPassed;
  }

  if (item.quality_label === 'blocked') {
    return !analysisAllowed || !qualityPassed;
  }

  return false;
};

const gradeConfidenceCalibration = (item, analysis) => {
  const confidence = analysis.season_result && typeof analysis.season_result.confidence === 'number'
    ? analysis.season_result.confidence
    : 0;
  const topCandidateSeasons = getTopCandidateSeasons(analysis);
  const top1Match = analysis.season_result && analysis.season_result.primary === item.expert_primary_season;
  const top2Match = topCandidateSeasons.slice(0, 2).includes(item.expert_primary_season);
  const isLowQuality = item.quality_label === 'low_quality' || item.quality_label === 'blocked';

  if (isLowQuality && confidence > 0.65) {
    return 0;
  }

  if (top1Match && confidence >= 0.55 && confidence <= 0.85) {
    return 1;
  }

  if (top1Match) {
    return 0.8;
  }

  if (top2Match && confidence <= 0.75) {
    return 0.7;
  }

  if (!top1Match && confidence > 0.7) {
    return 0;
  }

  return 0.3;
};

const gradeCase = (item, analysis, schemaValid) => {
  const topCandidateSeasons = getTopCandidateSeasons(analysis);

  return {
    schema_valid: schemaValid,
    quality_gate_match: schemaValid ? gradeQualityGate(item, analysis) : item.quality_label === 'blocked',
    season_top1_match: analysis.season_result?.primary === item.expert_primary_season,
    season_top2_match: topCandidateSeasons.slice(0, 2).includes(item.expert_primary_season),
    undertone_match: analysis.attributes?.undertone === item.expected_undertone,
    brightness_match: analysis.attributes?.brightness === item.expected_brightness,
    saturation_match: analysis.attributes?.saturation === item.expected_saturation,
    contrast_match: analysis.attributes?.contrast === item.expected_contrast,
    confidence_calibration_score: schemaValid ? gradeConfidenceCalibration(item, analysis) : 0
  };
};

const emptyFailedScores = (item) => ({
  schema_valid: false,
  quality_gate_match: item.quality_label === 'blocked',
  season_top1_match: false,
  season_top2_match: false,
  undertone_match: false,
  brightness_match: false,
  saturation_match: false,
  contrast_match: false,
  confidence_calibration_score: 0
});

const getFailedChecks = (scores) => (
  Object.entries(scores)
    .filter(([key, value]) => key !== 'confidence_calibration_score' && value === false)
    .map(([key]) => key)
);

const summarizeCases = (cases) => {
  const confidenceScores = cases.map((item) => item.scores.confidence_calibration_score || 0);
  const failedCases = cases.filter((item) => (
    item.status === 'failed' ||
    getFailedChecks(item.scores).length > 0 ||
    (item.scores.confidence_calibration_score || 0) < 0.7
  ));

  return {
    total_cases: cases.length,
    schema_valid_rate: averageBooleanMetric(cases, 'schema_valid'),
    quality_gate_accuracy: averageBooleanMetric(cases, 'quality_gate_match'),
    season_top1_accuracy: averageBooleanMetric(cases, 'season_top1_match'),
    season_top2_accuracy: averageBooleanMetric(cases, 'season_top2_match'),
    undertone_accuracy: averageBooleanMetric(cases, 'undertone_match'),
    brightness_accuracy: averageBooleanMetric(cases, 'brightness_match'),
    saturation_accuracy: averageBooleanMetric(cases, 'saturation_match'),
    contrast_accuracy: averageBooleanMetric(cases, 'contrast_match'),
    confidence_calibration_score: average(confidenceScores),
    average_latency_ms: cases.length === 0
      ? 0
      : Math.round(cases.reduce((sum, item) => sum + item.latency_ms, 0) / cases.length),
    failed_case_count: failedCases.length
  };
};

const formatPercent = (value) => `${Math.round(value * 100)}%`;

const renderMarkdownReport = (report) => {
  const failedCases = report.cases.filter((item) => (
    item.status === 'failed' ||
    getFailedChecks(item.scores).length > 0 ||
    (item.scores.confidence_calibration_score || 0) < 0.7
  ));

  const metricRows = [
    ['Schema valid rate', formatPercent(report.metrics.schema_valid_rate)],
    ['Quality gate accuracy', formatPercent(report.metrics.quality_gate_accuracy)],
    ['Season top-1 accuracy', formatPercent(report.metrics.season_top1_accuracy)],
    ['Season top-2 accuracy', formatPercent(report.metrics.season_top2_accuracy)],
    ['Undertone accuracy', formatPercent(report.metrics.undertone_accuracy)],
    ['Brightness accuracy', formatPercent(report.metrics.brightness_accuracy)],
    ['Saturation accuracy', formatPercent(report.metrics.saturation_accuracy)],
    ['Contrast accuracy', formatPercent(report.metrics.contrast_accuracy)],
    ['Confidence calibration score', formatPercent(report.metrics.confidence_calibration_score)],
    ['Average latency', `${report.metrics.average_latency_ms} ms`],
    ['Failed cases', String(report.metrics.failed_case_count)]
  ];

  const failedRows = failedCases.length === 0
    ? ['No failed cases.']
    : failedCases.map((item) => {
      const failedChecks = getFailedChecks(item.scores);
      const predicted = item.predicted ? item.predicted.primary : 'none';
      return `- ${item.id}: expected ${item.expected.primary}, predicted ${predicted}; failed checks: ${failedChecks.join(', ') || 'confidence_calibration_score'}`;
    });

  return [
    '# ColorSnap Color Analysis Eval Report',
    '',
    `Generated: ${report.generated_at}`,
    `Mode: ${report.mode}`,
    `Dataset: ${report.dataset.path}`,
    `Cases: ${report.dataset.evaluated_items}/${report.dataset.total_items}`,
    '',
    '## Metrics',
    '',
    '| Metric | Value |',
    '| --- | ---: |',
    ...metricRows.map(([name, value]) => `| ${name} | ${value} |`),
    '',
    '## Failed Cases',
    '',
    ...failedRows,
    ''
  ].join('\n');
};

module.exports = {
  emptyFailedScores,
  getTopCandidateSeasons,
  gradeCase,
  renderMarkdownReport,
  summarizeCases
};

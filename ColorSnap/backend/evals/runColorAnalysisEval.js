#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');
const {
  emptyFailedScores,
  getTopCandidateSeasons,
  gradeCase,
  mergeRecommendationScores,
  renderMarkdownReport,
  summarizeCases
} = require('./graders');

const EVAL_ROOT = __dirname;
const BACKEND_ROOT = path.resolve(EVAL_ROOT, '..');
const DEFAULT_DATASET = path.join(EVAL_ROOT, 'fixtures', 'color-analysis-goldset.jsonl');
const DEFAULT_REPORT = path.join(EVAL_ROOT, 'reports', `color-analysis-eval-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
const getDefaultMarkdownReport = (jsonPath) => jsonPath.replace(/\.json$/i, '.md');

const seasonValues = new Set([
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

const qualityLabels = new Set(['good', 'usable', 'low_quality', 'blocked']);

const parseArgs = (argv) => {
  const args = {
    dataset: DEFAULT_DATASET,
    out: DEFAULT_REPORT,
    markdownOut: null,
    mode: 'mock',
    limit: null
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === '--dataset' && next) {
      args.dataset = path.resolve(BACKEND_ROOT, next);
      index += 1;
    } else if (arg === '--out' && next) {
      args.out = path.resolve(BACKEND_ROOT, next);
      index += 1;
    } else if (arg === '--markdown-out' && next) {
      args.markdownOut = path.resolve(BACKEND_ROOT, next);
      index += 1;
    } else if (arg === '--mode' && next) {
      args.mode = next;
      index += 1;
    } else if (arg === '--limit' && next) {
      const parsedLimit = Number.parseInt(next, 10);
      args.limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : null;
      index += 1;
    }
  }

  if (!['mock', 'openai'].includes(args.mode)) {
    throw new Error(`Unsupported mode "${args.mode}". Use "mock" or "openai".`);
  }

  return args;
};

const readJsonlDataset = (datasetPath) => {
  const raw = fs.readFileSync(datasetPath, 'utf8');

  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      try {
        const parsed = JSON.parse(line);
        return validateDatasetItem(parsed.item, index + 1);
      } catch (error) {
        throw new Error(`Invalid JSONL at line ${index + 1}: ${error.message}`);
      }
    });
};

const validateDatasetItem = (item, lineNumber) => {
  const requiredFields = [
    'id',
    'image_path',
    'expert_primary_season',
    'expected_undertone',
    'expected_brightness',
    'expected_saturation',
    'expected_contrast',
    'quality_label'
  ];

  for (const field of requiredFields) {
    if (!item || typeof item[field] !== 'string' || item[field].trim() === '') {
      throw new Error(`Dataset line ${lineNumber} is missing required field "${field}".`);
    }
  }

  if (!seasonValues.has(item.expert_primary_season)) {
    throw new Error(`Dataset line ${lineNumber} has invalid expert_primary_season.`);
  }

  if (item.expert_secondary_season && !seasonValues.has(item.expert_secondary_season)) {
    throw new Error(`Dataset line ${lineNumber} has invalid expert_secondary_season.`);
  }

  if (!qualityLabels.has(item.quality_label)) {
    throw new Error(`Dataset line ${lineNumber} has invalid quality_label.`);
  }

  return {
    ...item,
    image_path: item.image_path.trim(),
    mock_size_bytes: Number.isFinite(item.mock_size_bytes) && item.mock_size_bytes > 0
      ? item.mock_size_bytes
      : null
  };
};

const getMimeType = (imagePath) => {
  const extension = path.extname(imagePath).toLowerCase();

  if (extension === '.png') return 'image/png';
  if (extension === '.webp') return 'image/webp';
  return 'image/jpeg';
};

const loadAnalyzeImage = () => {
  const servicePath = path.join(BACKEND_ROOT, 'dist', 'services', 'aiAnalysisService.js');

  if (!fs.existsSync(servicePath)) {
    throw new Error('Missing dist/services/aiAnalysisService.js. Run "npm run build" from ColorSnap/backend first.');
  }

  return require(servicePath).analyzeImage;
};

const loadProductRecommendations = () => {
  const servicePath = path.join(BACKEND_ROOT, 'dist', 'services', 'productRecommendationService.js');

  if (!fs.existsSync(servicePath)) {
    throw new Error('Missing dist/services/productRecommendationService.js. Run "npm run build" from ColorSnap/backend first.');
  }

  return require(servicePath).getProductRecommendations;
};

const runCase = async (item, analyzeImage, getProductRecommendations, mode) => {
  const absoluteImagePath = path.resolve(EVAL_ROOT, item.image_path);
  const buffer = fs.readFileSync(absoluteImagePath);
  const startedAt = performance.now();
  const effectiveSize = mode === 'mock' && item.mock_size_bytes ? item.mock_size_bytes : buffer.length;

  const image = {
    fieldName: 'image',
    originalName: path.basename(absoluteImagePath),
    mimeType: getMimeType(absoluteImagePath),
    source: 'upload',
    size: effectiveSize,
    buffer
  };

  try {
    const analysis = await analyzeImage(image);
    const products = analysis.season_result && analysis.attributes
      ? getProductRecommendations({
        primarySeason: analysis.season_result.primary,
        secondarySeason: analysis.season_result.secondary,
        attributes: analysis.attributes,
        limit: 16
      })
      : [];
    const latencyMs = Math.round(performance.now() - startedAt);
    const scores = mergeRecommendationScores(gradeCase(item, analysis, true), products);

    return {
      id: item.id,
      status: 'completed',
      latency_ms: latencyMs,
      expected: {
        primary: item.expert_primary_season,
        secondary: item.expert_secondary_season || null,
        attributes: {
          undertone: item.expected_undertone,
          brightness: item.expected_brightness,
          saturation: item.expected_saturation,
          contrast: item.expected_contrast
        },
        quality_label: item.quality_label
      },
      predicted: {
        primary: analysis.season_result?.primary || null,
        secondary: analysis.season_result?.secondary || null,
        confidence: analysis.season_result?.confidence ?? null,
        attributes: analysis.attributes || null,
        image_quality: analysis.image_quality || null,
        top_candidates: getTopCandidateSeasons(analysis).slice(0, 4),
        critic: analysis.critic || null,
        products: products.slice(0, 5).map((product) => ({
          id: product.id,
          name: product.name,
          category: product.category,
          score: product.score,
          reason: product.reason,
          match_reasons: product.match_reasons || []
        }))
      },
      scores
    };
  } catch (error) {
    const latencyMs = Math.round(performance.now() - startedAt);

    return {
      id: item.id,
      status: 'failed',
      latency_ms: latencyMs,
      expected: {
        primary: item.expert_primary_season,
        quality_label: item.quality_label
      },
      predicted: null,
      error: error.message,
      scores: emptyFailedScores(item)
    };
  }
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  process.env.MOCK_AI = args.mode === 'mock' ? 'true' : 'false';

  const analyzeImage = loadAnalyzeImage();
  const getProductRecommendations = loadProductRecommendations();
  const allItems = readJsonlDataset(args.dataset);
  const items = args.limit ? allItems.slice(0, args.limit) : allItems;
  const cases = [];

  for (const item of items) {
    cases.push(await runCase(item, analyzeImage, getProductRecommendations, args.mode));
  }

  const report = {
    name: 'colorsnap-color-analysis-eval',
    dataset: {
      path: path.relative(BACKEND_ROOT, args.dataset),
      total_items: allItems.length,
      evaluated_items: items.length
    },
    mode: args.mode,
    generated_at: new Date().toISOString(),
    metrics: summarizeCases(cases),
    cases
  };

  fs.mkdirSync(path.dirname(args.out), { recursive: true });
  fs.writeFileSync(args.out, `${JSON.stringify(report, null, 2)}\n`);

  const markdownOut = args.markdownOut || getDefaultMarkdownReport(args.out);
  fs.mkdirSync(path.dirname(markdownOut), { recursive: true });
  fs.writeFileSync(markdownOut, renderMarkdownReport(report));

  console.log(JSON.stringify({
    report: path.relative(BACKEND_ROOT, args.out),
    markdown_report: path.relative(BACKEND_ROOT, markdownOut),
    metrics: report.metrics
  }, null, 2));
};

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

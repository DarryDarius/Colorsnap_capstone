# ColorSnap Color Analysis Eval Harness

This folder contains the first lightweight evaluation harness for the ColorSnap AI color-analysis pipeline.

## Structure

```text
evals/
  baseline/
  fixtures/
    images/
    color-analysis-goldset.jsonl
  reports/
  graders.js
  runColorAnalysisEval.js
  README.md
```

## Goldset Format

Each line in `fixtures/color-analysis-goldset.jsonl` is one eval item:

```json
{"item":{"id":"mock-001","image_path":"fixtures/images/mock-warm-autumn-good.jpg","mock_size_bytes":32000,"expert_primary_season":"Warm Autumn","expert_secondary_season":"Soft Autumn","expected_undertone":"warm","expected_brightness":"medium-low","expected_saturation":"muted","expected_contrast":"medium","quality_label":"good","notes":"Mock warm autumn baseline case."}}
```

The current image files are mock placeholders for harness development. In mock mode, `mock_size_bytes` simulates the file size used by the mock quality gate. Replace placeholders with consented real photos and remove mock-only assumptions before running OpenAI-backed evaluations.

## Metrics

`graders.js` currently scores:

- `schema_valid_rate`: the pipeline returned a valid structured analysis.
- `quality_gate_accuracy`: image quality passed, warned, or blocked as expected.
- `season_top1_accuracy`: predicted primary season equals the expert primary season.
- `season_top2_accuracy`: expert primary season appears in the top two candidates.
- `undertone_accuracy`: predicted undertone equals the expected undertone.
- `brightness_accuracy`: predicted brightness equals the expected brightness.
- `saturation_accuracy`: predicted saturation equals the expected saturation.
- `contrast_accuracy`: predicted contrast equals the expected contrast.
- `confidence_calibration_score`: rewards correct calibrated confidence and penalizes high-confidence wrong answers.
- `average_latency_ms`: average end-to-end analysis time per fixture.
- `failed_case_count`: cases with failed checks or weak confidence calibration.

## Run Ad Hoc Eval

From `ColorSnap/backend`:

```bash
npm run build
npm run eval:color
```

Optional flags:

```bash
node evals/runColorAnalysisEval.js --dataset evals/fixtures/color-analysis-goldset.jsonl --limit 5 --mode mock --out evals/reports/latest.json
```

This writes a JSON report and a Markdown report with the same base filename into `evals/reports/`. Timestamped reports are ignored by git.

## Run Baseline

From `ColorSnap/backend`:

```bash
npm run eval:color:baseline
```

This writes:

- `evals/baseline/color-analysis-baseline.json`
- `evals/baseline/color-analysis-baseline.md`

The baseline should be updated intentionally after a known-good change to the AI prompt, model, quality gate, or calibration logic.

Current baseline, using mock mode:

```text
schema_valid_rate: 100%
quality_gate_accuracy: 100%
season_top1_accuracy: 40%
season_top2_accuracy: 60%
undertone_accuracy: 40%
brightness_accuracy: 60%
saturation_accuracy: 80%
contrast_accuracy: 60%
confidence_calibration_score: 66%
```

These low season and attribute scores are expected for the mock dataset because the current mock AI path intentionally returns a fixed Warm Autumn-style analysis. With real labeled photos and OpenAI mode, these metrics become meaningful model-quality signals.

## Adding New Cases

1. Add a consented image to `fixtures/images/`.
2. Add one JSONL record to `fixtures/color-analysis-goldset.jsonl`.
3. Fill in expert labels for season, undertone, brightness, saturation, contrast, and quality.
4. Run `npm run eval:color`.
5. Review the Markdown failed cases before updating the baseline.

Use `quality_label` as:

- `good`: clear photo that should pass the quality gate.
- `usable`: analysis can continue, but the result should include quality caveats.
- `low_quality`: analysis may continue only with low confidence and retry advice.
- `blocked`: analysis should not continue.

## Current Scope

This harness now completes the first production-style eval loop:

- reads a versioned JSONL goldset
- loads each image fixture
- calls the existing ColorSnap analysis pipeline
- records predictions, schema validity, latency, correctness checks, and confidence calibration
- writes JSON and Markdown reports
- stores a baseline report for future regression comparison

The next development step is to add automated baseline comparison, for example failing the run if `schema_valid_rate` drops below 100% or if top-2 accuracy regresses beyond an accepted threshold.

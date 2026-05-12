# ColorSnap Color Analysis Eval Report

Generated: 2026-05-12T23:24:04.712Z
Mode: mock
Dataset: evals/fixtures/color-analysis-goldset.jsonl
Cases: 5/5

## Metrics

| Metric | Value |
| --- | ---: |
| Schema valid rate | 100% |
| Quality gate accuracy | 100% |
| Season top-1 accuracy | 40% |
| Season top-2 accuracy | 60% |
| Undertone accuracy | 40% |
| Brightness accuracy | 60% |
| Saturation accuracy | 80% |
| Contrast accuracy | 60% |
| Confidence calibration score | 66% |
| Average latency | 901 ms |
| Failed cases | 3 |

## Failed Cases

- mock-002: expected Soft Autumn, predicted Warm Autumn; failed checks: season_top1_match, undertone_match, contrast_match
- mock-003: expected Cool Summer, predicted Warm Autumn; failed checks: season_top1_match, season_top2_match, undertone_match, brightness_match
- mock-004: expected Bright Winter, predicted Warm Autumn; failed checks: season_top1_match, season_top2_match, undertone_match, brightness_match, saturation_match, contrast_match

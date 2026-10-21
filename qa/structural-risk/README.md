# Structural career probe

Read `docs/GCC_V8_STRUCTURAL_RISK_REVIEW.md` before interpreting counts. Product SHA-256: `6b4f46967d347f3f23c67554dfbb3c8f19f7af732c7fb6fa2086036715e7d030`.

Run from repository root:

```bash
GCC8_TEST_BUILD=game/gcc_v8_product_candidate.html GCC8_TEST_REPORT_DIR=qa/structural-risk/world-101 GCC8_TEST_SEED=101 node qa/structural-risk/career-run.mjs
GCC8_TEST_BUILD=game/gcc_v8_product_candidate.html GCC8_POLICY_REPORT=qa/structural-risk/policies.json node qa/structural-risk/policy-run.mjs
node qa/structural-risk/cpu-boards.mjs
GCC8_CHROMIUM_EXECUTABLE=/path/to/chromium node qa/structural-risk/annual-clicks.cjs
GCC8_CHROMIUM_EXECUTABLE=/path/to/chromium GCC8_ANNUAL_FIXTURE=qa/structural-risk/world-101/checkpoint-2010.json GCC8_ANNUAL_REPORT=qa/structural-risk/annual-clicks-no-vacancies.json node qa/structural-risk/annual-clicks.cjs
python qa/structural-risk/analyse.py
```

Native probes require Playwright and a Chromium executable. The default `/tmp/gcc-chromium` is a local test-runtime convention; override it as shown. The first native probe uses the existing actual completed-2008 fixture in `qa/stabilisation/fixtures/foundation.json`. The second requires the generated full-career checkpoint. The full career and policy probes take several minutes. Seed overrides for the cohort are `GCC8_POLICY_FIRST`, `GCC8_POLICY_LAST`, and optional `GCC8_POLICY_NAME`. The recorded report uses defaults 8201–8203 and all four policies.

`analysis.json`, `policies.json`, the two native action logs, `cpu-boards.json` and `career-results.json` are retained results. Large regenerated checkpoint saves, markup and intermediate observations are intentionally not committed. `analyse.py` needs those generated checkpoint files and observations to reproduce skill-change calculations. `career-results.json` is the unmodified final regression summary copied from the generated world directory. Full scripts assert legality and engine/runtime integrity; they do not certify human enjoyment, UI geometry or an optimal strategy. Counts of harness dispatches are never minimum user clicks.

The full-flow trace is one informed policy in one world. The policy cohort is a simplified recruitment experiment, not twelve complete UI careers. It omits optional management, full annual CPU wrapper adjustments, injuries and form updates. Its best-XI helper is a controlled test selector, not a product auto-select feature. Opening-board overlap controls roster needs; common elite targets are expected and do not alone establish predictable final squads.

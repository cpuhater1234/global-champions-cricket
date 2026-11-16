# GCC v116 Visual Baseline Guardrail

Automated visual regression protection for the v116 release. Captures
deterministic screenshots at 4 breakpoints x 10 screens and compares them
against committed baselines with a pixel-diff threshold of <=0.1%.

## Layout

```
qa/visual/
  baselines/          Committed baseline PNGs (4 breakpoints x 10 screens)
  current/            Freshly captured screenshots (CI runtime, not committed)
  diffs/              Diff images on failure (CI runtime, not committed)
  pixel-diff.py       Python comparator (Pillow)
  README.md           This file
../../v116_visual_baseline.cjs   Playwright capture harness
../../.github/workflows/v116-visual.yml   CI workflow
```

## Breakpoints

| Width | Height | Device class |
|-------|--------|--------------|
| 360   | 800    | Small phone  |
| 390   | 844    | Phone        |
| 768   | 1024   | Tablet       |
| 1440  | 900    | Desktop      |

## Screens

home, club-select, draft, xi, signing, preview, live, innings-break, result, archive

## CI workflow (`.github/workflows/v116-visual.yml`)

Triggers on push to `work/v116-candidate-acceptance` and `workflow_dispatch`.

1. Installs Chromium + Playwright + Pillow (same pattern as other v116 workflows)
2. Generates a deterministic career checkpoint (seed-101 to 2009)
3. Captures screenshots at all 4 breakpoints x 10 screens
4. If no baselines are committed yet: establishes them and pushes to the branch
5. If baselines exist: runs pixel-diff comparison (<=0.1% threshold)
6. On failure: uploads `visual-diffs` artifact and fails the job

## Local testing

The capture harness requires Playwright/Chromium and a career checkpoint:

```bash
# Generate checkpoint first (from repo root)
node qa/structural-risk/career-run.mjs > /dev/null

# Capture baselines
GCC8_TEST_BUILD="GCC_v116_release (1).html" \
GCC8_BROWSER_CAREER_DIR="qa/results/whole-ui-career" \
GCC8_BASELINE_DIR="qa/visual/baselines" \
GCC8_CHROMIUM="$(python -c 'from playwright.sync_api import sync_playwright; p=sync_playwright().start(); print(p.chromium.executable_path); p.stop()')" \
node qa/v116_visual_baseline.cjs

# Compare against baselines
GCC8_BASELINE_DIR="qa/visual/baselines" \
GCC8_CURRENT_DIR="qa/visual/current" \
GCC8_DIFF_DIR="qa/visual/diffs" \
GCC8_MAX_DIFF_PCT="0.1" \
python qa/visual/pixel-diff.py
```

## Proving the guardrail works

1. Change one padding value in the release CSS
2. Run the workflow — pixel-diff should exceed 0.1% and CI goes red
3. Revert the change — CI goes green

This confirms the guardrail catches unintended visual regressions before they reach the release.
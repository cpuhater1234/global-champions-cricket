# Calibration evidence

Read `docs/GCC_V8_CALIBRATION_AND_TRADE_REVIEW.md` for exact scope and caveats.

`summary.json` contains before/after population and paired league measures. `policies-merged.json` retains twelve controlled policy cohorts. `career-baseline.json` and `career-candidate.json` are complete-flow seed404 summaries. `final-resume.json` labels the one exact-final-artifact season separately from prior history. `compatibility.json` and `equivalence.json` cover saved-world preservation and prototype/final model equivalence.

The baseline is the delivered career-experience build at commit c6e4a0ab4697a3f1650ae3ece195757a48289707. To reproduce locally in a full checkout:

```bash
git show c6e4a0ab4697a3f1650ae3ece195757a48289707:game/gcc_v8_product_candidate.html > qa/calibration/baseline-before.html
node qa/calibration/prototype.mjs
node qa/calibration/compatibility.mjs
node qa/calibration/equivalence.mjs
node qa/calibration/trajectory-audit.mjs
GCC8_TEST_BUILD=qa/calibration/candidate.html GCC8_TRAJECTORY_REPORT=qa/calibration/candidate-trajectories.json node qa/calibration/trajectory-audit.mjs
GCC8_TEST_BUILD=qa/calibration/candidate.html GCC8_GROWTH_REPORT=qa/calibration/candidate-growth.json node qa/career-experience/growth-probe.mjs
GCC8_TEST_BUILD=qa/calibration/candidate.html GCC8_POLICY_FIRST=8201 GCC8_POLICY_LAST=8203 GCC8_POLICY_REPORT=qa/calibration/policies-merged.json node qa/structural-risk/policy-run.mjs
```

Full-flow before/after runs use `qa/structural-risk/career-run.mjs`, seed404 and separate `GCC8_TEST_REPORT_DIR` directories. Save checkpoints, HTML prototypes and intermediate markup are intentionally not committed. Follow `qa/structural-risk/README.md` and `qa/career-experience/README.md` for fixture generation and browser dependencies. Copy generated summaries rather than interpreting the archived nineteen-season total as nineteen newly exercised seasons in the resumed test.

`trajectory-audit.json` compares legacy foundation-anchor templates with generated entrant templates, not strictly debut eras. Tim Southee is the one2008 entrant in the latter group. `candidate-growth.json` and the earlier baseline population report use eligibility by game year. Neither is a full UI career.

Native trade tests and the reproduced pre-fix paired-branch report are under `qa/trade-structure`. Their new model uses receiving-club marginal value and retains explicit confirmation. Do not overwrite the original paired exploit report with a post-fix run of the same exploratory probe.

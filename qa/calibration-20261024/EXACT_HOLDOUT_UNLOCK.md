# Exact numerical unlock

The final player-rating holdout must not be improvised.

Run from the repository root in an execution environment with outbound access to Cricsheet:

```sh
bash qa/calibration-20261024/run_exact_holdout.sh
```

The launcher does **not** modify production. Before it opens 2023–2026 it:

1. verifies the preregistered model hash and identity hash;
2. verifies the accepted v57 playable SHA-256;
3. recovers only the fourteen frozen Cricsheet archives and rejects any archive whose SHA-256 differs;
4. installs the pinned numerical dependencies in an isolated local venv;
5. runs the parser/model unit tests;
6. rebuilds `deliveries.sqlite`;
7. requires dataset SHA-256 `60d38fb30ff38f72a7d344437ed881b2ba93731a739dd35fdd556a82386c3ce9` plus the recorded match/delivery totals;
8. regenerates the exact game numeric baseline and requires the accepted playable hash/player counts;
9. only then executes the frozen holdout model.

If any source has changed upstream, the launcher stops **before** held-out evaluation. Do not update the expected hash, substitute another archive, reduce the source set, filter cold-start players, retune alphas, or change the promotion rule to make the run succeed.

A successful run still does not authorise an automatic rerating. Inspect `heldout-report.json`, `heldout-observations.json`, outliers and the predeclared family promotion gates first. Any family that fails remains on the published ratings.

Current branch recovery evidence is documented in `docs/GCC_V8_PRE_HOLDOUT_INDEPENDENT_REVIEW_20261024.md`.

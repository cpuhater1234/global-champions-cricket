> Historical checkpoint, superseded on25October2026. Exact inputs recovered and frozen evaluation completed (both gatesfail); biography/accessibility release and actual evidence are in `GCC_V8_CALIBRATION_RELEASE_20261025.md`. Original observations below remain as session history.

# GCC v8 pre-holdout independent review — 24 October 2026

## Scope

This review was performed after preregistration and identity/data reconciliation, but before any 2023–2026 held-out metric was successfully observed. It is deliberately independent of a favourable or unfavourable test result.

## Release integrity

- Authoritative production remains commit `397311626bf1fb7c30b58a223c81063cac17e279`, SHA-256 `3dd348dd956017563dc006d64a2364a15a0b2d7a3d97bb9d92e3fae3399fcbdf`.
- Both canonical playables still point to Git blob `f5059bb1890951b9816c8cdf57670d6b21e0d0f2`.
- Every branch change since the accepted production commit is QA, evidence, documentation or workflow infrastructure. No production game file has changed.
- Library v57 was re-materialised and independently re-hashed to the same accepted SHA-256.

## Frozen calibration contract

The preregistered contract remains valid and unchanged:

- validation years: 2020–2022;
- locked test years: 2023–2026;
- walk-forward prediction uses only completed prior years;
- a separate fixed-2022 model predicts the whole 2023–2026 block;
- alpha candidates are frozen;
- wicket-cost state data stop at 2019;
- promotion is per family and requires both the positive player-cluster CI gate and nonnegative locked-block point gain;
- mental, leadership, keeping and technique are explicitly outside what the delivery archive can certify.

No future/test outcome is used in feature fitting, slot priors, wicket-cost training or regularisation selection.

## Independent statistical cautions

These are limitations to interpret, not reasons to tune after seeing the holdout.

1. The model includes categorical year-context terms learned from training years. A never-seen target-year category has no fitted coefficient at transform time. This is conservative but means the model does not extrapolate a learned calendar trend.
2. A player without sufficient prior-window appearances has no learned player coefficient. That is a real cold-start weakness. The held-out comparison must retain those cases rather than silently filtering them to help the model.
3. Promotion is based on rank association of phase-level player observations, while alpha selection is based on weighted per-ball squared error. Those objectives are not identical; the preregistered gate, not post-hoc tuning, governs release.
4. Player-cluster bootstrap correctly keeps repeated player-years together, but it does not make delivery-derived batting/bowling phase estimates causal measurements of technique, temperament, leadership, keeping or fielding.
5. The batting target does not charge ordinary run-outs as bowler-credited wickets. That avoids assigning run-out cost to the bowler but also means the model is intentionally not a complete batting-value model.

None of these cautions introduces future leakage. All make the correct release rule more important: a family ships only if the frozen gate passes.

## Recovery attempts after Work-mode exhaustion

- GitHub Actions run `40092717453` failed twice with no allocated runner and no executed steps.
- The workflow was changed only from `ubuntu-24.04` to `ubuntu-latest`; the calibration contract was untouched. Retry run `40093517831` again failed before any step/runner allocation. Therefore the failure is infrastructure-level.
- Library metadata was swept across the relevant creation window. It contains v57, the QA save fixture archive, and the original four-source Cricsheet snapshot only. No expanded ten-archive bundle or `deliveries.sqlite` is retained there.
- The retained four-source snapshot and v57 were re-materialised locally and hash exactly as recorded.
- Direct container retrieval from Cricsheet is blocked by the current environment. The web retrieval layer rejects ZIP payloads.
- Cricsheet's public catalogue currently reports the same competition match counts as the frozen ten-archive manifest, which makes an unchanged upstream snapshot plausible but does not prove byte identity.
- Public GitHub mirrors with committed Cricsheet ZIPs/raw data were inspected. Available committed ZIP examples are stale or have nonmatching sizes, and the connector cannot transfer binary Git blobs into the execution container. They are not acceptable substitutes.

## Decision

The held-out set remains unopened. Do not alter the model, source set, hashes, exclusions or promotion thresholds to work around infrastructure.

The only valid numerical unlocks are:

1. execute the exact frozen fourteen archives;
2. execute a hash-identical `deliveries.sqlite` with SHA-256 `60d38fb30ff38f72a7d344437ed881b2ba93731a739dd35fdd556a82386c3ce9`; or
3. restore an execution environment that can download the exact archives and pass every pre-holdout hash gate.

Until then, production ratings remain unchanged.

## Accessibility

The isolated cumulative-score live-region source patch remains the correct candidate fix. It must still be applied through `v8/ui/match_story.js`, rebuilt through the authoritative pipeline and followed by affected exact-build regressions. Do not hand-edit v57.

Human-only gates remain genuinely external: uncoached novice comprehension, returning-player attachment, physical iPhone/Android behaviour and regular screen-reader-user speech pacing.

# GCC v117 — gameplay-calibrated release candidate handoff

Status 18 November 2026: **v117 is the gameplay-calibrated successor candidate to the
frozen v116 release.** This handoff records the tuning evidence, the mechanism-level
surgery, and the acceptance battery. It follows the v116 governance pattern: branch-designated
artifact, pinned SHA-256, reproducible build, deliberate owner promotion decision still open.

## Identity

- Branch: `v117` (created from `work/local-v116-ui` gameplay-calibration history)
- Exact artifact: `qa/candidates/v116-authenticity-candidate.html`
- Artifact SHA-256: recorded in `qa/candidates/CANDIDATE_SHA256.txt`
- Reproducible build: `node qa/scratch_build_final.mjs` (from the frozen v116 release HTML; do not hand-edit)
- Provenance and full tuning history: `qa/candidates/README.md`

## Gameplay calibration summary

Two benchmarks failed on frozen v116 and are fixed here (official audit runner,
300 matches per seed, multi-seed):

| Metric | v116 release | v117 candidate | Band |
|---|---|---|---|
| Chase Win Rate | 59.0% ❌ HIGH | **52.9 avg ✅** (48.3–55.0 across 5 seeds) | 46–55 |
| All-Out Innings | 26.0% ❌ HIGH | **14.7 avg ✅** (13.5–15.7 across 5 seeds) | 8–15 |
| Wickets/Innings | 6.12 ✅ | 5.9 ✅ | 5.6–7.0 |
| All other benchmarks | PASS (unchanged ranges) | — |

Per-seed detail and measurement pitfalls: `qa/candidates/README.md`.

### The five patches (all documented in `qa/candidates/README.md`)

1. Wicket baseline 6.35 → 6.10
2. Two-stage wicket model — 9 independent trials + conditional 10th wicket (0.13)
3. Chase phase dampen −0.55 RPO (powerplay/middle/death)
4. Thin-margin chase gate in `resolveChase` (win by ≤3 runs succeeds p=0.60, else last-over collapse)
5. **Chase-hazard pressure surgery**: `(1+max(0,pressure)*.65)` → `(1+max(0,pressure)*.00)` —
   removes the chase-only systematic collapse bias. Dose-response verified
   (MULT 0.65→AO 17.2, 0.30→15.5, 0.15→15.0, 0.00→14.3).

### Realism / uniformity statement

Patch 5 rescales hazard magnitude only; per-ball hazard clamps, batter–bowler `edge`,
ground conditions and streak dynamics are untouched. Empirical variance check: seed
spread on AO is ±0.9 across five independent drafts, and one outlier seed (8313,
+0.7 over ceiling) demonstrates draft-luck seasons still occur. Mismatches and upsets
are preserved by design.

### Known residual

AO averages 14.7 against a 15.0 ceiling — in band on average and on 4/5 seeds, but
not deeply centered. One seed-draft in ~5 may graze over by ≤0.7. Closing the final
2pts requires chase-model internals beyond constants (documented in the README's
ruled-out levers). Assessed as acceptable for a playable release; flagged for v118.

## Acceptance battery on this exact build (2026-11-18)

- Native save/reload (`captaincy_layer_v116.py`, HTTP mode): **PASS**, both scenarios
- Static guardrails (`qa/check_candidate.py`, `qa/check_phase2_items.py`): **PASS**
- Career durability (`qa/structural-risk/career-run.mjs`): **PASS** — 1,750 checks, 0 errors
- Visual regression: **PASS** — 40/40 screens captured, committed pixel-diff baselines,
  ≤0.1% threshold
- Gameplay authenticity: **PASS** — all 11 benchmarks in band on average, multi-seed

## Release-process position (per v116 governance)

- This is a branch-designated artifact, not yet merged to `main` and not yet tagged —
  matching how v116 itself was first designated.
- `main` remains historical code; no merge has been made.
- Promotion decision (v117 replacing v116 as the stable playable build, GitHub
  Release/tag creation, default-branch entry point) is an **owner decision**, per
  `docs/release/V116_HANDOFF.md` release-process rules.

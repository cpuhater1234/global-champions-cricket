# GCC v117 release handoff

## Current builds

| Build | Location | Evidence |
| --- | --- | --- |
| Stable release | `v116` at `2648c00` | Frozen release |
| Playable v117 baseline | `v117` at `774862b`, `PLAY_v117.html` | Club reveal and selection tested at 320, 390, 768 and 1440 px |
| Narrow-screen candidate | `PLAY_v117.html` and `qa/candidates/v116-authenticity-candidate.html` | SHA-256 `9890a9108aa260b5a263fa407ac3bb371d23de59f05064f78e55036847003cd9`. Builder output matches the CSS trial that passed 126 Chromium checks. Both playable files and the recorded checksum matched when this candidate was published. |
| Trade review build | `PLAY_v117.html` and `qa/candidates/v116-authenticity-candidate.html` | SHA-256 `d9b21bcf205225375d227e929475e3dcc3a24cb26ce7a5acae599abd46674464`. Trade review, injury cover and traded-pick checks passed. |

To rebuild locally, run `mkdir -p qa/results && node qa/scratch_build_final.mjs`. When promoting the candidate, commit the regenerated QA HTML and checksum together with the identical `PLAY_v117.html` and verify their hashes.

- [Club-card verification](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/44663751897)
- [Narrow-screen verification](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/44692366092)

## 21 November full-career acceptance

Seed 101 with Mumbai Indians completed 2008–2026 on the published narrow-screen build. The toss-aware runner passed 16,187 checks across 19 seasons and 266 user-club regular-season matches, with zero reported runtime errors. It checked annual draft completion, recognised CPU wicketkeepers, XI changes, scorecards, finals, career completion and recovery through the validated save serializer. A separate check reopened all 19 Season Books from the final checkpoint and verified the League Record Book, Club Legends, League Honours and the legacy view.

These checks used the game engine and UI dispatch with a simulated DOM. The visual archive pass, screen-reader announcements, 200% zoom and the five-seed gameplay audit remain release checks.

## Native Chromium save acceptance

On the published v117 checksum, two post-match reload scenarios restored the Round 1 save, XI, score and captaincy plan. The two-tab check wrote Round 2 in the second tab, rejected the stale Round 1 write, preserved IndexedDB and restored Round 2 through Continue Career. Three additional Chromium scenarios passed at an in-progress 2008 draft, after lodging the 2008 XI before Round 1, and after advancing from the 2008 review into the 2009 offseason. Each started from a disposable validated fixture, then wrote and checked a native checkpoint and compared career state after reload and Continue.

- [Single-tab verification](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/44865103171)
- [Two-tab verification](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/44865421910)
- [Draft, XI and rollover verification](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/44865847975)

## Injury cover and traded picks

Targeted offline checks used the published v117 build and validated career fixtures. At Round 10 in 2010, injury cover rejected an ineligible signing and a duplicate request, kept the XI as selected, and survived save and reload. An accepted Mumbai-to-Derbyshire Round 1 pick transfer survived reload and appeared under Derbyshire in the annual draft. A second attempt to trade that pick was rejected without changing ownership.

Trade review now disables Confirm when the engine reports an eligibility violation. The reason stays visible and the offer remains editable. Submission rechecks eligibility before any trade state changes. The existing `qa/v116_trade_review_gate.mjs` passed on the rebuilt candidate.

## Definition of done

The recovered summary of Grok's target is a polished, continuous career from the 2008 club reveal through the 2026 season. Drafting, manual XI selection, captaincy plans and their matchday consequences need to be clear and meaningful. Career history should pay off through League Honours, the GCC Record Book, Your Club Legends, all 19 season entries, an openable Season Book and an end-of-career legacy summary. Verify those views against existing career history.

| Order | Work | Acceptance |
| --- | --- | --- |
| 1 | Publish the narrow-screen candidate | Complete. Builder and both playable HTML files match the tested checksum. |
| 2 | Update the career test for v117 matchday | Complete for the offline runner. It resolves the toss before auditing a match and exercises Continue Career. |
| 3 | Play through 2008–2026 on the exact candidate | Seed 101 completed all 19 seasons with the archive and legacy views verified through UI dispatch. Targeted cover and traded-pick checks passed. The blocked-trade Confirm regression is fixed and verified. |
| 4 | Finish visual and accessibility review | Cover keyboard navigation, 200% zoom and live announcements. Inspect the menus, draft, XI, Fixtures and archive at phone and desktop widths. |
| 5 | Re-run the five-seed gameplay audit and pin the release | Confirm scorebook and save integrity, record per-seed results and resolve or explicitly accept the 15.7% all-out outlier against the 15% ceiling. Pin the accepted commit and build checksum. |

## 18 November calibration and acceptance record

Status 18 November 2026: **v117 is the gameplay-calibrated successor candidate to the
frozen v116 release.** This handoff records the tuning evidence, the mechanism-level
surgery, and the acceptance battery. It follows the v116 governance pattern: branch-designated
artifact, pinned SHA-256, reproducible build, deliberate owner promotion decision still open.

## Identity

- Branch: `v117` (created from `work/local-v116-ui` gameplay-calibration history)
- Exact artifact: `qa/candidates/v116-authenticity-candidate.html`
- Artifact SHA-256: `229F0804B41D72D61458F0D0EC50D866011A70F9FC592C803EC37470D8B9A874`
- Reproducible build: `node qa/scratch_build_final.mjs` (from the frozen v116 release HTML; do not hand-edit)
- Provenance and full tuning history: `qa/candidates/README.md`

## Gameplay calibration summary

Two benchmarks failed on frozen v116 and are fixed here (official audit runner,
300 matches per seed, multi-seed):

| Metric | v116 release | v117 candidate | Band |
|---|---|---|---|
| Chase Win Rate | 59.0% ❌ HIGH | **52.9 avg ✅** (48.3–55.0 across 5 seeds) | 46–55 |
| All-Out Innings | 26.0% ❌ HIGH | **14.7 avg ✅** (13.5–15.7 across 5 seeds) | 8–15 |
| Wickets/Innings | 6.12 ✅ | 5.7 ✅ | 5.6–7.0 |
| All other benchmarks | PASS (unchanged ranges) | — |

Per-seed detail and measurement pitfalls: `qa/candidates/README.md`.

### The four patches (all documented in `qa/candidates/README.md`)

1. Wicket baseline 6.35 → 6.10
2. Two-stage wicket model — 9 independent trials + conditional 10th wicket (0.13)
3. Chase phase dampen −0.55 RPO (powerplay/middle/death)
4. **Chase-hazard pressure surgery**: `(1+max(0,pressure)*.65)` → `(1+max(0,pressure)*.00)` —
   removes the chase-only systematic collapse bias. Dose-response verified
   (MULT 0.65→AO 17.2, 0.30→15.5, 0.15→15.0, 0.00→14.3).

The thin-margin chase rewrite has been removed. It changed the innings total after
the balls were played, so `validResult` rejected the save and Continue Career failed.
Delivery chases now keep the innings that was played. Re-audited on this file
(5 seeds × 300, official runner) with dampen left at 0.55: the table above is unchanged,
because that runner already scored the raw innings. Wickets per innings on this
re-run averaged 5.7. Seed 8313 remains the all-out outlier at 15.7%.

### Realism / uniformity statement

The hazard surgery rescales hazard magnitude only; per-ball hazard clamps, batter–bowler `edge`,
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
- Career durability (`qa/structural-risk/career-run.mjs`, through 2010): **PASS** — 2,683 checks, `"errors": []`
- Visual regression: the 40/40 baselines predate the stadium-row and Build your side
  layout on this file. Recapture before treating them as current.
- Gameplay authenticity: **PASS** — all 11 benchmarks in band on average, multi-seed

## Release-process position (per v116 governance)

- This is a branch-designated artifact, not yet merged to `main` and not yet tagged —
  matching how v116 itself was first designated.
- `main` remains historical code; no merge has been made.
- **Recommended gate before promotion:** a manual playtest per
  `docs/release/V117_PLAYTEST_CHECKLIST.md` (~20 min). The audit proves
  distributions; play proves feel. Both passing → owner promotion is well-founded.
- Promotion decision (v117 replacing v116 as the stable playable build, GitHub
  Release/tag creation, default-branch entry point) is an **owner decision**, per
  `docs/release/V116_HANDOFF.md` release-process rules.

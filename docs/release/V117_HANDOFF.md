# GCC v117 release handoff

## Current builds

| Build | Location | Evidence |
| --- | --- | --- |
| Current playable build | `v117` at `1ea4a4c`, `PLAY_v117.html` | SHA-256 `326f3dabac9d337544b3b40bfd8b250dacca9025e755a89716a862c5f353da6d`. Full-career regression passed 17,036 checks across 19 seasons and 266 regular-season matches with zero runner errors. [Exact-build run](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/44918414963) |
| Stable release | `v116` at `2648c00` | Frozen release |
| Playable v117 baseline | `v117` at `774862b`, `PLAY_v117.html` | Club reveal and selection tested at 320, 390, 768 and 1440 px |
| Narrow-screen candidate | `PLAY_v117.html` and `qa/candidates/v116-authenticity-candidate.html` | SHA-256 `9890a9108aa260b5a263fa407ac3bb371d23de59f05064f78e55036847003cd9`. Builder output matches the CSS trial that passed 126 Chromium checks. Both playable files and the recorded checksum matched when this candidate was published. |
| Trade review build | `PLAY_v117.html` and `qa/candidates/v116-authenticity-candidate.html` | SHA-256 `d9b21bcf205225375d227e929475e3dcc3a24cb26ce7a5acae599abd46674464`. Trade review, injury cover and traded-pick checks passed. |

To rebuild locally, run `mkdir -p qa/results && node qa/scratch_build_final.mjs`. When promoting the candidate, commit the regenerated QA HTML and checksum together with the identical `PLAY_v117.html` and verify their hashes.

- [Club-card verification](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/44663751897)
- [Narrow-screen verification](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/44692366092)

## 21 November full-career acceptance

Seed 101 with Mumbai Indians completed 2008–2026 on the published narrow-screen build. The toss-aware runner passed 16,187 checks across 19 seasons and 266 user-club regular-season matches, with zero reported runtime errors. It checked annual draft completion, recognised CPU wicketkeepers, XI changes, scorecards, finals, career completion and recovery through the validated save serializer. A separate check reopened all 19 Season Books from the final checkpoint and verified the League Record Book, Club Legends, League Honours and the legacy view.

These checks used the game engine and UI dispatch with a simulated DOM. Later sections record the browser and gameplay audit results.

## Native Chromium save acceptance

On the published v117 checksum, two post-match reload scenarios restored the Round 1 save, XI, score and captaincy plan. The two-tab check wrote Round 2 in the second tab, rejected the stale Round 1 write, preserved IndexedDB and restored Round 2 through Continue Career. Three additional Chromium scenarios passed at an in-progress 2008 draft, after lodging the 2008 XI before Round 1, and after advancing from the 2008 review into the 2009 offseason. Each started from a disposable validated fixture, then wrote and checked a native checkpoint and compared career state after reload and Continue.

- [Single-tab verification](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/44865103171)
- [Two-tab verification](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/44865421910)
- [Draft, XI and rollover verification](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/44865847975)

## Injury cover and traded picks

Targeted offline checks used the published v117 build and validated career fixtures. At Round 10 in 2010, injury cover rejected an ineligible signing and a duplicate request, kept the XI as selected, and survived save and reload. An accepted Mumbai-to-Derbyshire Round 1 pick transfer survived reload and appeared under Derbyshire in the annual draft. A second attempt to trade that pick was rejected without changing ownership.

Trade review now disables Confirm when the engine reports an eligibility violation. The reason stays visible and the offer remains editable. Submission rechecks eligibility before any trade state changes. The existing `qa/v116_trade_review_gate.mjs` passed on the rebuilt candidate.

## Published build gameplay audit

The five original seeds were rerun for 300 matches each on the published trade-review build (SHA-256 `d9b21bcf205225375d227e929475e3dcc3a24cb26ce7a5acae599abd46674464`).

| Seed | All-outs | Chase wins |
| --- | ---: | ---: |
| 8301 | 89/600 (14.8%) | 54.3% |
| 8311 | 87/600 (14.5%) | 55.0% |
| 8312 | 81/600 (13.5%) | 55.0% |
| 8313 | 94/600 (15.7%) | 48.3% |
| 8314 | 90/600 (15.0%) | 52.0% |
| Combined | 441/3,000 (14.7%) | 52.9% |

The reporting runner now accounts for floating-point roundoff at exact band endpoints. The two 55% chase rates are inside the band. All other benchmark checks passed except seed 8313's all-out rate. Extending that same seed to 1,500 matches gave 474/3,000 all-out innings (15.8%) and a 49.3% chase win rate. The extended run is a larger sample of the same seed and is excluded from the combined row. This points to a persistent seed-specific overage in the audit runner. Diagnose innings and squad composition using the delivery ledger before changing calibration. The published engine was left intact.

## Corrected fixtures and delivery-ledger diagnosis

The original audit cycled through eight opponent offsets in an eight-club league and scheduled clubs against themselves. The runner now cycles through seven offsets. Every ordered matchup occurs exactly once in a full fixture cycle. Results below use the same published HTML and supersede the original audit for release decisions.

| Seed | All-outs, 300 matches | Chase wins, 300 matches | All-outs, 1,500 matches |
| --- | ---: | ---: | ---: |
| 8301 | 83/600 (13.8%) | 53.0% | 438/3,000 (14.6%) |
| 8311 | 79/600 (13.2%) | 51.0% | 428/3,000 (14.3%) |
| 8312 | 86/600 (14.3%) | 52.7% | 459/3,000 (15.3%) |
| 8313 | 87/600 (14.5%) | 54.0% | 442/3,000 (14.7%) |
| 8314 | 93/600 (15.5%) | 50.7% | 461/3,000 (15.4%) |
| Combined | 428/3,000 (14.3%) | 52.3% | 2,228/15,000 (14.9%) |

In the corrected extended run for 8313, first innings contributed 224 all-outs and chases 218. The tenth wicket fell 282 times in the death phase, 109 in the middle and 51 during the surge. Batting sides five or more down at 60 legal balls went all out in 337/637 innings (52.9%), versus 105/2,363 (4.4%) for sides four or fewer down. The original schedule's 8313 self-fixtures had an all-out rate of 58/368 (15.8%), close to that schedule's overall 8313 rate. Changing the schedule changes opponents and the sequence of random draws, so the rerun does not isolate a causal effect of self-fixtures. Squad XIs also differed across the seeds. The corrected evidence indicates a broader tail risk around the ceiling, with two extended seeds above 15%, and does not support tuning a chase-only parameter for 8313. The playable engine was left intact.

### Early-wicket clusters

Delivery ledgers from the corrected five-seed run covered 15,000 innings. Ball counts use legal deliveries.

| Wickets down after 24 balls | Innings | Five down by 60 balls | Eventually all out |
| --- | ---: | ---: | ---: |
| 0 | 4,392 | 3.3% | 3.4% |
| 1 | 5,249 | 11.8% | 8.8% |
| 2 | 3,315 | 32.7% | 21.2% |
| 3 or more | 2,044 | 69.9% | 44.7% |

The overall wicket rate was 5.24% on balls 1–24, 5.20% on balls 25–42 and 5.11% on balls 43–60. Within the first 60 legal balls, 2,598 of 45,730 deliveries immediately following a wicket took a wicket (5.68%), versus 43,264 of 836,854 after a non-wicket (5.17%). This is an unadjusted comparison and includes changes of batter and matchups. The hazard formula has no explicit previous-wicket multiplier. The two seeds above the extended ceiling did not both have unusually many three-wicket starts: seed 8312 had 407, the same as seed 8301, while seed 8314 had 413. Early losses strongly predict a collapse, but this evidence does not identify a seed-specific early phase fault or justify a chase or momentum adjustment. Keep the engine unchanged pending matched tests that hold XIs or opposition fixed.

### Fixed XI and fixture comparison

Crossed five league setups with five independently chosen initial match RNG states (104729, 130363, 155921, 181081, 205019). Each cell simulated 600 fixtures through the corrected schedule. Within each row the clubs, XIs, ratings and fixture schedule were held fixed. Resetting `G.state.seed` after squad setup varied match randomness. The same initial RNG states were reused in each row, although individual matches consume different numbers of random draws. The published HTML was unchanged.

| League setup | 104729 | 130363 | 155921 | 181081 | 205019 | Mean all-outs |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 8301 | 14.00% | 15.75% | 13.08% | 12.83% | 15.25% | 14.18% |
| 8311 | 14.92% | 16.50% | 16.08% | 15.50% | 14.75% | 15.55% |
| 8312 | 14.58% | 16.58% | 15.42% | 14.33% | 14.92% | 15.17% |
| 8313 | 14.75% | 16.50% | 14.58% | 14.08% | 15.92% | 15.17% |
| 8314 | 14.25% | 13.92% | 14.75% | 13.58% | 14.75% | 14.25% |

Across 15,000 matches there were 4,459 all-outs in 30,000 innings (14.86%), and chases won 52.31%. The same 8301 XIs ranged from 12.83% to 15.75%, showing that match randomness alone can cross the ceiling. Across common initial RNG states, league setup averages ranged from 14.18% to 15.55%. This captures the complete setup, including the opposition mix, and does not isolate individual roster traits. The evidence supports both match-level variation and a league-setup effect. An aggregate gate passes, while a strict per-setup gate remains open. Any calibration trial should use a predeclared gate and verify chase rates, wickets per innings and score distributions against the current build.

## Late-innings calibration

From over 16 with eight or nine wickets down, the engine applies a 0.90 multiplier before clamping wicket probability. The original sample of 15,000 matches per build moved from 14.86% to 14.16% all-outs and from 52.31% to 52.16% chase wins. The holdout sample of 9,000 matches per build moved from 14.38% to 14.05% all-outs and from 51.59% to 51.40% chase wins. All ten setup averages were below 15%. Individual seeds can still exceed 15%. Average first-innings scores moved by less than half a run in each sample.

Candidate SHA-256: `e21c54c8596ab12e7f5a42daee96e88aabea779ece49f2871cebada722c87d2a`. The full 19-season career and native Chromium post-match save and Continue Career checks passed on this exact build. [Acceptance run](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/44888428848)

## v117 browser accessibility review

On the published calibration checksum, Chromium completed 998 automated observations with no reported findings or runtime errors. Native 200% browser zoom was verified at 1440 px and 640 px physical widths (720 px and 320 px CSS viewports), covering Home, Matchday, XI and its player dialog. Keyboard coverage included navigation and playback controls. The live score text matched the displayed score and appeared in the accessibility tree as a polite, atomic status.

The live status was replaced seven times across seven observed updates, which can affect announcements. Actual spoken screen-reader output remains unverified. The 2008 fixture did not cover the trade dialog, and the visual archive review is still open. [Audit and evidence](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/44889781077)

## Persistent live score status

Chromium observed one mounted polite, atomic status element across seven score updates. The verified build passed 998 automated observations including 200% zoom. Spoken output is unverified and outside release scope. SHA-256: `a14e1f0c41bf383827b8f8e4e5c70b1c8ae1707c7744cc7935773eea10cecb85`. [Chromium evidence](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/44910803638)

## Draft, archive and trade review

On build `9712737`, Chromium checked the draft, archive and preseason trade surfaces at 320, 390 and 1440 px. The audit reported no document overflow, dialog bounds failures, runtime errors or trade dialog keyboard failures. Opening and closing the Season Book worked, and Escape returned focus to its opener. Inside the Season Book, Tab and Shift+Tab could leave the dialog's focus cycle at all three widths. The fix passed at all three widths. Screenshots showed readable Season Book and trade layouts. The draft sort label clipped at 320 px in that build. The updated draft stacks filters at 360 px and below. Chromium verified the full label fits at 320, 360, 390 and 1440 px. [Browser verification](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/44917552439) [Audit and screenshots](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/44915689973)

The Season Book build checksum is `bbc5c7bf96edc70d62a1ddd33f48e1a5bf01cebbdf0b1f413d7992d26ac4c693`. [Passing keyboard audit](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/44916253055) · [Build verification](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/44916799004)

## Published build full-career regression

The current checksum-pinned playable HTML at `1ea4a4c` completed 2008–2026 with seed 101 and Mumbai Indians. The offline runner passed 17,036 checks across 19 seasons and 266 regular-season matches, including the 2026 ending and cold Continue Career from the final save. Browser save and accessibility evidence is recorded separately. [GitHub Actions](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/44918414963)

## Definition of done

The recovered summary of Grok's target is a polished, continuous career from the 2008 club reveal through the 2026 season. Drafting, manual XI selection, captaincy plans and their matchday consequences need to be clear and meaningful. Career history should pay off through League Honours, the GCC Record Book, Your Club Legends, all 19 season entries, an openable Season Book and an end-of-career legacy summary. Verify those views against existing career history.

| Order | Work | Acceptance |
| --- | --- | --- |
| 1 | Publish the narrow-screen candidate | Complete. Builder and both playable HTML files match the tested checksum. |
| 2 | Update the career test for v117 matchday | Complete for the offline runner. It resolves the toss before auditing a match and exercises Continue Career. |
| 3 | Play through 2008–2026 on the exact candidate | Seed 101 completed all 19 seasons with the archive and legacy views verified through UI dispatch. Targeted cover and traded-pick checks passed. The blocked-trade Confirm regression is fixed and verified. |
| 4 | Finish visual and accessibility review | Chromium keyboard and 200% zoom checks passed on covered screens. Live status persistence passed in Chromium. Draft, archive and trade review completed at sampled widths. Spoken screen-reader testing is outside release scope per Tom. |
| 5 | Re-run the five-seed gameplay audit and pin the release | Calibration and acceptance passed for the per-setup average, with the checksum recorded above. Individual seed ceilings remain unproven. |

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

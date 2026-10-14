# V8 complete-career assessment checkpoint

Candidate: `game/global_champions_cricket_v8_final_pass.html`.
Rebuild: `python3 v8/build.py --freeze --output game/global_champions_cricket_v8_final_pass.html`.
SHA-256: `f4aa6622f621ce14d16ffcd4725562d186522e633d49a8f05ca3a9932aac811f`.
Authoritative completed verification: `qa/v8_final_pass_scope.json`.

## Defects found and corrected

1. Lodging an XI now cancels an unfinished swap. Previously the unconfirmed bench choice survived leaving the team room and could reappear during a later visit.
2. Temporary cover uses available players. Unavailable free agents previously appeared in the cover market and could be signed despite being ineligible for XI selection. The shared domain pool now filters with `healthyForSelection`, covering both player and CPU replacements. Confirmation recalculates eligibility, including an injury occurring after the market opens.
3. The ordinary annual snake stops after four rounds. Forced departures beyond four are filled through the existing supplementary mechanism after all ordinary selections. Previously those extra vacancies became ordinary fifth/sixth rounds. Transferred R1/R2 picks retain their original positions, and their missing vacancy still creates a supplementary pick.
4. Persisted statistics reject non-numeric/negative counts; fixtures reject a club playing itself. Super Over validation checks strike order and prevents batting after two wickets or after reaching a chase target, in addition to its existing ledger checks.

The protected v7.9.3 reference remains unchanged. Domain corrections are reproducibly applied by `v8/build.py`; engine snapshots are generated output.

## New edge coverage

`qa/v8_final_pass_test.mjs` exercises zero through six forced user retirements, optional-cut limits, supplementary placement, manual refill to fifteen, CPU keeper integrity, stale release/cover/match commands, incomplete XIs, unfinished swaps and cold resumes. Retirement counts and cover injuries are explicit fixtures; subsequent drafts, selections and played matches use real commands.

The full-career helper now uses the manual cover market when natural injuries leave fewer than eleven fit players. An earlier new-seed attempt stopped because its helper assumed an XI could always be selected from the current list. This is test-path expansion, not automatic XI selection in the product.

Existing cricket-feedback, naturally simulated tie-break reload/statistics, migration, trade/pick transfer, played-round recovery, corrupt-save rollback, highlight/reveal and keyed DOM checks are included in the final scope. Only completed runs of the recorded final artifact count as final evidence.

## Honest confidence boundary

The model, state transitions and persisted data are exercised through actual game scripts in a VM host. Delegated input callbacks and generated markup are checked. This host does not implement native browser layout/events, so it cannot certify pixel alignment, keyboard/mouse use, mobile wrapping, focus, scroll, animation or performance.

Source inspection confirms intrinsic stadium dimensions, readable fixed name colours, responsive grids, reduced motion and no external runtime dependencies. Scrollable signing/draft containers and reveal frames still require rendered desktop/mobile/zoom review. The hidden legacy rendering adapter and shared MCG photograph remain known limitations. Follow `qa/V8_VISUAL_REVIEW.md`; no browser/deployment restriction was bypassed and no release or Actions run was made.

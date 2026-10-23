# GCC deeper hardening audit, 23 October 2026

Three reproducible defects were fixed. The updated playable is SHA256 `5088df01d3355c7a71a090e951bfe42f1e2976c0879ace591414205ad315d2b9`, Git blob `e79635da06ba54d4e12ef0a6b94454190cbf232d`, 1,922,392 bytes. Both canonical files and the delivered GCC_v8_Career_Clarity.html are identical. Existing delivery updated to version 56.

## Defects fixed

1. **Temporary cover blocked legal trades.** A permanent fifteen plus temporary injury cover was treated as an overfull squad. Capacity and CPU squad-shape checks now count permanent players. Actual accepted trades retain an unrelated cover spell, or expire the spell when its injured original is traded. Ownership, manual XI cleanup and cold saves are checked.
2. **Malformed annual-draft metadata could restore or rewrite progress.** Negative/fractional vacancies, bad lottery clubs, invalid pick ownership and other administration fields were not validated early enough. Thirteen corruptions now reject before changing live state or stored bytes. Real browser rejection and 72 genuine saved checkpoints verify the guard and compatibility.
3. **A traded player could appear for both clubs in the next round.** CPU XI caches retained an outgoing player until after match simulation. In the reproduced case the incoming player had three global appearances after two rounds and incorrectly accrued two user-club appearances. Accepted early-season trades now refresh CPU selections immediately; cached XI reads check club ownership, and older stale caches repair on restore. The repeated test gives two global appearances, one user appearance, and correctly separated runs/wickets. Old rosters, historical results and match seed are preserved by repair. Previously played scorecards are not rewritten.

## Tests completed

| Area | Evidence |
|---|---|
| Fresh full careers | Seeds811/1601, RR/SUR, both 2008–2026; 38 seasons, 532 managed-club league matches, 2,128 total league fixtures and 114 finals. 95 cold resumes, 51 injury selection recoveries and 8 natural Super Overs. No unexpected errors. |
| Save limits | Both fresh careers ran under a 4 MiB UTF-16 storage budget. Largest observed save: 2,664,150 bytes; no quota failure. |
| Candidate continuations | Twelve late seasons on the first fixes, then two 2026 seasons on the exact final build. These repeat two existing worlds and are not extra fresh careers. |
| Cricket preservation | Exact final 2026 squads, results, table, statistics, finals and complete history match the original full-career outcomes in both worlds. |
| Scoring stress | 336 additional actual-engine matches using 2009/2016/2026 squads; 73,045 delivery events, 3,379 checks. Wides, no-balls, free hits, surge, all-outs and successful chases observed. Forced tied/repeated Super Overs check order reversal and winner. |
| Saved season invariants | 287,182 assertions across 36 saved completed seasons and 612 match ledgers: schedule/points arithmetic, owned rosters, player bounds, CPU keepers, archives, two-deal limit and shared departure budgets. Four club-seasons naturally exceeded four retirements and still refilled correctly. |
| Exact-final regressions | All 14 VM suites, 27 cover/trade lifecycle checks, 36 trade-tenure checks, 13 atomic malformed-save cases and 72 genuine checkpoint validations passed. |
| Browser coverage | All 19 broad suites passed on the frozen incoming build: fresh recruitment/draft/manual XI/matches, annual flow, modals, menu, contrast, responsive containment, motion and save-warning recovery. Targeted 390px cover/trade/reload and corrupt-save protection passed the exact final build. |
| Concurrent saves | Two VM instances shared one storage map. A stale instance could not overwrite newer bytes; persistent warning and explicit Continue recovery worked. Unsaved stale in-memory play is still possible until recovery. |

## Method and continuity

The incoming build was frozen while the two full careers ran. Fixes were developed in a separate candidate so checkpoints never silently changed engine version. Candidate testing and each result's hash identify the version exercised. Only the foundation and dynasty script blocks changed; every stylesheet, visible UI module, photo and illustration is byte-identical to the incoming build.

No automatic user XI selection was added. The current retirement, cut, trade-package, two-deal, Round3 and supplementary-snake rules are preserved. The final cache repair changes only invalid CPU selections; normal career/scoring outcomes stayed identical in the parity checks.

Evidence: `qa/hardening-20261023/verification.json` and the named scripts/results. Red failures, debug evidence and actor corrections are retained. A native test initially looked for Find cover outside the scout screen; the actor was corrected. A tenure test initially assumed a full retained squad, then followed the actual draft route for its two retirements. Neither was presented as a product defect. Large saves, raw scorebooks, HTML baselines and internal screenshots remain local reproducible QA material.

## Remaining limits

This is strong automated evidence, not a claim that bugs are impossible. Chromium was exercised; other browsers and physical devices were not certified. Informed automated choices do not establish novice comprehension or nineteen-season enjoyment. The earlier balance watches, including later-career rating crowding and similar initial CPU targets, remain watches; no speculative rebalance was made. Historical results in an already-affected save are preserved rather than recomputed.

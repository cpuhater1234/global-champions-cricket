# GCC v8 stabilisation, 18–19 October 2026

This repair starts from branch `work/v8-game-first-rebuild` at `dcc2754cfba631b2dcba14f4b178fe09a8fd34f8` and recovers the later `GCC_v8_stadium_consistency_candidate.html` changes. Before repairs, the recovered source rebuilt that standalone byte-for-byte at SHA-256 `9760bbe381650dfb41fa0c49ec510eb2a7f6f2110c8d78e23a72134b711ae7a3`.

## Behaviour

- Keep the current game flow, manual XI, career systems, random home-ground selection and presentation.
- Up to four retirement vacancies use ordinary snake selections. Optional releases, and retirement vacancies beyond four, use supplementary selections after the ordinary draft. User and CPU release allowances remain capped at two, reduced by retirements within the existing four-departure allowance.
- Ordinary pick trading checks actual ordinary selections. A club whose vacancies are entirely supplementary cannot sell a nonexistent ordinary selection.
- A new lottery records the corrected release policy. An older saved lottery or draft keeps its already-exposed selections and transferred pick ownership. An older market adopts the rule when it draws its next order.
- Home, matches and finals share the real-stadium renderer, image URL and persistent error state. No illustrated pitch is rendered before the photograph. Remote venue images still need network access; a correctly named neutral frame remains on failure.

## Source and tests

`v8/domain/draft_slots.js` owns the annual allocation and ordinary pick availability. The builder installs it beside the existing dynasty logic. Generated engine files are not the editing source.

The match audit now reconciles legal deliveries separately from batter balls faced, including no-balls and excluding wides. The corruption regression always changes over notation to an actually incorrect value.

Historical tests use `qa/v8_fixture_paths.mjs`. Fixture preparation decodes real completed saves, checks the year, league completion, season archive and finals completion, and records source hashes. Consumer build identity is separate from producer identity; an unknown producer is recorded as unknown.

## Reproduce

Run from the repository root:

```sh
python3 tools/source_workspace.py build game/global_champions_cricket_v7_9_3_layout_rebuild.html
python3 v8/build.py --freeze --output game/gcc_v8_stabilised.html
GCC8_TEST_BUILD=game/gcc_v8_stabilised.html GCC8_TEST_LAST_YEAR=2008 GCC8_TEST_KEEP_FINAL_SAVE=1 GCC8_TEST_REPORT_DIR=qa/stabilisation/foundation node qa/v8_game_test.mjs
GCC8_TEST_BUILD=game/gcc_v8_stabilised.html GCC8_TEST_KEEP_FINAL_SAVE=1 GCC8_TEST_REPORT_DIR=qa/stabilisation/full-career node qa/v8_game_test.mjs
GCC8_TEST_BUILD=game/gcc_v8_stabilised.html node qa/v8_prepare_fixtures.mjs
GCC8_TEST_BUILD=game/gcc_v8_stabilised.html node qa/v8_release_gate_runner.mjs
node qa/v8_release_pick_policy_test.mjs
GCC8_TEST_BUILD=game/gcc_v8_stabilised.html node qa/v8_venue_loading_test.mjs
GCC8_TEST_BUILD=game/gcc_v8_stabilised.html node qa/v8_management_boundaries_test.mjs
GCC8_TEST_BUILD=game/gcc_v8_stabilised.html node qa/v8_lifecycle_consistency_test.mjs
```

For foundation-only suites before the full career completes, invoke fixture preparation with `--foundation-only`. The tie suite additionally needs an actual tied match. Preparation searches completed career checkpoints, then accepts the explicitly generated tie fixture. If the career has no tie, run `GCC8_TEST_BUILD=game/gcc_v8_stabilised.html node qa/v8_tie_fixture.mjs`, then rerun preparation. This fixture searches match RNG seeds through actual play commands and completes the season; it is a controlled test fixture, not a random career sample.

The release runner records the starting artifact hash, verifies it did not change during execution, records each suite's script hash and log hash, and returns failure if any suite fails. Two independent test processes run at a time; full-career and native visual review remain separate checks.

## Acceptance limits

VM command/ledger checks do not establish native browser layout, focus, scroll, image-loading speed or game feel. The existing hidden-engine adapter is retained. No redesign, deployment or main-branch promotion is included.

## Initial stabilisation result (18 October)

Candidate SHA-256: `7eceb4ff32cf91487a948ab455a037068ef4aa07d38c8a84bdfb533d6427a1f3`. Fresh 2008–2026 career: 19 seasons, 266 league matches, 15,522 checks, no VM errors and no quota failures. The initial broad batch passed 30/32 suites; both failed suites passed after correcting test expectations and fixtures. Additional actual-delivery playback (924 checks), ledger save rejection (26), lifecycle (78) and draft stress (602) checks passed. Detailed original batch results, corrected reruns, completed career save and fixture hashes are in `qa/stabilisation/evidence/`. Native visual acceptance remains outstanding.

## Final adversarial pass (19 October)

Current candidate SHA-256: `0ee49de063af555e0d6b9d80c81b692c132bf33ff9d5fe11571f5960c8ccb4cd`.

Three additional surgical fixes were reproduced before implementation:

- A cold Continue during signing restored queued player objects as detached JSON copies. Day-five decisions then failed to update the actual pool and the window failed to close. Resolution now finds the canonical pool player by ID. Twenty cold-resume cases cover all five days, two seeds, both Skip and paced callbacks, and identical final signing decisions.
- Unexpected inherited control names such as `constructor` could throw outside the dispatch error handler. Command and stage maps now have null prototypes. The hostile-command regression rejects 348 cases without changing live or saved career state.
- A cold restore recompressed already verified save blocks on its first save. The decoder now primes the existing block cache after length, checksum and JSON verification. Full plain-value comparison still invalidates changed blocks. No save-format change was introduced. Actual compressed-save Continue timings on the shared VM host improved from 6.86s to 1.58s and 9.85s to 2.39s. These are not browser latency measurements.

Executed against this exact candidate:

| Battery | Result |
| --- | --- |
| Focused suites | 57 unique suites resolved passing |
| Original expanded batch | 53/55 passed; two stale trade fixtures corrected and both reruns passed |
| Fresh careers | Two complete 2008–2026 careers, club indexes 7 and 3, seeds 4294967295 and 20260317 |
| Older-save continuation | Real completed-2008 save continued through 2026; 18 newly played seasons |
| Club matrix | All eight club indexes, distinct seeds, 2008–2010 each |
| Total career play | 80 new season runs; 1,120 managed league matches |
| Delivery stress | 3,000 seeded match pairs; 6,000 innings; 4,397,010 ledger/property checks |
| Replay persistence | 104 actual notice/Super Over/start/end positions cold resumed |
| Role fallback | Keeper-free manual XI played and resumed; 20 non-specialist bowling innings obeyed limits |
| Build | Independent clean source assembly reproduced the exact SHA above |

The two failing trade fixtures assumed the highest current overall rating guaranteed an acceptable package. In the actual market, injured Shane Bond was valued below every attempted target. Corrected fixtures select a viable offer by market value, explicitly exercise rejection before acceptance, and retain all ownership, cover-cleanup, manual-XI and cold-resume assertions. An ended user cover may legitimately sign for a CPU club; the corrected invariant is that it cannot reappear in the user squad or XI. Trade pricing and acceptance rules were not changed.

Machine-readable summary: `qa/stabilisation/verified-summary.json`. Full logs, original failures, corrected reruns, career saves and timing evidence: `qa/stabilisation/evidence/20261019/`. Earlier evidence in the parent directory belongs to historical candidates. Fixture producer identity remains unknown where it was not captured; final-run artifact identity is recorded independently.

To repeat the focused battery after building, use distinct report directories:

```sh
GCC8_TEST_BUILD=game/gcc_v8_stabilised.html GCC8_BRUTAL_DIR=qa/stabilisation/recheck-suites node qa/v8_brutal_runner.mjs
GCC8_TEST_BUILD=game/gcc_v8_stabilised.html node qa/v8_logic_review.mjs
GCC8_TEST_BUILD=game/gcc_v8_stabilised.html node qa/v8_unbalanced_lineup_probe.mjs
GCC8_TEST_BUILD=game/gcc_v8_stabilised.html GCC8_BRUTAL_DIR=qa/stabilisation/recheck-clubs node qa/v8_brutal_runner.mjs clubs
GCC8_TEST_BUILD=game/gcc_v8_stabilised.html GCC8_TEST_CLUB=7 GCC8_TEST_SEED=4294967295 GCC8_TEST_KEEP_FINAL_SAVE=1 GCC8_TEST_REPORT_DIR=qa/stabilisation/recheck-career-7 node qa/v8_game_test.mjs
GCC8_TEST_BUILD=game/gcc_v8_stabilised.html GCC8_TEST_CLUB=3 GCC8_TEST_SEED=20260317 GCC8_TEST_KEEP_FINAL_SAVE=1 GCC8_TEST_REPORT_DIR=qa/stabilisation/recheck-career-3 node qa/v8_game_test.mjs
GCC8_TEST_BUILD=game/gcc_v8_stabilised.html GCC8_EXISTING_SAVE=qa/stabilisation/fixtures/foundation.json GCC8_TEST_KEEP_FINAL_SAVE=1 GCC8_TEST_REPORT_DIR=qa/stabilisation/recheck-older-career node qa/v8_existing_career_test.mjs
```

The supplied source archive includes the test fixtures. A fresh repository checkout can regenerate them using the earlier foundation/full-career/preparation commands; generate the controlled tie fixture if that career has no tied match.

Rendered visual approval remains open. The VM host cannot certify native geometry, pointer targets, keyboard focus, scrolling, animation, device performance or game feel. No browser security restriction was bypassed. This is a verified functional checkpoint, not a release, deployment or main-branch promotion.

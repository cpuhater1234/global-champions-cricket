# Extensive V8 verification

Candidate: `game/global_champions_cricket_v8_quality_tested.html`.
SHA256: `d615ddfe4dc376c53aa49e31425842add7ad72a572940880b140b3fe527a497e`.

This extends the hard-audit checkpoint. Exact final results are in `qa/v8_extensive_scope.json`. This standalone game has browser-local domain logic and persistence, with no server API. VM execution and DOM-tree/string parsing cannot certify rendered layout, native focus/events, browser storage semantics or performance.

## Defects found and fixed

1. An accepted midseason trade removing an XI player moved only the hidden domain screen to the team room. The visible UI stayed on matchday. The scheduler now follows that explicit XI-repair transition, sets the return destination and saves the new context. The regression performs a real accepted trade, checks ten players remain, blocks repeated trading and incomplete lodging, fills the XI and plays Round 8.
2. Deeper malformed saves could fail after state was partly copied into the active career. The revised persisted-state validator checks club/team identities, selections/order, schedules, results, table/stat containers, dynasty phase and reveal metadata. Failed restores also roll back the prior state and screen, covering unexpected exceptions after validation. The original stored payload is preserved. Empty team maps remain valid before the foundation draft creates the rosters.

## Expanded checks

- Three complete careers with seeds 101, 202 and 303, choosing different club positions. Repeated cold reloads during the foundation user pick, manual XI, annual order, annual user picks and finals compare career truth and destination screens. Every run ends in 2026 and restores the ending.
- Eight separate full 2008 seasons, selecting each club in the same revealed league. Each executes signing, 120 draft picks, manual XI/order/swap, fourteen matches, season closure and reload. CPU/player roster integrity and cricket arithmetic are checked.
- An explicit two-round OUT injury fixture signs temporary cover, plays actual rounds, then verifies automatic recovery removes the cover, clears both mapping directions and restores the original player in the same XI and batting-order slots.
- Real midseason trading and the Round 8 continuation, plus the earlier offseason trade with transferred draft pick and supplementary selections.
- Nine malformed-save structures and a deliberately injected post-validation render exception. All must reject without changing the active career or saved payload.
- Storage-denied sessions, legacy-key migration preserving the original save, timed reveal pace/pause/resume, stale commands, single-runner scheduling, keyed control identity/typing/details and screen/action markup parsing.
- Legal balls, innings/phases/extras/dismissals/boundaries, bowler runs and economy, four-over ceilings, nonconsecutive bowling changes, ladder points and NRR arithmetic, annual fifteen-player lists and CPU wicketkeepers.
- Syntax checks and byte-identical rebuild from the immutable v7.9.3 reference.

Initial exploratory runs used the preceding candidate and are not counted as final-candidate evidence. Final runs use isolated report directories to avoid overwriting each other's results.

## Reproduce

```sh
python v8/build.py --freeze --output game/global_champions_cricket_v8_quality_tested.html
python qa/v8_club_matrix.py
GCC8_TEST_BUILD=game/global_champions_cricket_v8_quality_tested.html GCC8_TEST_SEED=101 GCC8_TEST_CLUB=0 GCC8_TEST_REPORT_DIR=qa/extensive/final101 node qa/v8_game_test.mjs
GCC8_TEST_BUILD=game/global_champions_cricket_v8_quality_tested.html GCC8_TEST_SEED=202 GCC8_TEST_CLUB=3 GCC8_TEST_REPORT_DIR=qa/extensive/final202 node qa/v8_game_test.mjs
GCC8_TEST_BUILD=game/global_champions_cricket_v8_quality_tested.html GCC8_TEST_SEED=303 GCC8_TEST_CLUB=7 GCC8_TEST_REPORT_DIR=qa/extensive/final303 node qa/v8_game_test.mjs
GCC8_TEST_BUILD=game/global_champions_cricket_v8_quality_tested.html GCC8_TEST_LAST_YEAR=2009 node qa/v8_game_test.mjs
GCC8_TEST_BUILD=game/global_champions_cricket_v8_quality_tested.html node qa/v8_transition_test.mjs
GCC8_TEST_BUILD=game/global_champions_cricket_v8_quality_tested.html node qa/v8_save_integrity_test.mjs
GCC8_TEST_BUILD=game/global_champions_cricket_v8_quality_tested.html node qa/v8_migration_test.mjs
GCC8_TEST_BUILD=game/global_champions_cricket_v8_quality_tested.html node qa/v8_audit_test.mjs
GCC8_TEST_BUILD=game/global_champions_cricket_v8_quality_tested.html node qa/v8_reveal_test.mjs
GCC8_TEST_BUILD=game/global_champions_cricket_v8_quality_tested.html node qa/v8_interaction_test.mjs
node qa/v8_clock_test.mjs
node qa/v8_dom_patch_test.mjs
python qa/v8_markup_check.py qa/extensive/final101/v8_markup_snapshot.json qa/extensive/final101/v8_markup_results.json
```

The short two-season run supplies the scratch fixture required by boundary tests. Native desktop/mobile visual and interaction review remains outstanding under the handoff's existing browser restrictions. No alternate renderer/hosting bypass, deployment, Actions, release or subagent was used.

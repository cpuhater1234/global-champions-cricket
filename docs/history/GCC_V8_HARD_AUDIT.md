# V8 front-end and cricket-engine audit

Candidate: `game/global_champions_cricket_v8_reviewed.html`.
SHA256: `61c4da1ff92f001087364ce868f5c6318b82628d03ee4cc66fdb41cd64a76bcd`.

This is a standalone browser game. The backend-equivalent domain logic and persistence run locally; there is no server/API to audit in this build. The established inert-host adapter remains transitional.

## Corrections

- Removed visible export controls, help/new-career export copy, the controller command, public export API, export/import download/file-picker functions and inert-host export/import buttons. Autosave and Continue remain.
- Storage-denied reads no longer crash the title. Failed writes produce a visible message and retain the active session. Page exit also attempts to save.
- Restore now returns an explicit success result. Corrupt, structurally incomplete, duplicate-roster or out-of-range-year saves are rejected before active state is changed; a previously loaded career cannot disguise a failed restore as success. Failed validation preserves the stored payload.
- Continue preserves team-room/finals destination, selected season tab, regular match result and archive-return context.
- A timer added during a pause uses the frozen clock origin, so it waits its intended remaining interval after resume. Closing dialogs respects story/title/background pause state.
- Stale draft commands cannot operate in the offseason market. Injury-cover confirmation rechecks need and success; swaps require an available bench player. Invalid argument containers produce normal feedback.
- Projected squad cache keys include component attributes, preventing stale ratings when overall/form do not change.
- A regular-season result returns to matchday even when a finals object already exists.

The accepted arcade colours, real stadium imagery, licensed icons, manual selection and advanced cricket reads remain.

## Verification

`qa/v8_audit_scope.json` records exact candidate evidence. Tests use real UI dispatch and the actual cricket scripts in a VM DOM stub, plus a separate DOM-tree model. Expected corrupt-save/storage-failure errors are intentional fixtures, counted separately from unexpected errors.

Career checks cover foundation signing and 120-player draft, manual XI/order/swap, fourteen-round seasons, injuries and availability, finals, contract decisions, annual drafts and supplementary picks, fifteen-player/keeper integrity, archives, reload and the 2026 ending. Scorebook checks cover legal-ball totals, four-over bowling limits, nonconsecutive bowling changes, extras and byes, dismissals, boundaries, phase scores, economy and ladder/NRR arithmetic. A second seed runs through two seasons. Targeted tests cover accepted trades with a transferred first-round pick, injury cover, timed reveal pause/speed/resume, corrupt save rejection and storage-denied sessions. DOM-tree tests cover keyed control identity under 24 reorder/removal permutations, typing and open details.

Native rendered desktop/mobile alignment, keyboard/focus behavior, browser storage semantics, scrolling and animation/performance remain unverified. No browser restriction was bypassed. No deployment, Actions run, release or message to other people was made.

## Reproduce

```sh
python tools/source_workspace.py build game/global_champions_cricket_v7_9_3_layout_rebuild.html
python v8/build.py --freeze --output game/global_champions_cricket_v8_reviewed.html
GCC8_TEST_BUILD=game/global_champions_cricket_v8_reviewed.html GCC8_TEST_LAST_YEAR=2009 GCC8_TEST_SEED=919 node qa/v8_game_test.mjs
GCC8_TEST_BUILD=game/global_champions_cricket_v8_reviewed.html node qa/v8_audit_test.mjs
GCC8_TEST_BUILD=game/global_champions_cricket_v8_reviewed.html node qa/v8_reveal_test.mjs
GCC8_TEST_BUILD=game/global_champions_cricket_v8_reviewed.html node qa/v8_interaction_test.mjs
node qa/v8_clock_test.mjs
node qa/v8_dom_patch_test.mjs
GCC8_TEST_BUILD=game/global_champions_cricket_v8_reviewed.html node qa/v8_game_test.mjs
python qa/v8_markup_check.py
```

The first short run creates the scratch fixture required by the targeted tests. The final full run creates the complete markup snapshot. Generated snapshots, fixture saves and engine copies are not repository source deliverables.

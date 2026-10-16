# Targeted coverage gaps and persistence fixes

Tom requested direct testing of the previously identified gaps before playing. This pass adds registered lifecycle callbacks, delegated clicks, trade dropdown events, every phase comparator, realistic storage accounting, concurrent-instance cases, every catalog club and an adverse combined trade/cover scenario. It retains the accepted arcade presentation and cricket rules.

The scope manifest is `qa/v8_gap_scope.json`. It records the actual tested digests, completed runs, excluded diagnostics and remaining limits. Result counts are added after the runs finish.

## Completed results

- 34 focused suites passed on the final artifact, including 107 lifecycle/control assertions, 38 storage assertions, 27 codec assertions and 107 combined-scenario assertions.
- All 20 catalog identities completed a naturally drawn opening season on the final artifact. The final two-season smoke passed.
- Fresh seed 9901 completed 2008–2026 and an existing completed 2008 save at 9919 continued 2009–2026, with the exact matrix/final distinction below. Both reached/cold-loaded legacy. Neither had a quota failure. The largest attempted save was 2,210,890 UTF-16 bytes under a 5,242,880-byte budget.
- Completion totals are 59 new season runs and 826 regular user matches, excluding the resumed save's pre-existing 2008. Additional combined-case rounds are not added to these totals.
- 855 captured matches /1,710 innings passed 35,928 bounds and 46,132 identity/wicket checks. The opening round-one game is audited but not captured by the foundation harness, so captured matches are not total played matches.
- All 20 club saves passed 6,526 frontend checks covering 299 scorecards and 300 average rows, with no findings. 501 parsed screen states/11,076 action bindings passed markup checks.
- Library version 26 replaces the same playable identity. Source is checkpointed on the existing branch; no deployment or merge.

## Defects reproduced and corrected

1. **Page exit did not pause the shared runner.** `pagehide` called the old season pause, leaving reveal/signing/highlight jobs live in the unified clock. It now pauses that clock explicitly. `pageshow` resumes only a visible, unobstructed game. Visibility, exit/reload and cached-page return are tested in signing, club reveal, foundation draft, annual draft and match highlights. A help dialog must keep the visible game paused.
2. **A stale game could replace newer saved progress.** Every write now compares the persisted payload with the last payload acknowledged by that instance. A mismatch preserves storage and gives a clear Continue instruction. A successful Continue or an explicitly confirmed fresh start adopts current storage. A stale empty launcher also cannot silently replace a world created after it entered the intro.
3. **A failed restore acknowledged storage too early.** If rendering fails after validation, the restore now rolls back both game state and the stored-payload acknowledgement. A later save from the rolled-back instance cannot overwrite the failed payload. The regression fails without this rollback and passes with it.
4. **A real first-season save exceeded a conservative quota.** The seed 9901 diagnostic produced a legitimate payload of 5,758,942 UTF-16 bytes, and a 5 MiB write budget caused a finals reload to lag behind live state. Large save blocks now use lossless, versioned UTF-16 compression. No scorecards, player data, career rolls or history are deleted. The frequently changing pool remains plain to avoid compressing the whole universe for every draft pick. Large career, results, finals, archive and development blocks are cached by their full current JSON content, so in-place changes invalidate the cache.

The codec accepts earlier plain JSON, checks packed block version, length and checksum before restore validation, and uses pinned LZ-string source with licence/provenance retained in `v8/vendor`. Save schema changes remain internal. No product import/export controls were added.

## New behavioral evidence

| Area | Direct checks |
|---|---|
| Lifecycle | Hidden game cannot advance; visible game resumes; exit saves; cold Continue preserves progress; cached-page return resumes; dialogs remain paused |
| Button routing | The registered handler receives a nested-content target; disabled controls and non-controls do nothing |
| Trading controls | Real change callbacks reset the target when the club changes, convert player IDs correctly, retain an actually owned pick and preserve choices through Scout |
| Phase sorting | Hand-ranked strong/medium/weak fixtures cover all six phase sorts, a non-bowler and stable equal-score ordering |
| Shared storage | Sequential current-instance interleavings, stale page exit, Continue recovery, explicit restart, stale empty intro, transient failure and post-validation restore rollback |
| Codec | Exact actual-payload round-trip, legacy and packed loads, Unicode, in-place cache invalidation and deliberately damaged packed blocks |
| Combined case | Retirement/release and annual recruitment, seven played rounds, injury to a selected original, selected cover, actual accepted midseason trade via dropdown events, cover cleanup, repeated exit/reloads and manual XI repair before round eight |
| Club catalog | Every real catalog identity is naturally drawn from a seeded world, drafted manually, played through 2008 and cold-reloaded |
| Capacity | Complete fresh and old-save career traversals use a 5 MiB UTF-16 write budget, with maximum attempted write sizes and quota failures recorded |

The host captures real registered callbacks but supplies synthetic events and a DOM stub. Its quota model includes keys and metadata and counts two bytes per UTF-16 code unit. It is deliberately conservative and does not certify a particular browser's quota implementation.

## Exact artifact scope

The long-career main hosts began on `3dd41d25473cdef2c47a5673b813e28aa4679f877c6c35ffd320ac0f4bcd93e3`. Later cold reloads read the final file, `1799dd652e4eaf8f00149f5597830315c19a39429989bd3d9c9a3aa2984b59ee`. A reconstructed byte-identical matrix artifact confirms that only script 19, the visible controller, differs: the final file prevents a stale empty intro from starting a world and clears fresh-start confirmation after using it. All engine, codec, player, CPU, rating and match scripts are byte-identical. The long runs are not described as pure final-controller careers.

The final focused batch, all 20 catalog club runs and final two-season smoke use the exact final artifact. Interrupted/superseded candidates and partial duplicate runs are excluded from completion totals.

## Reproduction

Build with `python3 v8/build.py --freeze --output game/global_champions_cricket_v8_gap_review.html`. Always set `GCC8_TEST_BUILD` to that file for Node tests. The suite manifest lists all scripts; `GCC8_GAP_DIR` sets the new test result directory. `v8_gap_clubs_review.mjs` discovers natural seeds and runs every catalog club.

Set `GCC8_STORAGE_LIMIT_BYTES=5242880`, `GCC8_TEST_SCOREBOOKS=1` and `GCC8_TEST_KEEP_FINAL_SAVE=1` when running the career harness. The completed large saves/scorebooks are local fixtures; committed manifests/results are not a complete raw-fixture bundle. The oversized diagnostic fixture for the codec test is reproducible using the earlier uncompressed persistence build and seed 9901 through 2008, or supply that existing fixture at its documented QA path.

## Remaining limits

- No native browser, rendered geometry/overlap, real pointer/keyboard/touch, focus/scroll, zoom, external stadium delivery or smoothness certification. Existing browser restrictions remain.
- The stale-write comparison protects detected sequential conflicts. It is not an atomic cross-process transaction or a guarantee against simultaneous writes between the comparison and write. Older unpatched game versions cannot acquire these protections retroactively.
- This is not full branch/state exhaustiveness. One complex combined trade case does not cover every combination of finals, injuries and negotiations.
- Numeric priors remain model estimates;371 legacy identities are not independently source-certified. Badge/composite calibration, club-games chemistry, empirical historical calibration and human enjoyment/difficulty remain open.
- CPU and match logic are unchanged in this pass. Prior controlled recruitment evidence is retained, not relabelled as new strategy experiments.

No deployment, Actions, release, merge, external messages or subagents were used.

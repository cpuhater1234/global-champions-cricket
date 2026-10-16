# GCC v8 interrupted Work continuation — 16 October 2026

## Scope and provenance

Continuation of the user-provided Work-mode checkpoint, on `work/v8-game-first-rebuild`. The changes below were applied through the connected GitHub repository. The earlier Work session's local unsaved changes, VM fixtures, and playable output were not available in this execution environment. The last committed full playable before these edits is described by `docs/GCC_V8_PREPLAY_TESTING.md`. **Do not claim these new changes passed that cohort; build and retest.**

## Saved source fixes

1. `v8/ui/clock.js`: stop processing a batch of simultaneously due callbacks once the first callback pauses the clock. Remaining jobs are retained for `resume()`.
2. `v8/ui/data.js`: opening powerplay in the bowling-changes view is four overs; surge overs are labelled `POWER SURGE` from the recorded start-over; death remains overs 16–20.
3. `v8/domain/delivery_engine.js`: a no-ball adds to the striker's balls faced without using a legal team/bowler delivery. A wide does not count as a ball faced. Save validation accepts both corrected batting ball counts and prior recorded undercounts from no-balls, without altering old scorecards; strike rate is compared against the saved balls faced.
4. `v8/domain/delivery_engine.js`: final delivery does not advertise a next striker/non-striker after the chase, 120 legal balls, or ten wickets.

Commits in application order:
- `d77f8d9da17a34c8bf668218bda0a316162b4dd3`
- `f7e5de27cd92dc595402af08f69e3564d0646a68`
- `f2b6ab80e4ea7b139495e67cb62e88d3a21a35c7`
- `176cfe66b9217e7011c88f595b5ac32424922bd0`

## Verification required before promotion

- Rebuild exactly with `python3 v8/build.py --freeze --output game/global_champions_cricket_v8_career_variation.html` in a clean checkout.
- Test no-ball, wide and strike rate in a new delivery innings, plus unchanged acceptance of legacy saves that contain no-balls.
- Exercise final wicket, full 20 overs and completed chase, including reload and terminal delivery UI.
- Test two timer callbacks due simultaneously where the first pauses playback; the second must wait until resume, and be skipped if canceled during pause.
- Check the over-by-over bowling label over boundaries 4/5, surge start/end, 15/16; test with an early finish.
- Run the full 30-suite preplay cohort plus fresh and continued full careers, statistics cross-checks and markup/action tests on the rebuilt artifact, then record build SHA-256.
- Human-operated desktop/mobile/zoom and keyboard/pointer review remains required. Previous VM tests do not certify native visual geometry or responsiveness.

## Unresolved baseline limitations

The engine still uses a transitional hidden legacy adapter. Native browser interaction, photo delivery and smoothness were not verified. Several historical player identities and match-distribution calibration remain uncertified. The current continuation did not execute a full playable rebuild or test run, and did not deploy, promote to main, or create a release.

## Additional regression coverage in this continuation

- `qa/v8_clock_pause_regression.mjs` (`dd220ab2`): deterministic execution of the committed timer module with a fake monotonic clock. Covers same-due jobs, pause/resume and cancellation during pause. A local mirrored-source smoke case passed; the committed test file must still be run in a clean checkout.
- `qa/v8_delivery_boundary_regression.mjs` (`169a0a8a`): exercises the actual delivery module across deterministic RNG seeds until it encounters both wides and no-balls, checks batting balls faced / strike rates, legal bowling counts and innings terminal references. Newly committed but not yet executed against a checkout.

**Verification distinction:** A local deterministic timer harness passed against copied logic; it is not equivalent to running the exact committed source nor does it certify the playable. The environment cannot resolve github.com for a full clone. Full suites, rebuilt playable, native rendering and save compatibility remain pending. No promotion or release has been made.

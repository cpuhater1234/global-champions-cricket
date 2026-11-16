# GCC v8 player-experience finishing checkpoint, 19 October 2026

## Continuity

Continues `work/v8-game-first-rebuild` at `11d0fb28706a552cb2a730aec742c9608b059923`, including the early random-stadium request and shared contrast/spacing fixes. Reconstructed the protected v7.9.3 reference at its expected SHA-256 before building. Main was not promoted and no release was deployed.

## Changes

- XI swaps put the instruction above the order and take keyboard/pointer focus to the replacement choices. Completion focuses the incoming player; cancellation returns to the bench. Lodging requires completing or cancelling a pending swap, so it cannot silently discard that decision.
- The GCC mark fits its content. HUD, fixture, dialog and verdict headings retain whole club names. Fixtures respond to panel width, including side-by-side semi-finals. Small devices keep a readable heading size.
- Scorebooks retain intact headers and names and scroll within their existing frame. Season contributors stack name/stat lines; comparisons use a minimum useful panel width. Preview role abbreviations do not split.
- Live batter balls faced include no-balls and exclude wides, matching the scorebook. All-out chases stop showing a live required rate. Super Over fixture scores use the current tie-break innings. A terminal no-ball does not promise another free hit.
- End-of-career honours use singular nouns when the count is one.

All changes are in four UI sources. No cricket engine, player data, draft, release, trade valuation or save format changes.

## Verification and its limits

See `qa/GCC_V8_FINISHING_EVIDENCE.json` for artifact identities and per-suite resolution.

- 57 focused suites resolved passing. The original batch had 13 failures: missing generated inputs/output folders/inventory, a local helper recovery error, a stale expectation that lodging silently cancelled a swap, and one failure without a diagnostic log. Reruns resolved them; the 924-check ball playback suite required one further output-directory correction. Original failures remain in the session evidence. This is not a claim that the original batch was green.
- Baseline and revised-controls 2008–2026 careers each completed 19 seasons, 266 managed league matches and 15,522 checks with no VM errors. They use the same seed to compare regressions, not to establish balance. Later changes are CSS and singular/plural honours wording. Final engine scripts are unchanged from the starting build.
- Final Chromium sweep: 84 screen/width cases at 390, 768, 1024 and 1440 pixels, no runtime errors, page overflow, measured sibling collisions, clipped headings/control text or fragmented words. Includes fresh signing/draft/manual XI, analysis, match preparation/results/scorebook, review, offseason, release and trade dialogs.
- Later-career Chromium sweep: 104 cases covering 2019/2025/2026 reviews, archive/scorebook, semi-finals, Grand Finals, 2020/2026 squad update/draw and ending. Finals states reconstruct the actual completed season for presentation inspection. This sweep predates the final heading/role and singular-copy refinements; do not relabel it as an exact-final-artifact run.
- Native XI regression: 13 checks. Live-feedback regression: 30 checks, including 22 real no-ball positions, five all-out chases and engine-generated Super Over innings in a presentation fixture.
- Long-name tests cover 320, 390, 768, 1024 and 1440 widths. A final real 2026 cold Continue/legacy/archive-return check verifies the ending and the terminal 2027 guard.
- Clean `--freeze` reconstruction reproduces the final standalone byte-for-byte.

Remote photographs were intentionally failed during deterministic geometry checks. This tests neutral fallback containment, not real image-download speed. Chromium on Linux is not every browser/device. Human first-time-player usability and whether a long career stays enjoyable still require actual player feedback; this checkpoint does not certify release readiness.

## Reproduce

```sh
python3 tools/source_workspace.py build game/global_champions_cricket_v7_9_3_layout_rebuild.html
python3 v8/build.py --freeze --output game/gcc_v8_player_experience.html
mkdir -p qa/ball-by-ball qa/player-first qa/micro-layout
# Generate foundation/full-career saves and prepare fixtures using GCC_V8_STABILISATION.md.
GCC8_TEST_BUILD=game/gcc_v8_player_experience.html node qa/v8_live_score_feedback_test.mjs
GCC8_TEST_BUILD=game/gcc_v8_player_experience.html node qa/v8_final_pass_test.mjs
GCC8_CHROMIUM=/path/to/chromium GCC8_TEST_BUILD=game/gcc_v8_player_experience.html node qa/v8_browser_selection_test.cjs
GCC8_CHROMIUM=/path/to/chromium GCC8_TEST_BUILD=game/gcc_v8_player_experience.html node qa/v8_browser_words_test.cjs
GCC8_CHROMIUM=/path/to/chromium GCC8_TEST_BUILD=game/gcc_v8_player_experience.html node qa/v8_browser_finishing_audit.cjs
GCC8_CHROMIUM=/path/to/chromium GCC8_TEST_BUILD=game/gcc_v8_player_experience.html node qa/v8_browser_career_audit.cjs
```

Native scripts require Playwright and a compatible Chromium installation; omit `GCC8_CHROMIUM` to use Playwright's default installation. Generate the standard `qa/stabilisation/fixtures` first. Large screenshots, saves and raw stress logs are local verification material, not source commits.

Final standalone SHA-256: `9e4928932fcca965e1a69f89014fe989f2565e873136823bf37c6e15a8dd5baf`.

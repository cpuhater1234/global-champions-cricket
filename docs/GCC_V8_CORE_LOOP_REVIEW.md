# Core-loop presentation and navigation

21 October 2026. This checkpoint refines the existing draft → XI → match → result → next-match flow. It does not claim that the whole interface or career experience is finished.

## Changes and reasons

The draft board now identifies its available-player area and has a direct Pick action on each card. Scouting remains a separate name/card action. This removes the mandatory profile-opening step when a player already knows their choice. Pick is disabled while another club chooses, and the unchanged controller still checks the real current turn and availability.

Squad size, keeper coverage and regular-bowler count remain together above the board. Their duplicate sidebar coverage is removed; selected players and squad analysis remain available. The twenty-over squad-building reminder now sits with the squad tools rather than interrupting the route to the candidates. The same draft component serves foundation and annual drafts.

During an existing season, the XI screen now exposes its existing guarded Return to matchday action. Previously that action was deliberately omitted whenever a schedule existed, leaving the player to use the global navigation. Native tests confirm returning neither resets nor advances the season. Manual XI and injury rules remain intact.

Results now present the outcome and score before a separate cyan continuation surface. That surface names the current next opponent and home/away status, or the league wrap-up/finals route. Next match opens matchday; it does not play a match immediately. Scorebook, replay, factual phase summary and deeper analysis remain accessible. Existing matchday and live-match layouts are retained after inspection; stadium assets and simulation logic are unchanged.

## Verification

Artifact: `game/gcc_v8_core_loop.html`.

SHA-256: `a9ea493eebb4ddaa6146eaaf6ece06a3e4d1e0eb85cfd00edda99b11c21f0189`.

- The new hierarchy regression fails on the prior decision-clarity artifact and passes here.
- Six focused VM suites pass on this artifact: core-loop hierarchy, comparison intent, selection recovery, decision tools, player journey and team workspace. These are not browser layout tests.
- Sixty expanded-state browser checks cover full/empty XI, expanded selected roster, comparison and its initial chooser. Another sixty cover draft, win, loss, neutral and league-complete presentation fixtures. Each uses four widths, 320/390/760/1280, and root sizes 16/24/32. All specified overflow, text escape, ability-label collision and opaque-background contrast checks pass.
- A fresh native-click journey at 390px completes signing, fifteen picks, manual XI, clearing/rebuilding the XI, pre-match XI review and return, the first match, scorebook, cold Continue, another XI review and return, and a second match. Both Scout/Pick and direct Pick routes are exercised. It asserts that reviewing the XI does not consume a match or reset the round.
- One exact-build runtime season passes 819 assertions, fourteen managed league matches and two cold-restore checkpoints, with no script errors. One seed and club only; no renewed nineteen-season or balance claim.
- Screenshots were inspected for the draft, XI, matchday, live match and result. CSS animations are settled for result inspection. External image requests are blocked in these browser tests, so their photographs are not a new image-loading certification.

Only components.js and screens.js executable blocks change relative to the preceding artifact. The other eighteen scripts remain byte-identical. Workspace CSS adds scoped board, continuation and direct-pick styling. `qa/core-loop/build_candidate.py` reproduces the exact artifact on the hash-verified preceding build; the normal builder's matching source files are also updated.

The browser journeys are informed tests with known selectors and a deliberate draft plan, not unfamiliar-player observations. Rendering fixtures intentionally construct later states and are reported separately. Automated contrast checks do not establish text contrast over every gradient or photograph. No human sessions, sustained enjoyment or release readiness are established.

## Remaining work

The broader design pass still needs offseason trading/releases, later-career pacing and consistency, and independent player observation. A cold player should complete this loop without coaching, then return to the same career and explain the next decision. Human voluntary return remains an essential separate requirement. Do not substitute this checkpoint's automated counts for that evidence.

## Reproduce

From repository root, run `python3 qa/core-loop/build_candidate.py`. Set `GCC8_TEST_BUILD=game/gcc_v8_core_loop.html` for the focused suites. Fixtures are produced by the existing one-season runtime test and `qa/v8_prepare_fixtures.mjs --foundation-only`, as described in the preceding decision-clarity review.

Browser scripts: `qa/core-loop/expanded.cjs`, `qa/core-loop/results.cjs`, and `qa/core-loop/native.cjs`. They require Playwright and Chromium at `/tmp/gcc-chromium`. Reports stay in their corresponding core-loop directories; screenshots and generated career saves are internal test artifacts.

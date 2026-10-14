# V8 game-first foundation

Current candidate: `game/global_champions_cricket_v8_refined.html`. See `GCC_V8_REFINEMENT.md` and `qa/v8_refinement_scope.json` for pacing, responsive layout changes and verification limits. The prior 65-season matrix remains in `GCC_V8_EXTENSIVE_TESTING.md`.

This checkpoint supplies an entirely new visible UI and controller. It does not certify visual quality, native browser behavior, focus, frame rate, or smoothness. Rendered review is still outstanding under the browser restrictions in `GCC_V8_NEW_CHAT_HANDOFF.md`.

## Experience

| Stage | New decision and presentation |
| --- | --- |
| Title | Play, Continue, separate story and how-to |
| Breakaway | Automatic club invitations with pause, speed and reveal-all |
| Takeover | Select a club and consider its home conditions |
| Signing | Five-day signing wire, pause/speed/skip, committed and declined names |
| Draft draw | Snake positions and reverse-round consequences |
| Foundation draft | On-the-clock room, searchable pool, player scouting and confirm pick |
| Team room | Manual XI, batting-order sheet, remove/swap/reorder and interactive cricket reads |
| Matchday | Ground, opposition, conditions, preparation and explicit match confirmation |
| Result | Club score, winning/losing colour, innings scorebook and return to matchday |
| Season | Ladder, fixtures and player averages as supporting views |
| Finals | Semi-final pairings/results, Grand Final matchup/result and XI review |
| Season close | Club outcome, run leaders and transition to the next year |
| Offseason | Contracts, confirmed releases, trade proposals and club responses |
| Annual draft | Same scouting/decision controls, fresh lottery, roster vacancies and supplementary picks |
| Archive | Season books using club-attributed player statistics |
| 2026 | Tenure closes with honours and archive |

Navy, lime, cyan and orange set the arcade visual roles. Club colours belong to club marks. Player names have their own dark foreground. The visible UI does not ship the v7 stylesheet or its card/screen markup. These are source-level design choices; screenshots are needed to assess the result.

## Architecture and limitations

The transitional adapter still runs foundation and dynasty cricket scripts against a hidden, inert DOM host. This preserves the established model while the visible interaction system is rebuilt. It is not a finished headless-domain architecture. Duplicate hidden rendering still has a performance cost that has not been measured in a browser.

The builder excludes old home motion, global moment overlays and visual-identity scripts. Legacy MutationObservers are disabled in the adapter because their presentation decorations do not belong in v8. Cricket timers run through a single native scheduler with pause/resume and cancellation. Opening a scouting dialog freezes the draft clock. Title and background-tab transitions pause the scheduler. Recruitment updates its live area; search updates the pool only. Other changes preserve identified controls and scroll positions in source, but native focus and scrolling require browser verification.

UI commands have stage guards, membership/availability checks, duplicate match protection and explicit decisions for drafting, releases and match preparation. Injuries after Round 14 route the user through XI selection before entering finals. Ratings derive from the manual batting order. Fielding opens a real read. UI forms pass trade decisions into the domain's hidden form temporarily; no old trade markup is copied into the visible dialog.

V8 uses `gcc_dynasty_v8` and `gcc_dynasty_meta_v8`. Continuing a v7.2 save reads it and writes the migrated state to v8, without overwriting the v7 save. There are no product import/export controls or download commands. Save restoration checks structure, year, player identities and roster uniqueness before changing the active career. Browser storage failures leave the current session playable and show a save warning. The model's save schema version remains its existing domain version.

Outstanding: rendered desktop/mobile review across all stages, browser playtesting, focus/scroll checks, performance measurement, deeper domain extraction, and iteration on game feel from actual pixels and play. This is an implementation candidate, not a polished or visually approved release.

## Reproduce

```sh
python tools/source_workspace.py build game/global_champions_cricket_v7_9_3_layout_rebuild.html
python v8/build.py --freeze
node qa/v8_clock_test.mjs
node qa/v8_game_test.mjs
python qa/v8_markup_check.py
GCC8_TEST_LAST_YEAR=2009 node qa/v8_game_test.mjs
node qa/v8_interaction_test.mjs
```

The base SHA256 must be `eddec7bc6d92eb494bef26384e0618ea63d5244c63c8a1c9d84b1f5e16e98926`. `v8/build.py --freeze` creates its generated engine directory. The standalone build is `game/global_champions_cricket_v8_fresh_game.html`. See `qa/V8_VISUAL_REVIEW.md` for the permitted user-operated capture path.

Test scope is explicit in each result JSON. VM tests execute the new controller and real model using a DOM stub. Parsed strings establish action bindings and missing-data checks; they do not establish native events, valid geometry or readable pixels. The trade/replacement fixture uses a deliberately injected OUT injury to exercise that boundary.

## Arcade presentation pass

The latest user direction is a bolder arcade sports treatment. The stylesheet has been rewritten around navy, lime, cyan, orange and pale player surfaces. The shared ground artwork has turf stripes, stands, boundary rope, correct two-bail stumps and floodlights. Club marks and card accents carry club colours, while player role accents distinguish the pool. Title type and scores use a local sports-display font stack without external font dependencies. Controls have pressed/hover states and short decision-triggered motion, disabled by reduced-motion preferences.

Build `game/global_champions_cricket_v8_arcade.html` with the explicit `--output` argument. The controller, clock and cricket model remain the foundation checkpoint's version. This pass changes presentation and result labels only. The arcade-specific scope JSON is authoritative for its checks; prior career tests do not establish anything about its rendered appearance. Screenshots and native play remain outstanding.

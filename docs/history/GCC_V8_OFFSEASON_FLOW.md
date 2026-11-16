# Offseason flow and hard gameplay testing

Current playable: `game/global_champions_cricket_v8_offseason_flow.html`.
SHA256: `2a33e49e2bea94349ad93516253370a10043179f6ae1b55be9f8ed35cae97a52`.
Build: `python3 v8/build.py --freeze --output game/global_champions_cricket_v8_offseason_flow.html`.

## Player experience

The season review now names the next year's squad update and explains what will happen. That update shows confirmed retirements by name, the returning squad and its vacant places. Confirmed optional releases and trades also appear by name. The three-stage guide is squad update → draft room → opening XI. The next action confirms the list before revealing the draft order; cancelling leaves the squad untouched.

Club agreements roll over automatically. There are no wages, invented expiry dates, renewal forms or salary cap. This is a deliberate design choice: develop a strong club through cricket roles, the draft, age/development and limited squad moves. Avoid an extra financial system that does not currently support meaningful player decisions. No real-world claim about Saudi competition rules is implied.

Trading is optional. Keeping the entire returning core is valid. Releases sit behind a disclosure and retain the existing allowance: at most two, reduced when retirements fill the four ordinary annual places. Every permanent retained player can be reviewed; the former opaque seed-dependent contract eligibility cycle is removed. Confirmed releases are irreversible here, return the player to the available pool and open a vacancy. Releases close at the draw; trading remains available until the draft starts. Forced departures beyond four still use supplementary choices, and traded early picks are preserved.

Other clubs negotiate automatically when the user confirms the draw. The user no longer has to press a button to make rivals participate. A club with no vacancies watches the other clubs finish before reaching the team room. Draft completion still hands off automatically; the XI and batting order remain manual. The final 2026 review clearly ends the career, with no 2027 market.

Player dossiers distinguish retained players, rival agreements, free agents, temporary cover, retired players and players not yet eligible. Existing saved offseasons without the new optional returning-core snapshot remain supported. New snapshots preserve list movements across cold resume and are validated against known unique player IDs.

The HUD now displays the upcoming round 1–14, Finals or Season complete. A later-year opening XI says Preseason rather than Foundation. Existing arcade palette, cricket roles, player ratings, stadium routes, scoring depth and manual selection are retained.

## Genuine defects corrected

A fresh 2008 cold reload previously reapplied older-age physical/mental adjustments to some foundation veterans despite no season advancement. Anchored 2008 attributes are now restored exactly before later career development. A dedicated regression compares every retained starting skill field for the entire foundation cohort across a cold reload. Later-year ageing remains covered by complete careers and the shared-career checks.

CPU negotiations repeatedly recalculated unchanged player/club values. A window-local cache reduces those calls. A club exits that negotiation window after trading, so values are never reused for an actively changed club. Three same-state comparisons restore the original uncached algorithm in temporary copies and require identical rosters, ownership, market state and transaction contents (excluding non-gameplay sequence timestamps). Calls fell from 1,518–2,934 to 324–414. VM timings are diagnostic only; native responsiveness is not certified.

The adversarial audit's cached-XI expectation was also corrected to exclude OUT players, matching the established fit-player calculation. This was a test expectation issue, separate from the genuine 2008 reload defect.

## Verification and scope

See `qa/v8_offseason_scope.json` and the linked result files for reproducible detail.

- Two complete 2008–2026 careers: seeds 3907 and 4001, clubs SOM and STA. Both ended at the legacy screen and cold-resumed it. Injury selection/cover, actual retirement, CPU roster integrity, annual drafting, supplementary picks, archives, finals and repeated cold checkpoints were exercised.
- All eight club paths completed a new 2008 season: seeds 4301 through 4371 in increments of ten.
- Combined matrix: 46 seasons, 644 regular-season games, 724 captured scorebooks including finals, 1,448 innings. The scorebook audit passed 30,467 consistency/bounds checks. Scores ranged 83–245, median 158; 54.01% of captured matches were won chasing. These are model diagnostics, not empirical historical calibration or every ICC playing condition.
- Nineteen focused regression suites plus the new offseason and CPU market suites passed. They cover actual trades, draft prospect value, variable retirement/vacancy cases, transferred picks, paced/skip equivalence, rapid controls, stale commands, manual selection, injury recovery, Super Overs, chase finishes, reveal pauses, storage failures, corrupt saves, migrations, roles, ratings and photo routing.
- New offseason checks explicitly cover cancellation, optional releases, RNG-independent eligibility, named list movements, cold resume, automatic CPU negotiations, late/duplicate actions, a zero-vacancy no-pick path, manual XI handoff and the 2026 boundary. The actual accepted offseason trade test verifies named incoming/outgoing players.
- Parsed HTML checks passed across 230 matrix states, 26 layout-suite states and four focused offseason states. This checks action bindings/IDs/output values, not visual alignment.
- All embedded scripts and source UI/domain modules passed syntax checks. A frozen rebuild is byte-identical.

The full-career matrix ran on SHA256 `566dda35023e7a5ec97e1b5de7cfd07bc574102a60e2345ec895a13a43cba891`. Only the HUD label expression changed afterwards. Exact reconstruction confirms all other scripts are byte-identical; see `qa/v8_offseason_equivalence_results.json`. All eight single-season club paths and the final focused regressions use the delivered `2a33…` artifact. Do not claim the full careers ran on that final digest unchanged. Earlier interrupted diagnostic careers are excluded.

## Remaining limits

This is a standalone DOM-backed transitional engine, with no server backend. Automated testing executes the actual scripts in a VM DOM stub. It cannot certify rendered spacing, alignment, keyboard/focus/scroll behavior, native image loading, animation smoothness or subjective enjoyment. Browser/localhost/file/CDP/alternative-hosting restrictions remain; obtain visual evidence through user-operated screenshots. External venue photos still require network access and retain the existing fallback. Model ratings are estimates, not historical measurements. No deployment, Actions, release or subagents were used.

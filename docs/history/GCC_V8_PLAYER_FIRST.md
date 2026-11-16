# Familiar systems throughout the career

Source parent: `2c1c4e54828ce82e9955aa7eb00eaa111749c440` on `work/v8-game-first-rebuild`.

## Intent and implementation

Tom found later seasons confusing despite the existing logic tests. He wants time to advance inside familiar systems, with the approved arcade design maintained throughout the career. This is a correction of the existing squad-management flow, shared typography and information hierarchy, not a new contract or financial subsystem.

There are no contract expiry dates, renewal negotiations or wages. Permanent players remain until retirement, an accepted trade or a confirmed release. The visible contract/agreement/renewal language has been removed. Historical/internal compatibility names are retained where changing them would needlessly alter saved or engine interfaces. New release transactions use truthful release copy.

Every annual squad update uses the same layout: occupied/vacant places, one row per player, Scout/Trade/Release actions, named departures and incoming players, and one continuation route that also works when no changes are wanted. Release limits remain at most two voluntary cuts, further limited by retirements to four total ordinary departures. Extra uncontrollable retirements still receive supplementary selections. Users see their actual remaining allowance. Releases stop at the draft draw; trades remain available until the draft starts. Full squads have a no-pick route.

A release review names the player and shows exact before/after squad and draft-vacancy counts, remaining allowance and a warning if the last recognised keeper is removed or the remaining bowling capacity cannot cover an innings. Keep is an explicit action. A confirmation is bound to that exact reviewed player. Older overfull-list correction also requires a review, cancellation and confirmation.

Trading retains the actual existing one-for-one engine and CPU squad-shape/valuation safeguards. Both players must be deliberately chosen; no target is guessed. Opening Trade from a squad row preselects only that outgoing player. The package labels You give/You receive, shows role/ability/form/age/availability, and previews fit-player squad batting/bowling phase averages and keeping through labelled before/after bars. These are read-only ability comparisons, not win probabilities or guaranteed acceptance. Market commentary estimates value and reports the real CPU roster refusal reason when applicable. Draft picks appear only when actually owned and tradable; their loss is stated explicitly.

Reviewing an offer makes no move. A separate confirmation sends the exact reviewed package through the existing trade command. Stale ownership, changed players, closed windows and unavailable picks are checked again. Declines explain that nothing moved and allow editing. Accepted trades name both movements and any transferred pick. Midseason XI/cover cleanup remains in the existing engine; players repair the XI manually. Unconfirmed offers are transient and do not execute on reload.

## Shared language, typography and depth

One foundation/annual draft room, one XI workspace and one Scout view continue across all years. The same card and ability-bar helper is used in drafting, scouting and injury cover. Later seasons do not receive a separate text-heavy presentation. The root text scale is18px with substantial body weight; existing rem-sized labels inherit that baseline, and condensed display type remains for large headings. Bar label tracks grow for larger words; responsive columns stack rather than reducing the text floor.

Normal player cards now use the same labelled batting/bowling bars as the draft. Scout leads with the cricket role, overall number and four ability bars. Detailed attributes remain individually labelled with bars in an expandable section; innings-phase skills are available separately. Bowling role remains explicit, including frontline/support/part-time distinctions. No preferred-slot number is presented as an exact mandatory batting position. Career outlook and observed development remain estimates/observations, not a guaranteed future.

Season summaries show labelled scored/conceded bars and a win/loss strip. Planning shows actual phase scoring rates in paired bars with a short scouting lead; innings lengths and context remain available. Cricket scorecards, averages, leaderboards and archives retain proper statistical tables. Replacing those with decorative gauges would obscure their purpose.

## Verification and limits

Exact artifact, test outcomes, fixtures and exclusions are recorded in `qa/v8_player_first_scope.json` after completion. New tests start from a genuine completed2009 save. Lifecycle coverage also opens completed2019 and2025 checkpoints, advances into2020 and2026, drafts actual vacancies, checks the shared manual XI/Scout and cold-resumes. Those are not newly simulated full careers. A fresh two-season interaction run covers the new build separately.

Source/VM markup checks cannot establish native pixel alignment, all viewport fitting, native keyboard/focus/scroll, image latency or animation smoothness. No browser rendering is performed under the established restriction. Larger text intentionally prioritises legibility and may require page scrolling on narrow displays. Existing371 uncertified player identities, rating/chemistry calibration and empirical simulation/human-enjoyment limitations remain. No claim of perfection.

Build: `python3 v8/build.py --freeze --output game/global_champions_cricket_v8_familiar_career.html`. Never patch generated engine scripts directly.

## Completed evidence

Final playable SHA256 `142a28437e152a5b8b8c70762d14dbceee392f0e779d613d7c72b81b19d22be4`,1,607,781 bytes; freeze rebuild matches. Same playable identity is version29.

The broad46-suite cohort ran on211bd697:44 passed and two initial failures were addressed. Draft controls caught the missing explicit bowling-workload role; final script12 restores it. Interaction encountered a VM stub assertion that read textContent from an element created through innerHTML; the assertion now checks actual result markup, while ownership/pick-transfer checks remain. All14 final focused suites pass on142a2843, including both previously failing suites and the new management, boundary, readability and lifecycle tests. No outstanding automated failures. Do not represent all46 as running on the final digest.

Fresh2008–2009 HEA seed8831 completed1,778 checks/28 regular user matches, two finals paths, two Super Overs and eight cold checkpoints with no reported errors or quota failures; peak attempted save2,027,702 UTF-16 bytes under5,242,880. That run used211bd697. Script comparison confirms only data script12 differs from final (the restored Scout bowling-role line); engine, codec, controller, all other scripts and CSS are byte-identical. Final lifecycle78 checks use142a2843. No new full19-season career was run for these presentation/confirmation changes.

Final markup:39 general states/556 action bindings;4 management states/294 bindings;6 lifecycle states/21 bindings; the two-season capture adds27 states/684 bindings. These are string/command checks, not native geometric measurements. Source audit covers all16 screen families and all10 UI JS files, with no sub-rem font declarations or inline font/scale overrides.

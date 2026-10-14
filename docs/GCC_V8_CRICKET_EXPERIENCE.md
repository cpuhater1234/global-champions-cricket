# Cricket experience checkpoint

The dressing room and draft now explain players through batting jobs, keeper status, pace/spin type and useful bowling phase jobs. Named groups replace the numeric bowling-cover summary. Unavailable players are excluded from fit-squad feedback. Existing detailed matchup analysis remains behind a disclosure. The underlying data supports broad pace/spin/dual styles; handedness and finer bowling subtypes are not invented.

Completing fifteen signings automatically finishes the remaining CPU choices and enters the team room, in foundation and annual drafts. The final-XI prompt offers manual selection or scouting the actual unsigned pool. It does not auto-pick the XI or batting order. Annual zero-pick paths are covered.

Dialogs have a sticky corner X and Escape close through the same controller path. The scorecard no longer depends on a bottom Close button. A shared gap between the bordered summary and following actions addresses the signing and yearly-review green-button collision in source. Role panels, squad groups and innings comparisons use the arcade visual system. Source and markup checks are not rendered evidence.

Match playback presents three actual phase summaries and one factual player-performance spotlight per innings, plus a ninth beat when a Super Over exists. Spotlight figures come from the scorebook, including credited wickets and legal overs. Hidden intrinsic frames reserve content space. Legacy six-beat saved reveals resume compatibly. Playback remains a presentation of a precomputed match, not invented live deliveries or a tactical ball-by-ball engine.

## Cricket defects found by testing

Successful chases previously always finished exactly one run above the opponent. New winning totals permit bounded excess of zero through five, consistent with the possible aggregate winning score; the helper does not claim to identify the final delivery. It uses the detail RNG, preserving the main RNG call sequence.

Target reconciliation previously dumped a surplus into the last played phase. Actual diagnostic games showed 21 runs in one legal ball and 29 in two without enough extras to explain them. Reconciliation now respects phase legal-ball capacity, proportional partial phases, exact totals and the requirement that earlier phases have not already reached the target. Regression tests include those exact defects and 1,820 generated phase budgets. This affects newly simulated games; existing saved scorecards remain unchanged.

Rules consulted: ICC men's T20 playing conditions, sections 13.7.1 (innings length), 13.9 (bowling limit) and 16.5.3 (winning boundary credited in full): https://images.icc-cricket.com/image/upload/prd/qfnsie8fz6vhyl1pmcli.pdf . This remains an aggregate simulation, not a complete ICC rules implementation.

## Verification and limits

See `qa/v8_experience_scope.json` for exact digests and run coverage. Two full 2008–2026 careers and eight foundation club paths completed: 46 seasons and 644 regular games. Including finals, the captured 739 matches / 1,478 innings passed 31,070 scorebook assertions. Tests cover totals, extras, wickets, boundaries, phase/chase stopping, legal balls, bowlers' limits, consecutive spells and batting identity. Score distributions are descriptive; no empirical historical league calibration is claimed.

The career matrix artifact SHA256 is `4d49d1e2633fa2b37a169e7992f3e6f761f942b84af3c2256c105fcec7120b82`. The final artifact is `game/global_champions_cricket_v8_cricket_experience.html`, SHA256 `131899e5c596f7adad94ae3089cc8ac0be1802feb69c6c2d47228b6d0ca8756c`. Engine, scheduler, controller, screens and persistence scripts are byte-identical. Final changes are fit-only cached squad preview, availability feedback and emergency-bowling wording in three UI read modules. The final artifact separately passed the role/handoff, draft, cricket-polish, match-reveal, layout and chase regressions and a two-season smoke (28 regular matches). Eleven matrix/release markup sets passed; the frozen rebuild is byte-identical and JS syntax passed.

No native screenshots or rendered geometry, focus, scroll, mouse/keyboard or smoothness evidence exists. Preserve the browser restrictions and user-operated review path. No deployment, Actions, release or subagents were used.

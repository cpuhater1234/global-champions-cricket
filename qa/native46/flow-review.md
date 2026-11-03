# Build46 native flow re-review

**Subjective flow score: 7.5/10.** The tested46 screens are materially easier to manage than45. The improvement comes from putting the existing decisions in the right order. This is a bounded positive judgment, not a whole-career or10/10 certification.

## Evidence

I independently inspected root-captured native46 `matchday-desktop.png`, `xi-390.png` and `management-390.png` in `qa/native46/captures`. Root operated the browser; I did not independently play this career. The first set shows Punjab2008 Round9, with eight completed league matches and populated requests. I also reviewed46 source, transforms and offline contracts, and previously reproduced and tested the correction to the result-to-management route.

## What the native captures now establish

- **Matchday hierarchy works in the tested desktop viewport.** Readiness and Watch match are prominent, both clubs and their home/away status fit together, conditions are readable, and the long venue name is subordinate. Campaign context and meaningful squad decisions remain visible alongside. The venue no longer consumes the main decision hierarchy.
- **XI editing uses phone space better.** At390×844, the first three selected players and their order controls are complete, with the return action visible and venue/conditions available by disclosure. This is evidence of useful density, not a claim that every roster state or short viewport is solved.
- **The tested management response is substantially better.** Kemp's active bowling promise, its medical/short-innings qualifications, and Agree to seek a move are simultaneously visible. The prior management criticism is closed for this active-promise/request case. Additional form and relationship context remains explicitly discoverable. The long terms still require careful reading, but they no longer bury the action in this captured state.

## Remaining limits

The season-review phase diagnosis still does not clearly travel into the next active recruitment workspace in the reviewed source. That leaves the accumulated-career learning loop weaker than the immediate match loop. Dense offseason, annual draft, finals, medical-plus-promise combinations, retirement-heavy squads and end2026 are not certified by these captures. I have not seen a native2009 trade-window notice.

A fuller consequence count is an improvement, but the completed result interaction and fixture Prepare match transition need their own native observations. A synthetic six-event contract cannot establish mobile list height or focus behavior.

## Independence

I found an actual46 integration bug before this native pass: consequence Review opened a player without Management because result was excluded from its guards. Root corrected it. I reran `qa/panel46/result-management.mjs` against the refreshed exact `deliver/GCC_v8_Playtest_46.html`: PASS, including actual management review/action, closed-window rejection, team-only rest and pending-swap guards, and unchanged XI/order/results/stats. That finding is retained in `qa/panel46/flow-review.md`; it was not waived because other contracts passed. I will only mark native gates closed when the matching captures or recorded interactions are available.


## Critical later native finding: consequence display loses valid events

Root's subsequent native Round9 test completed Kemp's second two-over promise (2.0 overs,15runs,1wicket), yet result reported no events; the next dossier said Commitment kept. This is root-observed native evidence, not my independent browser play. I independently reproduced the underlying defect against exact46 model: event cleanup clamps both year and playerId using the default maximum400. Thus2008/2026 become400, the production renderer's year filter hides the event, and IDs above400 can point at the wrong player. The former passing consequence test used stubbed events after cleanup and missed this integration boundary.

`qa/native46/event-cleanup.mjs` and `event-cleanup-red.log` establish five failing model/migration cases. They exercise actual compiled management decide/applyMatch/clean sequentially, and the corrected-model path additionally invokes the actual compiled consequence renderer. Until a corrected deliverable passes and the native result is rechecked, consequence reliability is an open release issue. The previous7.5/10 is superseded by **provisional6.5/10 for this affected candidate**: correct hierarchy cannot compensate for a misleading “no consequences” statement.

Other default400 clamps in the management model apply to bounded counters; annual counters reset each season, promise/trust/grace have their own tighter limits. I found no other management year/identity field using the same generic numeric clamp. That is a focused audit, not a global save-system certification.

## Candidate47 correction independently verified

I reran `node qa/native46/event-cleanup.mjs qa/perfection-20261030/candidate.html` after the correction: all five checks PASS, including sequential actual compiled model cleanup and the actual compiled consequence renderer. The isolated renderer harness now supplies its required roster dependency; this is a harness correction, not native evidence.

Source review confirms that valid2008-2026 event years and positive safe-integer player IDs are preserved. A legacy invalid/clamped year can recover from a valid four-digit year prefix in its event key. For ambiguous legacy ID400, a route is recovered only when exactly one current-roster name matches the complete `name + ':'` prefix and has a valid ID; otherwise it becomes0. This deliberately favours a readable historical event without a player link over linking the wrong person. Events for players who left the current roster may therefore retain text without an actionable player route.

This closes the reproduced cleanup defect at model/render integration level in candidate47. **Native47 consequence display and its player-review interaction remain pending.** The affected46 score above describes the pre-correction candidate; I am not assigning a fresh score from this test alone.

Root additionally reports normal native46 Round9 completion: Kemp bowled2.0overs for15runs and1wicket, fulfilling the second promise opportunity; the next dossier showed Commitment kept. Punjab lost by110runs and advanced to Round10. Root reports fixture Jump to Round10 → Prepare match passed without XI changes, and the320px fallback kept three44×44controls without horizontal spill. These are root-recorded interactions, not my independent browser play, and they do not retroactively validate46's broken consequence display. They do support the fixture continuation and short-viewport control gates for the tested state.

# Build45 independent flow and sports-management review

**Subjective score: 6.5/10.** This is a coherent, playable management loop with much better navigation than the older inspection baseline. It is not yet a convincing nineteen-season decision workspace. Too much of the consequential information lives after the button that advances play, inside a long report, or on the previous phase's screen. My concern is decision cost and continuity, not a request for more systems.

## Evidence limits

I inspected the compiled `deliver/GCC_v8_Playtest_45.html` and current `v8/ui` presentation/management source. I viewed actual older native screenshots `qa/build43-inspection/captures/xi-ratings-390.png`, `qa/build44-review/captures/management-mobile.png`, and `qa/build44-review/captures/fixtures-round8-before.png`, and read the Build42 and Build44 inspection records. Those screenshots are baseline evidence, not Build45 renders. I also viewed the root-captured current45 `qa/panel45/captures/matchday-desktop.png` at Punjab Round9: campaign record, clear Watch match action and populated relationship requests are visible together. I additionally viewed current45 `fixture-jump-mobile.png` and `management-mobile.png` from the same root capture directory. The fixture target is visibly outlined and fully in view; the Kemp report shows the unresolved request, current performance and the start of his remaining-opportunity card. Root reports native jump focus on `gccuiNextFixture`, bounds y306.2-537.8, and no horizontal spill. No new match was played in this45 pass: Round9, 8/14 played. I did not independently operate a career or play finals/offseasons. The Build44 account of rounds 2-8 is prior recorded testing, not my own play. Dense later-career concerns below are source-supported design judgments; their exact native geometry remains unverified here.

## Three strengths

1. **The regular-season loop has a clear spine.** Matchday / My XI / Ladder / Fixtures / Stats are stable destinations, the opponent and XI readiness sit beside Watch match, and the result has a clear continuation. This is a usable sports-management structure rather than a collection of disconnected panels. Evidence: current `components.js`, `decision-ui.js`, current45 native Matchday image, and older native XI image.
2. **The management logic has credible cricket-specific qualifications.** Preferred batting role, full bowling opportunities, medical pauses, and explicit remaining commitment opportunities reduce arbitrary punishment. The prior Build44 Kemp test records an actual two-over allocation and one opportunity remaining. Evidence: current `management.js` and prior Build44 recorded test. The second opportunity and pause behavior are not certified by that sample.
3. **Build45 fixes a real accumulated-season access problem.** The older Round8 fixture capture begins with Round1; Build45 provides a guarded Jump to Round N target. This responds to career accumulation, not cosmetic polish. Evidence: older native screenshot, compiled45 source and current45 mobile fixture-jump image. The current target is fully visible with a distinct outline; root verified actual focus. This closes the midseason mobile jump geometry gate for the tested viewport, not every fixture/viewport.

## Five ranked weaknesses

### 1. Advancement is more prominent than the consequences that should inform it

**Screen:** Match result → next Matchday. **Impact:** A player can repeatedly press Next match without learning that a promise broke or a relationship changed. That weakens the game's causal story: the manager sees the score, then discovers the management bill later.

**Evidence type:** Current45 source. `decision-ui.js` moves Next match into `gccuiResultTop`; `screens.js` puts `X.storyResult(r)` after result and continuation material. `managementResult` emits only the last three matching events (`slice(-3)`), with no complete event route on that screen. I have not rendered a result with four simultaneous events; truncation is source-confirmed, its practical frequency is unknown.

**Acceptance criterion:** With a match that creates a broken commitment and at least three other management events, the initial result view signals the number and severity of consequences before advancement, and every event is reachable from the result in one explicit action. The manager can identify the affected player and what changed without visiting each dossier.

### 2. The dossier offers generic promises before making the urgent response easy

**Screen:** Player report → Management. **Impact:** A manager handling a transfer concern, rotation conversation or injured selected player must wade through relationship context and a generic Make a commitment block before the contextual action. The interface makes optional promise creation look like the normal management chore, even for a settled player.

**Evidence type:** Older44 native management screenshot, current45 Kemp mobile capture and current45 source in `managementPlayer`. The old screenshot shows a healthy McCullum's long generic promise introduction; source places commitment options before rotation, seek-move and rest/replacement actions. Current45 Kemp has an active promise, so optional promises are correctly suppressed: the visible report clearly explains the unresolved request but reaches only the start of the remaining-opportunity card at the bottom. His seek-move response is farther down. I have not measured its exact distance, and do not claim generic promises appear in that active-promise state.

**Acceptance criterion:** On a 390×844 report for an injured selected player or unresolved transfer request, the specific concern, relevant rule and contextual action are available before the optional promise catalogue. For a settled player, optional promises can be discovered without dominating the first Management view. Promise terms remain visible when a promise is chosen.

### 3. The season diagnosis does not travel into the squad-building decision

**Screen:** Season review → Prepare your squad / annual draft. **Impact:** The manager diagnoses a weak phase, clicks Build your next squad and lands in a workspace organised around vacancies, retirements and development. They must remember the tactical brief or go hunting backwards. This is a poor handoff for a career whose primary purpose is learning and improving over many seasons.

**Evidence type:** Current45 source, not a played offseason. `seasonPlan()` calculates the weakest scoring-rate phase; review hides it in What to take into next season. `offseasonMarket()` presents retention, vacancies, development and generic squad analysis without carrying that phase diagnosis into the active recruitment workspace. This is not a claim that no analysis exists.

**Acceptance criterion:** Enter an offseason after a season with a clear death-over deficit: the player can recover that same specific diagnosis and inspect relevant squad or draft options from the squad-building screen without returning to the previous-season review. Show the evidence as a scouting prompt, not a guaranteed causal prescription.

### 4. A deadline-bearing trade window is treated like footer content

**Screen:** Matchday, first three rounds from 2009. **Impact:** A time-limited choice competes poorly with Watch match. Advancing three rounds can close the window before a player notices the entry, especially as squad decisions and supporting material accumulate.

**Evidence type:** Current45 source inference. `matchdayHub()` appends `gccuiTradeEntry` after the whole MatchdayLower block; its label correctly states the Round3 deadline. No native2009 screenshot was reviewed, so actual fold position is unverified.

**Acceptance criterion:** With an open trade allowance and a dense squad-decision state at 390×844, the first Matchday decision area explicitly shows that trading is available and when it closes. The manager can reach the trade workspace directly from that notice; it need not interrupt ordinary play.

### 5. The fixture jump finds the next job but does not complete the navigation

**Screen:** Fixtures → Jump to Round N → Up next card. **Impact:** After jumping below seven historical rounds, the player sees Up next but must return to the top navigation or another control to prepare/play. Build45 solves finding; the destination still acts like a static record instead of the next actionable fixture.

**Evidence type:** Older44 native accumulated fixture list, compiled45 source and current45 native mobile jump capture. The outlined Round9 card is fully visible and carries Up next without an action; the navigation header is offscreen. Completed cards get Scorebook; upcoming cards get only Up next. This is a modest remaining friction, not a failure of the new jump and not a demand for direct simulation from Fixtures.

**Acceptance criterion:** At Round9 on a phone, use Jump to Round9 and reach that match's Matchday preparation from the targeted card in one explicit action, preserving normal XI checks and match flow. Completed fixtures retain their scorebook behavior.

## Judgment

The strongest next improvement is making the existing decision systems legible at the point of choice. More news, more panels or more management mechanics would increase the current workload. None of this review establishes a game-wide blocker, simulation-balance verdict, or exhaustive career certification.

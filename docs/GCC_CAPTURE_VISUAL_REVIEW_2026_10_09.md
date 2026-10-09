# GCC rendered visual review, 9 October 2026

The capture route worked. This review uses the newly supplied rendered images,
not the older screenshots. The presentation is more orderly than those references,
particularly the season tables and scorecards, but it does not yet meet the intended
premium, readable cricket-management standard.

## Evidence and limits

- Evidence: `gcc-visual-capture.zip`, 90 PNG images plus metadata; ZIP CRC check passed.
- ZIP SHA256: `1139e41dcc95e6b906aa290325523e1d2547443db88873e74f76bd87e8fa1ec1`.
- Capture: 9 October 2026, 20:26:41 to 20:32:38 Australia/Sydney.
- Every image is 1920 × 842 pixels. These are capture dimensions, not verified CSS viewport dimensions. The opening frames visibly change scale; browser zoom and device pixel ratio were not recorded.
- All 90 frames inspected in chronological contact sheets. 31 selected frames examined individually at full resolution, including both scorecard scroll positions and all five season tabs.
- Covered: Home, story/help, club reveal/choice, signing, draft-order draw, draft, XI selection and detail modal, matchday preview, scorecard, regular-season views, finals qualification, semi-final setup/results and Grand Final setup.
- Not covered: Grand Final result, season review, offseason, trade, annual draft, later years, narrow/mobile layouts, keyboard navigation or live DOM geometry.
- The collector explicitly records `versionVerified: false`. Images are evidence of the user's current running game. They cannot independently prove its file hash. Source traces below refer to the byte-preserved v7.8.7 recovery baseline, SHA256 `8dfda284f00ca7f693f96b734ae9a95edb9ad0b133165dcaef9024eae74478c2`.
- A cropped heading while the user has scrolled is not classified as an overlap. Animation snapshots are classified as readability during motion, not proof of permanent transparency.

## Findings and acceptance criteria

| Priority | Frames | Finding | Required result |
|---|---|---|---|
| High | 23–26, especially 24 and 25 | The live signing feed is nearly invisible in repeated samples. Frame 24 also catches the headline decision card almost transparent. The full wire in 27 is readable, so the live presentation is the problem. | Names and outcomes remain readable throughout live updates at 1×, 2× and 4×. Animate accents or newly arrived content without fading existing information. |
| High | 57, 65–70 | XI selection packs role prose, rating, XI membership, batting position and actions into narrow roster rows. Labels wrap into tiny fragments such as `XI · BAT` with the number below. The tall roster and expanded read require scrolling to reach the main action. | Give names, selected status and Pick/Remove/Swap stable columns. Move long role prose into details. Keep the summary and progression action available while selecting or ordering players. |
| High, validation concern | 65 | A side containing seven players labelled Bowler and only three specialist batters is described as `XI shape: Elite` and `Balanced XI`, while batting depth is `54 Weak`. The screen gives conflicting construction advice. | Explain the weak batting depth beside the positive bowling assessment. Separately investigate whether the balance/shape judgement is appropriate; do not alter simulation rules merely to change the wording. |
| Medium | 5, 14 | The large GCC identity remains inside a prominent rounded cream card. The gold ball is crossed by broad dark diagonal stripes; the stumps are merged into the letters. This remains an awkward interpretation of the requested cricket identity. | Use a restrained, unboxed identity with recognisable cricket equipment. Review at both header and hero sizes. Treat this as a design judgement, not a collision defect. |
| Medium | 20, 27, 38, 65, 80–84 | Essential support text is often very small: ground traits, player roles and attributes, fixture details, table data and phase explanations. Large margins and headline treatment coexist with tiny decision-making text. | Establish a readable text scale at the measured browser viewport and zoom. Preserve the cream/green aesthetic while making player and match information easy to read without zooming. |
| Medium | 76, 82–85 | The large decorative `MATCHDAY` watermark sits immediately beneath/behind the scorecard action area. Its letterforms compete with the functional content. | Remove the watermark or give it a separate area with no intersection with labels or controls. |
| Medium | 76, 82–85 | The result banner's large scores do not directly label both clubs. The user's identity is implied, while the opponent appears as a small central `v/at` label. | Pair each score with its club name. Result, score and opponent should be clear in one scan. |
| Medium | 80, 82–84 | Every season tab repeats the large result banner, next-fixture strip and four-stat row before the selected content. Players, Analysis and Fixtures spend substantial screen height on repeated context. | Retain a compact persistent season summary; give each tab's actual content more of the available height. |
| Medium | 87–90 | The Grand Final block occupies about 200 captured pixels of height, even while empty. It is more visually prominent than the current semi-final. The same upcoming pairing is then repeated in a second large card. | Put the active match and its action first. Keep the bracket compact; expand the final only when it is current. Avoid repeating the same pairing without adding useful information. |
| Medium | 74–75 | The scorecard requires internal scrolling, and the visible Close action is at the very bottom. Both innings fit their columns, but leaving the view depends on reaching the footer unless another close mechanism exists. | Provide a visible close control throughout scrolling. Check Escape, focus management and return focus in a real browser; these images cannot establish their behaviour. |
| Low | 53 | Draft summary says `1 PICKS LEFT`. Some bowler tags end in an orphan separator, such as `PACE · NEW BALL ·`. | Use singular/plural correctly and join only populated tags. |
| Low/design | 16, 20, 31 | Club shields distinguish clubs by colour, but their tiny abbreviations and repeated geometric treatment look generic at these sizes. | Keep club colours useful; simplify the small crest treatment or refine it consistently. This is polish, not a reason to replace the club/ground flow. |

## Source trace for the signing problem

`src/scripts/foundation-game.js` declares `recruitSpeeds = [190, 95, 42]`.
`renderRecruitment()` rewrites the recent feed's `innerHTML` on each update.
The recent rows match the generic `.feed-item` rule in
`src/styles/legacy-foundation.css`: `feedIn` lasts 0.28 seconds and starts at
opacity 0.08. The full `.recruit-feed` has a more specific animation-none rule;
the recent feed does not share that class.

The separate decision-card arrival animation lasts 0.46 seconds and starts at
opacity 0.35. `src/scripts/event-presentation.js` restarts it when the decision
changes. At 4×, update intervals are much shorter than either animation.
This is a strong source-supported explanation for the captured live fading.
It is not a runtime trace of the user's browser. Verify any correction by
capturing the live feed at every supported pace, including reduced motion.

## What is working in this capture

- Home now has distinct New Dynasty and Continue actions; its four facts form a readable two-by-two grid in frame 5.
- Club/ground cards align consistently in frame 20. Ground information has an intelligible structure.
- Draft separates the searchable pool from the squad read. Player names and ratings have a clear relationship.
- Season Overview, Fixtures, Ladder, Analysis and Players are distinct views. The old adjacent-heading collisions are not evident in the inspected season frames.
- Win/loss result banners have clearly different colours. The green is sufficiently distinct from the cream page to establish a focal point.
- Scorecards have stable columns and strong innings headers. The inspected rows do not show text collisions.
- Story/help, matchday and finals-qualification modals show a clear title and action hierarchy.

## Smooth interactivity is an acceptance requirement

Tom explicitly requested smooth interactivity alongside visual quality. It must
be assessed as part of the presentation work, not deferred to cosmetic polish.
This image bundle cannot measure input latency or motion over time.

| Interaction | Required behaviour | Verification |
|---|---|---|
| Signing pace | All speeds keep names/outcomes readable; Pause stops progression; Skip produces the same settled state as completion. Existing rows do not repeatedly fade. | Short continuous recording at 1×, 2× and 4×; compare final pool/state with unchanged logic. |
| Draft pick | One activation makes one valid pick, immediately shows the selected player and locks the action during CPU turns. Pool position, filter and search remain intentional. | Pick by mouse and keyboard, including rapid repeated input and the transition back to the user's turn. |
| Search/filter/Show More | Typing stays responsive, focus stays in the search box, and results update without page jumps. Show More keeps the user near the newly revealed results. | Type and clear several queries, change role filters, expand results and pick from a scrolled pool. |
| XI pick/remove/swap | Feedback updates immediately; chosen player's row and action remain locatable. Swap has a visible incoming player, clear outgoing targets and reliable Cancel. | Rapid selection, removal, repeated swapping and cancellation; check counts, keeper, batting order and unchanged roster ownership. |
| Batting order | Moving a player retains focus on that player's move controls. Names and order change coherently, without rebuilding unrelated panels or shifting the page unexpectedly. | Repeated up/down input with mouse and keyboard at top, middle and bottom slots. |
| Season tabs | Active tab feedback is immediate. The selected content appears without replaying the entire page entrance or resetting scroll unexpectedly. | Cycle through all tabs before and after a result, with a scrolled page. |
| Run/Pause | Start and Pause remain reachable, state transitions are clear and further scheduling stops promptly after Pause. Controls cannot accidentally queue duplicate progression. | Start/pause/resume across ordinary rounds and the final regular-season round. |
| Modals | Stable open/close, persistent close action, Escape, contained focus and focus return to the triggering control. Background cannot scroll while the modal is active. | Open, scroll and dismiss scorecard/help/XI details with keyboard and mouse. |
| Hover/motion | Controls feel responsive without moving other content or letting targets jump away. Reduced motion keeps every piece of information and feedback. | Pointer passes over cards/buttons; keyboard focus; reduced-motion run. |

Source inspection identifies candidates, not measured failures: `renderTeam()`
replaces the roster and batting-order markup on ordinary XI changes;
`renderPlayers()` rebuilds the pool on updates; choreography's `reanimate()`
forces layout by reading `offsetWidth`. Preserve DOM identity, focus and scroll
where practical; update only changed parts. Do not label these paths slow solely
because they use `innerHTML`. Measure actual interactions before performance claims.

Use a practical target of visible action feedback within 100 ms on Tom's normal
desktop, with no lost/doubled actions or unexplained scroll/focus jumps. This is
an intended acceptance target, not a measurement from the capture. Record the
browser, viewport, zoom and input method for the next verification pass.

## Implementation order

1. Resolve live signing readability and XI density. These affect the core decisions.
2. Rework season context and finals around the current action, with readable supporting text and directly labelled scores.
3. Replace the hero identity treatment and remove decorative interference.
4. Clean up singular labels, tag separators and modal close access.
5. Obtain evidence of offseason/trade/review/later years and measured narrow viewports before signing off those areas.

No game implementation was changed during this review. Screenshots establish
visible presentation; they do not establish correctness of clicking, saved games,
trades, simulation or responsive states that were not captured.

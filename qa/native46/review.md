# Native Build46 review and Build47 correction

Three independent reviewers inspected real Build46 captures. Macro rated the inspected presentation 7.5/10 and micro 8.1/10. Flow initially rated it 7.5, then identified the result issue below as critical. The corrected candidate has passed integration checks but has not rendered in Chrome. No whole-game or nineteen-season certification is claimed.

## Browser evidence

Root verified localhost Build46 and resumed Punjab in Round 9. At 1150x666, both club cards, match controls, conditions and compact venue row now fit above the fold. At 390x844, three complete XI rows occupy y507.7 to806.69, including form labels; document width is375. Kemp's Management view shows his concern, active promise and response without scrolling. Supporting context is in a disclosure.

At 320x568, the document remains305px wide and all three row controls measure44x44 with accessible names. Replace Sachin opens the bench chooser; Keep my XI cancels without changing selection. Fixtures -> Jump to Round10 -> Prepare match returns to normal Matchday preparation.

Round9 was played through Watch match, toss and Show result. Punjab chose to bowl. Gujarat made175/5 from20overs; Punjab made65/10 from12overs, losing by110runs. Kemp bowled2overs for15runs and1wicket. Results incorrectly said no new management consequences. After Next match, his report showed Commitment kept and Settled in the squad, confirming that the second promised opportunity was fulfilled.

The career is left at Round10: nine of fourteen matches played,4wins/5losses, fifth, NRR-0.12. No other match was played. Prompts were closed, Matchday restored and the temporary viewport reset.

## Root cause and Build47

Management event cleanup used a generic numeric helper capped at400 for both year and player ID. Thus2008 and2026 became400, hiding events from the result filter. IDs above400 could also become400 and point a review action at the wrong player. The promise was fulfilled correctly; the consequence display was false. This bug predated46 and was exposed by the completed promise test.

Build47 preserves valid career years2008-2026 and positive safe-integer IDs. Previously clamped years recover from the existing event key. An ID of400 recovers only from a unique exact current-roster name followed by a colon in the existing event text. Unresolved or ambiguous IDs become0: the event stays readable without an invented player link. A legitimate player400 remains400 when the name matches. Historical years are retained rather than replaced by the current year. No field or schema is added.

Promise terms now use normal-weight13px prose. The empty result-consequence state loses its unnecessary coloured rule. No other visual redesign is included in47. Cricket simulation, RNG, ratings and embedded image bytes are unchanged; management normalization logic is intentionally corrected.

## Checks

Build46 fails the five initial event regressions. The corrected candidate passes eight checks, covering sequential decide/applyMatch/clean at2008 and2026 with ID701, the actual compiled result renderer, legacy recovery, unresolved and ambiguous names, legitimate ID400, historical years, invalid years and unsafe IDs. An isolated-renderer test initially lacked a roster stub; the harness was corrected without changing production code for that failure.

Result-to-Management navigation, presentation ordering, cricket-state immutability, management terms and guards, and existing management unit checks pass. All20 scripts parse and both maintained stylesheets have no parse errors. Compared with46, only script16 changes; cricket engines2/9/10 and embedded image bytes remain identical.

## Open gates

Open47 with the existing Round10 career, view Round9's result and verify that kept/resolved events appear and link to Kemp. Check normal-weight promise terms and the quiet result state at phone and desktop sizes. Wider open coverage includes offseason diagnosis continuity, annual trading, medical promise pauses, finals/spectator flows, long archives and2026 closure. No10/10 award is asserted.

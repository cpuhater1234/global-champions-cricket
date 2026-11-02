# Build42 macro inspection

Evidence: read delivered `deliver/GCC_v8_Playtest_42.html`, including terminal charcoal/decision CSS and rendered-view templates, the Build41 inspection register, and supplied Build41 XI/matchday/result captures. No Build42 browser interaction or production edits performed by this inspector.

## Ranked native inspection targets

1. **Medium candidate — midseason Fixtures: current round may be buried.** Source emits all fourteen round cards in chronological order (`decision-ui.js:53`), two columns on desktop and one on phone. The current fixture receives `is-next`, a top border, and “Up next”; no jump control or grouping is emitted. After several played rounds the next match can lie many screen lengths below the title on phone. This is a source-confirmed composition risk, not a captured failure. **Bounded fix if reproduced:** retain chronological ordering and add a small “Jump to next match” control beneath the heading when the next card is outside the initial view; make it target/focus that card. Alternatively a compact next-round summary can provide context without duplicating scorebook actions. **Verify:** open fixtures at Round 1 and Round 7+, check current round is quickly reachable and previous scores remain readable; no auto-scroll surprise on scorebook return.

2. **Medium candidate — Player stats / Ladder: scroll, names and rightmost columns.** Source uses a seven-column player table plus a second detailed record, and a seven-column ladder. The complete cascade already provides a conditional “More columns → Swipe or use arrow keys” hint and makes overflowing wrappers focusable (`accessibleTables`), so adding another generic swipe hint is unjustified. **Native gate:** at 390px inspect the initial left edge, swipe to Econ/NRR and back, check long names and caption alignment, and repeat at desktop to ensure the hint disappears when unnecessary. **Bounded fix only on failure:** correct wrapper overflow/padding or detection timing; preserve a real table and avoid shrinking all figures into illegibility.

3. **Low candidate — Stats empty versus populated density.** League leader tables explicitly supply a meaningful opening-round empty message; club tables contain roster records and detailed records. Check both My players and League leaders after a completed round, including the second table below the first. **Bounded fix only if observed:** reduce redundant framing or align caption spacing locally; no global card/material change.

4. **Low candidate — utility Menu in short viewports.** Source already constrains the four-item panel to 70vh with overflow:auto and 44px action targets; Escape and outside click close it. **Native gate:** open at 390×844 and a short landscape viewport, verify final item reachable, menu overlays page controls cleanly, Escape returns focus to summary, and opening a guide restores that opener. No new menu design is supported by source alone.

## Cross-review of creative recommendations

Communicated to creative42: a small OVR label on XI ratings is a worthwhile local clarity improvement if narrow rows retain their name/action width; avoid spelling out Overall on every row. Trialling the existing faint batting glyph at actual icon size is reasonable. The observed result winner sentence wraps legibly across three lines and is not clipped, so splitting heading/margin remains optional polish; preserve the exact cricket margin. Venue thumbnail already sits below the match action and supports the ground name, with no demonstrated consequential defect. Prioritise the rating label and icon legibility over venue/result restructuring.

## Carry-forward limits

Build41 source risks are not automatically Build42 failures. Root is verifying the actual candidate; final sticky XI behavior and specialist micro fixes need current native evidence. Stats/fixtures/ladder/menu are the useful next coverage, rather than another global reskin. No whole-game or completed-career sign-off is asserted.

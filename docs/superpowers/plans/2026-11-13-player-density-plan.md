# Player report density implementation plan

Goal: reduce duplicated attribute framing and player-header spacing while preserving all visible content, rating colours,44px controls and report actions.

Architecture: extend the pinned381b5bb2 candidate using exact edits to the existing decision owner. No runtime code or new style blocks. Do not import maintained CSS because source/build parity is unverified.

- [x] Inspect the user's Overview/Attributes/Management views without career actions; return to Matchday.
- [ ] Guarded CSS patch: desktop header padding16→12 and row gap14→10; attribute group padding14→10px0; remove group border/background and heading underline, retaining outer report and group headings.
- [ ] Compare three actual player archetypes from the generated2009 checkpoint at1440/1150/768/390/320widths. Test all three report tabs, text/value/colour/action parity, button minima and containment, scroll reachability and close/reopen.
- [ ] Native screenshots and visual review. Reject cramped variants. Save one candidate only after evidence passes; report remaining mobile scrolling and source-parity limitation.

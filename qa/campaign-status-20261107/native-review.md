# Native v103 visual verification, 7 November 2026

Current downloadable artifact remains GCC_v103.html, SHA-256 89fe0404d094ecfd996bf35c496c3c0afa63a61e1530c4f3da6d12d6db6b7fc9. This checkpoint records browser testing only; no new product build.

Confirmed in the user's Chrome, http://127.0.0.1:8000/GCC_v103.html:
- Existing Lucknow 2010 Round 3 career: ribbon shows 4th / Early days, record 1-1, NRR 0.53, lost then won.
- At desktop 1150px, all four label tops y186, value tops y208 with height44, footer tops y256. Recent form aligns with neighbours.
- At 390px, ribbon is two columns; each pair shares label/value/footer tops and 118px cell heights. Scroll width380 < viewport390.
- No new match simulated in the user's save.

Separate localhost test origin:
- Draft at 1440x900, scrolled650px: header bottom87.675; sidebar top104, position sticky, overflow auto, maximum height780. Sidebar clears header by16.325px; current sidebar603px tall and tools visible.
- Restarted the disposable localhost career to inspect recruitment. Main 127.0.0.1 save was not reset.
- Intro main action942px plus Back58px, both44px high, no sideways overflow. Screenshot inspected.
- Club chooser desktop1150: all eight466px high and256px wide; guide button offset405px for every card. Includes the full Ekana ground name.
- Chooser1024: two468px columns, every card400px high, no horizontal overflow.
- Chooser768: two348px columns, every card400px high, no horizontal overflow.
- Chooser390: one356px column, every card206px high, no horizontal overflow.
- Lucknow guide: identity has one104px grid row, total108.8px. Priorities110/133/109px instead of artificially stretched185px rows.
- Guide390: dialog client/scroll width354; stacked sections both322.4px, no sideways overflow. Screenshot inspected.
- Signing desktop: Start/Speed/Skip all16px type,44px high, same y453 and no clipping. Both panels441px high and bottom786. Screenshot inspected.
- No error-level console entries captured on main or QA pages.

Viewport reset. Retained test tab is at localhost v103 signing, ready to open, Lucknow selected; signing has not started. Native ribbon, intro, chooser/guide, initial signing and empty-squad draft checks above are complete. Entire game visual acceptance remains ONGOING: Manage squad, toss, long filled draft sidebar reachability, finals, review, archive and remaining dialogs still require native review. Do not repeat already recorded checks without a new change or concern.
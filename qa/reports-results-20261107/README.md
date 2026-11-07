# Player reports and result layout pass

Native defects reproduced in v98:
- Player dialog changes its vertical position when changing between a tall Overview/Attributes tab and short Management tab. On phone the short tab appeared centred far down the screen; the tall tab began at y=12.
- Result screen separates the Next match control from Scorebook and retains the old slanted primary shape.
- Match awards remain a three-card feature layout.
- Phone scorebook batting table overflows by roughly five pixels (319px client vs 324px scroll width), producing a scroll hint for a nearly fitting table.
- Toss and replay controls retain mismatched primary/secondary geometry. The replay otherwise fits phone width; league-leader tables are aligned on desktop.

Changes stay in five existing source files. Anchor the player dialog at y=12 and reserve its scrollbar gutter. Group existing result actions in the header; keep their action names and score/consequence content. Present the same awards as a single aligned list. Reduce scorebook cell padding on phones using the winning compatibility owner. Extend the existing grouped-command rule to toss/replay controls. Remove the obsolete result-decision style.

Verification: all five pre-change source blobs match the maintained branch. Build standalone v99 by replacing those exact source bodies in saved v98. All 20 scripts pass syntax checks; only script 18 changes, solely the result wrapper. Actual wrapper fixtures check regular next match, league wrap-up and finals return; navigation actions, consequences and score content are preserved. All embedded assets and style IDs are unchanged; CSS delimiters are balanced.

Native acceptance of v99 is pending download. Check stable player-dialog/tab position at desktop and phone widths, result action placement for regular/final states, awards alignment, scorebook table scroll width, and toss/replay button geometry. Do not claim the mobile overflow is eliminated until measured in the actual downloaded build. This environment does not contain the full checkout, so no new complete-project rebuild ran. The default build consumes the changed source files, and the canonical regression records the expected v99 hash.

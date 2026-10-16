# Draft and lineup micro-layout pass · 16 October 2026

Parent: `95c19a10d7022a9300b928e7c2c55fa4065f8697` on `work/v8-game-first-rebuild`.

The user approved the arcade visual direction and reported crowding in the draft sidebar, split cricket labels, excessive lineup scrolling and a lime element overlapping home content.

## Changes

- The draft roster no longer sits inside a fixed 300/320px scroll area. Every signed player stays in the page flow, grouped by cricket role, with a rating and Scout control. Long role descriptions remain in Scout rather than repeating in each compact row.
- Squad analysis and recent picks open dedicated dialogs with corner close controls. Analysis retains the named cricket-role groups and twelve matchup reads. Pick history shows the latest sixteen selections. Both foundation and annual drafts use this arrangement; opening a dialog pauses CPU reveals.
- Draft sidebar gets a 350px minimum at wide desktop widths. At narrow widths role groups use available columns without introducing a nested roster scrollbar.
- Matchup buttons use intrinsic columns with a 240px target minimum and ordinary word wrapping. Powerplay and wicketkeeping are no longer subject to arbitrary word splitting. Narrow screens may wrap a multiword label at a space.
- The wide team room uses the full panel width. Its eleven batting-order places run down two numbered columns (1–6, then 7–11), reducing vertical length. Rows retain selection controls and role-fit feedback. Form remains in Scout and squad detail. Below 900px the order is one column; a complete XI cannot be guaranteed to fit one short/mobile viewport without shrinking text or controls.
- The lime feedback banner moves out of fixed overlay positioning into normal flow beneath the HUD. Home action spacing includes room for shadows and button movement. This addresses a concrete overlay risk found in source; the user's particular reported rectangle has not been matched to a screenshot.

## Verification

Results and exact artifact digest are recorded in `qa/v8_micro_layout_scope.json`. Tests cover actual game-script VM commands, generated markup and CSS source contracts. These do not measure rendered geometry, pointer targeting, font metrics, native focus, scroll position, zoom or smoothness.

The existing browser restriction remains in force. No native rendered inspection or screenshot evidence was obtained. A user-operated rendered check remains required before certifying alignment, including the reported home rectangle, complete XI at the user's viewport, longest player names and all matchup labels.

Simulation, player data, CPU valuation, save codec and storage arbitration were not changed. Existing historical-data and model-calibration limitations from the gap review still apply.

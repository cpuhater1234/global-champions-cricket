# GCC v90 — stacked home-ground scales

Restore three equal full-width rectangles for Pace & carry, Spin & grip and Boundaries at every club-guide width. Make category/value text larger and higher contrast; restore readable low/neutral/high scale labels and use a six-pixel outlined marker with a visible midpoint. Preserve all scale positions, descriptive bands and actual ground conditions.

This replaces the v85 three-column scouting-strip CSS. It only affects the club-guide condition block. All 20 inline scripts are byte-identical to v89, including the current Blast names, simulation and persistence. The colourful Breakaway Eight page is unchanged.

Reproduce with `python qa/ground-readability-20261028/build.py --promote`. Pinned v89 base `9755c69524845bd85735d012595d1367315f3695`. SHA256 `65671622910aa3cbcbbb1af32f6c44e864629a0b4c67704dc9883a5d6be5ad99`, 8,075,639 bytes. Both playable aliases and the download match.

RED reproduces the unequal/non-stacked readings. Final native Chromium GREEN checks all 36 grounds across 320, 390, 768 and 1440px widths and 16, 24 and 32px root fonts: 432 cases. Each case verifies three equal-width/equal-height vertically stacked rectangles, visible scale labels, larger markers, no document/card overflow and no category/value collision. Zero page errors. Desktop and phone screenshots visually inspected. All 20 scripts pass syntax checks; embedded CSS and both aliases match. This is targeted presentation validation, not a new full-game or cross-browser certification.

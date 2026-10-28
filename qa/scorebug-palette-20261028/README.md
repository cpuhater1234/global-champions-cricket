# GCC v94 scorebug palette and stadium canvas

Base: v93 commit `987354d02381fe10d09386ccb57fcedf946dea9e`, SHA256 `427bca91a0bbfbe4fc704777849b7aa33caa599bd34c3f7df4483d7c115b62aa`.

CSS-only pass replaces bright forest/bronze surface combinations with matte deep green, charcoal and slate. Cream title bars and club identity colours remain. Main canvas combines a faint stadium arc, fine scoreboard lines and a small embedded procedural grain tile; no animation, fixed overlay or external asset. Text sits on solid panels. Forced-colours mode removes the decoration. Club-guide ground traits fit their content and wrap at narrow widths.

Validation:252 screen/width/font cases (21 states,320/390/768/1440 pixels,16/24/32px root fonts);432 club-guide cases covering all36 clubs. Equal stacked scales and aligned guide headers preserved. Targeted contrast checks cover21 screen/dialog states; changed panel text exceeds4.5:1. See summary.json for sample counts and measured minima. All20 scripts are byte-identical to v93 and pass node syntax checks. Screenshots inspected at phone and desktop sizes. No fresh physical-device or cross-browser certification; contrast scope is targeted, not a full accessibility audit.

Rebuild: `python qa/scorebug-palette-20261028/build.py --promote`. Without the local cache, baseline is read using git show at the pinned commit. Run check.cjs, clubs.cjs and contrast.cjs from repo root with Playwright and native Chromium configured as in the scripts.

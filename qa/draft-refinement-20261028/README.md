# GCC v97 — solid colour and stable draft

Base: v96 commit21e84efc36905e12aa1919c97b540cf13224ab2c, HTML SHA256a3d4e33271d167c31caca59d05f8b45280b00268c105a8d587edb94b66e33e29.

Only presentation scripts11/12/13/17 change; other16 scripts remain byte-identical. Protected simulation, persistence, player data, laws and saves are unchanged. Original club palettes and stadium photos remain.

- Compact signing panel; **Skip to end** action.
- Sealed/revealed draw tickets retain identical geometry. Controls reserve pause/run/completion text and action sizes.
- Strong **YOUR PICK** banner and stable selection instruction on mobile/desktop.
- Compact nonzero role bars, no tracker title/details or suggested quotas. Primary roles partition picked players once: top/middle BAT, keepers, batting/bowling AR, pace/spin BOWL.
- Solid navy/cobalt/red/purple surfaces, white rating ink; no pale mint/cream theme. Original four cricket figures repeat faintly on a textured canvas. Role headers, signing statuses and interaction states own distinct colours.
- Native dark fields and explicit readable placeholder; reduced-motion support.

## Validation

`check.cjs`: RED reproduces176px excess signing space on desktop, reveal movement, unclear own turn and unwanted tracker. AUTO-RED catches automatic-reveal text wrapping missed by paused-only tests. GREEN covers4 widths(320/390/768/1440),3 font sizes(16/24/32),9 reveal counts with paused/running status(216 states),36 CPU/own turn states. Card positions/sizes stay within0.5px; no document overflow.

`draft-flow.cjs`: four complete foundation drafts,480 total picks,60 user picks,116 scroll checks, legal unique rosters, no forced spinner. Bars have positive counts summing to picked roster; renderer is read-only.

`annual.cjs`: two annual drafts after real release/review actions, both return15-player squads to team room.

`smoke.cjs`:21 main screens across4 widths,84 cases, no page errors/document or local overflow.

`visual.cjs`:8 visual states, no pale-green text or cream default-theme surfaces outside intentional club identity; no page errors; reduced-motion bars; signing copy.

All20 inline scripts pass Node syntax checks. Independent review found dark-placeholder contrast and automatic-reveal coverage issues, both addressed and tested. Native Chromium only; no fresh physical-device or cross-browser certification.

## Rebuild

`build.py` pins the v96 baseline SHA. Restore `baseline.html` from the named commit (or set it to that exact standalone), then run `python qa/draft-refinement-20261028/build.py`. CSS baseline is captured from that standalone. Canonical source files and this QA folder's copies match. Candidate HTML is promoted to both game aliases and the saved playable only after validation. Never run a historical builder against a newer release.

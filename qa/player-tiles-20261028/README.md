# GCC v95 player and decision cards

Base: v94 commit `c0b5af8de55dafdf7dbc61c97215c64d510d1c10`, SHA256 `72bf66187f21ee0e986b3a54fac7eb3a9786acc7dafce8f87d6f2725ecd0555c`.

Signing wire uses explicit SIGNED, DECLINED and UPDATE strips, clear player identities and compact country/role metadata. Only duplicate leading status text is removed from metadata; names and model decisions are escaped and preserved. Matching dark scorebug player cards apply in the draft, arrivals and other player-card surfaces; club-card identity is unchanged. Empty wire is a restrained dark state. Scroll-grid rows retain their content height for a full80-card feed.

264 screen/width/font checks and12 focused feed cases pass. Tests include long/unbroken names, escaped markup, all three statuses, accurate country/role text,80-item limit, horizontal overflow and vertical clipping.22 targeted contrast states pass; summary.json records sample counts/minima. Phone/desktop screenshots inspected.19 scripts, including simulation and persistence, remain byte-identical. Script17 changes only the signing-feed presentation. All20 scripts pass node syntax checks. No new physical-device/cross-browser certification or complete accessibility audit claimed.

Rebuild: `python qa/player-tiles-20261028/build.py --promote`. Builder reads the pinned baseline with git show when the local cache is absent. Run check.cjs, feed.cjs and contrast.cjs from repo root with Playwright/native Chromium configured in those scripts.

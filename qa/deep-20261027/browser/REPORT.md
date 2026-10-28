# Deep lifecycle and native accessibility audit

Canonical v80 game/gcc_v8_product_candidate.html; product unchanged. 13/13 assertions pass; no page errors or confirmed product defect.

Reproduce from repository root:

`NODE_PATH=$CODEX_PRIMARY_RUNTIME_NODE_MODULES node qa/deep-20261027/browser/lifecycle.cjs`

Actual Chromium navigation away/back emitted pagehide(persisted:false) and visibilitychange(hidden:true), with back_forward navigation on return. A partially revealed league restored. A paused match restored with exact presentation state after away/back/Continue, remained paused through a 2-second observation, then advanced after real Resume control. Native How to play dialog froze league reveal count for 2.2 seconds; closing resumed progression.

Keyboard activation opened a player scout, 30 mixed Tab/Shift+Tab presses reached no background controls; nested scout→compare had a title and Escape returned to the original scout opener. Chromium CDP Accessibility.getFullAXTree exposed a named Phil Mustard dialog and excluded the inert main landmark. Raw native AX tree and separate Playwright ariaSnapshot are in lifecycle.json; the latter is a DOM-derived convenience snapshot and includes background landmarks, unlike the native tree. Native Tab navigation transiently focuses BODY/browser chrome at the end of the dialog cycle; this is not treated as a background-control escape.

Match live status has nonempty text. This does not prove spoken announcement timing or screen-reader behavior. 390px touch emulation used actual Playwright browser context API with hasTouch/isMobile; observed maxTouchPoints=1, coarse pointer and 390px viewport. This is emulation, not physical-device certification.

Fixtures: fresh normal flow through world reveal; existing genuine legacy-round1.gcc.json save loaded with presentation-only v8UI/v8Match/v8Reveal fields cleared to exercise match and team controls. No synthetic players, match results, or fake lifecycle events injected. Observational lifecycle listeners were installed to record actual browser events.

Limits: Firefox and WebKit executable probes returned absent; no downloads attempted. file:// away/back did not use bfcache, so persisted:true restore is unverified. No independent hidden-tab dwell timer test, nested trade path, physical touch device, human usability session, or screen-reader certification. Earlier broad layout/arithmetic matrices were not repeated. Full machine results in lifecycle.json.

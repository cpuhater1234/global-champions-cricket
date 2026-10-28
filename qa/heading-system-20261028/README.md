# GCC v92 heading hierarchy

Base: published v91, commit `7a5ed5a4c07cb19af85828f9e18d8742af74b7f5`, SHA256 `cec128ae13075540da552afe56dc87b9d6c2bcadad4fd2f0a2518165a13fc4b7`.

CSS-only presentation change: bold italic uppercase page and dialog titles, quieter structural panel headings, italic section summaries. Existing colours, framed panels, stacked condition scales, title-screen wordmark and player/club identity text remain. Inline title icons now wrap naturally; expanded player cards have room at enlarged font sizes.

Validation: `check.cjs` covers25 screen/dialog states at4 widths (320/390/768/1440) and3 root font sizes (16/24/32):300 cases. `clubs.cjs` checks all36 club guides at those widths/fonts:432 cases, including aligned headers and equal stacked scales. Zero page errors or detected heading/document overflow. Representative phone and desktop screenshots were inspected. All20 script bodies are byte-identical to v91 and pass node syntax checks; aliases and playable download are byte-identical.

Rebuild: `python qa/heading-system-20261028/build.py --promote`. Without the local baseline cache, the builder reads the pinned commit via git show. QA runs from repository root with Playwright available through NODE_PATH and the native Chromium executable path configured in the scripts.

This is targeted native Chromium layout QA, not new physical-device or cross-browser certification. The playable aliases, source stylesheet and QA records are synchronised with the saved version92 download.

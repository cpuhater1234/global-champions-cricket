# Visual follow-through, 30 October 2026

Observed in connected Chrome, candidate (13), 2011 Round 2:
- Trade club selector precedes both aligned package columns. Review works; declined Haddin/Buttler proposal leaves assets unchanged.
- Trade Escape returns focus to its trigger. Player dialog keyboard traversal stays inside; Escape returns focus to the player trigger.
- Live playback currently puts batting side first. Paused at Thunder 40/3, 5.3 overs. This contradicts the requested fixed home-first ordering.

Changes in this batch:
- Fixed home/away live score panels with club colours and explicit batting indicator. Score values come only from the existing revealed-score closure. No access to future innings totals in the new renderer.
- Selected draft squad grouped BAT/WK/AR/BOWL with country, age, discipline and rating. All eight role-count bars remain visible including zero.
- Three key attributes for BAT/AR/BOWL; two for keepers. Tests require rendered cards from every role, avoiding empty-pool false passes.
- Sticky trade action row keeps Review and Keep controls available while scrolling.
- Singular run grammar in live commentary/accessibility text.

Verification: all 20 inline scripts parse; decision UI contracts pass, including all role cards and both live innings boundaries. Rendering remains read-only. Existing 2008–2026 seed-101 lifecycle run completed 19 seasons and 266 league fixtures before this presentation-only batch.

Limits: new layouts need actual desktop/mobile browser inspection after the updated HTML is opened. No claim of pixel-perfect completion. Historical role/ratings audit remains separate and unverified.

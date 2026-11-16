# GCC v7.9.2 hard audit

The earlier review did not cover the controls and lifecycle boundaries deeply enough. This pass reproduced additional defects and changed the source, rather than treating old screenshots as evidence of the current build.

## Repairs

- Autoplay now uses one controlled runner across years. Pause, pace changes and manual-match lock agree with the running state. Each timed round saves. Navigation and modal opening pause; reload restores a paused game. Invalid XIs stop before a match.
- XI actions reject foreign, unknown and unavailable players. A stale swap is rejected atomically. Invalid batting-order direction cannot corrupt the order. Replacement signing validates ownership.
- Archive returns to its originating screen. Offseason navigation prevents stale season destinations. Career closure requires a completed 2026 archive, and reload preserves the closed career.
- Signing exposes Pause and Resume, preserves pending calls, and resumes a completed day into the following day exactly once. Pause/Resume and Skip produce the same final player availability.
- Narrow navigation remains available. Conflicting legacy font rules were removed for season controls, ladder, fixtures and overview scores. Draft tags have consistent legible sizes. No new `!important` rules were added.
- Modal return focus has a visible fallback; batting controls retain identifiable actions after rerender. Season view controls use `aria-pressed`; trade and draft inputs have labels. Native focus behavior remains unverified.

## Evidence

Two clubs completed 2008 through 2026 on the exact delivered file: 38 season-years, 532 regular-season scorecards and 3,412 assertions, with no failures or recorded console errors. Versioned JSON reports include the artifact digest. Targeted timer/control, signing, interaction and manipulated-state stress tests supplement the career runs. The source and curated cascade unit suites also run separately. Generated HTML is checked across 18 states for duplicate IDs, handler names and syntax, unnamed buttons and inappropriate ARIA selection attributes.

The signing equality test initially rejected equal arrays from different VM realms. Its assertion now compares serialized ID/availability pairs. This was a test defect, not evidence of a game defect.

## Limits

This candidate has not been rendered and inspected in a real browser. The host is a render stub, not a native DOM. Parsed markup does not reproduce imperative SVG replacement or all selector-driven mutations. Cascade tests enumerate relevant matching selectors, rather than implementing a browser CSS engine. The checks cannot establish pixel quality, overlap, responsive geometry, real click/focus behavior, animation smoothness or frame/input latency.

Historical captures show what to avoid; they do not certify v7.9.2. Browser security restrictions were not bypassed. Do not label this visually approved or assert that no other defects remain. The original protected v7.8.7 checkpoint remains unchanged.

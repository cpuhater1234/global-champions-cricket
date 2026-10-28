# Release synchronisation plan

Goal: reconcile the latest club visual edits with v84 fixes and v85 ground conditions, keeping simulation and persistence exact.

Architecture: reconstruct immutable v84 from recorded patches, append the v85 ground conditions and latest focused club override to its workspace stylesheet, replace only the corresponding embedded style, then promote identical aliases. Do not run legacy builders that regenerate gameplay.

Tech stack: standalone HTML/CSS/JS, Python build/check, native Playwright Chromium.

Spec: user's request to get source, playable and download back in sync.

Constraints: preserve all 20 inline scripts from v84; preserve engine/domain/controller; preserve protected main; branch work/v8-game-first-rebuild only; no Actions billing.

Review focus: narrow long club names; enlarged dialog text; pale surface contrast; source embedded exact; pinned release rebuild avoids silently downgrading newer fixes.

- [x] Reconstruct v84 and verify its pinned SHA; retain latest CSS unchanged as reviewed override input.
- [x] Add a failing source/embedded parity and script integrity check against current split state.
- [x] Build v86 by combining v84 workspace, v85 condition strip and latest club override; add guarded reproducible builder.
- [x] Run parity/syntax/IDs, prior visual regressions and club guides across desktop/mobile/enlarged fonts; inspect screenshots.
- [x] Publish source, builder, QA and identical HTML aliases on current branch with expected-head checks; verify remote Git blob hashes.
- [x] Save exact tested download and report release identity.

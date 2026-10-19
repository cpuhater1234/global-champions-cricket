# Player experience implementation plan

Goal: deliver the existing approved cricket flow with reliable layout, obvious actions and less repeated reading.
Architecture: retain engine, save format and command guards. Modify the existing presentation and use browser geometry and native interactions to verify the delivered single HTML build.
Spec: approved screen-by-screen acceptance table in the conversation, 20 October 2026.

## Constraints
- Preserve random actual home stadium, real venue photographs, manual XI, engine and career rules.
- Keep default body text at least 16px and controls usable by keyboard/touch.
- Do not equate automated checks with unfamiliar-player usability or long-term enjoyment.

## Tasks
- [x] Reproduce title fragmentation with 320–1920px sweep; size it from its content column and prevent word splitting. Check fallback font metrics.
- [x] Compact heading hierarchy and mobile navigation; make player rows visibly interactive and selection available directly. Verify native selection, reorder, swap, pending-swap guards.
- [x] Add age and relevant skill context to draft candidates; preserve safe scouting/picking and CPU pacing.
- [x] Put conditions and comparison on matchday; provide a direct watch action while preserving the optional preparation route for existing saves/tests. Prioritise playback over skipping.
- [x] Replace annual slogans with a concrete vacancy decision and visible retirement names; preserve scouting and release/trade review safeguards.
- [x] Review all early/late career screens, expanded sections, keyboard/modal focus, long names, short viewports, font/zoom variation and image failures. Fix findings and record limits.
- [x] Run focused regression suites plus full existing browser audits against the final artifact, review source independently, verify deterministic build, publish working branch and replace existing deliverable.

## Review focus
Intermediate widths; fallback font width; disabled XI guidance; stale match commands; final-season/offseason transitions.

## Ledger
- Baseline title sweep: 59 of 201 widths fail; Champions fragments at 320–336 and 1480+ desktop samples. No document overflow, proving overflow-only checks insufficient.
- Work continues in existing dedicated qa/v8-decision-first-ui checkout to retain untracked frozen build and established QA fixtures. Only selected source/evidence files will be committed.
- Execution inline; final independent reviewer follows execution skill. User approved the implementation scope and repeatedly requested autonomous completion.

- Final review resolved ambiguous batting-only AR summaries; regression and re-review passed.
- Native fresh mobile career completed 150 actions, 14 first-year matches and one second-year match, with 22 manual selections and no direct state mutation.
- Old squad-place and button-copy tests were migrated to actual vacancy metrics and management panes; all transaction/save guards retained.
- Ruling: unknown-player usability and nineteen-season enjoyment remain external playtest requirements, explicitly reported rather than inferred from automation.

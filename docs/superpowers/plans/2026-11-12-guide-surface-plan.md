# GCC guide surface implementation plan

**Goal:** Remove competing ownership from the rejected guide overlay and produce
one bounded visual candidate with evidence, preserving the working game.

**Architecture:** Guarded adapter starts from the checksum-pinned readability
candidate. It replaces one existing guide block and narrows dialog selectors in
one existing late Floodlit block. No new stylesheet or script enters the game.

**Spec:** docs/superpowers/specs/2026-11-12-guide-surface-design.md

## Global constraints

Frozen release and main unchanged. User save untouched. Seventeen styles and 22
byte-identical scripts. No global token or app styling change. No speculative
match-flow or phase-engine changes in this visual candidate.

## Review focus

- Generic selectors must remain equivalent on non-guide dialogs.
- Short viewports must preserve the header and a reachable scrollable body.
- Long rules must not create horizontal overflow or paired dense prose columns.
- Mobile navigation must retain legible labels and touch targets.
- Tests must not substitute for visual judgment of actual captures.

## Tasks

1. Recover references and independently audit the cascade and composition.
   Record qualified findings; reject advice conflicting with user preferences.
2. Stage the proposed complete scoped owner at qa/candidates/v116-guide-owner.css
   for native validation. Promotion to v8/ui/decision-ui.css remains blocked by
   automatic approval review. Preserve the exact
   previously accepted guide bytes in qa/fixtures/v116-accepted-guide-owner.css
   so the accepted candidate remains independently reproducible. Create
   qa/v116_menu_surface_candidate.py with exact base identity, ownership and
   script/style inventory assertions. Build candidate locally; diff every block.
3. Extend native menu audit in a separate qa/v116_menu_surface_audit.cjs. Reuse
   real game dispatch and markup. Assert fonts, palette, scroll geometry, column
   contract, actions and overflow; capture paired baseline/candidate screenshots.
4. Run independent QA workflow without changing the accepted baseline workflow.
   Preserve JSON evidence in logs and screenshots in an isolated review branch
   because artifact storage is full. Perform independent review before delivery.
5. Inspect actual same-size screenshots. Fix defects at their owner and repeat only
   affected checks. Document limits and only then provide the review candidate.

## Subsequent scope

Once this owner correction is visibly credible, inspect equivalent patterns on
Matchday, XI, player reports and trading. Each surface gets an explicit owner and
before/after evidence. Do not propagate the menu layout or palette globally.

## Completed evidence

Tasks 1-5 for the bounded guide candidate are complete. Exact candidate SHA:
79a2fbfe965453ad0ef04d238ee7047346fb38e537deeec47d91cfcbebf51c4a.
Native run 43154341321 passed all 54 states; independent visual review found the
captured guide correction credible for user review. Shared guide-owner promotion
was approved after native validation; earlier blocked-status notes above describe
the staging sequence. No user visual approval or whole-game completion is claimed.
See docs/release/V116_SURGICAL_GUIDE_REVIEW_20261112.md for scope and limits.

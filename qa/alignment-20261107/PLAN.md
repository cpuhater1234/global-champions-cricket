# GCC alignment corrections

Goal: correct the alignment defects observed in v96 while retaining the modern visual treatment and all game behaviour.

1. Move the existing selection-details element into the selection grid. Assign bench and details to the left column and XI to the right; retain both mobile pane controls and supporting information.
2. Give the two selection metrics identical type, line height and baseline. Remove the superseding oversized rating declaration.
3. At phone widths, place row controls immediately beneath player details, retaining 44px targets and full accessible labels. Prevent status badges from making desktop row heights inconsistent.
4. Reuse the existing selection command geometry for Matchday and adjacent campaign actions.
5. Apply existing dialog surfaces to analysis and development panels. Use stacked discipline sections below 1000px, and a stable four-tile grid where room permits. Allow word wrapping at spaces without splitting words.
6. Replace only the matching source bodies embedded in the accepted v96 artifact. Verify unchanged script bodies except selection markup, identical image payloads, identical style IDs, balanced CSS and all script syntax. Record the new hash in the canonical regression and handoff.

Native acceptance: desktop 1150px, tablet 768px, phone 390px after the user downloads the candidate. Check shared edges, row-control attachment, analysis labels, pane switching, and saved-career continuation. Reset viewport overrides when finished.

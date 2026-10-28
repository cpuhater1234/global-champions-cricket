# v99 draft readability, coverage and batting order patch

Input: active v99 at d905166de71afc65133092e8b05457916b5f1512, SHA256 00509ba76941006480cd145a2349a8968e86086312d592ffb1118be13bfada25.

The dark rule-note panel inherited old dark heading/body ink. The exact draft guidance measured 1.06:1. The panel now owns its descendant text colours; the same reproduced guidance measures 13.04:1. Before/after evidence covers 320/390/768/1440px widths with 16/24/32px root text.

Draft coverage uses singular skill descriptions, opaque framed colour blocks, ticks and option counts. The visible note explains that one player can cover several skills. Counts and eligibility stay unchanged; ticks indicate an option exists, not an enforced quota or sufficient attack.

All-rounder draft cards and selected-player entries show batting position and bowling type from the model (pace, spin or dual). Team XI and bench entries do the same. No handedness or spin subtype is invented. All 98 pool all-rounders were checked, plus 12 coverage layouts.

Starting XI rows have visible, labelled up/down arrows. End arrows are disabled appropriately. A real selection was reordered through a visible arrow, saved and reloaded with the order intact. Twelve layout states had no name/control intersections or document overflow.

Run build.py, check.cjs (GCC_FILE=qa/draft-contrast-20261029/candidate.html PHASE=after), roles.cjs and order.cjs. NODE_PATH may need the primary runtime modules directory. All 20 scripts are syntax checked; only presentation scripts 11,13,17 changed, the other 17 remain identical to the input.

## Matchday assessment — no additional styling in this patch

The prior matchday was reconstructed using the v98 screen source and the current standalone's pre-v99 stylesheet; both versions used the identical Lancashire away fixture at WACA Ground. This isolates the actual matchday markup/style change, not a full recreation of the v98 application.

At 390px, the fixture panel grew from 552px to 647px (17% taller). At 1440px it grew from 423px to 461px. Team cards became separate nested dark panels; the ground photograph was removed. The action labels now wrap in the mobile fixture. The repeated no-trades reminder was correctly removed, but the core fixture gained no useful match information.

Design judgement: the last pass worsened density and removed venue character. The large title/header and club tiles delay the main action. Matchday should establish opponent, venue and stakes, explain useful selection implications of conditions, then provide one dominant Watch match action and a quieter Review XI action. Restore club/ground identity in a bounded fixture header; avoid adding another large uniform panel system. A smaller hub, not more decorative nested boxes, is the appropriate next step.

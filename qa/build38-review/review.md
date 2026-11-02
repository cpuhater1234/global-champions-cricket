# GCC Build38 browser review and Build39 candidate

Actual Chrome38 was inspected from saved2013 Round2. No trades or commitments submitted and no completed swap. Tested: home320x568; menu/How to play; career matchday1150x666; fullXI; incoming swap/cancel; previous result390x844; Scorebook; trade builder empty/filled and review; Management for Ryan Sidebottom; desktop ladder. Viewport reset and browser left on Matchday.

## Verified38 outcomes

Matchday full matchup now visible at1150x666. Incoming Bumrah swap shows both Naturalorder and ClearXI disabled; Cancel restores focus to g8select-1037 and keeps11 selected. Mobile result Scorebook and Nextmatch at y248.2,44px high; document width375 at390 viewport. Worm label height14px at321px chart width versus4.8 before. Scorebook390 has table widths315 matching wrapper widths315, no horizontal overflow, readable long dismissals; Close returns focus to resultScorecard. Guide close returns focus to Menu; at320 guide close44x44, guide paragraphs16px, dialog scrollWidth279 within296px dialog. One guide screenshot was unexpectedly320x185 while DOM viewport320x568; this is a capture discrepancy, not a verified game-scale defect.

## New observed issues

Home320 clips Global Champions inside its139px text track even though document has no horizontal overflow. Build39 permits word wrapping in that track without shrinking typography.

XI38 still fails the three-row roster target: firstXI rowy518.9; long halfwidth advice stretches ground/status to136px. Build39 combines title/confirmation in one header, keeps complete venue advice in a fullwidth bar, removes duplicate title instruction (row instruction remains), and removes obsolete SelectionTop rules and selectors plus stale direct-child heading overrides. Mobile/tablet header stacks through1000px. No advice or squad content removed.

Management390 breaks Management into Managemen/t: button105.8px, inner text85.8px, global anywhere wrapping. Build39 makes view names atomic, uses less horizontal button padding and three-column layout where it fits, and deliberate two-plus-one layout below375px.

Trade review390 has repeated heavy rounded panels and a large exchange gap. Build39 uses one exchange frame, quieter give/receive labels, left-aligned title and aligned consequence rows; existing exact terms, estimated values and sticky confirmation/edit controls remain. No trade logic or offers changed.

Ladder38 remains54px per row; final padding rule lost to the earlier tbody selector. Build39 raises selector specificity at the actual body cells, uses6px vertical cell padding, retains14px data text and explicit12px column headings. Complete-eight-row fit remains a new-browser check, not a claim.

## Checks and limits

20 scripts parse; only presentation script18 differs from38. Engine, management logic, controller, RNG, ratings and save format unchanged. CSS parser reports no errors. Existing dossier, pending-swap/cover and pressed-state regressions rerun. Candidate39 not rendered. Boundaries320/374/375/390,1000/1001, long venue advice and three-view short-screen reports need reinspection. Setup/recruitment/all8 clubcolours, fullfinals/offseason/archive and longcareer remain open browser coverage in the whole-game register.

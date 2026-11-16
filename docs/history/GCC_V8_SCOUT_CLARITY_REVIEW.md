# Draft and scouting presentation, 21 October 2026

Artifact SHA256: 20106af30b6002b05f3e05ce7a1ac7f4ecc7eee363e0001c8eaef23a5952c3c3.

## Changes
- Header branding sizes to its contents; club abbreviations receive enough internal space.
- Cricket icon has a straight bat toe, shared by header and cricket actions.
- Draft wording uses Draft order, On the clock, Squad complete and Awaiting draw in place of conversational filler.
- Scouting no longer nests Detailed skills inside another Scouting report disclosure. Technique, strokeplay/running, bowling and mental attributes use panels based on the accepted comparison presentation. Bowl control becomes Bowling accuracy; Bat control becomes Shot control. Bowlers see Bowling skills first; non-bowling players omit that category. Existing numerical values are unchanged.
- Innings-phase scouting uses matching grouped panels, with bowling phases only for players who bowl.
- Draft sidebar shows the latest signing with role and two relevant ability readings; full selected roster remains available.
- Projected and selected XI ratings use white text on a dark rating tile, fixing pale text inherited onto a lime background.
- Related narrow/enlarged-text defects in scout role headings, temperament labels, draft-order badges, long club names and sealed tickets were reproduced and repaired.

## Evidence and limits
qa/scout-clarity/browser.json: 84 rendering cases, seven states across four widths (320,390,760,1280) and three root text sizes (16,24,32). Includes all four player roles, draft, projected XI and partial draw. Presentation fixtures use a completed-2008 save, not an unfamiliar player's decisions. External photos blocked. No measured page overflow, tested text escape or solid-background contrast failures. Opaque-background scans do not certify gradients/photos.
qa/scout-clarity/offseason-browser.json: 84 later-season rendering cases from genuine completed-2008 fixture opening 2009 annual screens.
qa/scout-clarity/focused.json: ten existing gameplay suites pass with exact artifact unchanged.
qa/v8_scout_hierarchy_test.mjs: prior build fails the terminology/hierarchy regression; new build passes role-specific bowling inclusion and unchanged cricket state.
Only executable script blocks 12,17,19 differ from the preceding save-visibility build. Ratings/model, CPU draft logic, comparison implementation and persistence engine remain unchanged. No human comprehension or enjoyment claim follows from these checks.

qa/scout-clarity/native/report.json: informed native browser run from fresh career through first two league matches and reload, 79 clicks. Uses visible controls; this is engineering verification, not independent novice evidence.

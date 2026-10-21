# Match, XI and career presentation checkpoint

21 October 2026. Artifact SHA256 1b6376ea5d1358d12daea4932b7f9ec79d41fa1fb1220fd8cddf50c30bfedb3d.

## Implemented
- Ball playback puts the fixture scores, batting side, live score, chase equation, batters and bowler before playback controls in DOM/reading order. Controls sit within the score panel. Club names use normal case and a restrained size; score remains the largest figure.
- Empty delivery trails reserve no space. Commentary uses its content height. Boundary markers have dark ink on lime; enlarged delivery markers reflow into fewer columns. Full scores, long club names and commentary fit narrow/enlarged layouts.
- XI progress, rating and Lodge/Return action share one command panel. It stays available while scrolling the list except on short viewports. Batting order remains a separate green section and squad/bench a blue section. Full-XI bench guidance says Swap rather than Select. Existing manual selection and lodge validation remain unchanged.
- Archive and final-career views share career-record metrics. The archive separates aggregate totals from individual season cards, which reflow vertically on narrow screens. Career ending retains the accepted club/venue composition and real record values.
- Finals fixture club names, badges, headings and ground descriptions now fit enlarged narrow layouts consistently with league views. Existing scores, qualification and progression actions are unchanged.

## Verification
qa/v8_match_career_hierarchy_test.mjs fails the previous build, passes this build and checks score/batters precede controls, XI command area, career summary and unchanged cricket state. Result-context and save-warning regressions also pass.

qa/match-career/browser.json: 156 layout cases (13 states × 4 widths × 3 root text sizes). States are full/empty XI; opening/middle/chase/closing match checkpoints; ready semi-finals, Grand Final ready and finals complete; season review; archive; long archive; career ending. Photos blocked. No measured page overflow, inspected text escape or solid-background contrast failures. Actual image/gradient appearance is not certified by the contrast scan.

The match and season data come from a genuine completed-2008 save. Finals stage switches are presentation fixtures. Long archive repeats a real season into nineteen rows and sets 2026 for ending-layout inspection; it does not establish a newly played nineteen-season career or historically correct nineteen-season totals.

qa/match-career/native/report.json: separate native fresh career through all fifteen draft picks, manual XI, two managed league matches and cold reload, 79 clicks, no browser script errors. This is informed engineering verification, not independent novice evidence.

qa/match-career/focused.json: ten existing gameplay suites pass with the exact artifact unchanged. qa/match-career/offseason-browser.json: 84 annual-screen layout cases pass. Total final rendering scope: 240 combinations, not 240 unique player journeys.

Only executable blocks 15 (match_story) and 17 (screens) differ from the preceding entry-clarity build. Delivery/model/CPU/persistence calculations remain unchanged. Source builder now includes match_story.js, restored from the current branch before editing.

## Still open

This pass addresses the requested layouts but does not establish product completion or sustained enjoyment. Independent player understanding and return play remain open. Real venue delivery, supported-platform/accessibility testing, empirical model calibration, remaining player provenance and clean release rehearsal remain on the product-completion contract. Legacy phase-only playback is not newly certified by the ball-playback screenshots. Further aesthetic refinement should be assessed through actual play rather than declared complete from test counts.

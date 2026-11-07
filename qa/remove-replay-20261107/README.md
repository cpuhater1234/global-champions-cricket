# Remove completed-match replay

Tom explicitly requested: remove the replay function for completed games; use the scorecard to review them.

Delete the Replay match button from screens.js and its result-only watchMatch action binding from controller.js. Normal first-time match presentation still enters through watchNext/playMatch and startPlayback; scorecard access remains through resultScorecard. No change to styles, images, match data or simulation.

Verification: v100 is exactly v99 minus those two fragments, 106 bytes total. All 20 scripts pass syntax checks; only scripts 17 and 19 change. All CSS and embedded asset bytes are identical. The first-view and scorebook bindings remain present. Native v100 result-screen verification is pending download. No fresh full-project build ran in the partial checkout; the canonical expected hash is updated.

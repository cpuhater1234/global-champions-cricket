# Entry pacing and stable draft checkpoint

21 October 2026. Artifact SHA256 fbb56696056606156f336d56587e37df4fcea2c06158fa49c402f4321376eebf.

Implemented the first player-facing review priorities:
- Short premise and three numbered career steps replace the four-paragraph opening. The extended breakaway story is optional, after the main action.
- Narrow-screen club choice uses compact coloured entries with badge, club, ground, trait and accessible named guide action. Desktop franchise cards remain. Guide opens before takeover; no club is committed merely by inspecting it.
- Draft success is announced to assistive technology without inserting a visible feedback block above the board. The latest-signing panel provides the visible acknowledgement. Empty selected-player disclosure is omitted before a first pick.
- Result HUD uses the viewed result's round; next-fixture panel explicitly identifies the upcoming round.
- Signing and selected squad wording are shorter and use cricket language. “The model’s over-by-over bowling allocation” becomes “Bowling spells, over by over.”
- Long club-guide headings and enlarged Boundaries labels now wrap within their available space.

Evidence:
- qa/v8_result_context_test.mjs failed before the fix and passes after it; rendering a viewed result does not change career state.
- qa/entry-clarity/browser.json: 60 width/text cases over intro, chooser, club guide, draft empty and first pick. No measured page overflow, text escape or solid-background contrast issues. The heading y-coordinate is identical before and after successful drafting. CPU timer paused during repeated geometry sampling; this is not an independent novice test. External photos blocked.
- qa/entry-clarity/native/report.json: separate unpaused native fresh career through all fifteen picks, manual XI, two matches and cold reload, 79 clicks, no browser script errors.
- qa/entry-clarity/focused.json: ten existing gameplay suites pass exact artifact unchanged.
- qa/entry-clarity/offseason-browser.json: 84 later annual-screen rendering cases pass the same artifact.

The larger player-facing audit remains open. Playback score/controls hierarchy, XI task composition, matchday duplication, trade density, wider screen-specific identity, finals/archive/ending visual replay, actual photo delivery and independent comprehension/enjoyment are not completed by this checkpoint. This is progress toward completion, not a release-ready declaration.

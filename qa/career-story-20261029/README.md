# v100 — first connected career story and compact matchday

The active game remains on work/v8-game-first-rebuild. Historical v7.0.14 is untouched.

This is the first complete selection-pressure arc, not the whole proposed relationship/promise system. Three low dismissed innings can surface a healthy, similar-position bench alternative. The game remembers the XI actually chosen, follows actual batting evidence for three fixtures and carries the same pairing through matchday, XI review, pre-match playback and results. Not-outs and DNB are excluded from failure detection. A managed injury is not called a fit alternative. No player quotes, emotions or performance penalties are fabricated.

The version-1 story journal lives in the existing saved dynasty snapshot. It uses the stable weather/world seed and club identity (the match RNG seed changes), deterministic event IDs, an 80-event bound and nested-data validation. Old saves need no new fields. Rendering and replay do not create events. Candidate pairing is derived from the last completed XI so editing the current XI does not lose the decision. Selecting both reports both innings. Events from other seasons/archived result objects do not leak into the current result.

Matchday now has opaque club-colour blocks, black frames, a bounded ground photograph and compact conditions/actions. The 390px fixture panel is 392px high versus the prior 647px; Watch match stays on one line. This is a compact fixture hub and one relevant selection story rather than another mandatory management menu.

## Evidence
- unit.cjs: detection and no-false-failure cases, factual outcomes, both-player evidence, deduplication, malformed nested arcs, identity isolation, managed injury exclusion and history bounds. Initial missing engine and review findings were reproduced before fixes.
- browser.cjs: real simulated low-score run and real challenger swap; fact-based aftermath; save/reload; no replay events; complete three-fixture arc; malformed active journal; 12 fixture layouts at 320/390/768/1440px with root text 16/24/32px. No page errors.
- Existing visual scanner: 84 screen/viewport cases, no browser errors. This run preceded the final journal-only identity/validation fixes; the final focused browser suite was rerun afterwards.
- Build: all 20 inline scripts syntax checked. Only presentation scripts 16,17,19 change; the other 17, including simulation and save engine, remain byte-identical to the v99 patch.
- Independent review found disappearing pairing after XI edits, incomplete nested validation and misleading both-player aftermath. Each is fixed with regression evidence. The three-fixture test also caught the need for stable world identity across RNG changes.

Rebuild: python qa/career-story-20261029/build.py. It uses a materialized pinned input when present, otherwise git show c2abe7840a6fbad8aec6f4141f02e69318e24eb9:game/gcc_v8_product_candidate.html. Expected input SHA256: 8b7e386590c49f3bd64eb15b13a20a4f5d14f5505a2354e56725233cc1eb2b84. Run node unit.cjs and browser.cjs (NODE_PATH may need the runtime node modules). Native Chromium 153 was used; other browser engines have not been revalidated for this release.

## Next slices
Recovery/return and temporary-cover stories, role expectations and trust, transfer callbacks, campaign turning points, then broader authored commentary variation. Promises, dissatisfaction effects and new morale-based performance modifiers are not implemented in v100.

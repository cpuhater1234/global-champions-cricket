# Analysis tiles and XI coverage · 25 October 2026

Analysis keeps all 12 existing profile values, centred overall and status, grouped into compact solid tiles. Selected XI shows five guide counts: recognised keeper (1), natural openers (2), bowling options (5), new-ball options (2), death options (2). Opening pair is guidance; the existing model's opening gap activates at zero. Bowling eligibility and phase thresholds match ratings.js; effective fitness is applied and OUT players excluded. No added performance penalties, state schema or numerical rating changes. Removed XI bowling-cover/overs readout at user request.

Run build.py then browser.cjs with GCC8_ENGINE chromium/firefox/webkit. Chromium path /tmp/accessibility-chromium. Reports record exact HTML hash. Each engine checks 18 draft-analysis viewport/text states, three selected-XI viewport states, empty XI missing counts, state preservation and page errors. Screenshot inspection is internal, not a physical-device test.

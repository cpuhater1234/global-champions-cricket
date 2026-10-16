# Causal ball-by-ball and player-facing clarity pass

Source parent: `c94dbd15ec178ffac45e08de45da1ac81cc6b0b5`, branch `work/v8-game-first-rebuild`.

## User-directed presentation changes

Signing-speed feedback hugs its text, is centred, stays for one second, then fades for250ms. Repeat clicks restart the timer. Persistent validation/save messages do not inherit that timeout. The brief toast does not move the signing page.

Draft-order tiles show the order number, club mark/name and a marker for the user's club. Repeated round-position, pick-number and confirmation copy is removed, along with obsolete minimum tile heights. Dressing-room names and ratings occupy separate columns. Squad-preview numbers use an explicit heavy Arial face without shadows or filters.

The team room puts the XI and bench beside one another on desktop. Selected players are not duplicated in the bench; removing or swapping a player updates the lists. Clicking an XI name opens Scout, including injury cover when eligible. Role-fit and ordering controls remain. Analysis/development are in a separate expandable section. Mobile layouts can still require scrolling to retain readable text and controls.

Squad analysis now presents labelled batting/bowling strength bars and ratings. Explanations and leading players expand inline, rather than requiring twelve separate rating popups. Keeping, fielding, balance and named cricket-role groups remain available. Ground conditions have labelled gauges with neutral/balanced reference points. Pre-match comparisons show both teams' abilities, with explicit edge labels and home first. Fixture/prepare/final previews also put home first.

Venue requests use960px thumbnails, memoised low-priority prewarming and high priority for the displayed photo. The pitch frame is visible while a photo loads. Load/error state survives subsequent UI patches, so a failed photo stays hidden instead of reappearing as a broken image. Dimensions are reserved. External photo latency was not measured successfully; a direct diagnostic request timed out in this environment. The game does not wait for a photograph to simulate or show scores. Source/licence metadata remains in the standalone build.

## New match model

The previous simulator generated phase totals and allocated a scorecard afterward. New matches now generate a causal delivery ledger. The existing squad/role/condition/weather/captaincy model supplies a scoring baseline; individual batter/bowler quality, batting role, chase pressure and current wickets shape each delivery. Scorecards, batting runs/boundaries, bowling figures, extras, wickets and innings endpoints all derive from that ledger.

The user explicitly selected the split-powerplay option: four opening overs, then a two-over surge available from over eleven. GCC adopts this as its alternate-history league rule for new matches throughout2008–2026. It is based on the structure described by Cricket Australia, not a claim that the rule existed in real2008 cricket: https://www.cricket.com.au/news/3305336/power-surges-bash-boosts-new-bbl-rules-revealed . Captains automatically choose timing for both sides using set batters, wickets, required rate and overs remaining; the latest full two-over start is over19. The restrictions affect scoring probabilities. No manual field-placement or mid-innings user tactical commands were added.

The ledger handles strike changes, legal/illegal balls, wides, no-balls/free hits, byes, leg-byes, dismissals, four-over bowling limits and nonconsecutive bowling overs. Chases end on the actual winning delivery; a winning no-ball penalty does not invent subsequent bat runs. A bowler who concedes the winning illegal delivery before bowling a legal ball has no economy rate. Injury-adjusted skills are captured once inside the existing fitness wrapper; testing caught and removed an initial double adjustment.

New phase statistics combine the opening powerplay and surge as field-restriction overs. Their actual legal-ball counts are stored separately from middle/death phases, so a late surge or early chase does not imply a fixed phase duration. Legacy scorebooks retain their original six-over powerplay interpretation.

## Playback and saves

A match resolves once when Play is selected, then its generated deliveries are replayed. Playback shows live scores, current batters, the bowler, recent balls and actual milestones: opening-powerplay end, surge start/end, over summaries, fifties, hundreds and innings completion. Super Over deliveries also play individually. Controls provide pause/resume,1×/2×/4×/8× and skip to the result. Viewing pace does not consume the cricket RNG or alter an outcome.

Save/resume stores the precise playback position, reference, pace and running state as presentation version3. Strict restoration validates causal delivery totals, strike continuity, legal balls, bowler limits, field-restriction phases, card figures and bounded frame positions before restoring. Earlier saves/results remain supported; matches without a delivery log continue to use their existing factual phase highlights. No retrospective ball sequence is invented for old results.

## Evidence and limits

Exact artifact digests, suite outcomes and season evidence are recorded in `qa/v8_ball_by_ball_scope.json`. Raw VM fixtures stay local; focused tests and compact results are checkpointed. A500-innings seeded matrix and separate target-one cases exercise conservation, boundaries, legal endpoints, surge use and illegal winning balls. Its scoring envelope is a plausibility check, not empirical calibration against historical match data.

No native browser rendering was performed under the existing access restriction. Pixel alignment, font rasterisation, native focus/scroll, image latency and animation smoothness remain unverified. Generated markup and CSS contracts are not visual certification. The existing371 uncertified legacy identities and rating/career-model limitations remain; this pass does not certify every player's historical data or human enjoyment.

Build: `python3 v8/build.py --freeze --output game/global_champions_cricket_v8_arcade_matchday.html`. Domain changes live in `v8/domain/delivery_engine.js` and `delivery_adapter.py`. Never edit generated `v8/engine` files directly.

## Final verification provenance

All 26 focused suites ran on the final standalone SHA256 `f62a266936bd4090a3fee36f7ab79fa117474ad950c905ec5dfb8fabe997ccb7`. A separate freeze rebuild produced the same digest. The 2008–2009 interaction run and the initial host of its resumed career began on `28a827bcd18582e8b3310ee6c97c8093b8dad9dc3c4915e7f2a64f38264438e4`; later cold loads use the final file. Reconstructing that initial host confirmed that only script15 differs: the final version stops showing an active-striker star after the second Super Over wicket. Every engine, codec, save/controller and other UI script is byte-identical. This is not a claim that every long-run host used the final presentation script.

An earlier diagnostic career failed on a legitimate zero-legal-ball economy edge. The causal bowler record now uses null economy in that case, displayed as a dash. Failed/superseded runs are excluded from the final successful career totals. An obsolete no-numeric-feedback assertion was also replaced with the user's approved rating-plus-visual-read contract.

Final career verification:2008–2026 completed as2 fresh seasons plus17 resumed seasons,266 regular user matches total. Initial run1778 checks; resume13140 checks. Zero quota failures under5,242,880 UTF-16 bytes; peak attempted save2315940 bytes. Final career reaches the legacy ending and cold-loads it. Failed/superseded diagnostic runs excluded.

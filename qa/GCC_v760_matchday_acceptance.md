# GCC v7.6.0 Matchday & Season Immersion Acceptance

## Status

**Accepted and frozen.**

Accepted candidate:

`global_champions_cricket_v7_6_0_matchday_immersion.html`

SHA-256:

`3a8b8bb9b9d67558ea19bda4b595b0ab083209f3ccb0607d209aaad04155b55f`

Frozen parent v7.5 SHA-256:

`abe0c99338990b5a33f23a62e759b853e9118c2e3a97331c91e37ae23fc571c6`

## Product result

v7.6 closes the largest remaining presentation gap in the regular-season loop without adding another management mechanic or altering the cricket engine.

The manual match path is now:

`MATCHDAY -> pre-match programme -> PLAY MATCH -> existing result`

The preview makes the fixture feel like an occasion before the score exists. It uses the cricket world GCC already knows:

- fixture and round;
- home / away status;
- venue and ground character;
- deterministic accepted weather;
- live ladder position and W/L;
- selected XI;
- opponent XI;
- players worth watching from real form / cricket ratings;
- existing injury / availability state.

`RUN SEASON` remains the fast path and bypasses Matchday entirely.

## Why Phase 2 was not added

The accepted candidate was inspected at Rounds 1, 4, 11 and 14.

The programme changes naturally because opponent, venue, conditions, table state and player form change. Round 1 frames the season opening, early rounds use real records and positions, the run home uses remaining matches, and Round 14 explicitly closes the regular season.

A second season-narrative layer would now duplicate information already handled well by the Season Hub, Matchday programme and Season Review. It was therefore rejected as unnecessary scope.

## Determinism proof

Seed 101 was built twice from the same foundation world and XI.

Path A:

`GCC.playNextRound()`

Path B:

`open Matchday -> close -> reopen -> close -> reopen -> PLAY MATCH`

The complete Round 1 output was identical for:

- final RNG seed;
- winner;
- both innings;
- full scorecard data;
- every post-match player form value.

Opening and closing Matchday left the pre-match state fingerprint unchanged.

The Matchday preview therefore does not influence the cricket it introduces.

## Protected cricket engine

`qa/check_v760.py` pins both the frozen v7.5 parent and accepted v7.6 SHA.

The following accepted systems remain byte-identical to v7.5:

- match simulation;
- innings model;
- phase scoring;
- bowling plan;
- two-sided form movement;
- `playNextRound()`;
- `simulateSeason()`;
- deterministic match weather;
- effective match ground;
- regular-season completion;
- save / serialisation / migration / resume;
- season archive;
- career progression;
- retirements / arrivals;
- trades;
- injuries / replacements;
- CPU and user Draft logic;
- season-performance value.

The preview itself is statically rejected if it directly simulates a match, advances the round, writes a result, updates form or calls the primary mutable RNG.

## Result and scorecard regression

The same deterministic Round 1 was rendered in frozen v7.5 and accepted v7.6.

Verified:

- post-match Matchday result-card text is identical;
- full scorecard text is identical;
- underlying result data is identical.

The accepted scorecard remains the authoritative match record. v7.6 adds context before it rather than redesigning it.

## Fast-path regression

A fresh v7.6 season was run using the existing `RUN SEASON` path.

Verified:

- all 14 rounds completed;
- 14 results were recorded;
- continuous season simulation stopped normally;
- no Matchday preview was injected into the fast path.

## Finals regression

After the regular season, the existing dedicated Finals flow opened normally with:

`Four clubs remain.`

No Matchday preview intercepted or replaced the Finals screen.

Regular-season Matchday therefore remains separate from the accepted Finals ceremony.

## Dynasty injury integration

The real 2008 season, Finals, offseason, annual Draft and Final 15 path was completed into 2009.

A player in the selected 2009 XI was then marked `OUT` through the existing dynasty injury state.

Calling Matchday correctly:

- refused to open the programme;
- returned the player to Team Room;
- gave a player-specific instruction to name a replacement.

After replacing that player with a real bench option, Matchday opened normally with a valid XI and batting order.

v7.6 therefore does not bypass dynasty availability rules.

## Responsive acceptance

Desktop:

- no horizontal overflow;
- programme reads as a cricket match sheet / programme rather than an analytics dashboard.

Mobile at 390 x 844:

- no page-level horizontal overflow;
- sections collapse vertically;
- the modal scrolls vertically where required.

## Engineering status

Accepted checks:

- exact v7.5 parent SHA;
- exact v7.6 candidate SHA;
- nine script blocks syntax-clean;
- zero duplicate static DOM IDs;
- protected simulation / dynasty functions byte-identical;
- preview read-only guard;
- manual Matchday button wired to preview;
- `RUN SEASON` button remains wired directly to accepted fast path.

Structured evidence is recorded in:

`qa/GCC_v760_acceptance_evidence.json`

## CI infrastructure note

The hosted GitHub Actions runner remains unavailable in this repository and jobs are still failing before checkout when a runner is requested. Acceptance is therefore based on the exact deterministic local rebuild plus Chromium QA against the pinned SHA above, consistent with the v7.5 acceptance process.

## Freeze rule

Do not modify the accepted v7.6 build during later phases.

Future work must start from the v7.6 SHA above. Do not reopen match balance, v7.5 history/legacy or the accepted regular-season result/scorecard flow without new evidence.

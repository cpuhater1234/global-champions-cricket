# GCC v7.6 Phase 1 Matchday Candidate Checkpoint

## Status

Phase 1 candidate is implemented and validated locally. It is **not yet the frozen v7.6 release**.

Parent v7.5.0 SHA-256:

`abe0c99338990b5a33f23a62e759b853e9118c2e3a97331c91e37ae23fc571c6`

Current v7.6 Phase 1 candidate SHA-256:

`3a8b8bb9b9d67558ea19bda4b595b0ab083209f3ccb0607d209aaad04155b55f`

## Product change

Manual regular-season matches now enter one read-only Matchday programme before the accepted match engine runs.

Flow:

`MATCHDAY · ROUND N -> pre-match programme -> PLAY MATCH -> existing Season Hub / scorecard`

The programme surfaces only existing truth:

- home / away and venue;
- ground character;
- deterministic weather used by the accepted engine;
- current ladder position and W/L;
- selected XI status;
- one player to watch from each side, derived from form and cricket role;
- season stakes derived from the current round and table.

`RUN SEASON` remains the fast path and bypasses Matchday entirely.

## QA evidence

### Determinism

A/B test with the same deterministic 2008 world, XI and seed:

- Path A played Round 1 directly.
- Path B opened, closed and reopened Matchday before playing.
- Winner, innings, scorecard and player-form changes were byte-for-byte equivalent in the QA result object.

### Read-only preview

Opening Matchday repeatedly leaves unchanged:

- round;
- results count;
- selected XI;
- batting order;
- table;
- player form;
- primary seed.

The preview uses the existing deterministic `matchWeather()` path and does not call the match RNG or simulation.

### Season-depth checks

Validated at:

- Round 1: season-opening context;
- Round 4: early table context;
- Round 7: Finals-line context;
- Round 11: run-home context;
- Round 14: final regular-season match context.

The Round 14 copy does not claim a match remains after the current fixture.

### Mobile

At 390 x 844:

- no horizontal page overflow;
- Matchday card scrolls vertically;
- `PLAY MATCH` remains available through a sticky action bar;
- no two-dimensional scrolling.

### Fast path

`RUN SEASON` was instrumented and advanced the season without invoking `openMatchdayPreview()`.

### Whole-product regression

The candidate completed the existing 23-state product audit from a fresh 2008 dynasty through 2009 Round 1:

- club choice;
- Signing Week;
- foundation Draft;
- Team Room;
- season views;
- scorecard;
- Finals;
- Season Review;
- offseason;
- annual Draft;
- Final 15;
- 2009 Team Room;
- 2009 Round 1.

Result:

- page errors: 0;
- runtime errors: 0.

Direct-document Chromium still emits the known localStorage security warnings from the QA environment. Those are not GCC runtime errors.

## Protected systems

`qa/check_v760.py` requires the accepted v7.5 implementations of the following to remain unchanged:

- match simulation and innings;
- phase scoring and bowling plans;
- form movement;
- `playNextRound()`;
- `simulateSeason()`;
- match weather / effective ground;
- Finals completion;
- dynasty save / resume;
- season archive;
- career progression;
- retirements / arrivals;
- trades;
- injuries / replacements;
- CPU and user annual Draft logic;
- season-performance value.

## Product judgement

Phase 1 solves the specific gap identified by the v7.5 product audit without weakening the fast path or duplicating the scorecard.

The screen changes meaningfully through the year because opponent, venue, weather, table position, W/L, form and players to watch all change.

Before freezing v7.6, the next decision is whether the season loop needs any **small between-round narrative sharpening** beyond this Matchday layer. Do not automatically add Phase 2 scope.

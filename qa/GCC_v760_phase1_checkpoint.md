# GCC v7.6 Matchday & Season Immersion — Phase 1 Checkpoint

## Status

**Guarded candidate, not yet frozen.**

Branch: `work/v7.6-matchday-immersion`

Frozen parent v7.5 SHA-256:

`abe0c99338990b5a33f23a62e759b853e9118c2e3a97331c91e37ae23fc571c6`

Current Phase 1 candidate SHA-256:

`3a8b8bb9b9d67558ea19bda4b595b0ab083209f3ccb0607d209aaad04155b55f`

Candidate:

`global_champions_cricket_v7_6_0_matchday_immersion.html`

## Product change

The manual regular-season flow is now:

`MATCHDAY -> pre-match programme -> PLAY MATCH -> accepted result`

`RUN SEASON` remains the fast path and bypasses the preview.

The Matchday programme is read-only and uses only existing game state:

- round and fixture;
- home / away status;
- venue and accepted ground character;
- deterministic accepted weather read;
- real ladder position and W/L once the season is underway;
- selected user XI and existing CPU XI;
- players to watch derived from current form and cricket ratings;
- genuine XI availability / injury gates.

No odds, morale, rivalry meter, prediction model or new tactical mechanic has been invented.

## Protected parent systems

`qa/check_v760.py` requires the accepted v7.5 implementations of the following to remain byte-identical:

- match simulation and innings model;
- bowling / phase scoring;
- form movement;
- `playNextRound()`;
- `simulateSeason()`;
- weather / effective ground;
- regular-season completion;
- save / load / resume;
- season archive;
- career progression;
- retirements / arrivals;
- trades;
- injuries / replacements;
- CPU and user Draft logic;
- season-performance value.

The preview is additionally rejected if it directly calls match simulation, advances the round, writes results, updates form, or uses the primary mutable RNG.

## Determinism evidence

Seed 101 was built twice from the same exact foundation world and XI.

### Direct path

`GCC.playNextRound()`

### Preview path

`open preview -> close -> reopen -> close -> reopen -> PLAY MATCH`

Round 1 was identical between both paths for:

- final seed;
- winner;
- home and away innings;
- full scorecard;
- every player form value after the match.

The preview itself left the full pre-match state fingerprint unchanged.

## Season-context evidence

The candidate was inspected at four distinct points in the same season:

### Round 1

- season-opening framing;
- ground and weather context;
- no invented table position before a ball has been played.

### Round 4

- actual W/L records and ladder positions shown;
- venue / conditions changed with the fixture;
- players to watch changed with live form.

### Round 11

- genuine run-home framing;
- real positions;
- correct remaining-match count after the fixture.

### Round 14

- final-round heading: `The regular season closes.`;
- real positions shown;
- explicitly states the top four is decided after the match;
- preview remains read-only.

This reduces the risk that Matchday becomes the same generic modal fourteen times.

## 2009 injury-selection evidence

The real 2008 season / Finals / offseason / annual Draft path was completed into the 2009 season.

A selected 2009 XI player was then marked `OUT` through the existing dynasty injury state.

Calling Matchday correctly:

- did not open the preview;
- returned the player to Team Room;
- displayed a player-specific message to name a replacement.

After replacing the injured player with a real bench player:

- XI returned to 11;
- batting order remained valid;
- Matchday Round 1 opened normally;
- no horizontal overflow occurred.

This confirms v7.6 does not bypass the accepted dynasty availability gate.

## Visual acceptance so far

Desktop:

- reads as a cricket programme rather than an analytics dashboard;
- two-club hierarchy is immediate;
- conditions, stakes and players to watch have separate jobs;
- existing Season Hub remains visible behind the modal as context;
- result card and scorecard remain untouched.

Mobile:

- no page-level horizontal overflow;
- programme collapses to one column;
- card scrolls vertically when content exceeds the viewport.

## Remaining Phase 1 gate

Before freezing v7.6:

1. decide whether any additional season-narrative layer is genuinely needed after repeated manual Matchday use;
2. run a final regression pass over result card, scorecard, Finals and `RUN SEASON` after the preview is committed;
3. pin the final v7.6 SHA only after those checks pass.

Do not reopen match balance or add another management mechanic during this phase.

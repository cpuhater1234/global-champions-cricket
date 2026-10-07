# GCC v7.6 Matchday & Season Immersion Plan

## Objective

Make each GCC fixture feel like a cricket occasion without changing the cricket engine.

The accepted v7.5 dynasty has deep club-building, strong scorecards, a strong Season Review and a proper historical Archive. The remaining experiential gap is the instant transition from `PLAY NEXT ROUND` to a completed result.

v7.6 should add anticipation, context and stakes around the match that GCC already simulates.

## Frozen parent

Accepted v7.5.0 SHA-256:

`abe0c99338990b5a33f23a62e759b853e9118c2e3a97331c91e37ae23fc571c6`

Do not reopen:

- ratings or career curves;
- match simulation;
- scoring environment;
- form movement;
- Drafts;
- trades;
- injuries / replacements;
- XI legality or balance;
- save schema;
- Archive / Legacy;
- v7.3 visual identity.

No general balance pass is permitted without new evidence.

## Product principle

**The match should feel important before the score exists.**

Do not fake live ball-by-ball cricket and do not introduce tactical choices that the engine does not genuinely model.

Use truthful context the game already knows.

## Phase 1: Regular-season Matchday preview

Change the manual regular-season path from:

`PLAY NEXT ROUND -> result`

to:

`MATCHDAY -> pre-match read -> PLAY MATCH -> existing result`

The preview is read-only.

### Required information

Use existing state only:

- round;
- home / away;
- opponent;
- ground;
- ground character;
- deterministic weather already used by the match engine;
- current ladder position and W/L when available;
- user's selected XI;
- opponent XI already selected by GCC;
- one or two players worth watching, derived from current cricket attributes / form;
- any genuine XI availability warning already known to the game.

Do not invent odds, pundit predictions, rivalry scores, morale or hidden tactical modifiers.

### Presentation

The preview should feel like a match programme / team sheet, not a dashboard.

Preferred hierarchy:

1. Round and venue;
2. two clubs;
3. conditions;
4. stakes / table context;
5. players to watch;
6. selected XI confirmation;
7. `PLAY MATCH`.

Use the accepted cream / green / muted-gold GCC language.

### Fast path

`RUN SEASON` remains unchanged and bypasses Matchday preview.

A player who wants speed must not be forced through fourteen previews.

### Result path

`PLAY MATCH` must call the existing accepted round simulation exactly once.

Afterward:

- return to the existing Season Hub;
- retain the accepted Matchday result card;
- retain the accepted scorecard;
- retain the accepted Analysis / Players / Fixtures / Ladder views.

Do not redesign the post-match record in Phase 1.

## Determinism gate

Opening, closing or repeatedly opening Matchday preview must not alter the match result.

Required A/B test:

- same frozen parent save / seed / XI;
- path A: play round directly through accepted `playNextRound()`;
- path B: open Matchday preview, close it, reopen it, then play;
- scoreline, winner, scorecard and form changes must be identical.

The preview must not call the primary RNG or mutate state.

Weather is safe only through the existing deterministic weather helper.

## Phase 2 candidates

Only after Phase 1 is accepted:

- sharper between-round season stakes;
- defending-champion / elimination / Finals-line context derived from real standings and history;
- player hot-streak / slump presentation derived from real recent output;
- optional pre-Finals team sheet only if the existing Finals screen still needs it after playtesting.

These are not automatic scope. Phase 1 evidence decides whether they are needed.

## Explicit non-goals

Do not add:

- ball-by-ball interaction;
- batting aggression sliders;
- bowling plans;
- toss decisions unless the simulation genuinely models their consequences;
- morale;
- contracts;
- finances;
- training;
- extra chemistry systems;
- press conferences;
- manufactured commentary feeds.

## Acceptance

Reject Phase 1 if:

- match outcomes change because the preview was opened;
- preview information is invented or misleading;
- it adds more than one extra required click to a manually played fixture;
- it feels like a statistics dashboard;
- `RUN SEASON` becomes slower;
- mobile overflows horizontally;
- the existing result card or scorecard becomes weaker;
- Matchday becomes repetitive by Round 4.

Accept only if the user can look at a fixture before pressing play and feel they know **where it is, what the conditions are, who matters and what the match means**.

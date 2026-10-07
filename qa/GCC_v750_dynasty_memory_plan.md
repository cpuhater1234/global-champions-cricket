# GCC v7.5 Dynasty Memory & Legacy Plan

## Objective

Make a long GCC career feel like history happened.

v7.5 does **not** add another management mechanic. The simulation already records enough history to support a proper cricket almanac; the current Archive simply does not surface it.

The phase should turn existing saved history into player-facing memory.

## Frozen parent

- Parent branch: `work/v7.4.1-form-symmetry`
- Parent checkpoint head: `74a365b7d9e37f1b4fdc1095931ce53fff5a50da`
- Accepted parent game SHA-256: `34f3095daeceb732629e443499aa905a553d79aa3045c9d41d2d5e80b2b29643`

The following remain protected:

- ratings and career curves;
- arrivals / retirements;
- match simulation;
- form;
- Drafts;
- trades;
- injuries / replacements;
- XI logic;
- scoring environment;
- league-history continuity;
- v7.3 interaction architecture;
- v7.3 visual identity.

## Existing history model

The save already records:

### Season archive

Each completed season stores:

- year;
- champion;
- user finishing position;
- regular-season W/L/played;
- Finals / Grand Final / title flags;
- user roster;
- full league `playerSeasonStats`;
- user-club tenure stats.

### Manager history

The dynasty stores:

- titles;
- Grand Final appearances;
- Finals appearances;
- wins;
- losses;
- matches;
- best finish.

### Club history

`clubCareer` stores every club's:

- seasons;
- titles;
- Grand Final appearances;
- regular-season wins.

### Your club player history

`playerCareer` stores, for players while they represented the user club:

- seasons;
- matches;
- runs;
- wickets;
- titles;
- clubs.

### Full league player statistics

Every archived season includes league-wide player totals:

- matches;
- innings;
- runs;
- balls;
- outs;
- fours;
- sixes;
- wickets;
- bowling balls;
- runs conceded;
- best score;
- best bowling figures.

The data model is therefore sufficient for a much richer Archive without changing the simulation.

## Product principle

**An archive should answer questions a cricket fan naturally asks.**

Examples:

- Who has won the most titles?
- Who are the great players of this GCC world?
- Who owns the career run and wicket records?
- What was the best batting season?
- What was the best bowling season?
- Who were the leaders in 2017?
- Which players became legends of my club?
- What actually happened in each year of my tenure?

Do not turn the Archive into an analytics dashboard.

It should feel like a cricket almanac.

## Canonical Archive hierarchy

One page, no tab maze.

### 1. Tenure scoreboard

Keep the existing four-number manager summary:

- seasons;
- titles;
- Finals;
- win rate.

This remains the first read.

### 2. League honours

A compact eight-club honours table derived from `clubCareer`.

Show:

- club;
- titles;
- Grand Finals;
- regular-season wins.

Order:

1. titles;
2. Grand Finals;
3. wins.

This is the competition's historical hierarchy.

### 3. GCC record book

Derive league-wide career totals by aggregating archived `playerStats`.

Show concise leaders for:

- career runs;
- career wickets;
- career sixes;
- most matches.

Also show single-season records:

- most runs in a season;
- most wickets in a season;
- highest individual score;
- best bowling figures.

Do not invent player awards.

These are statistical records supported directly by the archive.

### 4. Your club legends

Use `playerCareer`, which intentionally represents performances while playing for the user's club.

Surface players by:

- seasons;
- titles;
- runs;
- wickets.

This section should communicate attachment, not simply sort four spreadsheets.

Preferred presentation:
- a short top-five legends list ranked with a transparent cricket-value formula;
- each row then shows seasons, titles, runs and wickets.

The ranking may combine those saved measures but must not manufacture hidden personality/legacy attributes.

### 5. Season timeline

Keep the year-by-year archive as the backbone.

Improve each row so it carries:
- year;
- user's outcome;
- W/L;
- champion;
- leading run-scorer;
- leading wicket-taker.

The row should remain concise.

### 6. Season detail

Selecting a season opens one focused detail view or modal.

Show:
- champion;
- user's finish and W/L;
- season leading run-scorer;
- season leading wicket-taker;
- performance leader using the already-existing `reviewSeasonValue()`;
- top 5 runs;
- top 5 wickets.

Do not show historical club beside a league player unless the archived record explicitly stores that club.

Current history does not store each player's club for each archived season, so avoid inventing that association.

## Derived helpers

Prefer pure read-only helpers over new state.

Likely helpers:

- `archiveCareerAggregate()`
- `archiveSeasonLeaders(record)`
- `archiveClubHonours()`
- `archiveUserLegends()`
- `openArchiveSeason(year)`

They should derive from saved archive data and never mutate dynasty history.

## End-of-career Legacy screen

The existing 2026 Legacy ceremony is already strong and should remain ceremonial.

Enhance it surgically with the same Archive helpers.

Potential additions:
- all-time GCC leading run-scorer;
- all-time GCC leading wicket-taker;
- most successful club in this world;
- strongest user-club legend.

Do not turn the final screen into the entire Archive.

The button to `VIEW ARCHIVE` remains the route to deeper history.

## Historical-data limits

### No retroactive club labels on league player records

Archived `playerStats` are keyed by player ID but do not store the player's club for that specific season.

A player may have moved later.

Therefore:
- player name + season stats are safe;
- current club is not safe as a historical label;
- do not infer historical team from present ownership.

### User-club careers are intentionally partial

`playerCareer` counts a player's GCC production while associated with the user's club.

Label this accordingly.

Do not present it as their complete league career.

## Visual direction

Use the accepted v7.3.3 visual language.

The Archive should feel like:
- scorebook;
- almanac;
- honours board.

Not:
- SaaS analytics;
- dashboard cards;
- trophy graphics everywhere;
- tab-heavy admin UI.

Prefer:
- tables / ranked lines;
- restrained rules;
- large year numerals;
- serif record names;
- meaningful gold only for champions / records.

One element owns each job.

## Mobile

Archive must remain useful on mobile.

Requirements:
- no horizontal page overflow;
- honours table may compress into ranked rows;
- record book becomes one-column;
- season row remains readable without hiding champion or leaders;
- season-detail modal scrolls vertically rather than becoming two-dimensional.

## Product acceptance

Reject if:

- new history data is invented rather than derived;
- historical club attribution is guessed;
- archive becomes a dense statistics dashboard;
- more than one navigation layer is needed to find basic records;
- Legacy screen becomes a data dump;
- archive writes to or changes simulation state;
- opening Archive changes future results;
- mobile requires horizontal scrolling.

## Engineering gate

v7.5 must prove:

- deterministic rebuild from exact v7.4.1 SHA;
- all simulation / balance functions byte-identical;
- save schema unchanged unless a genuinely required history field is added;
- opening / closing Archive is read-only;
- all 2008-2026 history records still load;
- missing/older archive records fail gracefully;
- no runtime/page/console errors;
- no duplicate DOM IDs;
- no page-level horizontal overflow.

## Required evidence

Use a real completed 19-season dynasty.

Desktop:
- Archive top / tenure scoreboard;
- league honours;
- record book;
- your club legends;
- season timeline;
- season detail for an early season;
- season detail for a late season;
- final Legacy screen.

Mobile:
- Archive top;
- record book;
- season row/detail;
- final Legacy screen.

## Acceptance question

**After nineteen seasons, can the player look back and recognise the cricket world they created?**

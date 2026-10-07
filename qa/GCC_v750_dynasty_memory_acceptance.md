# GCC v7.5.0 Dynasty Memory & Legacy Acceptance

## Status

**Accepted and frozen.**

Accepted candidate:

`global_champions_cricket_v7_5_0_dynasty_memory.html`

SHA-256:

`abe0c99338990b5a33f23a62e759b853e9118c2e3a97331c91e37ae23fc571c6`

Protected parent v7.4.1 SHA-256:

`34f3095daeceb732629e443499aa905a553d79aa3045c9d41d2d5e80b2b29643`

## Product result

v7.5 turns the history already stored by GCC into a cricket almanac without adding another management mechanic.

Accepted Archive hierarchy:

1. tenure scoreboard;
2. league honours;
3. GCC record book;
4. your club legends;
5. season-by-season history;
6. one focused Season Book modal.

The 2026 Legacy screen remains ceremonial and surfaces only the four strongest world-level historical reads before routing the player into the Archive.

## Final presentation decisions

The accepted presentation keeps the v7.3 visual language and removes unnecessary game-system language.

Final polish includes:

- no redundant `SEASON / TOP FOUR / TITLE` tail on year rows;
- Club Legends ranking is explained in cricket language rather than exposing raw weighting arithmetic;
- the Legacy introduction reads as part of the GCC record book rather than a generic results summary;
- no guessed historical club attribution beside league player records.

## Exact-baseline protection

The build is deterministic from the accepted v7.4.1 bytes.

`qa/check_v750.py` pins both the protected parent SHA and accepted v7.5 SHA.

The following remain byte-identical to v7.4.1:

- save / serialisation / resume path;
- season archiving;
- career progression;
- retirements and arrivals;
- trade value;
- injury processing;
- CPU and user Draft logic;
- match simulation;
- Finals resolution;
- two-sided form;
- existing season-performance value logic.

The Archive layer derives from existing history only and does not write to historical state.

## 19-season acceptance evidence

A real dynasty was carried through the complete 2008-2026 horizon using seed 101.

The final accepted build loaded the real accumulated dynasty history, completed the closing seasons through 2026, rendered the career-end Legacy screen and audited the complete 19-season Archive.

Verified:

- 19 archived seasons, 2008 through 2026;
- all seasons have resolved champions;
- 19 Season-by-Season rows;
- eight-club League Honours table;
- eight GCC Record Book categories;
- top-five user-club Legends;
- early-season Season Book opens correctly;
- late-season Season Book opens correctly;
- Record Book values reconcile directly with archived league player statistics;
- League Honours reconcile directly with `clubCareer`;
- Club Legends reconcile directly with `playerCareer`;
- every Season-by-Season row reconciles with its archived season;
- opening Archive does not mutate history, manager, club-career or player-career state.

## Mobile acceptance

At 390 x 844:

- page horizontal overflow: none;
- all 19 season rows remain readable;
- Record Book collapses to one column;
- Season Book remains vertical;
- modal client height: 758 px;
- modal content height: 980 px;
- modal overflow: `auto`.

The detail view therefore scrolls vertically rather than becoming two-dimensional.

## Final integrity

At the end of the accepted career:

- 120 contracted players;
- 120 unique contracted players;
- eight clubs with 15 players each;
- no retired player remained rostered;
- zero runtime errors;
- zero console errors;
- nine script blocks syntax-clean;
- zero duplicate static DOM IDs.

Structured evidence is recorded in:

`qa/GCC_v750_acceptance_evidence.json`

## Freeze rule

Do not modify the accepted v7.5 build while working on later phases.

Any future change must start from the accepted v7.5 SHA above and must not reopen v7.4.1 simulation or balance without new evidence.

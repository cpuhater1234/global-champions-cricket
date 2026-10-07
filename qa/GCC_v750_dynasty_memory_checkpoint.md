# GCC v7.5 Dynasty Memory & Legacy Checkpoint

## Status

**Accepted.**

v7.5 Dynasty Memory & Legacy is accepted on `work/v7.5-dynasty-depth`.

Accepted v7.5 SHA-256:

`bc3bbb7465ff660fe0028dab19b74f32afcffa494351b03cd2b197830dfae16a`

The game remains deterministically rebuilt rather than storing a second generated source-of-truth HTML.

## Protected parent

Accepted v7.4.1 SHA-256:

`34f3095daeceb732629e443499aa905a553d79aa3045c9d41d2d5e80b2b29643`

The local reconstruction reproduced every recorded checkpoint from the available exact v7.2.15 predecessor through v7.4.1:

- v7.2.15: `22dbb185e1c274a60449223b0e3e362470e36be39b9d90e95fc76caec73df78a`
- v7.2.16: `dbf8dc746207c970c11ab650cf13cbca0adae87b641dc63c159f02db0090af2b`
- v7.3.0: `a9ecb8e4596fc7d751e6abcd840d74529e6b49b0c5ed78b8770badd3db4e191c`
- v7.3.1: `ef7c04895020da2922af5e12ad830c602f453233b72ec942f92aa03e677ab19f`
- v7.3.2: `693558f48012bc878672e7dedd4524eaed7616597319d5539dba0c9d9b7994da`
- v7.3.3: `88c1c2b21ae7593d77b94babfda74e8df247e1f1e13be7f5de89a80abe62f650`
- v7.3.4: `ac7e0479d3c5fe4b5ae6d3648f71267d74e540af3b127f08e6decfe03d6bb9bc`
- v7.4.0: `6317af10bbda0aa8ee1f61c825d12097c216ec58beef54df2f2524e75f1136eb`
- v7.4.1: `34f3095daeceb732629e443499aa905a553d79aa3045c9d41d2d5e80b2b29643`

This removes the earlier uncertainty caused by the uncommitted local `89b8c913...` v7.5 file. That file was never used as source-of-truth.

## Product result

The Archive now answers the cricket questions the v7.5 contract set out to answer without adding a management mechanic.

### Tenure scoreboard

The established first read remains:

- seasons;
- titles;
- Finals seasons;
- regular-season win rate.

### League honours

All eight GCC clubs are ranked by:

1. titles;
2. Grand Finals;
3. regular-season wins.

### GCC record book

Derived across archived league-wide season statistics:

- career runs;
- career wickets;
- career sixes;
- most matches;
- most runs in a season;
- most wickets in a season;
- highest individual score;
- best bowling figures.

No awards or historical club associations are invented.

### Your club legends

Derived only from `playerCareer`, meaning performances while representing the user's club.

The top-five order is transparent:

`runs + 25 × wickets + 80 × seasons + 300 × titles`

Each row still shows the underlying saved cricket measures.

### Season timeline

Every archived year shows:

- year;
- user outcome;
- W/L;
- champion;
- leading run-scorer;
- leading wicket-taker.

Mid-career wording now says `The seasons so far`; only a complete 19-season career says `Nineteen years of GCC`.

### Season scorebook

Selecting a year opens one focused modal showing:

- finish;
- W/L;
- champion;
- leading run-scorer;
- leading wicket-taker;
- statistical season standout;
- top-five runs;
- top-five wickets.

The standout calculation reuses the accepted existing `reviewSeasonValue()` function. v7.5 only exposes that existing read-only helper to the Dynasty layer; its body is byte-identical to v7.4.1.

### Legacy

The final ceremony remains compact.

It adds only:

- all-time GCC run record;
- all-time GCC wicket record;
- most successful club;
- leading user-club legend.

The Archive remains the route to deeper history.

## Save and simulation protection

No new save field was added.

`qa/check_v750.py` proves byte identity against v7.4.1 for:

- `freshDynasty`
- `serialisable`
- `archiveSeason`
- `applyCareerYear`
- `retirementsForYear`
- `arrivalsForYear`
- `tradeValue`
- `injuryChance`
- `processInjuries`
- `cpuDraftPick`
- `userAnnualDraft`
- `simulateMatch`
- `resolveCpuFinalsOffscreen`
- `formNegRoll`
- `updateFormForMatch`
- `reviewSeasonValue`

Therefore the accepted v7.4.1 numerical evidence remains the balance evidence for v7.5.

## Static gate

Accepted candidate:

- exact protected parent SHA: pass;
- 9 / 9 script blocks syntax-clean;
- duplicate static DOM IDs: 0;
- save schema protected;
- simulation / balance functions protected;
- Archive derives league player records from `history[].playerStats`;
- historical player rows do not infer club ownership;
- Archive helpers contain no writes to history / playerCareer / clubCareer / archivedYears.

## Browser gate

The v7.5 Archive browser audit passed:

- four canonical Archive sections;
- eight-club honours board;
- eight record-book records;
- club-legends rows;
- season-detail modal;
- mid-career timeline copy;
- 390px mobile width with zero page-level horizontal overflow;
- older archive row with missing `playerStats` loads gracefully;
- opening / rendering Archive leaves history, manager, clubCareer and playerCareer unchanged.

## Full-horizon evidence

A real dynasty was driven through the complete **2008-2026** horizon on the v7.5 code line.

The run completed all 19 seasons with the normal GCC systems active:

- foundation Draft;
- regular seasons;
- Finals;
- injuries and replacement handling;
- annual off-seasons;
- annual Drafts;
- final-15 cuts;
- XI selection.

The resulting completed career produced:

- 19 Archive season rows;
- eight-club honours;
- populated career and single-season records;
- populated user-club legends;
- working 2008 scorebook;
- working 2026 scorebook;
- final Legacy ceremony.

Desktop and mobile Archive / detail evidence was visually reviewed. The Archive retained the accepted v7.3.3 cream / green editorial identity and did not become a tabbed analytics dashboard.

The full-horizon-tested pre-polish candidate was:

`b77e38ff00af6701cf555aeb407ee4c473e78fe359d64c1c86bf39ed20d40f89`

Reversing exactly the two final copy changes on the accepted candidate reproduces that SHA byte-for-byte.

The final `bc3bbb74...` delta from the full-horizon-tested build is therefore limited to:

1. Archive intro wording: removes a claim about surfacing moves;
2. timeline heading: becomes career-aware before nineteen seasons.

No cricket logic, derived-history logic, record calculation, Legacy logic or layout rule changed after the full-horizon run.

## Hosted Actions

The repository workflow remains in place:

`.github/workflows/v750-dynasty-memory-qa.yml`

It now defines:

1. deterministic rebuild from v7.4.1;
2. static guard;
3. Archive browser audit;
4. one real seed-101 2008-2026 longevity run;
5. evidence artifact upload.

GitHub-hosted runs are still failing before checkout with zero workflow steps and no allocated runner, matching the infrastructure issue already recorded during v7.4.1. Local acceptance therefore remains the operative evidence until hosted execution is available again.

## Acceptance decision

**KEEP / ACCEPT v7.5 Dynasty Memory & Legacy.**

The acceptance question is answered:

> After nineteen seasons, can the player look back and recognise the cricket world they created?

Yes. The player can now see the competition hierarchy, the statistical greats of that generated world, the records, their own club legends, and the story of every season without changing the simulation that produced them.

Do not reopen v7.4.1 balance as part of follow-up v7.5 polish.

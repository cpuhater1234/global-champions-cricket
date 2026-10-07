# GCC v7.5 Dynasty Memory & Legacy Candidate Checkpoint

## Status

Implementation candidate staged on `work/v7.5-dynasty-depth`.

This is **not yet an accepted v7.5 game build**. The previously referenced local candidate `global_champions_cricket_v7_5_0_dynasty_memory.html` with prefix SHA `89b8c913...` was not present in the branch or available file surfaces, so it has not been treated as source-of-truth bytes.

v7.5 is rebuilt deterministically from the accepted v7.4.1 baseline.

## Protected source

Accepted v7.4.1 SHA-256:

`34f3095daeceb732629e443499aa905a553d79aa3045c9d41d2d5e80b2b29643`

The v7.5 rebuild refuses to proceed if that parent SHA does not match.

## Candidate scope

v7.5 adds a read-only Dynasty Memory layer over existing archived history:

- tenure scoreboard remains the Archive entry point;
- league honours table: titles, Grand Finals, regular-season wins;
- GCC record book:
  - career runs;
  - career wickets;
  - career sixes;
  - matches;
  - season runs;
  - season wickets;
  - high score;
  - best bowling;
- user-club legends derived only from `playerCareer`;
- season-by-season timeline with champion and league batting/bowling leaders;
- season scorebook modal with:
  - user finish and W/L;
  - champion;
  - leading run-scorer;
  - leading wicket-taker;
  - performance leader using existing `reviewSeasonValue()`;
  - top-five runs;
  - top-five wickets;
- concise end-of-career Legacy strip for GCC run record, wicket record, most successful club and user's leading club legend;
- responsive one-column treatment on narrow screens.

No new management mechanic is introduced.

## Data model

The implementation derives its presentation from existing fields only:

- `dynasty.history[].playerStats`
- `dynasty.clubCareer`
- `dynasty.playerCareer`
- `dynasty.manager`

No new save fields are added.

Historical league player rows deliberately do not infer or display a club from current ownership.

## Guardrail

`qa/check_v750.py` requires the following v7.4.1 functions to remain byte-identical:

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

It also checks:

- all nine script blocks parse with Node;
- no duplicate static DOM IDs;
- required v7.5 Archive markers exist;
- Archive helpers are derived from historical records;
- Archive helpers do not write to dynasty history/career stores;
- historical player rows do not invent a club association.

## Local smoke evidence

The exact compressed v7.5 payloads were applied through the same structural rebuild operations to the locally available v7.2.15 predecessor as a payload/insertion smoke test.

Result:

- 9 / 9 script blocks syntax-clean;
- duplicate static DOM IDs: 0;
- Archive helper exports present;
- season-detail finish line present;
- deterministic output generated successfully.

This smoke test validates the payload mechanics, but it does **not** replace rebuilding from the exact v7.4.1 protected bytes.

## GitHub Actions status

Workflow: `.github/workflows/v750-dynasty-memory-qa.yml`

The first full rebuild attempt ended before checkout with:

- zero workflow steps;
- runner id 0;
- no runner name;
- no job logs.

This matches the hosted Actions availability problem already recorded during v7.4.1 validation. It is an infrastructure failure, not a v7.5 checker or game-code failure.

## Acceptance gate still required

Before v7.5 can be frozen:

1. rebuild `global_champions_cricket_v7_5_0_dynasty_memory.html` from the exact accepted v7.4.1 bytes;
2. pass `qa/check_v750.py`;
3. inspect Archive and season-detail presentation in-browser at desktop and mobile widths;
4. run a completed 2008-2026 dynasty and verify all 19 season rows, honours and records against the stored history;
5. confirm no horizontal overflow or Archive navigation regression;
6. record and freeze the final v7.5 SHA-256.

Until those gates pass, classify v7.5 as **candidate, not accepted**.

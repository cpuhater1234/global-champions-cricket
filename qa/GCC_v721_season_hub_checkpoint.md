# GCC v7.2.1 Season Hub Structural Checkpoint

## Status

Second structural v7.2 checkpoint, built from the tested v7.2.0 launcher architecture.

This pass deliberately changes the **information architecture and gameplay flow** of the Season Hub. It is not a cosmetic reskin.

## Source of truth

- Repository: `cpuhater1234/global-champions-cricket`
- Branch: `work/v7.2-structural-rebuild`
- Input: `game/global_champions_cricket_v7_2_0_launcher_architecture.html`
- Output: `game/global_champions_cricket_v7_2_1_season_hub_structure.html`
- v7.2.0 SHA-256: `365245b618ffa09a799c32006faa09acc896598c5aecfa60501fe7cdd080d4ef`
- v7.2.1 SHA-256: `e1b1566abbf6c1f11a366f6b9f54e67ef9747a9871ebcf87309fdd7ca4049db3`

Rebuild with:

```bash
python qa/rebuild_v721.py
python qa/check_v721_season_hub.py
```

The v7.2.1 file is reconstructed from the v7.2.0 baseline plus:

`qa/patches/v720_to_v721_season_hub.patch.gz.b64.part*`

## Product objective

The default Season screen must answer three questions before presenting deeper data:

1. What just happened?
2. Who is next?
3. What should I do now?

Full fixtures, the full ladder, phase analysis and player leaderboards must remain available without competing for attention on the default route.

## Structural changes

### Default Overview

The default route now contains:

- match/result story
- next-fixture context
- compact Round / Record / Position / NRR KPIs
- a short recent-and-next fixture run
- a compact ladder/finals-line snapshot

It no longer renders the complete season data wall by default.

### Deliberate secondary views

The Season Hub now has five explicit views:

- Overview
- Fixtures
- Ladder
- Analysis
- Players

Full fixtures and the full ladder are rendered only when requested. Season insights and player leaders are also deferred until their views are selected.

### Action hierarchy

- `PLAY ROUND 1` / `PLAY NEXT ROUND` is the primary action.
- `RUN SEASON` / `RUN REST OF SEASON` is secondary.
- Pace controls appear only while season simulation is running.
- The ambiguous `KEEP SEASON RUNNING` label is removed.
- At Round 14, the obsolete regular-season header actions disappear so Finals / Season Review owns the transition.

### Edge-state hardening

Stress testing found a real transition defect: when Round 14 opened the finals-qualification state, a Round 13 signature-result moment could remain visible because the final round suppressed a new result moment without dismissing the old one.

v7.2.1 explicitly dismisses stale result moments when the qualification/review transition takes over.

## Acceptance results

### Syntax/runtime

- All script blocks passed syntax validation.
- Final desktop test: zero page runtime exceptions.
- Final desktop test: zero console errors.
- Continuous 4x season run completed through Round 14.

### Information hierarchy

At Round 7 on the default route:

- Overview is visible.
- Fixtures, Ladder, Analysis and Players are hidden.
- recent/next run is capped at five rows.
- ladder snapshot is capped at five rows.
- full fixtures are not rendered initially.
- full ladder is not rendered initially.

Secondary views were then opened individually and showed:

- Fixtures: 14 fixture rows.
- Ladder: 8 teams.
- Analysis: match/phase analysis only.
- Players: player leaderboards only.

### Completed-season state

At Round 14:

- obsolete regular-season header actions are hidden.
- Finals / Season Review CTA remains the dominant transition.
- stale result-moment overlay is absent.
- qualification modal opens correctly for a qualifying team.

### Mobile

Tested at 390 x 844:

- no page-level horizontal overflow on Overview.
- no page-level horizontal overflow on Fixtures.
- no page-level horizontal overflow on Ladder.
- no page-level horizontal overflow on Analysis.
- no page-level horizontal overflow on Players.
- all five season navigation tabs fit without clipping.

### Default-route height comparison at 1440 x 900

Measured in the same browser harness:

| State | v7.2.0 | v7.2.1 |
| --- | ---: | ---: |
| Round 0 | 1007 px | 497 px |
| Round 1 | 1404 px | 755 px |
| Round 7 | 1391 px | 760 px |
| Round 14 | 1510 px | 870 px |

These are controlled visual-QA measurements, not general performance benchmarks.

## Guardrails

`qa/check_v721_season_hub.py` statically verifies the tested artifact SHA and structural markers, including:

- five-view Season Hub
- `setSeasonView`
- `RUN REST OF SEASON`
- removal of `KEEP SEASON RUNNING`
- completed-season action hiding
- stale-result `dismissMoment` support

## Not claimed by this checkpoint

This pass does **not** claim to solve:

- XI selection interaction/hierarchy
- draft density and feedback
- off-season/trade-screen density
- multi-year CPU management quality
- simulation tuning beyond existing protected behaviour
- physical splitting of the approximately 2 MB single-file application

Those remain separate v7.2 structural workstreams and must pass their own acceptance gates.

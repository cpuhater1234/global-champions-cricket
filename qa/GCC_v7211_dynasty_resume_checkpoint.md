# GCC v7.2.11 Dynasty Resume Continuity Checkpoint

## Status

Accepted surgical save/resume hardening on top of authoritative v7.2.10.

## Source of truth

- Input: `game/global_champions_cricket_v7_2_10_review_hierarchy.html`
- Output: `game/global_champions_cricket_v7_2_11_dynasty_resume_continuity.html`
- v7.2.10 SHA-256: `e6a93cf831a548c2dfd44c5c8d6af9c35166accf007c428bdde286e4b860fe70`
- v7.2.11 SHA-256: `abe4236e5ee6664f2191b1898d31a7566a8bcc5d672e8fab4bc375c10d32a25c`
- Passing 2009 dynasty-loop run: `37412362455`

## Problem fixed

After the 2008 Season Review, an active 2009 offseason could be saved correctly but Continue Dynasty still restored a foundation-era Team Room.

The save data itself was intact. The restore-screen heuristic was wrong.

## Surgical change

When a loaded save contains `state.dynasty.offseason`, resume now prioritises:

`currentScreen = 'dynasty'`

before foundation/season heuristics inspect `fullSchedule`, `draftFinished`, `draftOrder` or other old state.

No save-schema change was required.

## 2009 acceptance

The full audit passed:

- Review -> Continue Dynasty
- 2009 Market
- Trade Centre
- hard reload / Continue at Market
- CPU market
- random 8-club Draft Draw
- post-draw trade-pick assets
- hard reload / Continue at Draft Draw
- annual Draft
- hard reload / Continue after a real user Draft pick
- complete annual Draft
- all CPU lists at 15
- all CPU lists retain a recognised keeper
- all CPU lists retain at least six bowling options
- Final 15
- Pre-season ready
- hard reload / Continue at Pre-season
- 2009 Team Room
- 2009 Round 1

Roster ownership remained globally unique throughout the tested offseason.

## Scope protection

The guardrail confirms the only logic change is offseason resume precedence. Core simulation, player data, Draft logic, recruitment logic and season logic remain unchanged.

## Follow-up visual finding

Evidence review found a separate transition defect after the saved-state work passed: the Dynasty screen can remain active underneath Team Room/Season after entering the 2009 Team Room.

That presentation/state-isolation issue is not part of v7.2.11 and is handled next.

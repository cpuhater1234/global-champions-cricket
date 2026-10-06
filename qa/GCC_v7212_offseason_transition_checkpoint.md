# GCC v7.2.12 Offseason Transition Isolation Checkpoint

## Status

Accepted surgical screen-transition hardening on top of authoritative v7.2.11.

## Source of truth

- Input: `game/global_champions_cricket_v7_2_11_dynasty_resume_continuity.html`
- Output: `game/global_champions_cricket_v7_2_12_offseason_transition_isolation.html`
- v7.2.11 SHA-256: `abe4236e5ee6664f2191b1898d31a7566a8bcc5d672e8fab4bc375c10d32a25c`
- v7.2.12 SHA-256: `10e0ea729a0bc5d3bacfbec759b3d91f38eae26caec266913338ac38c7410283`
- Passing 2009 transition QA run: `37412791649`

## Problem fixed

After the 2009 offseason reached Pre-season, entering Team Room activated the core Team screen but could leave the Dynasty screen active underneath it.

The same leaked Dynasty screen then remained below the 2009 Season Hub.

This was visible in QA evidence as `Build the 2009 side` continuing below the Round 1 Season page.

## Surgical change

The Dynasty `enterTeamRoom()` transition now removes the Dynasty screen's `active` class before delegating to the existing Team Room transition.

No Team Room, XI or Season rendering logic was changed.

## Acceptance

The full 2009 offseason loop re-passed:

- Market and Trade Centre
- Market hard reload / Continue
- CPU market
- Draft Draw
- post-draw pick assets
- Draft Draw hard reload / Continue
- Annual Draft
- partial Draft hard reload / Continue
- all CPU rosters 15/15
- keeper / bowling-shape protection
- Final 15
- Pre-season hard reload / Continue
- Team Room
- recommended XI
- Round 1

New isolation gates verified:

- 2009 Team Room has exactly one active screen: `team`
- Dynasty screen inactive
- 2009 Round 1 has exactly one active screen: `season`
- Dynasty screen inactive
- 2009 recommended XI has 11 players
- batting order has 11 players
- at least 20 overs of bowling cover
- keeper fallback remains correct

## Visual acceptance

The accepted evidence shows three clean, separate states:

1. `The 15 are lodged.`
2. `Name your 2009 XI`
3. `2009 is ready to go`

The old offseason page no longer appears below Team Room or Season.

## Scope protection

The guardrail confirms the only logic change is deactivating the Dynasty screen at the Team Room boundary. Core cricket, save, Draft, roster and Season logic remain unchanged.

## Acceptance decision

v7.2.12 Offseason Transition Isolation is accepted at:

`10e0ea729a0bc5d3bacfbec759b3d91f38eae26caec266913338ac38c7410283`

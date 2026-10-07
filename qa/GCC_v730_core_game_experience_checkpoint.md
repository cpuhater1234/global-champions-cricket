# GCC v7.3.0 Core Game Experience Checkpoint

## Status

Accepted first v7.3 game-experience build on top of the frozen v7.2.16 baseline.

This checkpoint marks the switch from incremental screen polish to product-level game building.

## Source of truth

- Repository: `cpuhater1234/global-champions-cricket`
- Branch: `work/v7.3-game-experience`
- Frozen parent: v7.2.16 Launcher Fast Path
- v7.2.16 SHA-256: `dbf8dc746207c970c11ab650cf13cbca0adae87b641dc63c159f02db0090af2b`
- v7.3.0 SHA-256: `3dedc12f16d810ad034f44014e19ef10b64e3c39faab3d5f918c6066836dcd80`
- Accepted product/engineering run before checkpoint documentation: `37561989737`
- Tested code head: `d627ef14b09dd9b738e802f3d895f8e5a3ede971`

Rebuild and verify:

```bash
python qa/rebuild_v730.py
python qa/check_v730.py
node --experimental-websocket qa/browser_v730_core_game_experience.mjs
```

## Product objective

v7.3.0 fixes the ownership of the XI decision and the season interruption philosophy.

The user chooses the eleven.

The game may:
- maintain a natural batting order for the players the user picked
- show cricket-balance reads
- warn about keeper or bowling problems
- show opponent, venue and conditions context

The game no longer offers a one-click complete recommended XI in Team Room.

The game no longer silently repairs the human XI during later-season auto-run when an injury makes the selected XI invalid.

## Team Room changes

### Full squad remains visible

The Team Room now presents the complete 15-man squad throughout selection.

Browser acceptance verified:

- empty XI: 15 squad rows, 15 PICK actions
- partial XI: all 15 still visible
- complete XI: all 15 still visible
- selected players remain visibly selected rather than disappearing from squad context

### Human-owned XI

Removed from the user-facing Team Room:

- `USE RECOMMENDED XI`
- `BUILD MANUALLY`

Selection now begins immediately.

The states are:

`PICK -> SELECTED / REMOVE -> complete XI -> SWAP -> SWAP OUT`

The existing natural batting-order assistance is preserved.

### Direct swap

Once the XI reaches eleven:

- all eleven selected players remain visible
- all four bench players remain visible
- a bench player can be armed for a direct swap
- one of the XI is then chosen to leave
- XI size and batting-order integrity remain 11/11

## Injury interruption

Later-season `RUN SEASON` no longer calls the human `autoRepairXI()` path between rounds.

Before another round begins, the run checks the human XI.

If the XI is invalid because a selected player is unavailable:

- auto-run stops
- Team Room opens
- the injured player remains in the XI
- the user must make the selection decision
- no replacement is silently chosen

CPU XI repair and CPU season progression remain separate and unchanged.

## Browser acceptance

The v7.3-specific Chrome journey completed:

### Empty XI

- active screen: Team Room
- XI: 0
- squad rows: 15
- selected rows: 0
- PICK actions: 15
- recommendation/manual gateway: absent
- start disabled
- projected XI ratings hidden
- desktop overflow: 0

### Partial XI

- XI: 5
- batting order: 5
- squad rows: 15
- selected rows: 5
- REMOVE actions: 5
- PICK actions: 10
- projected complete-XI rating still hidden

### Complete XI

- XI: 11
- unique XI IDs: 11
- batting order: 11
- squad rows: 15
- selected rows: 11
- bench rows: 4
- SWAP actions: 4
- Season action enabled
- XI analysis available
- desktop overflow: 0

### Direct swap

Verified:

- explicit incoming-player state
- eleven valid SWAP OUT targets
- XI remains 11 unique players
- batting order remains 11 players
- incoming player enters XI
- outgoing player leaves XI
- pending swap state clears

### Mobile

At 390 x 844:

- all 15 squad rows remain accessible
- XI remains 11/11
- Season action remains usable
- page-level horizontal overflow: 0

### Injury interruption

A controlled later-season test injected an OUT injury after one valid auto-run round.

Verified:

- first valid round completed
- auto-run stopped before Round 2
- Team Room became active
- round remained 1
- injured player remained selected
- entire XI remained byte-for-byte the same selection
- no silent human XI repair occurred
- all 15 squad rows remained visible
- injured player visibly unavailable
- page-level overflow: 0

Runtime quality:

- page errors: 0
- runtime exceptions: 0
- console errors: 0

## Game-gate rejection caught during review

The first engineering-green candidate was not accepted immediately.

Manual screenshot review found old recommendation-era Team Room copy still being injected by the year-shell copy layer even though the recommendation button had been removed.

That state was rejected.

The copy layer was corrected so the screen now states, in the foundation season:

`Pick the eleven you want for Round 1. The room will order them naturally; the cricket decisions stay with you.`

The static guardrail and browser test now reject recommendation-era Team Room copy.

This is the first concrete use of the v7.3 rule that engineering-green does not automatically mean product-accepted.

## Scope protection

v7.3.0 does not intentionally redesign or recalibrate:

- player database
- player ratings
- recruitment outcomes
- 2008 Draft architecture
- CPU Draft evaluation
- match simulation
- innings model
- schedules
- weather model
- Finals
- Season Review
- offseason market
- annual Draft rules
- replacement-player eligibility
- CPU XI construction
- dynasty save architecture

## Acceptance decision

v7.3.0 Core Game Experience is accepted at SHA-256:

`3dedc12f16d810ad034f44014e19ef10b64e3c39faab3d5f918c6066836dcd80`

The next coherent workstream is **v7.3.1 Dynasty Continuity**, focused on bringing the annual Draft onto the established 2008 Draft interaction family rather than maintaining a cheaper second Draft interface.

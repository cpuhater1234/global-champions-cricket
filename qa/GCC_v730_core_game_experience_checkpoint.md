# GCC v7.3.0 Core Game Experience Checkpoint

## Status

Accepted first v7.3 game-experience build on top of the frozen v7.2.16 baseline.

This checkpoint marks the switch from incremental screen polish to product-level game building.

## Source of truth

- Repository: `cpuhater1234/global-champions-cricket`
- Branch: `work/v7.3-game-experience`
- Frozen parent: v7.2.16 Launcher Fast Path
- v7.2.16 SHA-256: `dbf8dc746207c970c11ab650cf13cbca0adae87b641dc63c159f02db0090af2b`
- v7.3.0 SHA-256: `a9ecb8e4596fc7d751e6abcd840d74529e6b49b0c5ed78b8770badd3db4e191c`
- Final accepted engineering/product run: `37563393315`
- Final tested code head: `6fd9e7f0193d0cfb124a01f37b50856af1352258`
- Accepted build parent: `eaa3d6e268c95ac82fc1523dc1f6c38d35df74a7`

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

Final browser acceptance verified:

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
- routine swaps do not trigger a large presentation moment over the Team Room

## Injury interruption

Later-season `RUN SEASON` no longer calls the human auto-repair path between rounds.

Before another round begins, the run checks the human XI.

If the XI is invalid because a selected player is unavailable:

- auto-run stops
- Team Room opens
- the injured player remains in the XI
- the unavailable player is named in the decision copy
- the user must make the selection decision
- no replacement is silently chosen
- both progression controls read `CHANGE REQUIRED`
- both progression controls remain disabled until the user repairs the XI

Once the user swaps in an available player:

- XI remains 11 unique players
- the unavailable player leaves the XI
- the screen returns to the normal ready state
- both progression controls read `RETURN TO SEASON`
- both progression controls are enabled

CPU XI repair and CPU season progression remain separate and unchanged.

## Final browser acceptance

The v7.3-specific Chrome journey completed against the final SHA.

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
- routine XI changes do not trigger the large GCC moment overlay
- no large XI-change moment is shown

### Mobile

At 390 x 844:

- all 15 squad rows remain accessible
- XI remains 11/11
- Season action remains usable
- page-level horizontal overflow: 0
- routine swap feedback does not obstruct the Team Room hierarchy

### Injury interruption

A controlled 2009 test injected exactly one OUT injury after one valid auto-run round.

Verified before the user acts:

- first valid round completed
- auto-run stopped before Round 2
- Team Room became active
- round remained 1
- injured player remained selected
- entire XI remained the same selection
- no silent human XI repair occurred
- all 15 squad rows remained visible
- exactly one controlled injured player was unavailable
- heading: `Set your Round 2 XI`
- decision lead names the unavailable player
- both progression controls: `CHANGE REQUIRED`
- both progression controls disabled
- page-level overflow: 0

Verified after the user repairs the XI:

- XI: 11
- unique XI IDs: 11
- injured player no longer selected
- lead returns to `Your XI is set for Round 2.`
- both progression controls: `RETURN TO SEASON`
- both progression controls enabled

Runtime quality:

- page errors: 0
- runtime exceptions: 0
- console errors: 0

## Game-gate rejections caught during review

v7.3.0 was not accepted merely because CI went green.

### Rejection 1: recommendation-era copy

An engineering-green candidate still injected recommendation-era Team Room language even though the recommendation action had been removed.

That state was rejected and the copy layer was corrected.

### Rejection 2: routine swap presentation

Screenshot review showed a large transient XI-change moment competing with the Team Room hierarchy, especially on mobile.

That state was rejected. Routine XI changes now stay inside the Team Room interaction.

### Rejection 3: ambiguous injury state

A later engineering-green candidate correctly stopped at Round 2, but still said the XI was set and allowed `RETURN TO SEASON` while the injured player remained selected.

That state was rejected.

The final build makes the decision explicit and blocks progression until the human repairs the XI.

This is the practical v7.3 standard: engineering-green is necessary but not sufficient.

## Visual review decision

Final desktop injury evidence and repaired-XI evidence were manually reviewed after the passing browser run.

The core decision hierarchy is accepted.

One minor pre-existing mobile label collision around the small `SELECTION SHEET` ornament is deliberately deferred to the later consistency/visual pass. It does not reopen the v7.3.0 gameplay workstream.

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

`a9ecb8e4596fc7d751e6abcd840d74529e6b49b0c5ed78b8770badd3db4e191c`

The next coherent workstream is **v7.3.1 Dynasty Continuity**, focused on bringing the annual Draft onto the established 2008 Draft interaction family rather than maintaining a cheaper second Draft interface.

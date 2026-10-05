# GCC v7.2.2 XI Selection Structural Checkpoint

## Status

Third structural v7.2 checkpoint, built from the tested v7.2.1 Season Hub.

This pass rebuilds XI selection around the actual cricket decision: name the eleven, set the order, check balance, then play. It specifically removes the fake-projection and repetitive-selection problems identified in the v7.1.2 red-team.

## Source of truth

- Repository: `cpuhater1234/global-champions-cricket`
- Branch: `work/v7.2-structural-rebuild`
- Input: `game/global_champions_cricket_v7_2_1_season_hub_structure.html`
- Output: `game/global_champions_cricket_v7_2_2_xi_structure.html`
- v7.2.1 SHA-256: `e1b1566abbf6c1f11a366f6b9f54e67ef9747a9871ebcf87309fdd7ca4049db3`
- v7.2.2 SHA-256: `6e1ec524263c1f30366b64be210ae6c6726830ff37dcfaaed4b79e8236d127e6`

Rebuild with:

```bash
python qa/rebuild_v722.py
python qa/check_v722_xi.py
```

The candidate is reconstructed from v7.2.1 plus:

`qa/patches/v721_to_v722_xi.patch.gz.b64.part*`

## Product objective

Fix four structural problems rather than decorate them:

1. Stop showing projected XI ratings when no XI exists.
2. Remove the requirement to click ADD eleven times for the normal path.
3. Stop duplicating selected players in both the squad list and batting order.
4. Make the actual XI and its cricket balance the dominant object.

## Structural changes

### Compact 0/11 choice

At 0/11 the full selection workspace is hidden. The player initially sees:

- `USE RECOMMENDED XI`
- `BUILD MANUALLY`

No batting/bowling headline ratings are displayed before a side exists.

### Recommended XI

`GCC.selectRecommendedXI()` uses the existing balanced-XI logic, applies the batting order, clears stale pins/swap state, and excludes players whose dynasty injury status is `OUT`.

If fewer than eleven selectable players exist, the recommendation fails safely rather than silently selecting an unavailable player.

### Manual build

`BUILD MANUALLY` reveals the full selector.

Selected players leave the available-player list and appear only in the First XI. At 11/11 the left rail therefore becomes the four-player bench rather than repeating all fifteen squad members.

### Direct swaps

A bench player can enter swap mode and replace an XI player directly.

Browser testing verified:

- incoming player enters the XI
- outgoing player leaves it
- XI remains at eleven
- batting-order slot is preserved
- pending swap state clears

### Honest ratings

- 0/11: no headline XI ratings
- incomplete XI: no headline XI ratings
- 11/11: Batting and Bowling reflect the actual selected XI

A deliberately batting-heavy manual XI correctly exposed a weaker attack rather than inheriting projected best-XI numbers.

### Selection essentials

The default completed-XI read now prioritises:

- Players
- Keeper
- Bowling cover
- XI shape
- Batting
- Bowling

Bowling cover uses the existing validated `oversCapacity` measure. An earlier test exposed `trustedOversCapacity` as unsuitable for player-facing use because it produced a misleading 0.0-over read; that implementation was rejected before checkpointing.

### Progressive detail

Phase metrics, fielding/chemistry and ground-fit material now sit under the collapsed `Detailed XI read` control rather than occupying the default selection screen.

## Browser acceptance results

### Core interactions

Passed with zero page errors and zero console errors:

- compact 0/11 state
- manual-build reveal
- Recommended XI
- detailed read open/close
- remove player to 10/11
- reset to recommendation
- direct bench swap
- manual eleven-player build
- Start Season transition
- mobile layout at 390 x 844

### Recommended XI state

Tested full-XI example:

- XI: 11
- Bench: 4
- Batting: 91 / Elite
- Bowling: 82 / Strong
- Keeper: Phil Salt
- Bowling cover: 20.0 overs
- XI shape: Elite
- Detailed XI read: closed by default

These numbers are test-state observations, not hard-coded acceptance values.

### Incomplete XI state

After removing one player:

- XI: 10
- available players: 5
- no headline Batting/Bowling ratings
- bowling-cover check updates to the actual ten-player group

### Manual imbalance test

A deliberately batting-heavy XI exposed:

- Batting: 93 / Elite
- Bowling: 68 / Thin
- Bowling cover: 12.0 overs

This is desired behaviour: the screen now reflects the selected side rather than a projected best XI.

### Injury hardening

A player marked `OUT` was excluded by Recommended XI while the function still returned an eleven-player side. Runtime errors: zero.

### Density comparison at 1440 x 900

| State | v7.2.1 | v7.2.2 |
| --- | ---: | ---: |
| Empty XI | 1015 px | 244 px |
| Completed XI | 1015 px | 860 px |

The old empty state also displayed projected ratings and 15 squad rows plus an 11-slot batting-order area. The v7.2.2 empty state is only the naming choice.

### Full-season regression

From the v7.2.2 build:

- Recommended XI selected
- Season started
- all 14 regular-season rounds played through `playNextRound`
- final round = 14
- schedule length = 14
- postseason CTA remained available
- qualification state opened correctly when applicable
- page runtime errors = 0
- console errors = 0

### Mobile

At 390 x 844:

- no page-level horizontal overflow
- First XI is ordered before the bench/profile sections
- full selection interaction remains usable

## Guardrails

`qa/check_v722_xi.py` verifies:

- exact tested SHA
- Recommended XI/manual/clear controls
- compact no-XI state
- XI essentials
- collapsed detailed read
- Bowling cover
- injury exclusion in Recommended XI
- removal of the old `LIKELY XI` presentation

## Not claimed by this checkpoint

This pass does not yet solve:

- Draft information density and pick-decision hierarchy
- signing-week ceremony
- off-season/trade-screen density
- deeper multi-year CPU roster/trade/draft quality
- physical decomposition of the approximately 2 MB monolith

Those remain separate v7.2 workstreams and must pass their own structural and regression gates.

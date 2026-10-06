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
- v7.2.2 SHA-256: `6b9ee248228a677e48ef644aa30aa4d8d7ed520404f9e0b32941d6961b13623f`

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

The recommendation hierarchy is now explicitly cricket-valid:

1. recognised keeper + at least 20 overs of bowling capacity;
2. recognised keeper if the squad cannot also cover 20 overs;
3. pure best-rated XI only when the available squad genuinely contains no recognised keeper.

A recommended XI therefore never voluntarily omits an available recognised keeper just to improve the headline rating.

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

Bowling cover uses the existing validated `oversCapacity` measure.

### Progressive detail

Phase metrics, fielding/chemistry and ground-fit material now sit under the collapsed `Detailed XI read` control rather than occupying the default selection screen.

## Browser acceptance results

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
- unavailable injured player cannot be re-added from a re-rendered manual list

### Keeper recommendation stress test

A 24-run synthetic squad test exercised all eight league slots on each run: 192 recommendation cases total.

- cases where the available 15-player squad contained a recognised keeper: 168
- cases where the recommended XI omitted that available keeper: 0
- duplicate/short XI failures: 0
- runtime failures: 0

Synthetic squads with no recognised keeper are allowed to surface the shortage rather than inventing one.

### Density comparison at 1440 x 900

| State | v7.2.1 | v7.2.2 |
| --- | ---: | ---: |
| Empty XI | 1015 px | 244 px |
| Completed XI | 1015 px | 860 px |

### Full-season regression

From the final v7.2.2 build:

- Recommended XI selected
- Season started
- all 14 regular-season rounds played through `playNextRound`
- final round = 14
- schedule length = 14
- postseason CTA remained available
- page runtime errors = 0
- console errors = 0

### Mobile

At 390 x 844:

- no page-level horizontal overflow
- First XI is ordered before bench/profile sections
- `START SEASON` is immediately available after accepting the recommendation
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
- keeper-preserving recommendation fallback
- removal of the old `LIKELY XI` presentation

## Not claimed by this checkpoint

This pass does not yet solve:

- Draft information density and pick-decision hierarchy
- signing-week ceremony
- off-season/trade-screen density
- deeper multi-year CPU roster/trade/draft quality
- physical decomposition of the approximately 2 MB monolith

Those remain separate v7.2 workstreams and must pass their own structural and regression gates.

# GCC v7.2.16 Launcher Fast Path Checkpoint

## Status

Accepted launcher responsiveness fix on top of authoritative v7.2.15.

## Source of truth

- Input: `game/global_champions_cricket_v7_2_15_match_day_conditions.html`
- Output: `game/global_champions_cricket_v7_2_16_launcher_fast_path.html`
- v7.2.15 SHA-256: `22dbb185e1c274a60449223b0e3e362470e36be39b9d90e95fc76caec73df78a`
- v7.2.16 SHA-256: `dbf8dc746207c970c11ab650cf13cbca0adae87b641dc63c159f02db0090af2b`
- Passing Launcher Fast Path QA run: `37555707311`

## Problem fixed

The launcher had a lightweight New / Continue choice, but pressing `NEW DYNASTY` still routed through the old heavy 2008 story/home scene before the actual foundation flow began.

That created an unnecessary extra screen and made the new-career path feel slow despite the launcher itself being lightweight.

Older saves could also force synchronous reads of large save strings merely to determine whether a save key existed.

## New path

Normal new-career flow is now:

`NEW DYNASTY -> eight-club foundation draw`

The heavy 2008 story scene is no longer on the normal path.

It remains deliberately available through the separate `2008 story` launcher link.

When replacing an existing save:

`NEW DYNASTY -> replace confirmation -> eight-club foundation draw`

## Save detection

Save existence checks now inspect storage keys rather than reading complete legacy save payloads.

The dedicated browser test creates a multi-megabyte legacy save and verifies that the New Dynasty guard remains responsive.

## Measured acceptance

On the GitHub Chrome regression runner, the synchronous fresh New Dynasty transition completed in:

`66.8 ms`

It landed with:

- launcher hidden
- heavy story hero still hidden
- `leagueDraw` active
- eight clubs created

The performance gate requires the synchronous transition to remain below one second.

## Regression protection

The same browser run continued through the complete game journey after the launcher measurement and passed.

All existing structural suites on the same tested branch head were green, including Draft, Signing Week, Draft Order, Foundation Save, Team Room, Season, Finals, Review, dynasty resume, offseason transition, mid-season trade and year-shell continuity.

## Acceptance decision

v7.2.16 Launcher Fast Path is accepted at:

`dbf8dc746207c970c11ab650cf13cbca0adae87b641dc63c159f02db0090af2b`

# GCC v7.2.15 Match-Day Conditions Checkpoint

## Status

Accepted deterministic match-day weather and next-fixture context on top of authoritative v7.2.14.

## Source of truth

- Input: `game/global_champions_cricket_v7_2_14_year_shell_continuity.html`
- Output: `game/global_champions_cricket_v7_2_15_match_day_conditions.html`
- v7.2.14 SHA-256: `70810a1d6771c283f9f143d7707a0df90fd5594dfe321677f6f7fe51e6f48e8d`
- v7.2.15 SHA-256: `22dbb185e1c274a60449223b0e3e362470e36be39b9d90e95fc76caec73df78a`
- Passing Match-Day Conditions QA run: `37555707482`

## Product rules

Ground remains the dominant baseline. Weather is a restrained match-day overlay.

Implemented conditions:

- Settled
- Overcast
- Cool & damp
- Hot & dry

No DLS, abandonment lottery, humidity shortcut or permanent rating change is introduced.

## Determinism

Weather uses a persistent dynasty `weatherSeed`, independent of the live match RNG.

The regression explicitly mutates the live simulation RNG and confirms the same year / round / home venue forecast does not change.

Legacy saves receive a stable weather seed during migration.

## Gameplay context

Team Room now uses the actual next fixture:

- home / away
- opponent
- venue
- ground trait
- immediate-next-match weather
- concise cricket read

Active-season Team Room cannot restart the season.

Future fixtures do not expose exact weather beyond the immediate next match.

Semi-final and Grand Final use distinct weather identities.

## Statistical acceptance

Paired v7.2.14 vs v7.2.15 regression passed.

The weather layer remained small enough that league-wide scoring and wicket distributions stayed within the calibrated model, while Settled conditions remained equivalent to the prior baseline.

## Visual acceptance

Desktop and mobile conditions surfaces passed without adding a permanent weather dashboard.

The condition read is absorbed into the existing Team Room, Season, scorecard and Finals hierarchy.

## Acceptance decision

v7.2.15 is accepted at:

`22dbb185e1c274a60449223b0e3e362470e36be39b9d90e95fc76caec73df78a`

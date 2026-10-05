# GCC v7.2.0 Launcher Architecture Checkpoint

## Status

First structural v7.2 change completed from the protected v7.1.2 premium-polish candidate.

This is intentionally **not** another visual polish pass. The change isolates startup/save behaviour so returning players can choose whether to continue or start again before the dynasty is hydrated.

## Source of truth

- Branch: `work/v7.2-structural-rebuild`
- Input baseline: `game/global_champions_cricket_v7_1_2_premium_polish_candidate.html`
- Rebuilt candidate: `game/global_champions_cricket_v7_2_0_launcher_architecture.html`
- Baseline SHA-256: `6c07526259b85723eedd216fca513f6e57b59ce98de23b2e7575af849a73c74b`
- Candidate SHA-256: `365245b618ffa09a799c32006faa09acc896598c5aecfa60501fe7cdd080d4ef`

The v7.2 candidate is reconstructed with `qa/rebuild_v720.py` from the v7.1.2 baseline plus the split payload `qa/patches/v712_to_v720_launcher.patch.gz.b64.part*`.

## Structural change

Boot no longer eagerly creates/hydrates a dynasty. The first view is a lightweight career launcher.

Clean device:
- `New Dynasty`
- `Import save`
- optional `2008 story`

Existing save:
- `Continue Dynasty`
- `New Dynasty`
- `Import save`

Heavy dynasty/player-universe setup now waits until the player explicitly continues or starts a career.

## Save architecture

Introduced:
- `SAVE_VERSION = 7.2.0`
- new save key `gcc_dynasty_v7_2`
- lightweight metadata key `gcc_dynasty_meta_v7_2`
- legacy key detection for `gcc_dynasty_v7_0`
- legacy migration on successful resume
- stale metadata self-healing
- storage failures logged rather than silently swallowed

The tiny metadata record is what the launcher reads before dynasty hydration.

## Automated browser tests completed

The local browser harness tested both v7.1.2 and v7.2.0 and recorded **zero runtime exceptions** in the completed launcher/save cases.

Passed:
1. Clean boot shows launcher.
2. Clean boot has no dynasty object hydrated.
3. Clean boot has no league hydrated.
4. New Dynasty reveals the foundation-year route without prematurely hydrating the game.
5. Starting the new world hydrates the dynasty and writes v7.2 save + metadata.
6. Reload detects the v7.2 save and shows Continue.
7. Continue successfully restores the v7.2 career.
8. Genuine v7.1.2 legacy save is detected.
9. Legacy save resumes successfully and migrates to v7.2 storage.
10. Legacy key is removed after successful migration.
11. Stale launcher metadata fails safely and removes itself.
12. No runtime exceptions recorded at the end of the test sequence.

## Performance note

Synthetic document-load timing in the test harness was not materially lower because the file remains a roughly 2 MB single-file application. The architectural win is that v7.2 stops doing dynasty creation and league/player hydration before the user chooses an action. A later engineering pass can split/lazy-load the monolith itself.

## What this checkpoint does not claim

This is not yet the full v7.2 product rebuild. It does not fix the season hub, XI-selection hierarchy, draft density, off-season density, or all wording issues.

Those now proceed screen-by-screen under the structural acceptance criteria, starting with the Season Hub.

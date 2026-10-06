# GCC v7.2.6 Foundation Save Continuity Checkpoint

## Status

Accepted save/resume architecture checkpoint built on authoritative v7.2.5.

## Source of truth

- Input: `game/global_champions_cricket_v7_2_5_draw_transition_hardening.html`
- Output: `game/global_champions_cricket_v7_2_6_foundation_save_continuity.html`
- v7.2.5 SHA-256: `ed7767c447fb1e0ed48b14bf93f69ec6e5af6f4307611c869b6182996b9291f2`
- v7.2.6 SHA-256: `58d64d554df9ed9090c3d47499258786e97355845c27cb071efa5512ec0c200c`
- Passing hard-reload run: `37403788943`
- Passing independent preseason journey run: `37403984792`

Rebuild and verify:

```bash
python qa/rebuild_v726.py
python qa/check_v726_save.py
node --experimental-websocket qa/browser_v726_foundation_save.mjs
node --experimental-websocket qa/browser_v726_preseason_journey.mjs
```

## Problem fixed

The foundation journey could appear saved in the launcher while Continue Dynasty restored an incomplete state, including a null `userClub` after the completed Draft / Team Room handoff.

v7.2.6 adds explicit foundation checkpointing and resume-screen recovery without changing the save schema.

## Hard-reload coverage

Passed boundaries:

1. club locked -> Signing Week
2. partially completed live Signing Week
3. Draft Order created
4. partially completed Draft after a real user pick
5. completed Draft -> Team Room
6. XI selected
7. mobile hard reload at Round 1

The launcher remained lightweight and unhydrated before Continue on every reload.

## Integrity

- save schema remains `7.2.0`
- core game/data/AI blocks unchanged
- club identity preserved
- partial recruitment decisions preserved
- Draft order preserved
- partial Draft pick and pick index preserved
- completed Draft restored to Team Room with 15-player squad
- XI and batting order persisted
- Season restored at Round 1 with 14 user fixtures / 14 full rounds
- mobile Continue restored the same Round 1 state
- full 120-pick Draft: eight squads 15/15, 120 unique players

## Scope protection

No intentional changes to player data, ratings, recruitment outcomes, Draft AI, CPU Draft logic, XI recommendation logic, simulation, season model or multi-year dynasty systems.

## Visual follow-up

Evidence review found the final Draft-pick bulletin could visually linger for the CSS fade duration over the first Team Room frame. Save state was correct. That presentation defect is handled separately in v7.2.7.

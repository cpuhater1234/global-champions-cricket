# GCC v7.2.7 Team Room Transition Checkpoint

## Status

Accepted surgical presentation hardening on top of v7.2.6.

## Source of truth

- Input: `game/global_champions_cricket_v7_2_6_foundation_save_continuity.html`
- Output: `game/global_champions_cricket_v7_2_7_team_room_transition.html`
- v7.2.6 SHA-256: `58d64d554df9ed9090c3d47499258786e97355845c27cb071efa5512ec0c200c`
- v7.2.7 SHA-256: `05b88d1158efa063a90c9d7dbadfbac5278de08f16129ffe7a419a74f8b7e58a`
- Passing v7.2.7 journey run: `37404440940`

Rebuild and verify:

```bash
python qa/rebuild_v727.py
python qa/check_v727_transition.py
node --experimental-websocket qa/browser_v727_preseason_journey.mjs
```

## Problem fixed

The last Draft-pick signature bulletin could remain visible during its CSS fade after `ENTER TEAM ROOM`, overlapping `Name your first XI`.

The logical state had already cleared, but the outgoing visual transition survived into the next screen.

## Surgical fix

`clearMoment()` now treats explicit screen transitions as hard visual boundaries:

- temporarily disables the moment-layer transition
- removes `show`
- resets the layer class
- flushes layout
- restores the prior transition setting

No Team Room spacing workaround or redesign was used.

## Acceptance

Static guardrail:

- exact v7.2.6 source SHA
- exact v7.2.7 target SHA
- all non-presentation script blocks byte-identical
- v7.2.6 save-continuity layer byte-identical
- JavaScript syntax clean

Full preseason journey passed.

Immediate Team Room entry verified:

- moment `show` class: false
- computed opacity: `0`
- computed visibility: `hidden`
- page-level horizontal overflow: 0

Manual screenshot evidence confirms the stale Draft card is gone from the first Team Room frame.

## Scope protection

No game, player, recruitment, Draft, XI, season, simulation or save logic changed in v7.2.7.

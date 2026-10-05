# GCC v7.0.14 QA checkpoint

## Current protected build

`global_champions_cricket_v7_0_14_mobile_interaction_hardened.html`

Canonical SHA-256:
`04072e8bb361cf3fc7259f058ab22ced7b6da6aa9ec8bf28f457e003e6cf0ac4`

Repository newline-normalised SHA-256:
`147ac0db30e150a85e60332bd9b56c3e8f9edcdc2226aaed729b737dac40d54c`

## Static integrity

- 9 script blocks, 9/9 syntax pass
- 0 duplicate DOM IDs
- 12/12 protected cricket/simulation functions unchanged
- v7.0.14 is CSS-only relative to v7.0.13; JavaScript SHA is identical

## Logic QA inherited from v7.0.13

- CPU adversarial matrix: 11 checks, 0 failures
- 60 deliberately corrupted CPU rosters repaired successfully
- 300 plausible CPU roster/XI cases retained a keeper and 20-over attack
- 12 league-wide keeper/bowler injury storms retained unique legal CPU XIs
- 40 CPU market states retained role floors and unique ownership
- first-round traded-pick ledger correct for all 8 clubs
- novice flow: 15 checks, 0 failures
- lifecycle/idempotency: 9 checks, 0 failures
- save-phase matrix: 8 checks, 0 failures

## v7.0.14 visual/mobile pass

At 390x844 on tested World, Clubs, Draft, Team, Season, Review, Market and Annual Draft states:

- document width = 390px
- horizontal overflow = 0
- tiny-target detector = 0 flagged controls
- browser errors = 0

The v7.0.14 delta only increases selected mobile interaction targets on Draft and Season screens. No game logic changed from v7.0.13.

## QA method from here

Do not run monolithic browser stress loops until final release regression.

Use short deterministic batches and checkpoint results immediately:

1. CPU cricket intelligence counterfactuals
2. first-time player comprehension/friction
3. visual-design teardown at stable representative states
4. save/load and transaction edge cases
5. one final 2008-2026 browser regression only after the candidate is frozen

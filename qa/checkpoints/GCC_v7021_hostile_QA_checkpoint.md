# GCC v7.0.21 hostile QA checkpoint

## Active candidate
`global_champions_cricket_v7_0_21_career_end_hardened.html`

SHA-256:
`5523efbfab2df58ad2fac1bcce5b8216cbc80189d60d55092a313901a7ea9bd5`

## Protected baseline
v7.0.14 remains the protected promoted baseline on `main`. All later work remains QA-candidate work.

## Reproduced defects fixed during hostile QA
- mid-season trade could leave a traded-away player in the live XI and next match
- 2008 could play a match with only 10 selected players after XI mutation
- temporary cover could remain after trading the injured player, creating a 16-player roster
- fresh installs visibly showed RESUME DYNASTY with no save
- Legacy -> Archive -> Back could expose the stale 2026 Season screen
- after 2026 Legacy, the user could navigate back to XI and start/play another 2026 season

## Regression evidence before interruption
- 11/11 adversarial CPU checks passed
- 15/15 first-time flow checks passed
- 80 seeded CPU market states: 116 trades, no negative-value deal under the CPU club's own valuation
- checkpointed 2008-2026 regression:
  - 19 seasons archived once
  - no duplicate player ownership
  - no CPU roster-shape failures
  - no browser errors
  - 2026 Legacy reached cleanly

## Next hostile batches
1. verify every career-end bypass path is locked
2. test save/export/import after career completion
3. test Start Again 2008 fully clears the old dynasty
4. retest covered-player trade cleanup both user and CPU directions
5. test roster mutation around Finals transitions
6. final desktop + 390px first-impression visual pass
7. one final full 2008-2026 regression after candidate freeze

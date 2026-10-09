# GCC recovery: architecture checkpoint and implementation order

## Authoritative direction

Follow `docs/GCC_EXPERT_RECOVERY_BRIEF.md`. The brief supersedes the older
restriction against presentation redesign. Simulation, historical data and proven
dynasty rules remain protected unless a reproducible defect requires a change.

Baseline: v7.8.7, source branch `work/v7.8-player-experience`, commit
`7076bdfd302f80f8d9ea97bedf5cabd9888a112f`.

The recovery starts with source separation, then replacement of the presentation
architecture. Renaming or moving files does not itself fix the player's experience.

## What this checkpoint actually changes

- Creates editable sources and a deterministic standalone-game build.
- Extracts 31 presentation functions into their original lexical positions.
- Isolates bitmap payloads so source review is readable.
- Adds source integrity, syntax, include safety and CSS ownership checks.
- Preserves the entire resulting game byte for byte.

No redesigned game is promoted at this checkpoint. No gameplay or visual behaviour
has changed. No GitHub Actions workflow is added or intentionally triggered.

## Evidence from source

See `qa/GCC_recovery_css_audit.json` for the reproducible inventory.

- 79 media blocks across 11 distinct conditions.
- 931 `!important` declarations.
- Team Room sheet grid defined 11 times.
- Annual Draft player grid defined 10 times.
- Team Room profile panel defined 10 times.
- Shared `.side-panel` receives `order:-1` below 1100px.
- Main GCC theme variables are redefined in later correction sections.

These are ownership conflicts. Static counts do not establish which individual
screens overlap, whether colours pass contrast requirements, or whether a player
understands the next action. Those require browser and human visual review.

The existing `qa/check_candidate.py` pins an older baseline and expects nine script
blocks. This verified v7.8.7 has ten. Its old script-count assertion is therefore
not suitable unchanged for this architecture checkpoint. The new source check
checks all ten scripts and exact full-file identity against v7.8.7. Do not weaken
the protected-model checks to accept future simulation changes.

## Replacement sequence

1. **Theme and shared primitives.** Own canvas, ivory working surfaces, forest
   event surfaces, outcome colours, typography, focus states and spacing in one
   token file. Reserve gold for championship/prestige. Remove conflicting old
   definitions rather than adding another correction stylesheet.
2. **Season hub.** Primary next-match programme and Play Match action; secondary
   recent result with scorecard, coloured form strip, position/points/NRR, and
   remaining home/away context. Fixtures, ladder, analysis and players must each
   have one purpose. Keep the regular-season data paths unchanged.
3. **Matchday and Finals.** One shared event surface. Raise the intensity from
   regular match to semi-final to final. Keep truthful match stories, decisive
   outcomes and a supporting bracket. Avoid duplicating the same score or stakes
   at several hierarchy levels.
4. **One Draft presentation.** Replace the separate Foundation and Annual Draft
   renderers with shared room, player-card, filters, squad context, board and
   pick-feedback components. Pass context and actions as adapters; do not alter
   the selection engines. Preserve the dynamic vacancy-based snake.
5. **Off-season and trading.** Give each lifecycle stage a sporting moment, one
   decision and one next action. Trade dossiers expose uncertain scout reads,
   production, career stage, contract and squad consequences, not exact trade
   values. Final 15 confirms the squad once full and keeps movement history quiet.
6. **Team Room, Home and identity.** Deliberate task-order layouts, readable role
   information, fast New/Continue flow, and a new small-size sports identity with
   correct cricket equipment. No more logo rescue through stacked replacements.
7. **Whole-game wording and regression.** Review every screen and transition,
   including later years, empty states, long names, won/lost matches and disabled
   controls. Remove generic product copy and duplicate instructions.

## Rule invariants

- Forced retirements are uncapped.
- Additional controlled cuts are limited to `max(0, 4 - forced retirements)`.
- Each vacancy produces one Annual Draft selection.
- Lottery establishes the snake. Reverse each round and remove clubs after their
  required selections are exhausted; this is one Draft.
- Final rosters contain 15 unique players. CPU keeper/bowling/batting requirements
  and existing roster validation remain protected.
- The human selects the XI. Save/Continue must preserve actual lifecycle position.

## Acceptance gate

Inspect real browser screenshots at 1440, 1180, 1080, 900, 768 and 390px, including
first viewport, full scroll, empty/populated states, long names/descriptions,
win/loss, disabled actions, focus/hover, and before/after decisions. Check both
Foundation and later-season equivalents. Page overflow alone is insufficient.

Only after the frozen presentation candidate passes relevant gameplay tests and
visual review should it be offered as a redesigned playable release or promoted.

## Current blocker

The local runtime has no Chromium binary. The official Playwright browser
download failed to supply a valid archive under the current network restrictions.
The cloud browser blocks access to the local HTTP game and rejects local-file
navigation under its security policy. No workaround was attempted after the
explicit policy rejection. Browser visual/gameplay QA is therefore unperformed.

Continue the presentation implementation in an environment with an authorised
browser capable of rendering the local build. This checkpoint makes that work
reproducible without redoing the extraction or guessing the current baseline.

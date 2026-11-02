# GCC Build35 review, 2 November 2026

This pass selectively applies draft readability and mobile access improvements. It does not introduce countdowns, drag-and-drop, multiplayer infrastructure or speculative synergy grades.

## Changes

Mobile draft controls open a read-only squad report. Inspecting a retained player and returning restores the report and its scroll position without advancing the draft. Desktop keeps the persistent companion. Draft spacing, adaptive card columns and mobile filters are more compact. Coverage explicitly describes counts as options rather than targets. The mobile player-report rating label has sufficient width and cannot wrap.

## Evidence

Actual Build34 Chrome measurements at 390x844 put the first draft card at document y797.8 and the squad companion at y4306.2. Actual Build34 player-report capture exposed the wrapped Overall label. These are before evidence. Build35 has not yet been rendered in the connected browser; improved pixel positions and native focus remain to be checked there.

Foundation empty/full squad, nested scouting/attributes return, preserved filtering/scroll, phase guards and transient-save contracts pass. A real offline season through the annual draft passes the same return and cursor/roster immutability checks. Existing dossier and accessibility contracts pass. CSS parser reports no errors; all20 scripts parse. Scripts18/19 alone differ from Build34; engine scripts2/9/10 are identical. No ratings, RNG or save schema changes.

Read-only specialist reviews covered draft experience, information design and motion. Timing recommendations and broader information-design issues remain follow-up work, not claimed fixes. This is a bounded improvement, not a complete visual certification.

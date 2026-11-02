# GCC Build36 visual craft pass

Four independent read-only specialists reviewed layout, typography, art consistency and responsive interaction. Findings were treated as source risks unless supported by actual captures. Root inspected Build35 home and annual draft in Chrome. No claim of exhaustive page coverage or premium completion.

## Implemented

Club accent/ink replaces forced gold on table selection. Feedback uses charcoal and a restrained accent edge, replacing cream. Draft filters, skill strips, card footers, rating wells and fixture actions use shared neutral surface tokens. Shared decision-button and draft-card borders use the same neutral token. Hover no longer erases keyboard focus; scout focus ring sits inside the clipped card. XI arrow hitboxes increase from36x40 to44x44 with8px separation. Mobile squad coverage becomes one column below381px and ratings use tabular numerals.

The actual Build35 draft capture showed Projected XI heading and explanation squeezed side by side under its rating. The legacy .g8draftsummary>div flex rule was still active inside the newer summary. Explicit block layout now stacks that inner content in desktop and squad-dialog summaries.

## Verification and limits

All20 scripts parse and are byte-identical to Build35. No game behavior, player ratings, RNG or save format changes. Existing draft-room and player dossier contracts passed during this pass. CSS parser reports zero errors in both stylesheets. Build36 has not been rendered in the connected browser. Browser commands intermittently timed out and then detached during Build35 inspection. Keyboard focus, enlarged XI rows, small-screen coverage and final summary geometry require rendered reinspection. Wider matchday/offseason/selection visual review remains outstanding.

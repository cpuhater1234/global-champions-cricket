# Simpler arcade draft

Candidate: `game/global_champions_cricket_v8_draft_controls.html`. Build with `python3 v8/build.py --freeze --output game/global_champions_cricket_v8_draft_controls.html`.

The default board shows player identity/role, one prominent overall rating and two compact batting/bowling bars. Each available card has Pick and Scout buttons. Pick acts directly on the user's turn; Scout remains usable during CPU turns and pauses the shared timer. The Scout dossier retains phase capabilities, fitness, keeping, fielding, bowling involvement and career/contract detail. Projected XI ratings and latest pick feedback are behind Squad analysis; recent selections are separately collapsible. Filters preserve scouting depth without displaying every attribute on every card.

Advice, filters and cards use separate layout gaps. The order-draw control bar uses normal flow rather than sticking over later cards. Speed and Skip to my pick share a two-column row, including narrow screens. Height grows for wrapped text. The equal-height club guide and qualitative bowling-role read remain.

Foundation and annual CPU selections use the existing single scheduler. Annual drafts previously skipped every CPU choice immediately; the source-owned annual pace module now advances one selection per interval, stopping for a manual user pick. Speed cycles 1x, 2x and 4x (520/260/130ms). Skip cancels its pending timer and advances only to the next user choice or the end. Scouting/home/visibility use the scheduler's existing pause system. Continue clears stale annual jobs and re-arms one timer. CPU choice logic, snake positions, supplementary eligibility, vacancy counts, match rules and rating rules are unchanged.

Exact artifact digest and completed checks are in `qa/v8_draft_controls_scope.json`. Dedicated tests compare complete paced foundation and annual drafts with skipping, including RNG/roster/pick equality, direct Pick, stale actions, Scout pause, home pause and cold annual resume. Annual pacing uses an explicit one-vacancy-per-club fixture. Existing retirement, trade, cover, save, reveal, cricket and generated-markup suites passed, plus a two-season/28-match smoke. Helpers explicitly use Skip to my pick during annual drafts. This is not another full 38-season run.

No native rendered screenshots, overlap measurements, keyboard/focus/scroll or smoothness verification. User-operated rendered review remains the permitted route under the handoff restriction. No deployment, Actions, release, subagents or external messages.

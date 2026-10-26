# Decision friction improvements

Draft summary now says Projection from N players, counting available/non-OUT players, rather than suggesting drafted players have already been manually selected. Squad analysis distinguishes a projected XI from the chosen XI. Final-draft copy no longer implies an explicit keeper-assignment tool.

New/different/reopened modal content opens at the top. Same-title/key updates preserve position. Scouting from a long undrafted/trade list captures and restores the originating scroll position on return.

Verification:
- Reproduced misleading selected label and actual browser scout scroll71vs0 before fix.
-14 label/availability cases: empty/partial/full, injured players, projection vs selected XI.
-9 actual Chromium layouts across1280/390/320 widths and16/24/32 root text; scouting from long list, exact back-scroll restoration, reopened analysis/player, Escape.
-5 current-build cold reloads during unconfirmed decisions: list/trade/release/selected swap/pending bench swap. No accidental commitment; pending bench swap preserved and cancellable.
-Independent source review: no blockers.
-Only UI blocks13/19 changed; all engine blocks identical to numerical-audited version75. No fresh19-season claim for this UI artifact; the numerical evidence applies to the unchanged engine.

Current SHA256: ceee19d9e874468fa72be41845a98ecdf8230ade58cd5763e64aafe0eb1f797f

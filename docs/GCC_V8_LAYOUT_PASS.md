# V8 overlap source assessment

Current candidate: `game/global_champions_cricket_v8_layout_pass.html`.
Build with `python3 v8/build.py --freeze --output game/global_champions_cricket_v8_layout_pass.html`.
Exact digest and verification: `qa/v8_layout_scope.json`.

The request was to check the entire game for overlapping elements. The existing browser restrictions remain in force, and no native v8 screenshots were available. This pass inspects all screen families and dialogs through source/generated markup. It does not certify that the rendered game has no overlaps.

## Structural risks corrected

- The team-room `.g8selection` grid did not join the mobile stacking rule. It now stacks below 1100px, with two-column XI metric reads.
- Signing titles had a fixed 3.4em height. They retain a minimum reservation but grow for wrapped names.
- Order cards had fixed 350/380px heights. They now grow; sealed foundation and annual order slots reserve the exact revealed card content using inert, aria-hidden markup. Club cover headers also grow if ticket labels wrap.
- Several fractional grid tracks retained automatic minimum sizes. Hero, trade, score and signing-wire tracks now permit shrinking. Grid/flex children, long names, headings and button labels wrap within their panels.
- HUD and heading groups can wrap; search/control labels use vertical layout. Narrow score/stat/archive rows stack, identity groups can wrap, and dialog content explicitly scrolls.

No cricket domain, controller, scheduler or save script changed. `screens.js` only changed order-card reservation markup. The previous complete-career evidence remains domain evidence; the final layout artifact has its own two-season smoke, reveal/highlight, feedback and markup checks.

## Coverage and limit

Generated markup covers 39 screen/dialog states: home/story, club choice and reveal, signing, both draft rooms/order reveals, XI, every season tab, highlights/results, all finals stages, season review, offseason stages, archive/legacy, scouting, trading and scorebook dialogs. Twenty club identities and a long-player-name fixture were checked. Source containment assertions and action/ID parsing passed; these are not rendered-width or pixel tests.

At native desktop, narrow mobile and zoomed widths, review name wrapping, buttons, score panels, tables, long dialogs and transitions between sealed/open cards. Dialogs/backdrops, sticky pacing bars, decorative watermarks, reveal shutters and the floating feedback toast intentionally layer. Inspect screenshots to distinguish those layers from unwanted collisions; do not classify every rectangle intersection as a defect.

The permitted next step remains user-operated screenshots and actual mouse/keyboard play, following `qa/V8_VISUAL_REVIEW.md`. No browser, hosting or deployment bypass was used.

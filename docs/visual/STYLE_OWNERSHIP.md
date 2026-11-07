# Visual CSS ownership

Current handoff reference: user's GCC_BULLETPROOF_HANDOFF.pdf, build floor v106. Home/Intro composition and the floodlit identity are protected. Source/build history is recorded in CURRENT_CHECKPOINT.md. v108 includes v107 plus a scoped command/trade cascade cleanup.

## Owners in the audited family

| Concern | Existing source owner |
| --- | --- |
| Main command geometry and typography | v8/ui/floodlit.css, shared .g8button |
| Dialog command geometry and typography | v8/ui/floodlit-compat.css, shared dialog .g8button |
| Active primary gradient and ink, both scopes | v8/ui/floodlit-compat.css, combined .g8primary rule |
| Main secondary fill | v8/ui/floodlit.css, .g8button:not(.g8primary) |
| Dialog secondary fill | v8/ui/floodlit-compat.css |
| Home career CTA composition/type exception | v8/ui/composition.css |
| Trade builder/review impact list | v8/ui/decision-ui.css |
| General modal action stretching | v8/ui/workspace.css |
| Sticky trade action grid and minimum height | v8/ui/decision-ui.css |
| Modal action surface fill and shadow | v8/ui/floodlit-compat.css |
| Existing baseline button transition | v8/ui/arcade-charcoal.css, important transition |
| Active context hover/disabled semantics | Existing scoped rules; retain unless separately verified |

## Working contract

1. Inspect real DOM and computed values before changing selectors.
2. Locate the winning declaration, its media/supports/container condition, importance and specificity.
3. Edit that owner. Remove obsolete declarations in the touched scope.
4. Explain context exceptions by purpose, not by release-number patch names.
5. Preserve Home/Intro and authored club colours. Address future surface differentiation through club identity and raised/inset relationships.
6. Keep scope to one family. Do not add blanket recolouring/type/geometry layers.
7. Recheck Home and touched screens, including focus, disabled, danger and phone wrapping. Keep the native acceptance state explicit.
8. Verify the maintained GitHub branch and exact downloadable hash. Historical large HTML remains build input, not the current release.

## v108 cleanup scope

Fourteen source sections consolidated; net44 declarations and1896 bytes removed. Scripts/assets unchanged. v107 trade rows and footer stretching retained. Home composition source remains exact. Removed redundant primary/dialog styles, shadowed main UI geometry/palette, obsolete trade-footer colour/type declarations and absent knockout-headline selectors. Exact changes and per-change reasons are in qa/cascade-cleanup-20261107/changes.json.

This is a scoped audit, not certification that every historical stylesheet conflict is removed. The retained14 stylesheet blocks serve existing foundations, assets and component owners. Candidate native verification is pending download.

## Squad-update surface ownership (v109)

The existing floodlit-compat.css surface family owns annualhero, annualdevelopment and departureguide. These selectors are removed from the shared gradient group before receiving explicit primary/inset roles. Primary retains club identity; supporting information is inset. Scope changes colour and shadow only, with no new layer. Native candidate acceptance pending download.

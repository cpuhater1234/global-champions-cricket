# GCC v116 CSS/JavaScript block lineage

Evidence: [successful native source identity and mapping run #42971180377](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/42971180377), 11 November 2026. The audit parsed the exact frozen v116 release, scanned **112 tracked CSS and JavaScript files**, and verified the current release SHA-256.

## Verified distribution

| Source mapping status | CSS blocks | JavaScript blocks | Total |
|---|---:|---:|---:|
| At least one byte-level correspondence | 9 | 12 | **21** |
| Heuristic line overlap only | 4 | 6 | **10** |
| Neither byte match nor sufficient line overlap | 4 | 4 | **8** |
| **Total** | **17** | **22** | **39** |

A byte match may cover one embedded source or subset rather than the full inline block; it does not certify a complete maintained build.

## Important engineering findings

- `gcc-decision-ui-20261030` has substantial line overlap with `v8/ui/decision-ui.css`, but **not** byte-level identity.
- `gcc-composition-20261107` overlaps `v8/ui/composition.css` without byte identity, so blindly replacing it would risk losing later composition changes.
- The large first style block overlaps `v8/ui/workspace.css`, but does not match the full current file.
- `gcc-floodlit-visual` contains exact embedded copies of `floodlit.css` and `floodlit-compat.css`, but the complete style block is larger and not fully sourced from those two files.
- The late `gcc-visual-pass`, `gcc-cleanup-pass` and `gcc-v116-perfection-pass` CSS blocks have no matching tracked CSS files in this scan. Treat them as release-only content until explicitly extracted and reconciled.
- The corresponding `gcc-cleanup-behaviour` and `gcc-v116-perfection-behaviour` scripts also lack matching tracked JS files in the scan. Do not discard them.
- The large `gcc-floodlit-fonts` CSS block and 3.3 MB inline JS resource block are mostly asset-bearing by their structure and size. Their absence of matching JS/CSS source files is **not** itself evidence of a defect.
- `v8/engine/dynasty.js`, `v8/ui/career.js`, `v8/ui/roles.js`, `v8/ui/story.css` and `v8/ui/v93.css` were identical to complete released blocks, but matching those five components is not proof of full release reproducibility.

## Full block correspondence table

| Block | ID | Bytes | Byte-level correspondence | Review hint |
|---|---|---:|---|---|
| CSS 01 | \`(none)\` | 388,958 | **Not byte-matched** | \`v8/ui/workspace.css\` (1814 shared lines); \`v8/ui/game.css\` (324 shared lines) |
| CSS 02 | \`gcc-club-catalogue-styles\` | 273 | \`v8/ui/club_expansion.css\` (source_embedded) | None |
| CSS 03 | \`gcc-bulletproof-styles\` | 2,385 | \`v8/ui/bulletproof.css\` (source_embedded) | None |
| CSS 04 | \`gcc-save-status-styles\` | 155 | \`v8/ui/save_status.css\` (source_embedded) | None |
| CSS 05 | \`(none)\` | 10,550 | **Not byte-matched** | \`v8/ui/match_experience.css\` (39 shared lines) |
| CSS 06 | \`(none)\` | 2,847 | \`v8/ui/match_experience.css\` (block_embedded) | None |
| CSS 07 | \`(none)\` | 4,533 | \`v8/ui/story.css\` (identical_file) | None |
| CSS 08 | \`(none)\` | 3,149 | \`v8/ui/management.css\` (source_embedded) | \`v8/ui/game.css\` (19 shared lines) |
| CSS 09 | \`gcc-charcoal-20261030\` | 45,494 | \`v8/ui/arcade-charcoal.css\` (source_embedded) | None |
| CSS 10 | \`gcc-decision-ui-20261030\` | 139,483 | **Not byte-matched** | \`v8/ui/decision-ui.css\` (1125 shared lines) |
| CSS 30 | \`gcc-floodlit-fonts\` | 445,858 | **Not byte-matched** | None |
| CSS 31 | \`gcc-floodlit-visual\` | 71,060 | \`v8/ui/floodlit-compat.css\` (source_embedded); \`v8/ui/floodlit.css\` (source_embedded) | \`v8/ui/broadcast.css\` (346 shared lines); \`v8/ui/v93.css\` (3 shared lines) |
| CSS 32 | \`gcc-floodlit-v93\` | 5,070 | \`v8/ui/v93.css\` (identical_file) | \`v8/ui/floodlit.css\` (3 shared lines); \`v8/ui/broadcast.css\` (4 shared lines) |
| CSS 33 | \`gcc-composition-20261107\` | 12,896 | **Not byte-matched** | \`v8/ui/composition.css\` (79 shared lines) |
| CSS 34 | \`gcc-visual-pass\` | 1,594 | **Not byte-matched** | None |
| CSS 35 | \`gcc-cleanup-pass\` | 6,704 | **Not byte-matched** | None |
| CSS 37 | \`gcc-v116-perfection-pass\` | 6,931 | **Not byte-matched** | None |
| JS 00 | \`g8homephoto\` | 320 | **Not byte-matched** | None |
| JS 11 | \`(none)\` | 3,319,413 | **Not byte-matched** | None |
| JS 12 | \`(none)\` | 522,020 | \`v8/core/arrival_calibration.js\` (source_embedded); \`v8/domain/career_outcomes.js\` (source_embedded); \`v8/domain/career_paths.js\` (source_embedded) | \`v8/core/development.js\` (9 shared lines); \`v8/domain/player_profiles.js\` (6 shared lines) |
| JS 13 | \`(none)\` | 1,663 | \`v8/ui/clock.js\` (source_embedded) | None |
| JS 14 | \`(none)\` | 291,039 | \`src/scripts/players-2008.js\` (source_embedded) | None |
| JS 15 | \`(none)\` | 18,189 | \`src/scripts/league-data.js\` (source_embedded); \`v8/domain/blast_names.js\` (source_embedded); \`v8/domain/club_catalogue.js\` (source_embedded) | None |
| JS 16 | \`(none)\` | 18,029 | **Not byte-matched** | \`src/scripts/ratings-model.js\` (165 shared lines) |
| JS 17 | \`(none)\` | 14,490 | \`src/scripts/player-projections.js\` (source_embedded) | None |
| JS 18 | \`(none)\` | 10,414 | \`v8/engine/cpu.js\` (source_embedded) | \`src/scripts/cpu-draft.js\` (115 shared lines) |
| JS 19 | \`(none)\` | 240,791 | \`src/views/draft/renderDraft.js\` (source_embedded); \`src/views/draft/renderDraftFlow.js\` (source_embedded); \`src/views/draft/renderDraftStatus.js\` (source_embedded) | \`v8/engine/foundation.js\` (2156 shared lines); \`src/scripts/foundation-game.js\` (1623 shared lines) |
| JS 20 | \`(none)\` | 189,135 | \`v8/engine/dynasty.js\` (identical_file); \`src/views/annual-draft/annualDraftNeedsHtml.js\` (source_embedded); \`src/views/annual-draft/annualPlayerCard.js\` (source_embedded) | \`src/scripts/dynasty-game.js\` (194 shared lines); \`v8/domain/save_validation.js\` (62 shared lines) |
| JS 21 | \`(none)\` | 16,896 | **Not byte-matched** | \`v8/ui/components.js\` (47 shared lines) |
| JS 22 | \`(none)\` | 37,819 | **Not byte-matched** | \`v8/ui/cricket-reads.js\` (107 shared lines); \`v8/ui/data.js\` (93 shared lines) |
| JS 23 | \`(none)\` | 12,384 | \`v8/ui/roles.js\` (identical_file) | None |
| JS 24 | \`(none)\` | 3,069 | \`v8/ui/venues.js\` (block_embedded) | None |
| JS 25 | \`(none)\` | 19,635 | **Not byte-matched** | \`v8/ui/match_story.js\` (60 shared lines) |
| JS 26 | \`(none)\` | 47,252 | \`v8/ui/career.js\` (identical_file); \`v8/ui/story.js\` (source_embedded) | \`v8/ui/management.js\` (35 shared lines); \`v8/ui/offseason.js\` (23 shared lines) |
| JS 27 | \`(none)\` | 34,198 | **Not byte-matched** | \`v8/ui/screens.js\` (42 shared lines) |
| JS 28 | \`(none)\` | 42,736 | \`v8/ui/decision-ui.js\` (source_embedded); \`v8/ui/dom.js\` (source_embedded) | None |
| JS 29 | \`(none)\` | 71,996 | **Not byte-matched** | \`v8/ui/controller.js\` (248 shared lines) |
| JS 36 | \`gcc-cleanup-behaviour\` | 2,902 | **Not byte-matched** | None |
| JS 38 | \`gcc-v116-perfection-behaviour\` | 2,259 | **Not byte-matched** | None |

## Priority order for source reconciliation

1. Preserve the **exact frozen release bytes** and keep historical `v8/build.py` separate.
2. Bring the release-only visual/perfection CSS and behaviour scripts into an explicitly versioned, extracted source workspace without reinterpreting or removing them.
3. Reconcile changed `decision-ui.css`, `composition.css`, `workspace.css`, `controller.js`, `screens.js` and related JS against current v116 blocks. Validate full block byte identity before selecting a single editable owner.
4. Only after source-to-release correspondence is complete should visual cleanup begin. Evaluate cascade precedence, media conditions and native screenshots per surface, rather than blanket deleting duplicated selectors.
5. Continue the existing native save/two-tab checks whenever a future candidate modifies gameplay or save behaviour.

## Evidence limits

The source-match routine makes only exact byte comparisons or shared-line heuristic hints. It does **not** prove build provenance, CSS ownership, cascade correctness, visual equivalence, or cricket-system validity. The full maintained v116 build remains **UNVERIFIED**. The game artifact, `main`, releases and historical branches were not altered for this mapping.

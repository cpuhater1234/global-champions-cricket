# GCC v93 visual candidate, 6 November 2026

Repository: cpuhater1234/global-champions-cricket
Branch: work/v8-game-first-rebuild

## Candidate location

The latest visual candidate is GCC_v8_Playtest_72_v93_lean.html, persistent Library identity libfile_951b363fbb4481919a83abb8d7cb9ca9. Companion stylesheet: gcc_visual_patch_v93.css, identity libfile_d60a12f3bfac819188272d912506ee8f.

IMPORTANT: This commit records a checkpoint only. The candidate HTML and stylesheet have NOT been integrated into this repository's canonical game files or source modules. Do not describe the latest visual implementation as pushed or source-synchronised. Preserve existing branch changes and canonical playables during reconciliation.

## Current changes

42 embedded images compressed to WebP; candidate approximately 6.58 MB. Manage squad role-coloured edges, display-font names and rating plates, quiet release-review buttons. Final candidate corrects alert/commitment style precedence, retains 44px affected controls, disables row hover lift under reduced motion, and puts the club context beside the logo/menu on short landscape screens.

Only the final visual stylesheet changed during the 6 November continuation. All 20 inline script blocks were compared unchanged and passed Node syntax checks. All 42 unique embedded raster images decoded successfully. Standalone and embedded visual patch were synchronized.

## Browser evidence and limits

Browser served an EARLIER v93 patch (4019 characters), not the latest saved candidate. Inspected home, continued existing LSG 2010 career, XI, matchday and trade dialog. No captured console errors, broken visible images or horizontal overflow on inspected screens. No trades or releases confirmed.

At 844x390, the earlier patch produced a 140.8px header with 36px navigation controls. Root cause: <=960px grid rules place club context on a separate row. Latest saved CSS adds a three-column first row and second-row career navigation. This latest correction is NOT yet browser verified. Do not claim a 92px live header or complete visual QA.

## Next actions

1. Reconcile candidate and maintained CSS into the existing GitHub source/build structure without overwriting newer work.
2. Rebuild canonical candidate from authoritative source and check exact output equality.
3. Serve latest HTML through the user's existing localhost server, replacing its older same-name copy, then reload.
4. Verify Manage squad role colours, alerts, keyboard/reduced-motion states, desktop/portrait/844x390 landscape layout and header dimensions.
5. Commit implementation and concise verification evidence on the current work branch. Main remains unchanged.

Audio and export/import are excluded from this pass.

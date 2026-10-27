# GCC v83 visual corrections — 28 October 2026

Baseline v82: `5f8b35d4bf3de95853175f53136c552f8d6de8be`. Final SHA256: `12d12fa15b442f6b27725fbecefe9216d721bf336c1da125af926768cec17486`, 8,065,524 bytes.

## Reproduced problems and corrections

- Home exposed a prominent Restore backup action beside Play/Continue. It is removed from the start panel; Menu → Career backup still offers restore and download with the existing validation/review flow.
- A broad responsive hardening rule forced the club group to occupy a full flex row. Menu fell onto a separate row, leaving a large blank header area. An older mobile rule also set the GCC brand font to zero. The header now uses a shared first row for the wordmark and Menu; selected-club details occupy a full-width second row on smaller screens. The redundant mobile header slogan is hidden. Long names and enlarged text retain room without menu collisions.
- Broad skill-grid rules forced each offseason development label onto its own row, separating it from its change and rating values. The three intended columns now align with flexible label wrapping. No rating value or development calculation changed.

Only inline script17 (the home view) and the two affected CSS assets changed. The other19 inline script bodies, including the full engine, save coordinator and recovery controller, are byte-identical to v82. Single-file offline use and the random stadium homepage are preserved.

## Validation

- `regression-{RED,GREEN}.json`: removed start-panel file action, compact aligned mobile header, visible GCC brand, and backup still reachable through Menu. Four baseline failures became green; existing menu access stayed green.
- `header-{RED,GREEN}.json`:360 cases covering all36 club names, widths320/390/768/960/1024 and root fonts16/32px. The first compact-header candidate exposed some long-name collisions; the final layout fixes them. RED records that intermediate candidate, not an alleged v82 long-name failure.
- `development-{RED,GREEN}.json`: skill label/change/range share a row without overlaps at320/390/768/1440.
- `after/metrics.json`:84 native captures,21 screens at320/390/768/1440; zero page errors and no document-width overflow. Screens: home, story, league reveal, club selection, club guide, signings, draft, matchday, ladder, fixtures, league leaders, XI, player profile, match preview, live match, result, scorecard, season review, archive, offseason and trade. Saved review fixtures are positioned on their review view for presentation inspection; fixtures are not claims of newly simulated full careers.
- `browser-report.json`:324 club-guide cases (36clubs ×3widths ×3font sizes), readable club/ground/badge content, no horizontal overflow; all36 offline venue photographs decode with credits. Photos and club colours are unchanged.
- `integration-GREEN.json` and `recovery-ui.json`: exact committed-checkpoint recovery and both recovery choices under healthy/quota failures, including4 mobile layouts. Backup remains under Menu and is keyboard-accessible.
- `webkit.json`:13/13 actual WebKit26.5 lifecycle, modal, keyboard and paused-match navigation checks; zero page errors.
- `review.md`: independent focused code/accessibility review found no important blocker. Chromium accessibility tree and keyboard navigation preserve the home button, club identity, season context and Game menu with the structural wrapper using display:contents.

The4 draft captures retain a local3px decorative overflow inside the board; it does not expand document width and is outside the changed selectors. No global hiding of overflow or reduction of touch targets was used to conceal problems. Physical devices, spoken screen readers and installed Apple Safari are not certified by these headless checks.

## Reproduce

```sh
python qa/visual-20261028/build.py --promote
GCC_PHASE=GREEN GCC_FILE=qa/visual-20261028/candidate.html NODE_PATH=$CODEX_PRIMARY_RUNTIME_NODE_MODULES node qa/visual-20261028/regression.cjs
GCC_PHASE=GREEN NODE_PATH=$CODEX_PRIMARY_RUNTIME_NODE_MODULES node qa/visual-20261028/header.cjs
GCC_PHASE=GREEN GCC_FILE=qa/visual-20261028/candidate.html NODE_PATH=$CODEX_PRIMARY_RUNTIME_NODE_MODULES node qa/visual-20261028/development.cjs
GCC_PHASE=after GCC_FILE=qa/visual-20261028/candidate.html NODE_PATH=$CODEX_PRIMARY_RUNTIME_NODE_MODULES node qa/visual-20261028/scan.cjs
NODE_PATH=$CODEX_PRIMARY_RUNTIME_NODE_MODULES node qa/visual-20261028/clubs.cjs
python qa/visual-20261028/check_release.py
```

Use a suitable official Chromium runtime in place of the environment-specific `/tmp/gcc-chromium-complete`. The builder retrieves immutable v82 bytes from its pinned Git commit when baseline.html is absent. PNG/JPEG captures remain local review outputs; Git and the downloadable evidence archive preserve code and measured reports. This work does not repeat or supersede v82's full persistence stress audit; those implementations are unchanged.

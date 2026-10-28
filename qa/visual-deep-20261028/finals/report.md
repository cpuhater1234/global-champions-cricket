# Finals, review, legacy and archive visual audit

Read-only audit of frozen `../baseline.html` (shipped v83). No product changes. All outputs here are QA only.

## Reproduction

From repo root:

```sh
NODE_PATH=$CODEX_PRIMARY_RUNTIME_NODE_MODULES node qa/visual-deep-20261028/finals/reproduce.cjs
NODE_PATH=$CODEX_PRIMARY_RUNTIME_NODE_MODULES node qa/visual-deep-20261028/finals/stages.cjs
NODE_PATH=$CODEX_PRIMARY_RUNTIME_NODE_MODULES node qa/visual-deep-20261028/finals/probe.cjs
```

Uses restored Chromium `/tmp/gcc-chromium-complete`. Tests 1440×900, 768×1024, 390×844, 320×640 and 844×390. Fixtures are real saved completed careers: `qa/club-expansion-20261027/fixtures/GLA-review.gcc.json` (2008) and `qa/bulletproof-20261027/career/GLA-closed.gcc.json` (2026). Import uses `GCC8.read.restoreBackup`; views are presented with `GCC8.ui.view` / `render(true)` rather than replaying 19 seasons. Archive season and final scorebook are opened through actual buttons.

`stages.cjs` presents existing real finals teams/results with `finals.stage` set to ready/semis/gf-ready; gfPair is supplied from the real Grand Final when absent. These are presentation fixtures, not proof of normal engine flow. In particular the existing completed gf is retained, so the pre-final screenshots include a Final scorebook action which must not be reported as a product bug.

## Verified findings

### F1 — awkward orphan in long club name on phone (medium visual polish)

Evidence: `stage-semis-390.png`, second result. Nottinghamshire displays `Nottinghamshir` and a lone `e` on the next line inside its coloured label. This is legal wrapping, not hidden text, but looks unfinished in a high-visibility knockout result.

Selector/root: `.g8result .g8score h3 .g8teamlabel`; the `@container(min-width:18rem)` rule forces two equal columns with 1rem gap, while `.g8teamlabel` adds horizontal padding and `overflow-wrap:anywhere`. At 390 viewport each side lacks width for an ordinary 15-character club name. 320 is paradoxically cleaner because the container stacks.

Suggested fix: require a larger result container before using two columns (around 24rem; verify normal results too), or provide a deliberate compact mobile club identity treatment. Do not shrink every team name globally.

### F2 — legacy stadium panel has a large empty lower half at tablet (low)

Evidence: `2026-legacy-tablet.png`. At 768px the right stadium card stretches from approximately y217 to y988, but its photo and caption end around y572. The ~416px empty dark area dominates the end-of-career composition. Desktop also leaves a smaller empty tail.

Selector/root: legacy `.g8hero > .g8heroart` stretches to the height of the left record panel. Its image/caption keep their natural heights. The hero remains two columns at 768 while the left metrics wrap to two rows.

Suggested fix: legacy-specific `align-self:start` on the stadium panel, or switch legacy to a single column at this tablet width. Check desktop alignment and avoid changing the welcome hero unintentionally.

## Checks / caveats

- Visually inspected desktop review and legacy, tablet finals and Grand Final, phone semi-final results, 320 ready/done finals, review and legacy, full archive with expanded records, and fresh 320 archive scorebook.
- No document horizontal overflow in the screen/viewport matrix (`metrics.json` and `stage-metrics.json`).
- The wide scorebooks intentionally scroll horizontally; at 320 only player, matches and part of runs fit. DOM includes focusable labelled scroll regions through `X.accessibleTables`. This is not classified as clipping. A visible horizontal-scroll hint would improve discoverability but is optional.
- Short landscape scorebook fits the viewport with its own vertical scroll and visible close control (`final-scorebook-landscape.png`).
- Some repeated-resize scorebook screenshots have a partly shifted sticky header; a fresh 320 page is correct (`fresh-modal-small.png`, `probe.cjs`: dialog top12, height616, header top15, scrollTop0, close focused). Do not treat those repeated-resize captures as a verified production defect.
- This scope did not replay an entire season, exercise a super-over final, or assess every possible club-name length. No engine/simulation claims.

### F3 — final review retains next-season disclosure label (low copy polish)

Evidence: `2026-review-small.png`. Directly above “Your nineteen-season career is complete”, the expandable section still says “What to take into next season”. The final-career CTA correctly says “Finish your tenure”, making the label contradictory in context.

Root: `v.review` unconditionally renders the next-season disclosure label (baseline line9576). Suggested fix: year2026 copy such as “Season analysis” / “Reflect on the final season”, keeping the same data panel.

## Candidate regression

`regression.cjs` accepts `GCC_FILE=/absolute/candidate.html` and always uses a fresh page per viewport. Baseline fails both checks: Nottinghamshire has character line counts `[14,1]`; the tablet stadium panel has 428px trailing gap. Results and screenshots are recorded separately as `regression-*`. `reproduce.cjs` and `stages.cjs` also accept GCC_FILE for a full candidate matrix.

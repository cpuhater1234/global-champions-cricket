# Candidate finals / archive / closure verification

Audited exact SHA256 `e3c9123743392ab9f1257305233204d0e2b59888887cb780e0c2b5f382212329` (`qa/visual-deep-20261028/candidate.html`). All files in this directory are separate from baseline evidence. No product edits.

Matrix rerun: 1440×900,768×1024,390×844,320×640,844×390; finals completed, semi-final ready/results, GF ready, 2008 review,2026 review/expanded analysis,legacy,archive/expanded records,archive scorebook,final scorebook. All screen/stage document-overflow checks passed. Same fixture/presentation caveats as baseline report apply: setting UI view and controlled finals.stage is presentation setup, not an engine journey.

## Confirmed fixed

- Nottinghamshire now fits a complete line at390; native Range counts `[15]` (previously `[14,1]`).
- Legacy tablet stadium trailing gap14px (previously428).
-2026 review says “Reflect on your final season”; expanded text uses “FINAL-SEASON PHASES”, “final season”, and explicitly states no further season to prepare for. No next-season instruction in expanded visible text.

## Additional verified findings

1. **Super-over score/team contrast (important)**. A real saved match exists in `qa/club-expansion-20261027/fixtures/GLO-review.gcc.json`: Mumbai145/3,Melbourne Stars145/8,Stars win super-over. `find-superover.cjs` checks saved results and presents that match using UI.result; no match was simulated. Screenshots `superover-{1440,390,320,844}.png`. In `.g8superover .g8statrow`, club names are near-white and figures lightgrey on pale cream; both are hard to read. Global/result text colours override the panel's dark text inheritance. Scope explicit dark colours to the light super-over panel's b/span text (including scorebook context). No synthetic tie generated.

2. **320 expanded analysis label orphan (minor)**. `2026-analysis-small.png`: every “Conceded” label wraps “Concede” then lone “d” in the rate comparison rows. `.g8seasoncomparison` compare-read row label column is too narrow at320. Reserve sufficient label width or use a deliberate shorter label, maintaining values/bar widths. Same panel at390 is readable.

## Reproduce

Set `NODE_PATH=$CODEX_PRIMARY_RUNTIME_NODE_MODULES GCC_FILE=$PWD/qa/visual-deep-20261028/candidate.html` when running `candidate/reproduce.cjs`, `candidate/stages.cjs`, `candidate/regression.cjs`, and `candidate/find-superover.cjs` from repo root. Regression includes fresh independent pages per target viewport. Matrix modal capture retains repeated viewport interactions; do not infer header positioning failures solely from those captures. Fresh modal correctness was verified separately against baseline, and candidate phone archive scorebook is correctly contained and visibly closable.

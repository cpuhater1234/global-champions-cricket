# Shared analysis row review

Baseline: GCC_v116_Secondary_Review.html, af1e36b9c6b43fb914823e5949fa53d4ad22c82fec69f350b56472940a5ab322.
Candidate: 5c4bbca8873cd3e94bb1a62ac7a9a344edfc94a72848d8f373a6d15d43091fa2, 6,658,693 bytes.

Root cause: existing teamAnalysis prompt-specific rules did not govern shared draft/offseason analysis. Its 110px intrinsic tile minimum produced one tall column in the available narrow content width; legacy tile padding, label floors and value underlines remained.

Correction: edit existing owner 10 shared component rules. Shared analysis metrics become horizontal label/value rows with normal words, 44px minimum, quiet separators and no individual raised slabs. XI-specific layout rules remain in their existing scope. No new stylesheet. Exact source-body check: only body 10 differs from delivered Secondary Review; all 22 runtime bodies identical.

Native verification: run 43581971040 passed 8 draft/XI states with zero failures; final 320px draft raster inspected and compact rows confirmed. Expanded offseason follow-up 43582208534 failed on an exact-text test locator including the disclosure icon, not a game defect. Corrected locator targets the actual summary; run 43582518510 passed 20 states at 1440/768/390/320px with zero failures. Includes draft, XI dialog and expanded 2010/2020/2026 offseason analysis. Candidate hash unchanged. Targeted captures include only visible shared-analysis surfaces along existing disposable controller journeys. Reports retain zero-failure requirement, known-word checks, 12 metric count and compact row geometry. No user career actions. Candidate remains unpromoted. Draft 320px raster confirms compact rows; expanded 2010 offseason 320px raster inspected separately. Current user-opened Secondary Review remains unchanged; correction is staged for the next consolidated review bundle.

Continuity: active review branch remained at 1510a4c before this edit; separate career-record/club-flow branch at 91ab58e. main has external .gitignore (.env) and empty package-lock.json updates at 7e9d331, which does not alter the playable artifact. No merge from main was performed.

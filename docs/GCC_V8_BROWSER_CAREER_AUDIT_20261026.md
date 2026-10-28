# Browser career lifecycle validation — 26 October 2026

Both independent careers reached the end of2026 with19 archived seasons, then passed final native reload, archive-return, title/new-career cancellation and Continue checks. One confirmed archive-restoration bug was fixed. This establishes substantially stronger lifecycle evidence, not a guarantee of every possible state.

## Evidence

| Check | Result |
| --- | --- |
| Desktop career, Rajasthan Royals |2008–2026,19 seasons,266 managed league matches |
| Touch-emulated390px career, Melbourne Stars |2008–2026,19 seasons,266 managed league matches |
| Rendered-control actions |4,583, including resumed segments and repeated diagnostic paths |
| Chromium geometry checks |1,709; representative320/390/1280px and16/24/32px root-font combinations |
| Successful cold-reload checks in journeys |52 |
| Exact release-build annual checkpoint restores |38; all19 years from both actual browser careers |
| Exact release-build Firefox/WebKit checks |540 saved-fixture navigation/layout cases across2008/2014/2020/2026 |
| Exact release-build regression suites |14 passed; current trade fixtures used |
| Controlled storage disruptions |QuotaExceededError, SecurityError and simulated newer-tab save all preserve existing save bytes and career truth |
| Excess-retirement rendering |Two clubs with7 natural retirements each; list review, annual draw and supplementary slots render on mobile without overflow |

Every annual journey visits review, all completed archive seasons, offseason, annual draw/draft where vacancies exist, manual XI selection, all14 league rounds and finals. Scorebook, ladder, fixtures and statistics are opened. Strategy uses read-only bestXI/candidate queries to choose actions; every progression/selection uses rendered controls. No state jumps in career segments. Synthetic storage/retirement cases are explicitly separate.

## Confirmed fix

A2013 archive reload changed Brisbane Heat from15 to16 players. Returning temporary injury cover left a stale CPU XI cache. `repairCpuOwnership()` called `refreshCpuXIs()`, whose normal live-season behaviour can recruit replacement players. Reopening an archived year therefore changed squad ownership.

For archived years, cache repair now selects from existing healthy owned players without recruiting. Unarchived saves retain their existing refresh path. The next season performs its normal selection/cover refresh. A baseline-failing regression now passes and checks roster ownership, unique healthy cached players, player ownership/replacement flags, replacement links, transactions and RNG neutrality. A separate guard verifies live/unarchived refresh is retained. Independent review found no remaining blocker for this scoped fix.

Only embedded script10 changed from version76; both game aliases and the playable deliverable are byte-identical. Match delivery formulas and ratings were not changed.

## Interruptions and practical limits

These were **not uninterrupted careers on one final hash**. The initial fresh runs were continued from their actual native checkpoints after harness/environment interruptions and the reproduced source defect. Early direct `file://` reloads intermittently returned empty storage; the cause remains unresolved. Later long segments used native localStorage on a stable local HTTP origin. The final release separately restores every saved annual checkpoint without changing year, round, seed, teams, XI, batting order, results, table or history count. Endings were repeated on the exact release build.

The runner initially assumed a2026 review always needed Finish career; reload correctly restores the already-closed career to Legacy, so that harness assumption was corrected. Initial UI locators/empty-XI assumptions and error capture were also corrected. Original failed evidence is retained. These are not product fixes.

The first broad suite invocation included two obsolete tests: `departure-rules/package-test.mjs` expects2008 in-season trading/copy, and `departure-rules/transactions.mjs` assumes naturally exhausted CPU counterparts remain tradable. Both failed. The final14-suite run uses the previously established current2009-window package fixture (63 checks) and controlled-counterpart transaction fixture (127 checks), and all pass. No engine rule was changed to satisfy obsolete fixtures.

Firefox and WebKit previously passed540 baseline cases. Their runtime caches were later unavailable; reinstallation/extraction failures were repaired. On release, Firefox completed its4 fixtures/270 cases before the combined process failed launching WebKit; WebKit then completed4 fixtures/270 cases separately. These are saved-fixture engine checks, not full fresh careers in each engine.

No JS page errors or native storage-write failures were recorded in the completed career reports. Maximum instrumented native storage was2,692,738 UTF-16 bytes desktop and2,690,784 mobile. Timings include shared-runtime load and instrumentation; individual instrumented writes reached549ms/313ms and are not a clean production performance benchmark.

External image requests failed in this restricted environment (924 desktop,541 mobile, including repeated reload attempts). Branded stadium fallbacks were inspected, but successful live stadium-photo fetching is not certified. Physical phones, assistive technology, human first-time comprehension, empirical cricket balance and historical player-skill accuracy are outside this browser-lifecycle evidence. Direct-file persistence remains an unresolved compatibility limit; stable hosted-origin continuity passed.

## Reproduction and provenance

`qa/browser-career-20261026/summary.json` records exact baseline/intermediate/release hashes and resumed segments. Source runners, final compact results, raw-evidence manifest and regression logs are stored with the repository. Actual browser saves/raw reports are retained in the separate evidence archive identified by the manifest; screenshots are internal QA only.

Release SHA256: `c24b4893b9d83b55ad6f5db8baa9d3dbf3d135fdac12ce44dea6bcef2e51dd70`.

Playable replaced as version77. Raw evidence archive: `libfile_1819ce970e58819181bd79dc4cfca616`, version0;49 raw save/report files,51,375,227 bytes. It contains no source-code duplicates or screenshots.

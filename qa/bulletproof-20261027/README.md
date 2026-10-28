# GCC v80 audit, 27 October 2026

Release SHA256: `c7ba52edcbee16d66b8651362a61939cd6c0507382b6bea49f81b51869b1bafb`.

This pass found and corrected malformed league-table save acceptance, ambiguous successful-restore feedback under failed storage, unreachable player comparison, unintended second picks from a native double-click, and enlarged-text word fragmentation in career headers, navigation, fixture panels and dialog titles. Regression tests failed on v79 before fixes and pass after them. A source-update idempotence defect in the audit builder was also found by independent review and corrected before publishing.

The original 36 clubs, offline photographs, player data and cricket mathematics are retained. Only inline scripts 10 (validation/persistence) and 19 (UI controller) changed through five exact replacements; the other 18 scripts are byte-identical. Responsive fixes are in `v8/ui/bulletproof.css`. The source controller matches its embedded script in full.

## Measured coverage

- Three actual VM careers from 2008 through 2026: 57 seasons, 798 managed regular-season matches, 3,192 total league matches and 171 finals. The finals count is reconciled from recorded player appearances, not assumed. All three closed correctly and prevented 2027/duplicate archives.
- 5,721 archived player-season rows and 309 current stat rows checked. Final candidate restored all 13 retained career snapshots; the three final closed careers matched cold-restored gameplay state.
- Real manager APIs exercised drafting, annual releases, retirements, accepted/rejected trades, two-trade limits, injured keeper/bowling cover and cover removal. Initial harnesses omitted required manager cover actions and were corrected and resumed from genuine checkpoints, without skipping rounds. Those initial failures are retained and explicitly are not product defects.
- Controlled venue counterfactual sweep: 1,440 actual innings pairs, 2,880 innings, 314,820 deliveries and 8,804,235 assertions across all 36 ground priors. This is not 1,440 complete career fixtures or empirical venue calibration.
- Player/decision suite: 16,156 checks, 412 profiles, 5,149 active player-years, plus 500 controlled stronger/weaker innings-pair challenges. Pure career-outcome, chase, delivery, delivery-boundary, CPU-market and migration suites passed.
- Saves: 77 existing integrity checks, 83 adversarial scenarios including 34 older test saves, 24 table-validation cases, native quota/blocked-storage recovery and healthy recovery. Unknown-screen normalization and dormant post-draft pickIndex are documented controls, not repaired bugs.
- Chromium: 432 initial viewport/text geometry cases, then exact-final affected comparison/header/navigation/fixture regressions and native interaction checks. Double-click selects one player; two separate clicks and two keyboard activations still select twice when the snake allows it. Paused match resume, accepted/declined trade repeated clicks, backups, dialog Escape/keyboard/scroll and scout cycles were exercised. Final screenshots were visually inspected.
- All 20 inline scripts parse; 192 static DOM IDs are unique; no external scripts. Independent review found no remaining Critical/Important change defect.

## Reproduce

From a normal Git checkout, run `python qa/bulletproof-20261027/build.py --promote`. The builder reads immutable commit `4ee466683f822a6e942d63c99ea55406a87f6f90`, checks its v79 hash, applies the exact patches and appends scoped CSS. Do not use the old `v8/build.py --freeze` to reproduce this release.

`python qa/bulletproof-20261027/run.py` runs static and focused regressions. It requires Node and the retained synthetic fixture overlay from the evidence archive. Native tests additionally require Playwright and an installed Chromium; set `GCC8_CHROMIUM` to its executable and `NODE_PATH` when Playwright is not locally resolvable. The test hosts are `qa/offline_game_host.mjs` and `qa/logic_game_host.mjs`. The VM host does not prove rendered behavior. Browser tests explicitly distinguish real control clicks from fixture injection.

The evidence archive preserves synthetic saves, scripts, initial failed harness logs and final results. It excludes browser screenshots. `summary.json`, `career/summary.json`, `saves/release-runs.json`, `browser/REPORT.md`, and `review.md` identify the final evidence. Historical report hashes remain attached to the builds they actually tested. Full careers and the cricket sweep ran on v79's identical simulation; final saves and UI regressions ran on v80. Do not relabel every historical run as a fresh final-build run.

## Remaining limits

This pass does not certify physical devices, Firefox/WebKit, screen-reader users, every browser storage policy or OS/power-loss event, subjective enjoyment or historical rating accuracy. The earlier intermittent browser save disappearance remains unreproduced. Portable backups remain the independent recovery route. Passing these measured checks is not proof that every possible bug is absent.

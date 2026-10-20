# Microscopic audit, 20 October 2026

## Scope and baseline

Starts from GitHub working-branch commit `74af2d3996b42e669138dbea181691cebcfbf5b9`, delivered HTML SHA-256 `80878842a99700dee5fc96152ad5b09d8b7ab3cc4997ea78c55fa0249c557046`. Covers the actual delivery engine, CPU decisions, career progression, saves and interruptions, commands, native interactions, responsive geometry, contrast, keyboard operation and text sizing.

The first broad batch passed 58/62 suites. Four tests still asserted retired layouts or wording: permanent ability bars, injury-cover actions on the team page, the previous management overview, and old age wording. Assertions were migrated to the current candidate/detail/pane paths; gameplay, ownership, recovery and identity assertions remain. The eight-club baseline matrix passed eight independent three-season runs. Those baseline results do not establish the corrected candidate's result by themselves.

A fresh seed `20261020`, club index `3`, stopped at the 2011 grand-final-ready cold restore. This was a real state change, not object-property ordering: batting positions one and two changed from McCullum/Trescothick to Trescothick/McCullum. The saved order was initially restored correctly, then an engine render recalculated it under a different injury-fitness context.

## Confirmed defects and repairs

| Finding | Cause and repair | Regression evidence |
| --- | --- | --- |
| Batting order changes on reload or profile display | `syncBattingOrder` recalculated any untouched natural order on every read. Preserve a valid existing order; repair missing/stale/duplicate membership and retain explicit Natural order. | Failing 2011 checkpoint; targeted profile/render/cold-restore tests; independent invalid-order checks; fresh career rerun. |
| Trade ownership metadata stays with old club | CPU and user trades changed roster arrays without changing `draftedBy`. Update both traded players. | Actual CPU market and accepted user exchange checked. |
| Legacy trades misattribute development | Annual development captured `draftedBy` even if stale. Use authoritative roster ownership when capturing the next annual boundary. Existing historical rows are not rewritten. | Deliberately stale legacy metadata maps to current roster owner. |
| Zero-legal-ball chase treated as 120 balls | Falsy fallback converted valid zero to120 in NRR and remaining-ball wording. Use nullish fallback, retaining the existing one-ball NRR floor and full-innings treatment of all-out sides. | Actual winning wide before a legal delivery; ladder arithmetic, remaining-ball text and legacy missing-value cases. |
| Dialog replacement loses keyboard focus | Replacing content removed the focused control while the open dialog was never refocused. Focus the new content while retaining the original opener. | Native Scout → Compare → Escape checks. |
| Mobile tables cannot be keyboard-scrolled | Overflow wrappers lacked a focus stop and accessible region name. Add them when needed, remove them when desktop layout fits. | Native ArrowRight scrolling and resize checks; automated accessibility scans. |
| Low contrast in trades/results/archives | Legacy pale select/chip surfaces and dark result/archive text remained after theme changes. Migrate explicit colours to readable dark-theme pairs. | Automated contrast tests on actual computed surfaces, including later finals and archives. |
| Malformed saved navigation can open a blank screen | View lookup accepted inherited Object keys such as constructor. Use a null-prototype view map and a function/type guard. | Seven malformed navigation values safely fall back. |
| Enlarged opening title overflows | The rem minimum exceeded the actual column at150–200% text sizing. Let the column-based size fit without that conflicting minimum. | Sixteen narrow/wide text-size cases, plus603 width/font checks. |
| Brief button contrast loss between screens | A reused button animated its old bright background toward transparency while its new light foreground applied immediately. Keep border animation without background interpolation. | Immediate screen-transition inspection and contrast rechecks. |

No cricket ratings, player data, league format, release limits, manual-XI rule or save-format changes. Real photographs and random home-ground choice remain.

## Verification record

Final stable batch: **63/63 suites and 8/8 club runs passed**, with no changed source or artifact inputs. The full career plus club matrix covers **43 seasons and 602 managed league matches**. Browser geometry/accessibility scans passed **497 screen states**, plus **144 expanded interaction cases**, **603 title width/font cases** and **16 text-scale cases**. The native fresh-career journey completed 146 actions, 22 manual XI selections and 15 league matches across two seasons. Injury-cover signing, manual replacement and cold restoration passed in a separate controlled-injury browser fixture.

The nineteen-season run used the immediately preceding HTML candidate; its executable script payloads are byte-identical to the final artifact. The final differences are CSS fixes for enlarged title fitting and transient button contrast. Final HTML SHA-256: `25e6ea914053a861b2db2be1582f429ccaa60132c0e495f944431a341207d6b6`.

Machine-readable final outcomes, exact artifact/script/report hashes and scope distinctions are in `qa/GCC_V8_MICROSCOPIC_EVIDENCE.json`. Raw execution evidence is generated under `qa/microscopic-20261020/`; large saves and screenshots are not committed as source.

The test layers have different purposes:

- Runtime suites check commands, guards, CPU choices, scouting fairness, development, release/trade consequences, retirement/draft policy, storage/codec behavior, corruption rejection, clocks, playback, scoring and statistics.
- Delivery properties independently reconcile every ball, extras, legal balls, wickets, free hits, strike endpoints, bowling limits, chase completion and Super Overs. A large assertion count is not a count of unique gameplay scenarios.
- The fresh nineteen-season run checks actual career continuity and cold restoration, including the seed that exposed the finals defect. The club matrix checks all eight takeover choices across three seasons each.
- Native browser checks exercise clicks, selection, replacement, keyboard focus, dialogs, reloads and the start of a second season. Fixture-based screen audits additionally inspect later-career and finals states without claiming new match simulations for those screenshots.
- Automated accessibility checks cover WCAG2A/AA and2.1AA tags supported by the installed axe engine. This is not an accessibility certification or screen-reader speech test.
- Multi-tab browser probes preserve newer saves when a stale tab acts. Controlled write failures retain the prior saved bytes, keep the UI usable, show a warning and recover on a subsequent successful write.
- Performance probes measure actual browser Continue handling and100 unchanged rerenders, with DOM growth checked. Timings come from a shared host under concurrent load and are diagnostic, not user-device benchmarks.

An intermediate rerun had passing suites but reported changed inputs while an earlier candidate was being rebuilt. It is excluded from authoritative final-batch evidence. The final verified runs use separate directories and stable candidate inputs.

## Reproduce

```sh
python3 tools/source_workspace.py build game/global_champions_cricket_v7_9_3_layout_rebuild.html
python3 v8/build.py --freeze --output game/gcc_v8_microscopic.html
GCC8_TEST_BUILD=game/gcc_v8_microscopic.html GCC8_BRUTAL_DIR=qa/microscopic-20261020/verified-suites node qa/v8_brutal_runner.mjs
GCC8_TEST_BUILD=game/gcc_v8_microscopic.html GCC8_BRUTAL_DIR=qa/microscopic-20261020/verified-clubs node qa/v8_brutal_runner.mjs clubs
GCC8_TEST_BUILD=game/gcc_v8_microscopic.html GCC8_TEST_SEED=20261020 GCC8_TEST_CLUB=3 GCC8_STORAGE_LIMIT_BYTES=5242880 GCC8_TEST_REPORT_DIR=qa/microscopic-20261020/career-reproduction node qa/v8_game_test.mjs
GCC8_TEST_BUILD=game/gcc_v8_microscopic.html node qa/v8_microscopic_regression_test.mjs
```

Fixture-based tests require the provenance-recorded saves described in `docs/GCC_V8_STABILISATION.md`. Browser audits require Playwright, a compatible Chromium executable and axe-core; the test scripts explicitly record image failures for deterministic geometry. Browser paths can be adapted to the local test environment.

## Remaining limits

No finite audit proves every facet defect-free. The tested browser is headless Chromium on Linux, not every Windows/macOS/mobile browser. Genuine tab-visibility/background throttling could not be certified: CDP freeze/resume did not change `document.hidden`. Truly simultaneous cross-process storage writes, screen-reader spoken output, real device/touch performance, every live remote photograph and unfamiliar-player enjoyment remain outside this evidence. Existing programmatic visibility/clock regressions still run.

The concrete defects above are actionable findings, not reasons to discard the substantial simulation. Release confidence should follow the final evidence and observed playtesting rather than the number of automated assertions alone.

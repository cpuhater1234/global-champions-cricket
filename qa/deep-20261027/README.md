# GCC v81: save coordination and deeper audit

Candidate SHA-256: `0f643bb049f277dd57550ad9fb8d6134c51ed102d3ffa00a53d20f68e10876e4` (8,053,567 bytes). Base: v80 commit `afe67378cf3e415683af2ff43ecd24e5a3638319`, SHA-256 `c7ba52edcbee16d66b8651362a61939cd6c0507382b6bea49f81b51869b1bafb`.

## Confirmed defects and bounded fixes

1. Actual overlapping native tab saves silently overwrote divergent careers in 20/20 baseline races. Compare, serialization and both writes now run under the same browser Web Lock; the final candidate accepts exactly one writer and refuses the stale divergent writer in all 20 repeated races. Existing token conflicts remain active. Do not keep an older GCC build open alongside this version: older writers do not participate in the lock.
2. Squad/matchday navigation serialized and wrote the entire late-career payload twice. Requests made before lock acquisition now coalesce. Eight actual clicks on the coordinated candidate wrote/serialized once each, preserved gameplay truth and restored the correct destination in cold contexts. Direct engine navigation still saves.
3. Queued saves were indistinguishable from failure. The HUD now distinguishes pending from actual failure, and restore feedback waits for completion. An exit guard is active during pending/failed saves and is removed on successful recovery or intentional reset. The native reload prompt was exercised; it cannot guarantee a prompt on every mobile platform.
4. Career replacement invalidates old queued generations. Clear uses the same lock. Independent review found that a queued clear could delete a subsequently restored career; the final generation/suspension guard cancels that obsolete clear before removal or reload. Both ordinary and superseded clears have held-lock native regressions.

5. A fresh career replay found an accepted 2010 trade of the only keeper (Denesh Ramdin for Graeme Swann), leaving a full permanent XV and no draft vacancy. A targeted guard now refuses full-roster trades that remove the keeper or reduce bowling capacity below twenty overs; genuine vacancies remain allowed. Two original cases and six independently added role boundaries pass, with baseline RED evidence. Five bowlers delivering exactly twenty overs and keeper exchanges remain permitted.

The engine/controller changes concern persistence/status and this roster-validation guard. Eighteen other script bodies are byte-identical to v80; source parity checks cover the full embedded engine and controller. No player attributes or cricket model are rebalanced.

## Evidence and reproduction

Run from the repository root. Native tests require Playwright, `NODE_PATH` pointing to its installation, and Chromium at `/tmp/gcc-chromium-complete` (or the individual script's documented environment override).

- `python qa/deep-20261027/build.py` reproduces the candidate. In a full clone it reads the immutable baseline with `git show`; this partial audit workspace also retained `baseline.html`. `--update-sources` applies idempotent engine/controller changes; `--promote` updates both standalone aliases. Do not use the older freeze builder for this release.
- `GCC8_TEST_BUILD=qa/deep-20261027/candidate.html python qa/bulletproof-20261027/core/static.py`: 20 scripts parse, 194 static IDs unique, no external scripts. Its output path is the older core directory; this audit retains a copy as `static.json`. The historical v7 checker intentionally targets nine scripts and remains unchanged; it is not the v8 promotion checker.
- `node qa/deep-20261027/performance/coordinator-review.cjs`: five deterministic coordinator cases, including late save requests and lock rejection. Its logged synthetic rejection is expected.
- Native persistence (final candidate `0f643bb…`): `pending-final.cjs` (11), `concurrency-green.cjs` (20 races), `GCC_PHASE=release ... exit-guard.cjs` (6), `clear-lock.cjs` (2), `clear-supersede.cjs` (2). `*-release.json` and final logs identify current release runs. Original RED evidence remains separate.
- Trade validation: `full-roster-trade.mjs` (two real-checkpoint cases) and `trade-role-boundaries-review.mjs` (six controlled role boundaries). The baseline accepts both prohibited trades. Positive boundaries test the new guard, not a promise that the CPU accepts any particular offer. The immutable actual input is `regressions/trade-before-2010.gcc.json`.
- Existing integrity: `GCC8_FIXTURE_DIR=qa/club-expansion-20261027/stock-fixtures GCC8_TEST_BUILD=qa/deep-20261027/candidate.html node qa/deep-20261027/regressions/final-baseline77.mjs` (77). `final-adversarial.mjs` (83), table validation (24), native restore feedback (healthy/quota) and storage recovery (6).
- `GCC_PHASE=candidate GCC8_TEST_BUILD=qa/deep-20261027/candidate.html node qa/deep-20261027/browser/lifecycle.cjs`: 13 native lifecycle/accessibility checks. Real pagehide/away/back, paused match resume, modal timer pause, nested focus return, native accessibility tree and touch emulation. See its detailed report for platform limitations.
- `node qa/deep-20261027/combinations/slots.mjs`: 4,096 pure-domain combinations / 771,430 checks / 23,703 traded-slot assignments, not 4,096 whole careers. Retirement fixtures force 0/1/3/4/5/8/12 exits, exercise releases, real offseason APIs and mid-draft cold restore, and produce eight legal squads. The one-exit case includes an actually accepted round-one pick trade. These runs target unchanged v80 gameplay, not natural retirement frequencies.
- `CODES=PBKS node qa/deep-20261027/regressions/full-career.mjs`: fresh final-candidate 2008–2026 VM regression; progress and final report are retained under `regressions/career`. This uses real game APIs and unmodified function bodies with a DOM stub. It is not a browser performance test.

Some investigative artifacts predate the final candidate. `build.json`, `source-parity.json` and final release runs identify exact current bytes; earlier bounded measurements are explicitly not relabelled as final-hash runs. The prior v80 audit's three careers / arithmetic matrices are separate evidence, not new executions in this pass.

## Limits that remain

A whole-browser crash reproduced rollback of an acknowledged localStorage write (latest seed reopened nine below the accepted marker). Graceful close/relaunch passed. A synchronous HTML localStorage API does not provide a forced disk-flush guarantee. Web Locks prevent the observed application overlap race; they do not fix that browser durability boundary or establish the original intermittent save-loss cause. Downloaded portable backups remain the recovery route independent of browser storage.

Concurrency guarantees require all writers to use this lock and a context supporting Web Locks. The synchronous fallback and mixed old/new builds are not certified for simultaneous saves. An indefinitely held lock leaves progress visibly pending; do not treat pending as saved. Exit warnings are opportunities, not crash-safe flushes.

No installed Firefox/WebKit runtimes, physical-device certification, real screen-reader listening, human first-use playtest, persisted-true bfcache return or empirical historical calibration were completed. The game is substantially harder to break; this audit does not certify universal correctness.

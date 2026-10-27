# Actual app native persistence integration

Final UI-feedback candidate tested: `qa/limits-20261027/candidate.html`, SHA256 `4a3d4d919d2fdd35d490f5e2f57359bb5fe65d209873a2f89353ee9735aa2453`. SHA was checked before the run (recorded in results.json) and after completion and was unchanged. Final verification UTC: 2026-10-27T12:49:23.654948+00:00. Chromium `153.0.8010.0`, checkpoint mode `strict`. This report and results.json supersede the earlier c3d1693 run.

**Final result: PASS — 10/10 crash cycles, 3/3 controlled primary recovery cases, 14/14 two-tab races.** Script uses actual game restoreBackup/saveAsync/flushSave/checkpointReady APIs. Initial career is the full GLA latest backup. All persistent profiles are isolated under /tmp/gcc-native-*. Native IndexedDB and localStorage are otherwise unmodified except the three named primary corruption fixtures. No product files modified.

## Crash/recovery

Ten complete game saves set distinct seeds 2300000000 through 2300000009 and await saveAsync true. Immediately afterward the script opens a CDP session and sends Browser.crash without an intentional persistence grace period. A fresh browser is launched against the same profile. The native database gcc-career-recovery-v1/checkpoints/career raw is parsed; its seed must equal the target. The actual recovery button is clicked when offered, otherwise the actual Continue career button; the resulting live game's seed must also equal target.

Three further controlled fixtures keep the native checkpoint intact while replacing the primary localStorage career with an older valid save, removing it, or corrupting it. Each reload must display the real Use recovery checkpoint button. After clicking, live seed must equal the checkpoint target, and checkpoint raw must have remained intact before selection.

## Cross-tab coordination

Fourteen races use two actual app tabs with navigator.locks deliberately undefined before page scripts run. Both restore the normal career through restoreBackup and await completion. A frozen save timestamp only during baseline synchronization makes the common saved token identical; native storage methods and IndexedDB transactions are not replaced. The race restores real Date.now, changes each live seed independently, and releases saveAsync at the same future time. Each round requires precisely one accepted save, one refusal with saveConflict true, and both native checkpoint and primary save matching the winning seed. No forced private save token, storage barriers or synthetic IndexedDB implementation are used.

## Limitations

One Chromium build and file:// origin only. Browser-process crash tests do not certify OS crash, power-loss, physical disk, browser eviction, user deletion or cross-device durability. saveAsync true in this mode is a completion acknowledgement under the application's native strict IndexedDB contract. The test does not inspect physical fsync implementation. Native IndexedDB serializes tested transactions; the application still relies on its transaction-contained primary token check for stale-writer refusal.

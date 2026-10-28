# Checkpoint store native validation

2026-10-27. Chromium 153 executable `/tmp/gcc-chromium-complete`, Playwright isolated browser context, synthetic file origin. No game browser profile used.

Reproduce from repository root:

`NODE_PATH=$CODEX_PRIMARY_RUNTIME_NODE_MODULES node qa/limits-20261027/store/test.cjs`

Initial RED: factory assertion failed (`undefined`, expected `function`) before production asset creation. GREEN after implementation; expanded native regression checks all passed:

- Actual strict transaction reports strict mode, acknowledged value and subsequent committed record readback.
- Synchronous mutator exception aborts transaction; prior committed record survives.
- Two real pages each execute 40 overlapping increments; final checkpoint is exactly 80.
- Held native readwrite transaction prevents a queued store transaction from starting. Native watchdog aborts queued transaction; mutator calls remain zero, release causes no late write, stored count remains 80, subsequent explicit transaction succeeds with 81.
- Fresh store connection reads committed count 81.
- Unsupported options (instrumented transaction API throwing) fall back to transaction mode and successfully commit; ignored option (instrumented API stripping dictionary) also reports transaction, never strict.
- Denied open (instrumented SecurityError) resolves ready to null and exposes unavailable mode/error.
- Real version upgrade closes existing connections through versionchange and updates availability/mode/error accurately.

No complete project test command/package manifest is present in this partial tree; root integrator owns full game validation. These are generic store tests, not application recovery/token/generation acceptance tests. Denied/unsupported behavior uses browser API instrumentation, not operating-system policy changes. Commit-already-in-flight InvalidStateError branch, quota exhaustion and late-open timeout are not reproduced by this focused suite. No power-loss claim is made.

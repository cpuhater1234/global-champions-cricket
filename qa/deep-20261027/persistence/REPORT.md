# Deep native persistence audit

Canonical product untouched. Native Playwright Chromium `/tmp/gcc-chromium-complete`, persistent profile, local `file://` app, foundation synthetic fixture. Run: `NODE_PATH=$CODEX_PRIMARY_RUNTIME_NODE_MODULES node qa/deep-20261027/persistence/native.cjs` (use a fresh profile directory before repeats).

Final run: **24/25 checks pass; one deliberate immediate-browser-crash durability check fails**. `results.json` is the authoritative count. This is not an all-green persistence certification.

Passing coverage: clean persistent-context close/relaunch preserves exact stored bytes and Continue works; actual renderer tabs reject stale writes in both directions; stale backup token refuses replacement; deliberate restore and deliberate Start again replace the stored career; older tab cannot roll either replacement back; externally cleared storage remains cleared rather than being repopulated from stale memory; retained memory remains exportable; initial save-write failure leaves no fake save and allows backup export; optional metadata write failure leaves primary save correctly committed; storage read failure refuses save.

Both different local HTML paths shared the same `file://` storage bucket in this Chromium. Renaming a downloaded copy did not reproduce missing storage here. Portable restore into that copy works. This observation must not be generalized to other browsers or profiles. No origin/security settings were changed.

## Reproduced durability limitation

Immediately after a successful localStorage write, `Browser.crash` terminates this test browser without its ordinary close. Reopening the same persistent profile can recover earlier storage. Final run reopened seed **2030044864** versus **2030044873** in the pre-crash successful write (the test deliberately changes seed by 9 to expose rollback). Continue still succeeds. Previous exploratory crash runs recovered an earlier timestamp, and one recovered null after external-clear/rewrite. `failure.json` documents the latter harness's null-handling exception, not an application exception. `precrash.json`, `results.json`, and `crash-diff.json` provide evidence. The diff helper compares a packed pre-crash envelope with decoded data, so its packed-results differences are representation noise; the seed difference is real.

Root boundary: engine `autoSave` uses synchronous `localStorage.setItem` (around product line 8695); this confirms browser storage acceptance, not guaranteed disk flush after abrupt browser death. Graceful close/relaunch passed. No minimal HTML-only synchronous flush fix can be claimed from this evidence. Do not add retry loops or describe the historical lost-career report as fixed. Practical mitigation is portable downloaded backups and accurate browser-only autosave expectations; any stronger durability redesign needs separate product authorization and investigation.

## Limits

Synthetic fixture, Chromium only, one sequential interleaving per two-tab direction; no real simultaneous read/check/set race, no actual match progression in this focused suite (seed marks writes), no Safari/Firefox/mobile, no OS/power-loss simulation. Crash exercised the isolated test browser only. No product edits or GitHub mutations.


## Separate application defect: concurrent-tab check/write race

`concurrency.cjs` exercises two actual pages in one persistent native context, loading the 2026 GLA fixture. Both pages have the same legitimate engine save token before each race (only setup saveStamp is fixed so sequential setup saves do not invalidate each other); native getItem/setItem remain real, with read-only timestamp/hash logging. Each page changes its own seed marker and begins save at a common real-time deadline. **Final result: 20/20 rounds reproduce silent divergent overwrite.** See `concurrency-results.json` for final counts and ordering.

Reproduced in all twenty rounds: both `save()` calls return true, both read exactly the same baseline bytes, each writes its own divergent marker, and only the final writer survives. This is a genuine application TOCTOU defect, distinct from the browser-crash durability limitation. The sequential stale-tab checks pass but do not serialize overlapping autosaves. Root cause at `autoSave`: getItem equality check happens before expensive serialization and setItem; another renderer can pass the same comparison before either write commits.

Minimal architectural fix proposal: serialize the complete compare/serialize/commit operation with one shared browser coordination lock (e.g. Web Locks on supported contexts), then reread and compare the stored token inside that lock and propagate asynchronous save status correctly through UI callers. A second unlocked getItem immediately before setItem narrows the race but does not prove atomicity; a localStorage lock flag/revision alone has the same check/write race. Browser support and fallback behavior require explicit design. No product changes made.

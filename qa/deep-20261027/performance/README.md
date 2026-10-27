# Native performance deep audit

Final implementation note: the shared coordinator was selected because the independently reproduced overlapping-writer race requires atomic compare/serialize/commit. Its coalescing also resolves the duplicate navigation writes. The final candidate repeats all eight clicks at one serialization/write each, two exact cold destination restores and one direct-navigation save. Earlier proposed specialGo-only changes below are historical recommendations, not shipped changes. Shared-CPU timings remain diagnostic.

Baseline product SHA256: c7ba52edcbee16d66b8651362a61939cd6c0507382b6bea49f81b51869b1bafb. No product edits made. Playwright launches /tmp/gcc-chromium-complete against a script-local HTTP server. All timings are this shared host's native Chromium measurements, not physical hardware FPS or Node VM estimates.

## Confirmed defect: duplicate full saves on navigation

`probe-input.cjs` performs visible native button clicks alternating squad and matchday in a restored GT2026 career. Every one of eight successful clicks produces TWO full career JSON.stringify calls and TWO localStorage writes of ~1,339,370 characters. Exactly one final write is necessary to persist updated v8UI.

Call stacks in native-input.json:

1. careerSection -> G.go/specialGo (8176) -> autoSave (8695).
2. X.dispatch (9741) -> UI save (9516) -> read.save (8811) -> autoSave (8695).

For matchday navigation, first save currentScreen is season but dynasty.v8UI.view is still team; second save updates it to season. Preserve final metadata and suppress/defer intermediate engine save inside the dispatch transaction, rather than dropping UI's final save. Do not change simulation RNG or deduplicate via seed-dependent state changes.

Focused deterministic RED command:

```
ASSERT_SINGLE_SAVE=1 NODE_PATH=$CODEX_PRIMARY_RUNTIME_NODE_MODULES node qa/deep-20261027/performance/probe-input.cjs
```

Observed exit 1; red.log records the assertion. The assertion bounds writes, never wall time. Input probe adds JSON serialization accounting, storage write stack capture, and parsed metadata inspection. Its latest timing numbers include this diagnostic overhead; do not use those numbers as clean product timings.

Before adding stack/JSON parsing instrumentation, actual native click Long Tasks were 120–264ms at CDP1x and591–752ms at CDP4x in one run; a subsequent serialization-instrumented run was118–659ms and634–1048ms, illustrating shared CPU variation. Wall click time includes Playwright actionability and an intentional60ms observer flush, and is not input handling duration. CDP throttle is local browser emulation only.

## Baseline load, resume, interactions

`probe.cjs` and native.json use native page.evaluate dispatch timings, explicitly not browser input Long Task measurements. One run:

|Fixture|Navigation load wall|Restore backup synchronous|Continue synchronous|
|---|---:|---:|---:|
|2008 foundation|337ms|461ms|364ms|
|GT2026 latest|404ms|767ms|705ms|

2026 squad/matchday synchronous dispatch typically111–118ms, inspect ~59–68ms, compare53ms. 2008 help dialog open/close ~30–42ms. Save payloads2008 ~1.015m chars;2026 ~1.339m chars. Storage.setItem itself ~8–13ms in this run; serialization, engine rendering and UI rendering add more work.

R.profile wrappers observed0–2 calls per careerSection click, not1365 bestXI combinations. Source bestXI enumerates C(roster,11), e.g.C(15,11)=1365, but do not assume that path caused the measured navigation stalls.

## Accumulation and memory bounds

After20 repeated dialog/navigation cycles in probe.cjs and explicit CDP GC:

|Fixture|DOM nodes before/after|JS event listeners before/after|JS heap used before/after|
|---|---:|---:|---:|
|2008|4509 /2707|95 /77|73.4MB /18.2MB|
|2026|3237 /2544|74 /75|43.3MB /27.0MB|

Before values were not forced-GC snapshots; therefore heap decreases are not a leak proof. No monotonic node/listener growth demonstrated in this bounded run. Additional native input cycles have listener variation with different rendered views. GCC8_CLOCK.pending was0 before/after each of8 navigation clicks. Chromium exposes Performance metrics and performance.memory in this environment; no claim of process RSS or precise retained heap ownership.

## Limits

No newseason/draft/CPU market throughput or search input timings were completed in this focused pass. Foundation fixture restores to completed team room, and late career fixture to2026; manufacturing an earlier offseason by mutating year would not be faithful evidence. No sustained match animation FPS measurement. No Node VM timing is presented as responsiveness. Test files are QA artifacts and not shipped product changes.

Regression also verifies isolated cold Continue restores after squad and matchday navigation return to matching UI/engine destinations; year, seed, weatherSeed, pool, teams, XI, batting order, round, results, schedule and history survive unchanged. Both destination restores and gameplay preservation passed baseline. Direct G.go('season') default persistence writes exactly once (passed baseline). Only the <=1 write-per-navigation assertion is RED.

Recommended fix scope: add optional persist argument to specialGo with default true and pass persist:false only from the two careerSection G.go calls; retain final UI dispatch save. This is narrower than global engine autosave deferral and preserves default engine caller persistence and exception behavior elsewhere.

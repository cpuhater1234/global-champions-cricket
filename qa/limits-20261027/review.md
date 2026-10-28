# Independent persistence review

Reviewed candidate SHA c3d1693bd008571eae71c6cfdad4ba6807fe16756ac1606a0569ca4c924cfd60 against design.md, plan.md, patches.json, coordinator.js and v8/domain/checkpoint_store.js. Product files were not edited.

## Important findings confirmed with native Chromium

1. A corrupt current checkpoint hides a valid retained previous checkpoint. Startup only validates record.raw. With missing primary, invalid current raw and valid previous codec bytes, recoveryInfo() is null. The retained recovery career is unavailable to the user. Required change: validate available checkpoint candidates and offer the valid previous copy explicitly, preserving primary token review and tombstone semantics.
2. A held Web Lock is unbounded when AbortController is absent and IndexedDB is unavailable. withStorageLock invokes navigator.locks.request directly in this branch. Native fixture remains pending after 4.6 seconds with empty error and unavailable checkpoint mode. Required change: refuse unsafe automatic saving in this capability combination or implement a bounded acquisition with late-callback cancellation, without reporting a committed failure prematurely.

Both are reproducible with `node qa/limits-20261027/review-cases/regressions.cjs`. RED evidence: review-cases/results-RED.json. Set GCC_PHASE=GREEN after rebuilding to retain independent evidence.

## Reviewed paths without additional blockers

- Primary compare/serialize/write occurs inside the coordinating callback. Cooperating v81 Web Lock writers cannot slip between token check and primary write; newer differing primary bytes produce explicit recovery choice at startup.
- Strict checkpoint success comes from transaction completion, not request acceptance. A transaction abort after localStorage acceptance cannot set saveSucceeded; the new local token remains the local retry baseline, while an external write is still detected.
- Recovery selection verifies the reviewed primary token before resume; unresolved recovery blocks ordinary UI dispatch and autoSave. Missing or invalid current checkpoint does not replace valid primary bytes.
- Queued save callbacks check the generation. Clear invalidates saves, checks its generation before removals, and writes its tombstone in the transaction. Reload follows completion only when its generation remains active. Restore invalidates the clear generation, so late clear completion cannot reload over the restored career.
- Store opening is bounded and late successful connections close. Queued transactions abort on timeout. A transaction already past abortability retains pending/slow status until its terminal event, avoiding invented outcome or retry.
- When neither exclusion mechanism exists, the candidate refuses automatic saving. Non-strict or unavailable recovery modes do not claim strict crash protection.

These conclusions are source review, supplemented by the two independent native regression fixtures above. Existing crash, race, restore, integrity and browser regression results were not independently rerun during this review. No simulator changes were proposed or made.

## Resolution

Both findings reproduced RED on c3d1693b and passed GREEN on final4a3d4d91. Startup validates current then retained previous bytes. No-AbortController/no-IDB refuses the unbounded path. A separate recovery-feedback RED reproduced a stale Saving progress message, then final integration and8 layout/feedback cases passed after completion feedback was tied to the current save generation.

# Independent save coordination review

Reviewed candidate `6f3ad5c6ab24207b6bca7cb4557fbd8a19401d749c3af16abd64dab7d4994090`, the exact patches, coordinator source, lifecycle callers, UI listener and supplied native evidence. Product files were not changed.

## Critical

None found in the reviewed supported-browser paths.

## Important

No blocking defect found. The concurrency guarantee requires every writer to use the same Web Lock. A concurrently open older build or the explicitly retained no-Web-Locks fallback can still race; this change cannot certify mixed-version writers or unsupported browsers.

A pending request has no deadline: a lock held indefinitely leaves Saving progress and the exit guard active until the request is released or rejected. This is accurate pending state, not evidence of a completed save. The code does not spin under ordinary lock contention: flush awaits the outstanding promise.

## Minor

The status event is dispatched before assigning the new save promise. With the actual UI listener this is safe: the listener reads state and patches the HUD; a flush started by a listener first resumes after the stack has assigned the promise. Synchronous listeners that change career identity and recursively request another save are not covered by the current integration tests and should not be treated as an unrestricted extension contract.

The rejection handler assumes console/toast/status infrastructure works. A throwing toast inside its catch handler can reject the promise before the final pending-state cleanup; ordinary lock and storage exceptions are handled. No such throw was observed in the real implementation or supplied native tests.

## Edge-case findings and verification

- Compare, serialization, primary write and metadata write execute synchronously inside the same lock callback; UI work does not run while awaiting acquisition. Storage exceptions return false and normal promise rejection clears pending.
- Requests before acquisition coalesce into the latest state. Requests after the callback but before settlement set saveAgain and schedule another commit. Completion updates pending before notifying the HUD.
- Successful restore/new-world/clear invalidates queued generations. Stale callbacks return false before serialization; stale completion cannot clear newer pending state. Old-generation flush waiters return false. A failed restore restores the previous storage token/conflict state and retries a previously pending save after a generation change.
- Pending status is not failure. The exit listener is attached during pending or failure and removed on healthy completion or deliberate clear. The native exit-guard artifact is tied to the reviewed candidate hash and includes an actual reload prompt.
- Independently executed `node qa/deep-20261027/performance/coordinator-review.cjs`: PASS for prelock coalescing, postcallback saveAgain, superseded waiter, stale callback and lock rejection. Its synthetic rejection log is expected.
- Inspected supplied pending native results (11/11), concurrency evidence, and final exit-guard results (6/6). These supplied native runs were not independently rerun in this review. Earlier concurrency/performance evidence predates the final status-notification change; the lock algorithm is unchanged.

Abrupt whole-browser crash durability and browser-specific beforeunload restrictions are not fixed or certified by this review. A beforeunload handler is a warning opportunity, not a forced flush or guaranteed prompt on every platform.

## Follow-up: lock-coordinated clear (`b8db3232cc75c0b5ae402fb3dce8efd0862109c5da10a01ad3e26472f9f792b7`)

The new clear path queues all three removals and reload inside the same Web Lock, closing the previously documented unlocked-clear window. On removal or lock failure it keeps the session open and restores unsaved warning/exit-guard eligibility. No product source was edited for this review.

**Important finding:** unlike queued save callbacks, the queued `reset` callback does not capture and verify its generation. While waiting for another tab to release the lock, the page remains interactive. A successful restore or startFreshWorld invalidates the pending career generation and sets saveSuspended=false, but the old reset can subsequently remove the replacement career's data and reload. Guard the callback with its captured generation and continued suspension before any removal or reload, or prove that every career-changing entry point is disabled while clear is queued. Root notified promptly. A held-lock -> clear -> valid restore/new-world -> release regression should establish that the obsolete clear neither deletes nor reloads.

Mixed-version writers, browsers without Web Locks, and abrupt whole-browser crash durability remain outside certification. A coordinated clear cannot ensure another already-open legacy tab will not later recreate storage.

## Final clear review (`4622c2f16881972869a2f861995d9b1f8a95cee2b9fe0cee62149d6352d261f9`)

The important follow-up finding above is resolved in this candidate. Clear now captures the generation immediately after invalidation. Its lock callback checks both generation equality and continued suspension before any storage removal or reload. A newer restore, fresh career or second clear invalidates the old callback. The asynchronous rejection handler also returns immediately for a superseded generation, so an obsolete failed clear cannot unsuspend or report a failure against a replacement career. Ordinary same-generation failures still unsuspend and notify the warning UI.

Inspected final native evidence tied to this exact candidate: `clear-supersede-green.json` passes replacement-opened-while-clear-queued and stale-clear-cancelled; `clear-lock-final.json` passes clear-waits-for-writer and locked-clear-and-reload. These demonstrate both cancellation and the intended ordinary clear. No remaining blocking issue found in this bounded change. Native results were inspected rather than independently rerun. Existing mixed-version, unsupported-browser and crash-durability limitations continue to apply.

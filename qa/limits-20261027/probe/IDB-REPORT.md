# Strict IndexedDB durability / atomic coordination probe

2026-10-27; Chromium 153.0.8010.0; synthetic file:// origin; isolated persistent profiles. Product v81 was not modified. Reproduce with `NODE_PATH=$CODEX_PRIMARY_RUNTIME_NODE_MODULES node qa/limits-20261027/probe/idb-durability.cjs`.

## Observations

- Strict option accepted and `IDBTransaction.durability === 'strict'`. An invalid enum throws TypeError. Omitting the options reports `default`, not `strict`; this is not an equivalent strict-durability fallback.
- 12/12 strict write transactions recovered exactly the marker acknowledged by `transaction.oncomplete` after immediate CDP Browser.crash and persistent-profile relaunch. No intentional delay between completion and crash command; CDP session creation/protocol overhead remains. Final round checked by a thirteenth launch. A second full run independently also passed 12 rounds; the final run is recorded in idb-results.json.
- Two actual tabs, each performing 100 read-modify-write increments using overlapping readwrite transactions on the same store, produced exactly 200. No Web Locks API used. Each mutation read the current value and wrote its increment within one transaction; each caller awaited transaction completion.
- Deliberately keeping one transaction active with chained requests left it incomplete at 200ms (772 requests in recorded run), then explicit abort produced the abort event. Request success does not imply transaction completion. This shows a pending transaction can be observed, not mathematical proof it remains pending indefinitely.
- A version upgrade while both tab connections remained open fired `blocked` and stayed `pending` at 250ms. No built-in short timeout was observed.
- An opaque-origin sandboxed iframe synchronously threw SecurityError opening IndexedDB.

## Integration recommendations

Use one strict readwrite transaction covering the authoritative state and revision (and any command identifier needed for reconciliation). Read/validate the latest revision and apply the command within that transaction; serialization prevents stale in-memory state from overwriting newer state. Publish success / replace the committed in-memory baseline only on transaction complete. A request's success event is insufficient.

Check actual `tx.durability`, not merely acceptance of the third transaction argument: older implementations may ignore unknown dictionary options. If strict mode is missing, throws, or reports something else, fail closed for the strict guarantee. Do not silently revert to default IndexedDB or localStorage while retaining the same acknowledgement claim. Default-mode fallback is observable in this browser, but unsupported-old-browser behavior was not emulated or certified.

Handle synchronous open exceptions, open errors, blocked upgrades, aborts, quota errors and timeouts explicitly. Install versionchange handlers to close stale connections. Before completion, retain the previous committed baseline. A deadline is an observation limit: late completion can create an unknown outcome; abort if possible and reconcile by command ID/revision before claiming failure or retrying. A timeout itself does not prove rollback.

## Scope limits

This is browser-process-crash evidence on one Chromium build and file:// origin, not an OS crash, sudden-power-loss, filesystem, or hardware durability certification. It does not validate product integration, Safari/Firefox, localhost deployment, denied-storage policies beyond the tested opaque origin, quota exhaustion, or old implementations. All browsers closed were created by this probe; product/root files were not changed.

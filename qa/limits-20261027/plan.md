# Save-limit reduction implementation plan

Goal: a durable recovery checkpoint, atomic no-Web-Locks fallback and bounded waits, preserving existing careers.
Architecture: IndexedDB checkpoint service embedded in the existing engine closure; coordinator wraps existing commitSave. Controller presents recovery choices and accurate capability/slow status.
Tech stack: existing standalone JavaScript, IndexedDB/Web Locks, Python exact-patch builder, Playwright native tests.
Spec: design.md in this directory.

Global constraints: preserve v81, all cricket/ratings/simulation mathematics, existing save version and offline single-file use. No security bypass, system privilege changes or fabricated device certification.

Review focus: newer legacy-tab primary data; restore while clear is queued/in flight; invalid/missing checkpoint; failed strict transaction after primary acceptance; held lock/transaction with late completion.

- [x] Native strict durability and atomicity probe, independent browser runtime investigation.
- [x] Write failing game integration tests for checkpoint crash recovery and missing-lock overlap.
- [x] Create checkpoint service, coordinator and minimal recovery/status UI. Build candidate deterministically from immutable v81. Run native RED/GREEN tests.
- [x] Exercise abort/denied/blocked/late generations/clear/mixed-primary conflicts. Run existing integrity and native browser regressions; update harness assumptions explicitly when unsafe legacy saving is intentionally refused.
- [x] Independent review, source parity, appropriate career continuity validation and release gate.
- [x] Publish byte-verified source/aliases and save playable/evidence. Record environmental and physical certification limits honestly.

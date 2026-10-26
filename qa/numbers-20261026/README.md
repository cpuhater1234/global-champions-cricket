# Numerical audit

See docs/GCC_V8_EVERY_NUMBER_AUDIT_20261026.md and summary.json. Current game hash unchanged. Raw traces are in the manifest-linked archive; source checks and compact reports remain in Git.

## Tool setup

From the repository root, install the audit-only AST parser:

```sh
npm pack acorn@8.19.0 --pack-destination qa/numbers-20261026
tar -xzf qa/numbers-20261026/acorn-8.19.0.tgz -C qa/numbers-20261026
node qa/numbers-20261026/extract-ratings.mjs
```

The extractor materialises the unchanged current inline ratings assignment at v8/engine/ratings.js for standalone source tests. This file is an audit dependency, not a modified game engine.

Restore the manifest-linked archive before fixture-dependent tests, or regenerate fixtures with the documented current-build runner and seed. The original raw failure logs distinguish missing dependencies and stale fixture assumptions from confirmed product defects.

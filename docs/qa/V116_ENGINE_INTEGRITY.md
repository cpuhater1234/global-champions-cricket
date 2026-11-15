# Canonical v116 engine integrity

Work on `work/v116-candidate-acceptance`; source is `v116/canonical`. Do not rebuild this release with `v8/build.py`, edit frozen `v116`, or merge into `main` for this pass.

| Source path | Responsibility |
| --- | --- |
| `v116/canonical/scripts/12-runtime.js` | Delivery engine (`GCC8_DELIVERY`) and compression runtime |
| `v116/canonical/scripts/13-runtime.js` | Domain clock/scheduler |
| `v116/canonical/scripts/14-runtime.js` | Historical players |
| `v116/canonical/scripts/15-runtime.js` | Clubs and world data |
| `v116/canonical/scripts/16-runtime.js` | Ratings/model specification |
| `v116/canonical/scripts/17-runtime.js` | Development projections |
| `v116/canonical/scripts/18-runtime.js` | CPU decision model |
| `v116/canonical/scripts/19-runtime.js` | Core match and season simulation (`window.GCC`) |
| `v116/canonical/scripts/20-runtime.js` | Dynasty, fitness, injuries and persistence wrappers |
| `v116/canonical/scripts/26-runtime.js` | Management promises and connected presentation |
| `v116/canonical/scripts/29-runtime.js` | Controller actions and connected presentation |

From the repository root, with Node 22+ and Python 3 available:

```sh
node qa/v116_integrity.mjs
```

Set `GCC8_PYTHON=python3` if needed. Reports and a rebuilt candidate go to `qa/results/v116-integrity/`. The suite verifies eleven source and embedded script pins, tests rejection of changed core bytes, permits a CSS-only HTML change, generates a legal completed 2008 foundation save, prepares its provenance, runs the existing seeded delivery arithmetic/endpoints suite, and checks management promise outcomes and rejection conditions.

For the reviewed wording differential, first build the previous source snapshot, then supply its HTML:

```sh
node qa/v116_integrity.mjs --baseline previous.html
```

The ten-change copy guard is historical and specific to the a4743f84 baseline and e58d2b82 candidate. Do not apply that historical differential to later UI work, including the trade-review gate candidate. Run the default suite without --baseline for current source; use the separate trade-review commands in docs/release/V116_TRADE_REVIEW_GATE.md for that differential. Optional full career coverage is explicit rather than repeated by default:

```sh
node qa/v116_integrity.mjs --full-career
```

Standalone pin check:

```sh
python qa/v116_engine_integrity.py --source v116/canonical --html qa/results/v116-integrity/candidate.html --self-test
```

Pins live in `qa/fixtures/v116_engine_pins.json`. There is deliberately no automatic refresh option. Owners 26 and 29 include presentation, so a legitimate copy change in those files needs an explicit reviewed pin update. Pins prove byte identity, not cricket calibration. The delivery test's plausibility bounds are not empirical calibration. The foundation driver covers VM/cold-reload behaviour; native storage durability and visual/accessibility verification remain separate checks.

## Existing checks and their limits

- `qa/v8_delivery_engine_test.mjs` has a historical filename but loads the exact HTML supplied through `GCC8_TEST_BUILD`; the new entry point prepares its foundation fixture automatically.
- `qa/v8_delivery_boundary_regression.mjs` reads `v8/domain/delivery_engine.js` directly. It is not evidence for the current canonical engine.
- `qa/v116_canonical_source.py` builds the canonical composition. Its historical manifest records an older snapshot; `--check-manifest` is not the current engine-pin baseline after reviewed changes.
- `qa/v116_source_reconciliation.py` checks frozen artifact identity/round-trip reproduction.
- `qa/v116_secondary_runtime_guard.py` is a specific historical UI-copy guard, not a general engine pin.
- `captaincy_layer_v116.py` is a native save/reload smoke test. Its default hash is frozen; a current candidate requires `--no-hash-check` plus separately verified exact candidate identity.

The career fixture driver now skips its obsolete Choose club action when the automatic transition has already happened. No game rules or assertions were removed.

Current pin revision: trade-review candidate 4410cf19. Only owners26/29 were repinned after three exact reviewed presentation/controller replacements; all nine remaining owner hashes retained. See docs/release/V116_TRADE_REVIEW_GATE.md.

# GCC v116 source reconciliation and provenance

Checked 11 November 2026 against the **exact frozen v116 release** on branch `v116`.

## Current playable source of truth

- Artifact: `GCC_v116_release (1).html`
- Size: **6,635,097 bytes**
- SHA-256: `b27cf0b4c7e6e4e7a78eaa5c80154dfd0f70657ce9f774dd405505e97e82c6d0`
- Git blob: `088cf689ef3a464b06e8512627811ad60864b3e8`
- **17** actual style elements and **22** actual script elements, established by the frozen-release parser on GitHub Actions.

This differs from older v112 reconciliation documents describing 14 styles and 20 scripts. Do not apply those counts to v116.

## Verified source-extraction gate

The new `qa/v116_source_reconciliation.py` verifies the exact release SHA-256 and length **before** parsing. It independently checks HTML tag balance and block counts, inventories each block with its own hash, and can extract the ordered HTML prefixes and inline style/script bodies into a disposable directory.

The `roundtrip` command reconstructs the release from those extracted parts and verifies the **entire assembled binary** matches the frozen SHA-256 exactly. No canonical file is overwritten. Mutating an extracted block fails verification unless deliberately building an *unreleased* candidate with `--allow-edits`.

Successful CI: [GCC v116 source identity audit #42970876618](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/42970876618).

Commands from a checkout of `v116`:

```sh
python3 qa/v116_source_reconciliation.py audit --json qa/results/v116-source-audit.json
python3 qa/v116_source_reconciliation.py roundtrip --json qa/results/v116-source-roundtrip.json
python3 qa/v116_source_reconciliation.py extract --source qa/results/v116-extracted
python3 qa/v116_source_reconciliation.py build --source qa/results/v116-extracted --output qa/results/v116-reassembled.html
```

Use the extracted directory as a **provenance checkpoint**, not as a finished editable architecture. The extraction includes exact markup prefixes and blocks, rather than rewriting layout, script or asset logic. CSS and JavaScript source substring matches are diagnostic only.

## Maintained-build limitation

`v8/build.py` currently delegates to `qa/perfection-20261030/patch.py` to create an historical candidate; it has not been shown to reproduce the frozen v116 binary.

`src/` contains older extraction work and `src/manifest.json` pins v7.8.7. It is not the v116 source manifest.

The new audit specifically labels maintained-source reproduction as **NOT VERIFIED**. A lossless extraction proves that a verified frozen binary can be split and reassembled. It does **not** prove meaningful edit ownership, source independence, v8 builder parity or that future changes are correct.

## Other independently cleared acceptance

- [Native browser save/reload and Continue Career #42751656106](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/42751656106): passed two scenarios.
- [Native two-tab recovery #42968272367](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/42968272367): stale tab rejected; later Round 2 career state and checkpoints preserved and recovered.

The browser scenarios are bounded tests, not a full certification of concurrency, storage failure, legacy save compatibility or every gameplay state.

## Next technical step

1. Compare each v116 block with current owning files and transforms, recording full hashes and exact insertion boundaries.
2. Identify actual version-specific ownership for style and script blocks. Avoid global cascade overrides or assumptions based on older build names.
3. Extract structural units into maintained source **without changing** the frozen v116 release; demand binary-equivalent rebuild first.
4. Only then modify one screen/surface family at a time, with native browser screenshots and regression evidence, while preserving approved Home/Intro styling.
5. Keep `main` untouched until release and source promotion have been deliberately reviewed.

**No merge, release/tag, gameplay HTML mutation, baseline rewrite or branch deletion is part of this source audit.**

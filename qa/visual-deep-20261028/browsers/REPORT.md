# Actual WebKit verification — v84

Tested immutable candidate `qa/visual-deep-20261028/candidate.html`, SHA256 `9a253947041974e26a91729e06a9a93e1812d518b04519a6f533e9793a7cc5ca`, in actual official Playwright WebKit26.5/revision2336.

## Results

- Lifecycle13/13 passed; zero page errors (`lifecycle.json`, `lifecycle.log`). Includes coordinated-save readiness, strict durability agreement, real navigation/pagehide, reveal save/restore, native modal pause/focus/return, actual backup import, paused match persistence and resumed progression.
- Targeted visual4/4 passed; zero page errors (`targeted.json`, `targeted.log`). All four screenshots were visually inspected.

| Actual DOM case | Evidence |
| --- | --- |
|390×844 backup review, html font20.8px (130%)|Title right309px, close left321px:12px separation; no collision. `webkit-backup-review-enlarged.png`|
|390×844 real GLO-review superover|All9 text samples passed4.5:1; lowest6.2695:1, stat names/scores9.823:1. Includes explanatory rule paragraph and bowler summaries. `webkit-superover-section.png` and `webkit-superover.png`|
|320×740 closed GLA review, expanded analysis|All10 Scored/Conceded labels occupy one line; no page horizontal overflow. `webkit-closed-rates.png`|
|740×360 analysis, scrolled to bottom|Dialog top12px; sticky header top15px after scrollTop2082; close control remains visible. `webkit-analysis-sticky.png`|

No remaining defect was found in these requested cases. This focused run does not claim exhaustive game visual coverage, physical Safari/iOS certification, human screen-reader validation or Firefox compatibility.

## Runtime and commands

The official WebKit payload and30 verified official Ubuntu packages were restored after transient runtime reset. Packages were SHA256-checked using the retained official manifest and extracted into `/tmp/gcc-webkit-deps/prefix`. The retained task-local launcher mirrors the official WPE wrapper environment, adds scoped library paths and execs the unmodified official browser binary. No product edits, system installation, privilege escalation, sandbox changes or security overrides.

```sh
GCC_BROWSER_EXECUTABLE="$PWD/qa/limits-20261027/browsers/webkit-prefix-launcher.sh" GCC_ENGINE=webkit GCC_PHASE=visual-deep-v84 GCC8_TEST_BUILD=qa/visual-deep-20261028/candidate.html timeout 80s node qa/limits-20261027/browsers/lifecycle.cjs
timeout 80s node qa/visual-deep-20261028/browsers/targeted.cjs
```

Lifecycle JSON was copied from its harness output into this directory. Targeted cases use native WebKit DOM/layout against the frozen HTML fulfilled at a local HTTP origin. Setup evidence: `provision-webkit.log`, `provision-prefix.log`, `ready.log`.

# Current candidate: v97 alignment pass, 7 November 2026

Maintained branch: `work/v8-integrity-charcoal-candidate`. This pass follows Tom's explicit request to continue correcting the alignment audit findings in the existing game.

Download: `GCC_v97.html`; Library `libfile_83a9a660e8d88191879133c5e2ca109a`, version 0. Expected SHA-256: `61b801cf8af2c913a46f9696d2645bb4d2b31a354ba15d522f05dd2a6ec39e93`; 6,582,458 bytes. The normal source-build command remains `python v8/build.py --output GCC_v97.html`. The canonical regression now records the v97 expected hash; a fresh full-project build was not run in this refreshed environment because the complete checkout is unavailable.

Changes from inspected v96:
- Selection details are inside the existing grid, below the bench and beside the XI. Mobile pane selectors still target the same direct bench/XI children; supporting information remains below the active pane.
- Selection metrics share the same font, size and line height; desktop roster rows have a consistent minimum height.
- Mobile roster actions sit beneath player identity and align left, with 44px controls.
- Matchday and grouped campaign commands use the same shape and typography as selection controls.
- Analysis and development panels use the existing dark dialog surfaces. At widths up to 1000px, analysis disciplines stack with four tiles per section; at 600px and below, tiles use two columns. Labels wrap at spaces, without splitting words.

All edits belong to five existing source files: decision-ui.js, decision-ui.css, floodlit.css, floodlit-compat.css and broadcast.css. No new visual stylesheet or style block was added.

Verification: generated the standalone candidate from the exact saved v96 by replacing the exact five owned source bodies. All 20 scripts pass syntax checks; only script 18 changes, solely by moving selection-details markup inside the grid. All embedded base64 assets and style-block IDs are unchanged. CSS delimiters are balanced and no nested style boundaries occur outside comments. See `qa/alignment-20261107/verification.json` and `PLAN.md`.

Native v97 acceptance is PENDING. The user downloads, then receives a fresh local link. Do not assume the local file exists before download confirmation. Inspect desktop 1150px, tablet 768px and phone 390px, especially metric baselines, sidebar flow, mobile control attachment, analysis labels, and saved-career continuation. Reset temporary viewport overrides. The previous desktop/mobile/tablet observations were for v96 and do not establish v97 visual acceptance.

The repository's large historical `game/gcc_v8_product_candidate.html` remains the build input; it is not the current downloadable candidate. Do not confuse it with v97 or claim it matches.

---

# Current candidate: v96 selection consistency, 7 November 2026

Maintained branch: `work/v8-integrity-charcoal-candidate`. v95 source reconciliation is committed as `5510d3fe4608ac87aa2058aa2deb5f05d4d1ce56`.

The default build creates v96: `python v8/build.py --output GCC_v96.html`. Expected SHA-256: `8c2f576ee975a9cacbf6d355c40586d07e3eca9579d2cfca462ae2872f5ce280`; size: 6,581,129 bytes. Saved download: Library `libfile_887b33cd3fb08191aabe0216b5f729a8`, version 0.

Changes: the selection counter renders as one text run, removing the small denominator. Adjacent selection commands share typography, padding, border, shape and hover movement, retaining primary and secondary colours. Changes are in the existing decision-ui markup/CSS and Floodlit button stylesheet; no new style block.

The archive `compose` entry point still enforces exact v93 bytes. The maintained pipeline calls `compose_source`, preserving CSS-boundary and final-document-boundary checks while permitting intentional source edits.

Verification: earlier local default build and four recovery tests passed. After the execution environment refreshed, recovered the saved v96 and confirmed its exact hash, exact containment of all three modified visual source files, all 20 script syntax checks, recovery hash guard, editable source composition and CSS boundary guard. Current environment does not contain the full project checkout, so a new full build was not rerun here. `test_canonical.py` records the v96 hash.

Native v96 visual review remains PENDING. The selected browser tab still identifies v95. The user downloads v96, then receives a fresh localhost link. Do not assume it has been downloaded or navigate to an unconfirmed local file. Review the selection counter, both buttons, mobile wrapping and saved-career continuation before visual acceptance. Broader visual consistency work remains open.

The remote `game/gcc_v8_product_candidate.html` remains the historical build input; do not identify it as the v96 download. Use the source build command above.

Tom explicitly approved syncing these v96 source changes after the prior automatic review requested separate authorization.

---

# Source reconciliation checkpoint, 7 November 2026

The maintained default `python v8/build.py --output <file>` now reproduces v95 exactly: SHA-256 `0fdce9468a340681e392db75a3788f8299e7d10bfd1ada5689151c0725585fa8`, 6,580,544 bytes. The default pipeline regression passed locally. Source integration includes media.py, the reviewed v93 CSS, composition source and a ten-part image manifest. Each image part is below 450,000 bytes; the parts reconstruct the same 42 reviewed images. This avoids sending the 3.79 MB image manifest as one tool argument.

The browser currently has downloaded v95 open, with a saved 2010 Lucknow career. Native inspection confirmed unequal selection command typography (14px vs 19.2px) and the counter mixing 28px and 17px text. These remain open defects. Source edits also reveal the composition helper is recovery-hash locked; separate the archive recovery check from the maintained editable pipeline before further source changes.

The remote `game/gcc_v8_product_candidate.html` is still the historical 8,385,768-byte build input, not the v95 download. Do not claim that file matches the current playable. Use the default source build to reproduce v95. No full native visual acceptance is claimed.

GitHub small reads and source uploads succeeded. Image upload initially failed automatic approval review; Tom explicitly approved uploading the existing image assets and reconciled build source to this branch, and the ten image blobs then uploaded successfully. Earlier reported maximum-length failures were not reproduced; oversized payloads remain a likely cause, not a confirmed diagnosis.

---

# Current continuation: v95 composition candidate, 7 November 2026

The original four user complaints are now implemented in a candidate: home space, tile underlines, the introduction's three-column layout, and reveal-bar alignment.

**Next action is native verification of the downloaded v95, not another recovery audit.**
File: `GCC_v95.html`.
SHA-256: `0fdce9468a340681e392db75a3788f8299e7d10bfd1ada5689151c0725585fa8`.
Library: `libfile_a8e2d0a6c4108191aca07044b9e1218d`, version 0.
Source and exact build command: [qa/composition-20261107/README.md](../../qa/composition-20261107/README.md).
The user downloads, then receives a fresh localhost link; inspect that exact build in the existing Chrome tab. Chrome was deliberately left on v93 pending that transfer. All native candidate visual checks remain pending.
The candidate preserves all original v93 bytes outside one appended stylesheet. Four regression tests, structural validation, 20 script syntax checks, 42 raster decodes, one SVG parse, and byte-identical rebuild pass.
Do not regenerate it using the different historical `v8/build.py` output. Its separate source integration is still unreconciled.
v93 stays the accepted recovery anchor until v95 passes the requested native review. v94 remains rejected.

---

# GCC continuation checkpoint, 7 November 2026

## Read this first
Maintained development branch: `work/v8-integrity-charcoal-candidate`.
The older `work/v8-game-first-rebuild` branch and its v101 handoff are historical relative to the current Floodlit candidate. Do not overwrite the maintained candidate from that branch.

## Last user direction
Resolve systemic confusion between external improvements, downloaded builds, maintained source and GitHub. v94 was rejected after a visible regression. Preserve v93 and reconcile before further game changes. Audio and save import/export remain excluded.

## Accepted recovery anchor
The browser was restored to `GCC_v8_Playtest_72_v93_lean.html`.
Library identity: `libfile_951b363fbb4481919a83abb8d7cb9ca9`, version 2.
Exact bytes: 6,576,785.
SHA-256: `3abf1f74a1ec77db5b3bd0322e3188015bca161853bdd3397bd116bcf1e5f026`.
The separate uploaded `GCC_v93_baseline (1).html` has the same SHA-256.
This is a recovery anchor, not a claim that every release gate passes.

## Other files, never substitute by version label
| File | SHA-256 | Status |
| --- | --- | --- |
| GCC_v93_polish (3).html | eeb08d8c9ee0b0be96ac138885a0a07a900e62b41f41785207b7c9173dfef16d | External visual proposal; retain and review |
| GCC_v94_scoped.html | 00c6e86cfc592be391da49c38a6c228a6cdad563634bf2cd7e820743cb7efca3 | REJECTED; never promote |

The polish file adds two visual blocks, `gcc-floodlit-v100` and `gcc-floodlit-v100b`, on top of the v93 baseline. Its 20 script bodies are identical to v93. v94 starts from the baseline instead of preserving that full proposal. A smaller/larger version number does not establish lineage or approval.

## Reproduced v94 defect
The patch replaced every literal `</body>`, including one inside the visual stylesheet's explanatory CSS comment. This injected a nested style opener and premature style closer into an existing style element, as well as appending the intended style at the document end. Syntax-only JavaScript checks miss this defect.
Any future insertion must target an actual parsed boundary or a single anchored final closing-body boundary. Validate the resulting HTML structure, unique style IDs, no nested style markup, and exact expected script bodies before browser review.

## GitHub and source reconciliation
On 7 November, the maintained branch's README still identified the older branch/v101. It was stale.
The maintained branch's release gate identified Playtest70 while later local work includes Playtest72 and v93 integration.
Remote canonical HTML Git blob observed: `69a3d1666f9300af5a739bd32872fb4633f210c7`. The contents endpoint returned no bytes, so SHA-256 and script parity of that remote file were NOT established.
Local integrated source candidate: SHA-256 `d3cf3c234085a574af9b5b41c952f6992f7eb14e371ea0240d12329c7dc50d1d`, Git blob `eeb09136b66c48bd5b4b21ea26c23b8504986382`. It is NOT byte-identical to the accepted v93 recovery anchor.
Local `v8/media.py` and its image manifest exist, but remote `v8/media.py` was not found. Local integration was not fully checkpointed remotely.
Local vs remote `v8/build.py` matched Git blob `17c2bc1b11e3a88c3f409006d9fde24e242cd2b6`; broadcast.css and patch.py differed. Do not overwrite either side without reconciling those differences.

Local integrated candidate and v93 have all 20 scripts identical after embedded image payloads are normalised. Observed differences are CSS ownership and styling, including alert specificity and landscape layout. This does not prove visual equivalence.

## Next steps
1. Keep the accepted v93 bytes unchanged and retain external polish separately.
2. Recover the remote canonical HTML bytes and current branch head before source integration; an empty contents response is not an empty game.
3. Reconcile and checkpoint media.py, the hash-guarded image manifest, patch.py and broadcast.css as one reproducible integration. Preserve v93 alert/promise distinction, 44px targets, reduced motion and landscape layout.
4. Build twice and compare exact output hashes. Verify scripts/media and run the structural release guard against accepted/rejected fixtures.
5. Review external polish against the actual DOM before adoption; no blind CSS replacement or automatic preference based on filename.
6. Verify the exact candidate in Chrome, including saved-career continuation. Only then provide one clearly identified fresh download and local link.

Do not claim GitHub, downloaded HTML and the current browser all match until their actual bytes have been compared. Do not describe this reconciliation as a finished-game release.

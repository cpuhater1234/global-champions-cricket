# GCC v116: signing and finals layout acceptance candidate

**QA record, 11 November 2026. Full automated candidate acceptance PASS; not a promoted release.**

## Protected baseline

- Frozen playable branch: `v116` at `2648c00b6f1932a690053e7cfba9ecf76ec0cac8`.
- Historical `main`: `b5a9185c51eea4a0f104a94a92fa152abfaf5db4`.
- Frozen playable SHA-256: `b27cf0b4c7e6e4e7a78eaa5c80154dfd0f70657ce9f774dd405505e97e82c6d0`.
- Signing-only review candidate: `a8aa0b653d2476b120353e3511e43e2b07d8f92e9a3b2ce9ff383313f7cf3ecb`.
- Current QA branch: `work/v116-candidate-acceptance`.
- **No change** to the playable HTML, either protected branch, historical gameplay source or user saves.

## Evidence of the two separate finals width faults

1. **Grand Final preview, mobile:** at 320/360/390px the club-side flex panels were compressed to 34px, causing text such as Gloucestershire to protrude from the viewport. The existing mobile `.gccuiFinals .g8matcharena` flex-column rule retained the default cross-axis alignment rather than stretching its children. A browser-only `align-items:stretch!important` test expanded the team panels to 260/300/330px and eliminated the corresponding 380/400/415px document overflows. Native Chromium probe [#42987321107](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/42987321107): **PASS**; no game file changed for the probe.
2. **Completed 2019 championship:** `v8/ui/broadcast.css` defines the `.gccuiFinals.gccuiTitleWon::after` decorative glow with `left:-6%;right:-6%`. The measured overflow exactly follows this relative overhang (e.g. 963px content width plus about 57px), while all direct children fit. This is a decorative overflow, not a match or saved-career defect. The candidate changes only those two positioning values to `left:0;right:0`, retaining the radial glow.

## Guarded HTML candidate

`qa/v116_finals_layout_candidate.py` rebuilds from the exact frozen HTML, first reproduces the signing-only candidate, then modifies **only two existing inline CSS owner blocks**:

- Add cross-axis stretching to the existing mobile Grand Final arena rule.
- Constrain the existing championship glow to its containing block.

The builder checks original byte identity, the signing SHA, unique rule matches, unchanged style/script inventory, and exactly two touched CSS blocks. It refuses to overwrite frozen v116. It adds **no stylesheet, JavaScript block or HTML structure**. Maintained-source `v8/build.py` parity is still **unverified**.

Build locally from a v116/QA repository checkout:

```sh
python3 qa/v116_finals_layout_candidate.py --output qa/results/v116-finals-layout-review.html --report qa/results/v116-finals-candidate-build.json
```

## Acceptance gates

The [candidate full-acceptance workflow](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/42988406245) checks the exact generated HTML against:
- Signing strip at 320, 360, 390, 768 and 1440px.
- Continuous 19-season cricket-engine acceptance (2008–2026).
- Two independent native Chromium gameplay/save/Continue cases.
- Native journeys at 320, 360 and 768px.
- Two-tab stale-save rejection, IndexedDB recovery and career identity preservation.
- 156 saved-career screen/viewport states covering 2019, 2025 and 2026 at 1440, 1024, 768, 390, 360 and 320px.

**Final workflow result: PASS.** [GitHub Actions #42988406245](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/42988406245), completed 11 November 2026.

- Exact corrected review candidate: **6,635,108 bytes**; SHA-256 `5ba82e499b0b8d08706aab851449d20b6d315bf9b780a8c9674b44933d3fe094`.
- 19 years (2008–2026), 266 user regular-season fixtures, **16,564** engine assertions, zero reported runtime errors.
- **5/5** signing-strip widths: PASS at 320, 360, 390, 768 and 1440px.
- **2/2** native Chromium gameplay/save/reload/Continue scenarios: PASS.
- **3/3** full mobile/tablet career-to-match journeys at 320, 360 and 768px: PASS.
- Native two-tab stale-save rejection, IndexedDB preservation, newest-career restoration and checkpoint consistency: PASS.
- **156/156** saved-career screen/viewport states across 2019, 2025 and 2026 at 320, 360, 390, 768, 1024 and 1440px: PASS. Zero page errors, horizontal overflows or flagged text clipping.
- Previously observed **14 finals overflow states: cleared** by the two targeted corrections.

The original v116 binary remains the stable playable release. The corrected HTML is **candidate only**; automated geometry does not equal a human visual sign-off.

## GitHub Actions storage limitation

[Diagnostic #42985232711](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/42985232711) ran its full browser diagnostic successfully but finished as failed solely when `actions/upload-artifact` returned **Artifact storage quota has been hit**. The issue is artifact storage, not proof that workflow execution minutes were exhausted. The narrowed follow-up wrote diagnostics to job logs and summaries without uploads; do not delete existing artifacts without reviewing them first.

## Practical visual sign-off without GitHub artifact storage

The QA branch includes `qa/v116_review_gallery.py`. It independently rebuilds the
**accepted exact candidate SHA-256**, uses the same Chromium renderer as the
successful 156-state workflow and writes screenshots plus a filterable local
`index.html`. It does **not** upload screenshots or mutate the frozen HTML.
The local-gallery smoke test [GitHub Actions #42992051804](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/42992051804) **PASSED**: 27 real PNGs for the 2019 saved career at 320/390/1440px, one clickable gallery, the exact candidate SHA, no page errors or geometry defects, and no artifact uploads.
Everything generated is excluded by `.gitignore`.

From the **QA branch checkout**, with Python 3, Node.js and Playwright installed:

```sh
python -m pip install playwright
python -m playwright install chromium
npm install --no-save --no-package-lock playwright
python qa/v116_review_gallery.py --years 2019 --widths 320,390,1440 --generate-checkpoints
```

The script automatically opens `qa/results/v116-human-review/index.html`
(or that file can be opened manually). Each screenshot opens at full resolution.
For the comprehensive 2019/2025/2026 review, omit the `--years` and `--widths`
restrictions; the default is 156 saved-career states and the full 2008–2026
checkpoint generator. Existing checkpoints can be reused by omitting
`--generate-checkpoints` and pointing `--checkpoint-dir` at them.

This is a deterministic offline visual comparison. The native audit blocks
external image requests, so some stadium photography may be missing. Passing
its geometry assertions is **not a substitute for judging the rendered design,
alignment, typographic hierarchy and interactions**.

## Maintained CSS ownership alignment (QA branch only)

Two maintained CSS declarations have now been aligned with the accepted
rendered candidate, without appending another stylesheet or changing a script:

- `v8/ui/decision-ui.css`: the existing mobile
  `#g8app .gccuiFinals .g8matcharena` rule now includes
  `align-items:stretch!important`, matching the native 320/360/390px proof.
- `v8/ui/broadcast.css`: the existing champion
  `.gccuiFinals.gccuiTitleWon::after` glow now uses
  `left:0;right:0` rather than `left:-6%;right:-6%`.

These are **source alignment only** on `work/v116-candidate-acceptance`.
They are not inputs to the current deterministic release adapter, which still
edits the checksum-verified frozen HTML directly, and they do **not** certify
full `v8/build.py` reproducibility. The frozen release and historical
`main` retain their original CSS bytes.

## Source architecture decision

The maintained `v8/build.py` is an older builder and does not reproduce v116.
The accepted candidate is presently **byte-reproducible** via the strictly
bounded QA builder, but that is *not maintained-source parity*.
The existing 39-block v116 exact-source snapshot already reconstructs the frozen
HTML; establishing independent owners for late CSS and behaviour blocks is
the next source-migration task. Do not conflate exact snapshot reproduction
with a modern maintained codebase. Keep historical `main` and `v116`
frozen while source ownership is resolved.

## Outstanding release boundaries

- Actual screenshot review/human sign-off, including colour hierarchy, clipping, spacing and deliberate narrow-screen composition, remains separate from automated geometry.
- Historical `v8/build.py` source-to-binary reproducibility is not verified.
- No merge, tag, release promotion or mutation of the frozen playable HTML is authorised by these QA results alone.

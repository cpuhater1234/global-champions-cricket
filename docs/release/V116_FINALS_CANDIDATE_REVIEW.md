# GCC v116: signing and finals layout acceptance candidate

**QA record, 11 November 2026. Not a promoted release.**

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

**Status at document creation:** candidate build, signing and syntax gates passed; full-career workflow in progress. Update this document with the final run result and candidate SHA before any promotion decision.

## GitHub Actions storage limitation

[Diagnostic #42985232711](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/42985232711) ran its full browser diagnostic successfully but finished as failed solely when `actions/upload-artifact` returned **Artifact storage quota has been hit**. The issue is artifact storage, not proof that workflow execution minutes were exhausted. The narrowed follow-up wrote diagnostics to job logs and summaries without uploads; do not delete existing artifacts without reviewing them first.

## Outstanding release boundaries

- Actual screenshot review/human sign-off, including colour hierarchy, clipping, spacing and deliberate narrow-screen composition, remains separate from automated geometry.
- Historical `v8/build.py` source-to-binary reproducibility is not verified.
- No merge, tag, release promotion or mutation of the frozen playable HTML is authorised by these QA results alone.

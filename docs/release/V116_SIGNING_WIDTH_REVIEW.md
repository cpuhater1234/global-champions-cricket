# GCC v116 signing-week mobile width defect and review candidate

**Verified 11 November 2026.** The frozen v116 game is **unchanged**. [GitHub Actions #42973181343](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/42973181343) completed **SUCCESS** for the targeted signing diagnostic, temporary candidate comparison, native save/reload and two-tab recovery tests.

## The confirmed defect in frozen v116

At **390px** viewport width, the initial five-day signing screen has:

- Available day-strip container width: **366px**, left edge 12px, right edge 378px.
- Five `Day 1` to `Day 5` spans, each at **72px minimum width**.
- Four `6.4px` gaps. The five spans and gaps need **385.6px**, exceeding the container.
- Last span extends to **397.6px**. Whole document scroll width becomes **398px**.
- No `.active` day at the initial, not-yet-started signing state. This is a legitimate initial state and not an independent failure.

The [static cascade audit](V116_CASCADE_INSPECTION.md) identified the exact source-level override: `gcc-composition-20261107` (style block 33) already declares `#g8app#g8app#g8app .g8days>span { min-width: 0; }`, but later `gcc-cleanup-pass` (block 35) sets `min-width:72px` on the same selector. The later declaration wins.

## Experiment: remove one obsolete override, no new style layer

[Reproducible candidate builder](../../qa/v116_signing_width_candidate.py) uses the checksum-verified frozen release, and **only removes the later `min-width:72px;` declaration** from the existing `gcc-cleanup-pass` style block. It validates:

- Original artifact size and SHA-256 before editing.
- Exactly one expected selector/rule/declaration to change.
- Identical content in every other inline style/script block.
- No modifications before or after the edited style body.
- Refusal to overwrite the frozen file.

Candidate review identity (not a new public release):

| Property | Value |
|---|---|
| Source release SHA-256 | `b27cf0b4c7e6e4e7a78eaa5c80154dfd0f70657ce9f774dd405505e97e82c6d0` |
| Experimental candidate SHA-256 | `a8aa0b653d2476b120353e3511e43e2b07d8f92e9a3b2ce9ff383313f7cf3ecb` |
| Candidate size | **6,635,082 bytes**, 15 fewer than frozen release |
| Source control edit | **One deletion inside the existing CSS owner** |
| New stylesheet | **None** |
| Script changes | **None** |

## Browser QA results

Native Chromium on disposable loopback origins:

| Check | Frozen v116 | Experimental candidate |
|---|---|---|
| Initial signing day strip, 390px | **Known 8px horizontal overflow** | **Pass**, no horizontal overflow |
| Initial signing day strip, 1440px | Not flagged by this scoped test | **Pass**, no horizontal overflow |
| Five day labels visible | Yes | Yes |
| Browser exceptions in signing probe | No additional errors reported | None |
| Full release save/reload/Continue | **Pass**, two native scenarios in same run | Not separately retested on candidate |
| Original release two-tab stale-save recovery | **Pass** in same run | Not separately retested on candidate |

The earlier temporary inline browser experiment showed cells shrinking to approximately **68.1px** at 390px, fitting inside the 366px strip and restoring document width to 390px. The actual review candidate achieved the same no-overflow result without a temporary inline override.

## Reproduce from the v116 branch

```sh
python3 qa/v116_signing_width_candidate.py --output qa/results/v116-signing-width-review.html --report qa/results/v116-signing-candidate-build.json
python3 qa/native_v116_signing_css.py --html qa/results/v116-signing-width-review.html --experimental-candidate --out qa/results/v116-signing-candidate-native.json
```

Playwright Chromium is required for the native check. These commands generate a local **experimental review artifact**, not a new release or tag.

## Remaining acceptance boundary

The corrected candidate is **not promoted**. Review real screenshots and computed styles at **320/360/390/768/1440px**, especially day indicators before, during and after signing, plus Home/Intro regression, text size and keyboard focus. If accepted, integrate this single-owner cleanup in a new explicitly versioned candidate and rerun full functional browser tests on **that candidate** before promotion. Maintained `v8/build.py` parity with v116 is still **unverified**.

No historical baseline, GitHub `main`, frozen v116 HTML, user save, or GitHub Release/tag was changed.

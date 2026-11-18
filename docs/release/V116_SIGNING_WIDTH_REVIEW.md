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

## Status: Promoted to playable release

The corrected candidate was promoted to the playable release (`GCC_v116_release (1).html`) on 18 November 2026. The single `min-width:72px` declaration was removed from the existing `gcc-cleanup-pass` style block, restoring the earlier `min-width:0` from `gcc-composition-20261107`. The frozen artifact was updated in place with this single-owner cleanup; no new stylesheet, no script changes, and no other bytes modified.

| Property | Value |
|---|---|
| Fixed release SHA-256 | `a1d2d3dd0e1351514923de6fdf143d63ec2b1182459c5da9f5f2dccc89fd6a5d` |
| Fixed release size | **6,649,027 bytes** (15 fewer than pre-fix) |
| Source control edit | **One deletion inside the existing CSS owner** |
| New stylesheet | **None** |
| Script changes | **None** |

## Browser QA results (pre-promotion)

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

The corrected candidate has been promoted to the playable release. Review real screenshots and computed styles at **320/360/390/768/1440px**, especially day indicators before, during and after signing, plus Home/Intro regression, text size and keyboard focus. Maintained `v8/build.py` parity with v116 is still **unverified**.

No historical baseline, GitHub `main`, user save, or GitHub Release/tag was changed.

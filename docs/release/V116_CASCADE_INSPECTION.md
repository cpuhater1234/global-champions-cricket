# GCC v116 CSS cascade: static inspection of the frozen release

**Verified 11 November 2026.** [GitHub Actions source/cascade run #42971485315](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/42971485315) passed on the frozen 6,635,097-byte HTML. Generated with `qa/v116_css_cascade_audit.py` and the pinned `tinycss2==1.4.0` parser.

## Findings and scope

- **20,715** selector-property declarations were enumerated from 17 style blocks.
- **70** same-selector/property/importance pairs occur in more than one style block under identical recorded at-rule context. **52** of these have different textual values.
- **12** such repeated pairs involve `gcc-visual-pass`, `gcc-cleanup-pass` or `gcc-v116-perfection-pass`. **All 12 differ in textual value.**
- All inspected CSS parsed with **zero parse errors** by this parser in the exercised rule types.
- These are static collisions, **not 70 proven rendering defects**. Properties can intentionally vary by state, layer, media query, specificity or custom-property context; the test has not evaluated the full browser cascade or screenshots.
- `gcc-floodlit-fonts` has @font-face content but no ordinary qualified rules; the zero-declarations count for that style is expected for this diagnostic.

## Initial visual priority

The strongest cluster of repeated late-block declarations concerns `#g8app#g8app#g8app .g8days>span` and `.g8days>span.active` in the **signing-week day indicator**. Specifically, background, border, text colour and minimum width are redefined across styles 31, 33 and 35. This is a better candidate for a tightly bounded native computed-style check than a blanket visual rewrite.

A separate repeated outline-offset declaration affects the Scout button's focus-visible state, and two ::selection declarations differ. Those merit focused keyboard and selection-state review.

**Do not remove any CSS automatically** from this inventory. Check desktop and 390px actual rendering, winner/provenance, disabled and focus states, then consolidate into one owner in a separately tested candidate only.

## Parser report

# GCC v116 static CSS cascade review
This is an exact-release, read-only STATIC collision inventory. It does not replace native computed style or screenshot checks.
- CSS declarations inspected: **20,715**
- Same-selector/property/importance/condition pairs spanning different style blocks: **70**
- Those with different values: **52**
- Repeated pairs involving one of the three late visual/cleanup/perfection blocks: **12**
- Of those, different values: **12**
| CSS index | Style block | Selectors | Declarations | Parse errors |
|---:|---|---:|---:|---:|
| 01 | \`(none)\` | 2,415 | 12,725 | 0 |
| 02 | \`gcc-club-catalogue-styles\` | 1 | 8 | 0 |
| 03 | \`gcc-bulletproof-styles\` | 23 | 67 | 0 |
| 04 | \`gcc-save-status-styles\` | 2 | 6 | 0 |
| 05 | \`(none)\` | 118 | 428 | 0 |
| 06 | \`(none)\` | 23 | 100 | 0 |
| 07 | \`(none)\` | 33 | 182 | 0 |
| 08 | \`(none)\` | 37 | 134 | 0 |
| 09 | \`gcc-charcoal-20261030\` | 279 | 1,151 | 0 |
| 10 | \`gcc-decision-ui-20261030\` | 923 | 3,593 | 0 |
| 30 | \`gcc-floodlit-fonts\` | 0 | 0 | 0 |
| 31 | \`gcc-floodlit-visual\` | 427 | 1,503 | 0 |
| 32 | \`gcc-floodlit-v93\` | 38 | 103 | 0 |
| 33 | \`gcc-composition-20261107\` | 61 | 320 | 0 |
| 34 | \`gcc-visual-pass\` | 20 | 37 | 0 |
| 35 | \`gcc-cleanup-pass\` | 40 | 186 | 0 |
| 37 | \`gcc-v116-perfection-pass\` | 40 | 172 | 0 |
## High-priority late-block duplication candidates
| Selector | Property | Block indices | Values differ? |
|---|---|---|---|
| \`#g8app#g8app#g8app .gccuiPlayerScout:focus-visible\` | \`outline-offset\` | 31, 37 | Yes |
| \`#g8app#g8app#g8app .g8days>span.active\` | \`border-color\` | 31, 33, 35 | Yes |
| \`:root\` | \`--gcc-panel\` | 9, 31, 35 | Yes |
| \`#g8app#g8app#g8app .g8days>span\` | \`background\` | 31, 35 | Yes |
| \`#g8app#g8app#g8app .g8days>span\` | \`border-color\` | 31, 35 | Yes |
| \`#g8app#g8app#g8app .g8days>span\` | \`color\` | 31, 35 | Yes |
| \`#g8app#g8app#g8app .g8days>span\` | \`min-width\` | 33, 35 | Yes |
| \`#g8app#g8app#g8app .g8days>span.active\` | \`background\` | 31, 35 | Yes |
| \`#g8app#g8app#g8app .g8days>span.active\` | \`color\` | 31, 35 | Yes |
| \`::selection\` | \`background\` | 31, 34 | Yes |
| \`::selection\` | \`color\` | 31, 34 | Yes |
| \`button:disabled\` | \`cursor\` | 1, 34 | Yes |
**No automated deletion or automatic winner attribution is permitted from this report.**

## Release discipline

This is an analysis of the exact original v116 HTML, **not** visual sign-off or maintained-source reproduction. Existing native cricket and storage tests remain valid only for their expressly exercised scenarios. The release file and `main` were not changed by this audit.

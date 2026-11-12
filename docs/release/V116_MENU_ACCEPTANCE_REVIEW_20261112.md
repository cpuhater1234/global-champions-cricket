# v116 menu candidate review | 12 November 2026

Status: full automated acceptance passed in run 43141508809 after correcting the runner's package mirror. This verifies the checksum-pinned menu candidate; it does not promote the artifact or resolve the outstanding palette/source-ownership findings.

## Candidate identity

- SHA-256: `943643a36730f9db6630437b15111b5f82041b540998f793230aab1745be21e3`
- Size: 6,641,178 bytes.
- Accepted finals base: `5ba82e499b0b8d08706aab851449d20b6d315bf9b780a8c9674b44933d3fe094`.
- QA correction commit: `38de5d0cab2f0a67bb4b6d0738b82125b636f96f`.
- Full acceptance rerun: https://github.com/cpuhater1234/global-champions-cricket/actions/runs/43032675898

## Confirmed failure and correction

Run 43008658075 failed at the report verifier, after the native menu audit completed. Its logged report contains an array of state objects, empty errors and empty failures. The assertion compared the array itself with 18. The sole workflow correction changes `r['states']==18` to `len(r['states'])==18`. Candidate identity, page-error and layout-failure assertions are retained. The subsequent saved-career verifier must pass in the rerun before acceptance can be claimed.

## Visual inspection

Inspected actual repository contact sheets `how.png`, `howItWorks.png` and `breakawayStory.png`, bearing the exact candidate checksum. They include 1440, 1024, 768, 390 and 320px views; How to play also includes each of the three expanded rule groups at 390px.

- Flat rows and fine dividers give the guides a coherent reading structure without nested card backgrounds.
- Two columns at desktop widths and one column at tablet/mobile widths are consistent with the intended responsive structure.
- Circular step numbers, strong headings and aligned icons create a clear hierarchy.
- Expanded rules use separated sections and readable headings rather than undifferentiated adjacent prose slabs.
- The story's final section has visibly stronger text contrast.
- Phone captures show scrollable content; they do not show every footer and every expanded-rule paragraph simultaneously. These contact sheets alone do not establish complete scroll/focus usability or exhaustive gameplay correctness.

### Outstanding visual concern

The modal is visibly navy, not neutral charcoal. The failed run's computed measurements give `modalBodyBackground: rgb(12, 26, 40)` (`#0c1a28`). The menu owner uses `var(--gcc-panel)`; `v8/ui/floodlit.css` defines that token as `#0c1a28`, whereas `v8/ui/arcade-charcoal.css` defines it as `#282828`. The captured rendering demonstrates that the effective candidate palette is Floodlit navy. The term 'charcoal tokens' in the menu comment does not establish charcoal rendering.

The structure is suitable for user review, but the candidate should not be described as fully satisfying the charcoal visual direction. No speculative palette change was made during this checksum-pinned acceptance run.

## CSS ownership and scope

The guarded menu builder replaces one delimited guide owner inside one existing decision-ui style block. It asserts 17 style blocks and 22 script blocks before and after, one changed style block, and zero changed JavaScript blocks. No new override stylesheet was introduced by this correction. The broader source still contains historical high-specificity and `!important` rules, so this bounded replacement is not certification that the entire cascade is simplified.

The builder explicitly describes itself as a guarded review adapter, not full maintained-source build parity. That limitation remains.

## Protected state verified before work

- main: `b5a9185c51eea4a0f104a94a92fa152abfaf5db4`
- v116: `2648c00b6f1932a690053e7cfba9ecf76ec0cac8`
- Starting QA branch: `c73afb1d26a12ee61b4e52645f621658241a96f2`

Only the QA workflow and this review documentation were changed in this session. The frozen HTML was not edited. No promotion is authorized by this review.

## Acceptance rerun outcome

Run 43032675898 attempts 1 and 2 both failed in `Install native Chromium and test dependencies`, before candidate generation or gameplay tests. Job IDs: 130563455258 and 130567438932. Both logs report `Temporary failure resolving 'azure.archive.ubuntu.com'`, failing to download nine Ubuntu font/Xfont packages; Playwright dependency installation exits with code 100. No acceptance gate was removed or skipped to work around the infrastructure failure. Full acceptance, including the final saved-career verifier, is therefore NOT cleared.

The actual assertion-report payload from the earlier failed run was independently evaluated locally: the old array-to-integer comparison fails, and the corrected length comparison passes with all 18 states, empty errors/failures and the exact candidate checksum. This confirms the assertion correction but does not substitute for the full rerun.

Earlier run 43008658075 passed 19 seasons, 266 user regular-season matches and 16,564 assertions, plus native persistence and two-tab recovery. These are prior-run results, not a new full acceptance pass.

## Successful full acceptance after mirror correction

Run https://github.com/cpuhater1234/global-champions-cricket/actions/runs/43141508809 completed successfully on commit `03e41c9af9d052c0bd73edf863a4a74d7b342cad`. All test and verifier steps passed, including the exact candidate build, signing at five widths, 19-season career harness, native gameplay/save/reload/Continue, responsive new careers, two-tab stale-save recovery, menu layout and final saved-career responsive rendering. No acceptance gate was removed.

The sole workflow change replaces the failing Azure Ubuntu archive address in the runner mirror list with the official Ubuntu archive before the existing dependency installation. The candidate remains exactly `943643a36730f9db6630437b15111b5f82041b540998f793230aab1745be21e3`, 6,641,178 bytes. Earlier failed-run descriptions above are historical and are superseded for automated acceptance by this result. The navy palette and maintained-source parity limitations remain open.

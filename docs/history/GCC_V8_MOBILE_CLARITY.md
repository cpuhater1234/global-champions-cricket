# Mobile clarity and career continuity

Continuation of the player-journey review at working-branch commit `f5a89058937c7e2e74ddab22218d81f6f7d0865b`. This pass addresses the remaining mobile density problem and gives the season review a factual connection to the previous year.

## Changes

- Mobile draft lists initially show six candidates, versus twelve on desktop. Show more adds six on mobile. Sorting, searching, annual drafts and cold restoration use the same responsive limit. The full pool remains searchable and expandable; player eligibility and draft decisions do not change.
- The keeper/twenty-over guidance appears before the candidates. In the final native 390px journey it appears before the first candidate, rather than beneath the entire board.
- Result cards place the two innings alongside each other when their container has sufficient room. At390px with normal text, the tested real loss card shrinks from728px to499px, about31%. At320px it intentionally retains the stacked layout. Enlarged text also stacks when needed.
- A redundant mobile turn-status sentence is removed; the turn heading remains, with space reserved for two lines to reduce movement between clubs. In the final390×844 native journey, the first candidate starts at705px and fits fully in the initial viewport. Controls retain44px height.
- Club-name space is shared visually so different name lengths do not put the scores on different rows. Mobile padding and header word wrapping prevent the confirmed narrow-screen horizontal overflow at200% text size.
- Season reviews compare regular-season wins with the immediately preceding archived season. The comparison is omitted when that history is unavailable. Finals totals, lifetime manager wins and fictional targets are not substituted.

These are presentation changes. Cricket calculations, ratings, scouting, CPU policy, trades, releases, player development and career rules remain unchanged.

## Verification

Final results: **65/65 stable-input suites passed** on the logic candidate. Final finishing changed CSS only; executable script payloads are byte-identical. Six focused suites were rerun on the final artifact, plus **230 browser screen states**, **nine text-sizing cases** and the native draft journey, with no reported failures. The test default was corrected to the current artifact after the broad run and rerun successfully.

Final HTML SHA-256: `4e3e50ca51c1759f1a410494a4a8cc473dfd671cef1450eeca81397bf4737afa`. The65-suite candidate hash and executable identity proof are retained separately in the evidence JSON.

Exact hashes and final outcomes are recorded in `qa/GCC_V8_MOBILE_CLARITY_EVIDENCE.json`. The focused tests cover responsive pagination and read-only season comparisons. Native browser actions cover fresh drafting, expansion, sorting, searching and cold restoration. Layout checks cover320/390/760px at100%,150% and200% root text sizes, including equal score alignment and intentional stacked fallback.

Browser screen audits also cover early flow and2019/2025/2026 career screens, with geometry and automated accessibility checks. They use saved fixtures for later screens and deliberately fail external photographs. They do not count those renders as newly simulated seasons or actual device testing.

## What remains uncertain

Fewer candidates and shorter cards reduce scrolling, but do not prove that first-time players understand the decisions or enjoy a sustained career. The first candidate still follows the turn controls, search and role filters; those retain substantial height. More aggressive hierarchy changes should be evaluated with observation, rather than assumed better because they fit more controls on screen.

The prepared [first-player protocol](GCC_V8_FIRST_PLAYER_PLAYTEST.md) covers unassisted drafting, XI selection, interpreting a real defeat, season-two rebuilding and returning after a break. It explicitly distinguishes unfamiliar-player observation from guided automation and late-career fixtures. No participant sessions have been run or fabricated.

Native Windows/Safari, actual touch-device comfort, screen-reader speech, genuine background-tab behavior and long-term strategic balance remain outside this pass. The previous paired trade pilot remains exploratory evidence, not a winning-strategy certification.

## Reproduction

```sh
python3 v8/build.py --output game/gcc_v8_mobile_clarity.html
GCC8_TEST_BUILD=game/gcc_v8_mobile_clarity.html node qa/v8_mobile_journey_test.mjs
GCC8_TEST_BUILD=game/gcc_v8_mobile_clarity.html node qa/mobile-clarity-20261020/native-draft.cjs
GCC8_TEST_BUILD=game/gcc_v8_mobile_clarity.html PROBE_TAG=final node qa/mobile-clarity-20261020/layout.cjs
```

The browser probes require Playwright and a compatible Chromium executable. Existing broad browser audits additionally require axe-core; the scoped scripts retain test-host paths that can be adapted to another environment.

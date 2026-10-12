# GCC v7.9.0 recovery candidate

This is the first implemented recovery candidate following the supplied capture.
It is not visually signed off. Open `game/global_champions_cricket_v7_9_0_recovery_candidate.html`
in the user's normal browser for the next captured review. The game stays self-contained.

## Changes

- Live signing text no longer fades between updates. Signed/declined decisions use clear green/red washes and opaque type at every pace.
- Roster rows keep concise role labels, rating, selected status and actions in stable columns. Detailed role prose remains available as the row's title. Pick/remove/order actions retain keyboard focus and page scroll. At an order boundary, focus moves to the enabled opposite arrow.
- The XI report is sticky on sufficiently wide screens and stacks at narrower widths. Detailed selection reads remain optional. A thin batting depth now prevents the presentation from calling the XI Elite/Balanced; the underlying ratings and penalties are unchanged.
- Match result scores explicitly name both clubs. Non-overview season tabs use compact result context. The decorative MATCHDAY watermark is removed.
- Finals puts the current match and its primary action before the bracket. The waiting Grand Final panel is compact.
- Home uses an unboxed vector identity: separate three stumps, two bails, a red cricket ball with a stitched seam and GCC lettering. It has not been approved visually.
- Modal Close remains visible outside the scrolling content. Modal logic handles Escape, Tab containment, return focus, background inertness and scroll locking, including direct opens from Dynasty.
- Full draft tags are visible, with no separator left behind an intentionally hidden tag. Singular remaining-pick wording is fixed.

## Functional repairs

1. Continue retains a valid saved Finals, Review, Legacy or Archive lifecycle screen instead of overwriting it with Season/Team. Normal in-season fallback remains intact.
2. An R1/R2 pick is tradable only when the originating human club actually has that many vacancies, retains its ownership and is in a pre-draft offseason phase.
3. A traded pick retains its ordinary snake slot and acquiring owner. Vacancies left by transferred picks receive manual supplementary choices after the ordinary draft, so the human can reach 15 and lodge the list. These choices are not tradeable ordinary-round assets. CPU list completion still uses the existing roster-shape rules.

The stress suite was changed to require rejection of nonexistent assets, while
retaining accepted real-pick, double-spend, owner and final-roster assertions. It
also requires the human supplementary choice and successful list lodging. No
failing assertion was disabled or marked as an expected pass.

## Stylesheet ownership

`styles/recovery.css` owns the changed component properties. The one-time
`tools/recovery_css_ownership.py` migration removed 184 superseded declarations
from the legacy sheets before removing all `!important` from the new component
rules. Untouched components retain their legacy styling. This is a scoped first
step, not a claim that all legacy cascade debt or the complete shared design
system has been replaced.

## Verification

Final candidate SHA256: `672dd4a73b68aed050cd3a9ffb2414517167e4f90ad00a9bc765ba90259bf152`.

- Full career: 1,702 checks passed, 19 seasons and 266 user scorecards, no failures or game console errors. Finals, Review and Legacy all restore to the saved screen.
- Targeted stress: 45 checks passed, including nonexistent-pick rejection, transferred-pick ownership, human supplementary selection, 15 unique players per club and successful list lodging.
- Controlled interaction tests: 21 checks passed.
- Source/extraction and CSS migration tests: nine passed. All ten inline scripts pass Node syntax validation.

The full-career report pins the exact delivered file hash. Results are retained
in `qa/v790_offline_game_results.json`, `qa/v790_offline_game_stress_results.json`
and `qa/v790_interaction_results.txt`. This covers one deterministic full-career
seed and targeted controlled scenarios, not every club/seed or a rendered browser.

Build with `python3 tools/source_workspace.py build game/global_champions_cricket_v7_9_0_recovery_candidate.html`.
Run `python3 tools/source_workspace.py check` and `python3 -m unittest qa/test_source_workspace.py`.
The source tests re-extract and rebuild the protected checkpoint in a temporary
directory to keep its exact digest test, rather than blessing a new digest.

Run the candidate-specific functional suites:

```sh
node qa/offline_game_regression.mjs game/global_champions_cricket_v7_9_0_recovery_candidate.html qa/v790_offline_game_results.json
node qa/offline_game_stress.mjs game/global_champions_cricket_v7_9_0_recovery_candidate.html qa/v790_offline_game_stress_results.json
node qa/recovery_interaction_test.mjs
```

The interaction suite uses controlled DOM objects for dialog focus and XI
focus/scroll preservation, plus real exported game APIs for moves, swaps and
tab transitions. It does not measure browser latency, real focus events,
animation frame rate, rendered geometry or responsive layout.

Protected player/league data, ratings, player projections, CPU foundation draft
and home-motion script blocks remain byte-identical to the checkpoint. No
GitHub Actions workflow or deployment was added.

## Outstanding acceptance work

Capture this exact candidate at the agreed viewports and compare with the prior
90-image evidence. Check desktop and narrow XI layouts, live signing at every
pace, modal scrolling, keyboard navigation, swaps, tab transitions, finals,
review, offseason/trade and later years. Still images alone cannot prove smooth
interactivity. The existing source/runtime checks cannot replace this gate.

The foundation/annual draft views are still separate. Further shared component
work, remaining typography/wording and later-season visual review remain open.

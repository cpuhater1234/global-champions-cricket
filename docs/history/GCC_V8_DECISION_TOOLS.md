# Faster cricket decisions

Continues the reviewed decision-first UI at `a45a882dbca2f8d101a86ab7e8eb4f267bb78f73`.

## What changed

- Draft cards offer Compare. Squad scouting offers Compare players. Both open two players together with roles, age where known, selection status, injury/form, and current overall, batting, bowling, fielding and keeping ratings. Phase skills remain expandable.
- A labelled selector changes the comparison without closing scouting windows or remembering numbers. Pick and Select/Swap actions use the existing eligibility checks. Comparing never selects anyone automatically.
- Shared All, Batters, Keepers, All-rounders and Bowlers filters narrow the bench or annual-management list. Selected XI rows remain visible; an empty filter explains how to restore the list.
- A compact coverage strip shows available keepers, regular bowlers and openers beside the draft and selected XI. These are descriptive counts using existing role/workload functions, not new selection quotas.
- Annual management shows the filled squad count and a compact retirement/release/draft-vacancy summary with existing squad-needs guidance. Retention and release rules are unchanged.
- On narrow screens, comparison columns use Player 1/2 labels matched to the named cards, preventing long surnames from crowding adjacent columns.

No engine, player-data, competition or save-format changes.

## Verification and review

Final build SHA-256: `e55bc318d10d5d1b07c7ba64e02e326ee5f7ea9a4d20d04be3ce4b96b8644da9`.

- 100 final-build Chromium screen/dialog cases at 1440, 1024, 768 and 390px. No page errors, overflow, clipped controls, detected sibling collisions or fragmented words.
- Native comparison/role-filter clicks at five widths, including 320px, with a long-name target and expanded innings skills. No errors or text extending beyond tested comparison cells. The first run reproduced crowded long names; the final run passed after responsive headers were corrected.
- 34 final-build decision-tool checks: comparison read-only behavior, self/unknown target rejection, pending-swap protection, selected-player injury display, role filters, annual summary, annual comparison and the guarded Pick action.
- Seven targeted suites passed: decision flow, team workspace, paced draft controls, annual management, pre-match controls, management boundaries and readable feedback.
- Complete 2008–2009 run: 1,735 checks, 28 league matches, annual draw/draft, manual XIs, a finals campaign and cold reload checkpoints. No unexpected errors or storage quota failures. This began on the tools candidate before the final mobile column labels and age text; cold reloads use the current build path. Those last changes were presentation-only. Final-build browser and decision-tool checks ran after source was frozen.
- Frozen-engine rebuild is byte-identical to the final artifact. `git diff --check` passes.
- Independent review found no critical/important regression. Two minor findings were resolved: selected injured players now show injury and XI status together; the new test defaults to the correct tools build.

Detailed acceptance evidence: `qa/GCC_V8_DECISION_TOOLS_EVIDENCE.json`.

## Practical limits

This improves repeated decision work; it is not proof that nineteen seasons are equally enjoyable. Full squad lists still scroll on small screens. The comparison contains cricket ratings, not a prediction of the better match outcome. Prior nineteen-season simulations and earlier browser cases are not recounted as fresh coverage here. Remote photo requests fail deliberately in geometry tests.

# Whole interface evidence ledger

Build under inspection: SHA25679a2fbfe965453ad0ef04d238ee7047346fb38e537deeec47d91cfcbebf51c4a.

## Evidence distinctions

- Live user browser: Matchday, manual XI, analysis, player overview/attributes, ladder, fixtures, club statistics, match preview and captaincy, existing result, trade form including disabled Review trade. Navigation only. Returned to Lucknow2010Round3; no fixture played, no XI/save mutation.
- Native generated career: first sweep produced243 screenshots at1440x900,1280x720,390x844. No document horizontal overflow reported. Images must be retrieved and individually reviewed before calling those screens visually assessed.
- Actual completed checkpoints2009,2019,2025,2026 provide review/archive/player/averages/offseason states. Historical finals stage replays explicitly reconstruct stage labels from actual completed finalists/results. They do not prove new live finals transitions.
- Local VM harness:19seasons,266regular matches,16,564checks,errors[]. This tests engine/controller integrity and validated backup round trips, not browser storage or visual quality.
- Previous guide-native checks:54paired states plus non-guide fixture parity. These apply to the guide candidate only, not the new shared-control candidate.

## First native sweep failure diagnosis

Run43216220938 correctly failed its final gate. It produced243screenshots, but its script made three invalid assumptions:

1. Requested the trade form in2008. Product correctly rejects trading before2009.
2. Requested skipPick after starting the2010annual draft when the actual roster had no vacancies and immediately advanced past drafting.
3. Same condition for2020.

Local QA script correction records the unavailable foundation trade state, captures actual later-year trade forms, and checks annual phase before issuing skipPick. A no-vacancies transition is labelled distinctly. These corrections are pending a native rerun. Do not report the first sweep as passing.

## CSS provenance

There are17style blocks and22scripts. Fonts/assets account for substantial stylesheet byte size. Block count alone is not proof of visual defects. The concrete ownership conflict is shared controls taking typography from gcc-floodlit-visual, primary fill/shadow from gcc-cleanup-pass and selected state from another high-specificity floodlit rule. Decision component geometry is separately authored in gcc-decision-ui-20261030. Multiple late owners create fragile correction paths.

Full maintained-source composition parity remains unverified. Guarded frozen-build adapters are review candidates, not proof that v8/build.py reproduces the delivered artifact.

## First correction candidate

SHA25673091780d5c0f867a3c4cd45a7b6153bc3dfac1bc0fe6a38628bf15f5e35be9f. Eight declarations changed in existing two style owners: ordinary app/dialog button family and tracking, three app button transforms, primary raised shadow. No new stylesheet. All22scripts identical; guide component owner identical. Native geometry, hover/active and guide computed-style parity remain pending.

No final weighted product score or release-ready claim yet. Unreviewed rendered states remain unscored.

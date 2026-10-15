# Career uncertainty and numerical audit — 15 October 2026

This is a read-only findings checkpoint, not an approved implementation design. The playable remains `game/global_champions_cricket_v8_logic_review.html`, SHA256 `356325d44873facc0bcea04c667112d50c10acf1fab67e390b51f08b1ba13d03`, Library version 23. No gameplay or UI source changed in this audit.

## Required behaviour is missing

Twelve fresh seeded worlds produced twelve distinct signed pools, but **zero of the 399 players had different underlying development paths**. Each world traversed all 4,946 active player-years through the actual career application function, comparing overall and the underlying attributes. Match randomness, form and injuries exist; persistent alternative career outcomes do not. Maxwell has the same peak-96 curve in every tested world.

The CPU reads the same fixed future metadata. In an isolated diagnostic copy, changing Maxwell's hidden peak from 96 to 60 while leaving his current visible skills unchanged reduced CPU future value from 91.2561 to 58.7730 and draft score from 85.9707 to 63.7980. This probe demonstrates dependence on future metadata; it is not a simulated disappointing career.

The root cause spans `v8/domain/career_paths.js`, career application and shared AI projection/scouting. Existing path-consistency checks did not test variation across worlds. Their passing results did not establish the behaviour Tom wants.

## Individual player information is not perfected

The complete shipped inventory has 399 players, including 130 generated later-arrival profiles. A targeted completeness check of 27 prominent names found 13 absent from the entire universe: Kane Williamson, Trent Boult, Tim Southee, David Miller, Mohammad Nabi, Fazalhaq Farooqi, Ben Stokes, Jonny Bairstow, Michael Neser, Dawid Malan, Ishan Kishan, Yuzvendra Chahal and Ravi Bishnoi. This is a targeted check, not an exhaustive census of every missing cricketer.

Generic all-rounder templates also produce suspicious cricket identities:

| Player at generated peak | Overall | Bat | Bowl | UI bowling involvement |
| --- | ---: | ---: | ---: | --- |
| Rashid Khan | 99 | 92 | 93 | Supporting bowler |
| Sunil Narine | 97 | 95 | 89 | Supporting bowler |
| Wanindu Hasaranga | 96 | 94 | 89 | Supporting bowler |

These are current model outputs, not measured historical ratings or proposed replacements. The shared usage prior is 2.35 for these profiles, explaining the misleading involvement wording. Narine's generated slot-eight identity also lacks his changing opening role. Individual role, usage and skill priors require review before adding randomness; uncertainty must not conceal a poor baseline.

The explicit identity layers inspected here contain twelve sourced birth dates and nine sourced broad bowling identities. Other legacy provenance may exist. An absent citation in these layers does not prove a field wrong. The inventory is not primary-source certification of all biographies, debuts, exits, skill ratings or year-specific roles. Separate factual evidence, model estimates and simulated outcomes in the next design.

## Numerical checks with clean sampled results

- Secondary cross-row audit: 664 previously captured matches, 35,551 checks, no errors. Opposing XIs, named wicket credits, fielding identities and DNB figures reconcile. These are existing matches, not 664 new simulations.
- Frontend/archive audit: eight existing completed 2008 saves, 2,620 checks, 120 displayed scorebooks and 120 average rows; no errors or presentation-string findings. Independently summed actual club scorebooks agree with displayed runs, batting averages, strike rates, wickets and economy. League results, NRR arithmetic, archived figures, appearances and raw record leaders reconcile.
- Zero-ball strike-rate suspicion was disproved; the inspected UI correctly displays a dash. Do not report it as a defect.

These checks add to the preceding logic review. They do not establish historical scoring calibration, ball-by-ball causal realism, native layout, focus, scroll, photo loading, smoothness or enjoyable difficulty. No rendered evidence was acquired. Existing browser restrictions remain.

## Recommended correction for design approval

Use historically anchored **expected careers**, plus a private **realised career** drawn once per player/world and persisted. Most outcomes should remain near the expected standard, with rare meaningful disappointments and breakouts. Preserve cricket roles and separate skill families; an elite bowler should not acquire elite batting from one global multiplier. Keep the exact 2008 current-ability anchor and never reroll outcomes on reload, trade, draft speed or match RNG consumption. Preserve archived matches; old-save migration must not rewrite history.

CPU and user scouting should estimate potential from the same permitted evidence: baseline expectations, current skills and observed performance. They must not inspect the private realised future. This still lets the CPU price Warner/Kohli as valuable prospects without guaranteeing their future. Correct the missing-player and individual-template gaps alongside this work.

More match randomness alone would leave careers predictable. Broad independent random ratings would damage player identity. Anchored expected and realised paths best meet the request, but tail frequency, timing, persistence and migration need a written design before implementation.

Feedback should show bold current ratings, meaningful observed development, role fit and cautious scouting outlooks. Keep detailed data behind Scout; never reveal a secret flop/breakout roll or guaranteed peak. No new salary-cap or contract administration is proposed. Native rendered review remains necessary before claiming arcade presentation quality.

Acceptance evidence must include distributions across many worlds, stars usually strong with rare poor careers, plausible weaker-player breakouts, role/attribute bounds, CPU independence from private future mutation, reload/trade/skip invariance, old-save migration and unchanged scorebook accounting. Controlled strategy comparisons and human learning tests remain necessary for difficulty and enjoyment claims. Actual-XI chemistry and overall/role-composite consistency also remain open from the preceding audit.

## Reproduction and evidence

Run from the repository root with the unchanged playable available:

```sh
node qa/v8_uncertainty_audit.mjs
python3 qa/v8_statistics_crosscheck.py
node qa/v8_statistics_frontend_review.mjs
```

The numerical scripts require the existing captured `qa/logic/final-career-5603`, `final-career-5701` and `final-clubs/0..7` scorebooks/saves. Those large local fixtures are not added by this checkpoint; retained result JSON is scoped evidence, not a self-contained reproduction bundle. The uncertainty script requires the existing `qa/logic_game_host.mjs`; its host exposes private functions only in temporary diagnostic copies.

See `qa/v8_uncertainty_audit_scope.json`, the complete `qa/v8_individual_player_audit.json`, and the three result files. The uncertainty report intentionally records a missing required feature; it is not a passing acceptance test for that feature. Implementation is pending design approval.

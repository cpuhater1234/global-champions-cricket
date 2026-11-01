# Independent GCC review, 1 November 2026

Candidate: Build30, generated from pinned baseline with qa/perfection-20261030/patch.py. Three independent lenses: premium UI, player experience, cricket/statistical integrity. Reviewers were read-only except dedicated regression tests; root integrated production changes.

## Confirmed defects addressed

| Priority | Finding | Change | Evidence |
| --- | --- | --- | --- |
| P2 | Injury recovery freezes through finals | Shared round boundary applies fitness once, advances recovery once, and limits new injuries/aggravation to actual participants. Both visible and offscreen finals use it. | Old Build29 failed recovery tests. Candidate passes 1,324 assertions across 13 isolated later-year fixtures, including new semifinal/GF injuries, aggravation, permanent-skill restoration and repeated-action guards. |
| P2 | Eleven players can enable XI confirmation without keeper, or with an OUT player | Confirmation now uses the authoritative XI legality check; the reason appears beside selection progress. | Test failed on old view. Candidate passes legal, no keeper, selected injury and incomplete XI cases. |
| P2 | Selected report tabs use dark text on dark club colours | Existing contrast-aware club ink now styles selected report tabs. | Punjab red with fixed dark text was 3.46:1; white ink is 5.19:1. Source-pair calculation, not rendered all-club certification. |
| P2 | At 761px bench names break inside words in two-column selection | Use single-pane XI/bench tabs through 1000px. | Root physically observed Ryan Sidebottom and Azhar Mahmood breaking midword on Build29. Candidate rendering remains pending after download. |

## Independent evidence

Integrity reviewer reconstructed ten aggregate fields across 15 user-club scorecards, including a semifinal, for 14 players: matches, innings, runs, balls, outs, fours, sixes, wickets, bowling balls and conceded runs. All matched season statistics, archived career totals and club records. This was offline Build29 evidence, not a browser playthrough.

Experience reviewer completed fresh draft, legal XI, 14 rounds and offseason in the command host without runtime errors. Selection and bowling concerns and transfer requests emerged. That establishes execution, not human enjoyment or visual quality.

Root physically inspected Build29 in the connected Chrome: mobile 390px player Overview/Management and XI, 761px XI, mobile archive table, Escape focus return. Viewport returned to desktop; career unchanged. Subagents could not access the originating browser context and did not perform physical playthroughs.

Retractions: dossier move arrows do have central accessible labels. This was removed as a false positive. Earlier guide-focus risk is superseded by actual successful focus-return verification. Neither is an open defect.

## Ranked remaining work

1. P2: Rotation explanations currently grant repeatable trust and omission grace even without a relevant concern. Investigate relevant-concern gating and relationship balance; avoid rewarding routine dossier clicking.
2. P2: Ordinary bowling priority is coupled to a relationship promise. Define explicit selection tactics separately from commitments and preserve legal over allocation.
3. P3: Explain commitment horizons before committing, including fit-match pauses and shortened innings.
4. P3: Offseason overview should acknowledge unresolved transfer requests and active relationship stories.
5. P3 risks requiring physical checks: live mobile club identity, sticky trade actions at zoom, essential small text across draft/matchday.
6. Historical real-life performance calibration remains unpromoted. Existing offline prototype is not imported into the game. Validate sample weighting, overlap and held-out performance before changing starting ratings.

## Release gates

The builder parses all20 inline scripts. Delivery engine script2 is byte-identical to Build29; changed scripts are9,10,18. Current targeted tests and relevant existing suites are recorded separately. No full visual sign-off is claimed for Build30 until it is opened in the user browser. No claim of exhaustive coverage or 10/10 quality.

## Fresh verification for Build30

Builder: all20 inline scripts parse. Selection gate and contrast regressions pass. Finals injury regression passes 1,324 checks across13 deterministic fixtures. Existing perfection regression:6/6 pass. Management unit suite passes. Integration:28 no-promise regular matches retain exact baseline result parity across seeds101/809; both finals paths complete;12 simultaneous promised bowlers receive legal allocation and management state restores correctly. Archive, guides and focused dossier contracts pass. There is no package-level test command in this extracted single-file workspace; these are its relevant existing suites. Full long-career rerun and new-build browser sign-off remain outstanding.

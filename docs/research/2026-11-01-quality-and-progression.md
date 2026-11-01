# GCC quality and player progression investigation

## What the source actually does

Match scorecards feed `state.playerSeasonStats`. Season review archives that ledger as `dynasty.history[].playerStats`. Club-specific records separately respect the player's time at that club. Current form changes after matches, is bounded to -3 through +3, influences selection/match calculations, and decays by one step in offseason advancement.

Permanent skills follow `GCC8_OUTCOMES.skillsAt(careerOutcome, year)`. That function consumes stored yearly baselines, career-family offsets and timing offsets. It does not consume saved match statistics. `GCC8_CAREER_STATE.applyYear` applies those skills; `dynasty.advanceCareers` decays form and calls the annual application. Therefore performances currently influence form but do not influence the permanent career trajectory. Independent source review confirmed this gap.

The profile catalogue explicitly distinguishes verified identity information from model-estimated skills, peaks and career windows. A source for a birth date or player identity does not validate a batting rating. Nothing in this investigation establishes that all historical ratings, grounds or career dates are correct.

## Research and its application

| Primary resource | Relevant finding | GCC application |
| --- | --- | --- |
| [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) | Normal text generally needs 4.5:1 contrast, large text 3:1. Keyboard focus, reflow and target sizing are separate requirements. | Measure rendered foreground/background pairs in every state; do not infer readability from the colour palette. Preserve visible focus and test narrow layouts and zoom. |
| [Xbox text display](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/101) | Readability includes size, spacing and scaling; the guidance gives platform-specific pixel examples. | Use a deliberate type hierarchy and test actual display sizes. Do not directly equate raster display pixels with browser CSS pixels or certification. |
| [Xbox contrast](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/102) | Important standard text and UI elements should have adequate contrast, including placeholders and inactive controls. Text over images needs worst-area assessment. | Club-colour ink must be measured; status cannot rely on colour alone. Keep important copy on solid panels. |
| [Xbox UI navigation](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/112) | Predictable layout, navigation order and focus movement are important across the whole game. | Stable primary/back actions, normal keyboard navigation, correct return from scouting and preserved trade context. |
| [W3C tables tutorial](https://www.w3.org/WAI/tutorials/tables/) | Header and data relationships need semantic markup; complex tables may need explicit associations. | Captions, header cells, labelled scroll regions, numeric alignment, complete records and clear empty states. |
| [Sports Interactive player manual](https://community.sports-interactive.com/sigames-manual/football-manager-2024/players-r4958/) | Player attributes have specific meanings; development involves meaningful playing time and training conditions. | Use separate batting/bowling skill families and explain development causes. This is a reference for management design, not a cricket formula to copy. |
| [Microsoft TrueSkill research](https://www.microsoft.com/en-us/research/publication/trueskilltm-a-bayesian-skill-rating-system-2/) | Estimated skill and uncertainty are distinct; observed outcomes contain noise. | Limited evidence must produce conservative changes. TrueSkill matchmaking is not directly a cricket attribute-development algorithm. |
| [Finding Your Feet](https://academic.oup.com/jrsssc/article/70/2/481/7033927) | A Bayesian career model estimates batting ability over time rather than treating the batting average as complete ability. Study concerns Test cricket. | Use its treatment of changing latent ability and uncertainty as a modelling principle; do not transfer Test coefficients into T20. |
| [CAMP paper](https://www.tandfonline.com/doi/full/10.1080/01605682.2023.2237530) | The paper describes performance evaluation using opponent strength and match circumstances. | Evaluate contribution against opportunity and context, rather than using totals alone. The accessible abstract supports the principle, not a claim that GCC implements its method. |
| [Cricsheet JSON specification](https://cricsheet.org/format/json/) | Structured identities, deliveries, runs, extras and wickets are distinct data elements. | Reference schema for a reproducible historical calibration dataset. No full dataset was ingested or historical calibration completed in this pass. |

## What polished implementation means here

A consistent spacing and typography scale; aligned panel and table edges; club colours in deliberate places; the approved cricket icon family; useful empty, loading, disabled and error states; one understandable main action per stage; clear season and career time scopes; readable text; predictable focus and return routing. Extra gradients, glass panels, decorative badges and animation do not substitute for those behaviours.

The current cascade contains repeated overrides from earlier visual revisions. Continue moving each reviewed component toward an authoritative style block rather than layering unrelated fixes across the whole app. Refactor only with parity and render checks. A wholesale rewrite would put verified game behaviour at risk.

## Required permanent-performance model

This is the remaining implementation specification, not a claim of a shipped model.

1. Preserve distinct layers: historical/model prior, permanent learned ability, temporary form, fitness, and suitability for the selected role.
2. Gather evidence from all clubs under the same rules. Use stable player identity, exact season, batting/bowling opportunity, innings phase, opponent ability, ground/conditions, and chase state where supported.
3. Estimate separate batting scoring/survival and bowling wicket/control contributions. Bowling analysis must exclude run-outs from bowler wickets and use legal balls correctly. Do not infer wicketkeeping skill solely from catches or stumpings without opportunity information.
4. Use priors and explicit uncertainty so short samples stay close to the prior. No innings, did not bat, injury absence and non-selection must not be treated as failed performance.
5. Allow sustained evidence to change relevant attributes gradually, with age/development trajectory retained. Recompute overall from attributes. Bound changes and calibrate those bounds through simulations, rather than choosing attractive-looking numbers.
6. Avoid circular reinforcement: results already depend on ability. Assess performance relative to an expectation that accounts for that ability and context. Merely rewarding top totals would compound initial advantages.
7. Apply a completed-season update exactly once, deterministically. Store model version, consumed evidence year and adjustment separately from frozen baseline trajectories. Loading a career must not reroll or reapply development. Old saves need an explicit migration rule.
8. Show the user the actual cause and time period of changes, including whether a change comes from ageing, established career development or sustained GCC performance. Do not promise a causal explanation the model cannot substantiate.

## Tests required before integrating that model

- Same opportunity/context with better performance moves the relevant estimate in the expected direction.
- One exceptional innings cannot cause a large permanent jump; a sustained multi-season trend has more influence.
- Finishers, openers, part-time bowlers and frontline bowlers are assessed against appropriate opportunities.
- Injured, benched and did-not-bat players are not penalised as if they performed badly.
- Stronger opposition and harder conditions do not create systematic punishment.
- User and CPU receive identical calculations; no hidden future trajectory is exposed through scouting.
- Replays, repeated review, reload and migration do not duplicate statistics or rating changes.
- Multi-seed 2008–2026 distributions remain plausible by age and role, with no runaway 99-rating inflation or collapse.
- Evaluate historical inputs against held-out real T20 data, separately from testing the internally consistent alternate-history simulation.

## Changes prepared in this pass

Player reports now derive and display GCC career totals alongside the latest season, with optional career batting average, strike rate and economy. Aggregation deduplicates the live season if it has already been archived. It follows the player across clubs and uses GCC records only. It does not mutate statistics, ratings, RNG or saves.

This is a useful completed step. The permanent performance-to-ability link remains a substantive outstanding requirement. It has not been replaced by an uncalibrated bonus formula.

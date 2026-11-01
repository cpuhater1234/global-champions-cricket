# GCC quality and historical rating calibration investigation

## Corrected scope, confirmed by Tom

Real-life performances should modestly influence starting player ratings alongside the other inputs, interpreted against career stage. Simulated GCC performances driving permanent ability was a misunderstanding and is not the requested feature. The simulated career-record display remains a separate statistics improvement.


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

## Historical evidence calibration specification

1. Identify each player's real-life record at the intended game-start reference period. Later-career reputation must not inflate the young starting version of a player. Record the exact cutoff, competition and match scope for reproducibility.
2. Preserve authored career-stage ability as the prior. Blend a modest adjustment supported by real performances rather than replacing the rating with raw averages or all-time totals.
3. Weight recent relevant T20 evidence more strongly while retaining broader career evidence. Where T20 samples are sparse, retain a conservative prior and clearly lower confidence. Other-format evidence needs separate, justified weighting.
4. Adjust for opportunity, role, competition strength, match context and sample size. Separate batting and bowling evidence. Do not infer keeping or fielding ability from dismissals without opportunity data.
5. Distinguish established players, emerging players and late-career players. Do not equate little evidence with poor ability or potential with already realised skill. Ageing effects must not be applied twice.
6. Store provenance, sample sizes, evidence period, prior, proposed adjustment, final attribute and confidence. Identity sources alone do not support numeric ability claims.
7. Review a representative calibration set across roles, ages, countries and evidence coverage before changing all players. Compare the existing and proposed ratings and simulated role outcomes. Keep the influence modest and test sensitivity to the evidence weights.
8. Recompute overall from the resulting attributes. Apply changes to newly created careers under a versioned calibration, preserving existing saved current abilities and stored futures unless Tom requests a migration.

## Existing evidence metadata audit

The 269 authored foundation/expansion records already include `ratingSource`, `ratingEvidenceYears`, core confidence and audit status fields. Several examples explicitly have low confidence. The inventory in `qa/progression-20261101/starting-evidence-inventory.json` records their distribution. These are metadata claims, not independent verification of the original underlying match statistics or weighting formula. The game also has subsequent profile and runtime corrections; the inventory is not a complete final-runtime rating audit.

The ICC's [rankings explanation](https://www.icc-cricket.com/rankings/faqs) supports considering career evidence with greater recent weight and opponent/context effects. Its ranking points should not be copied directly into GCC's attribute scale, and its keeper caveat is relevant: dismissals depend on chances created by others.

## Required checks

No evidence after the chosen historical cutoff; correct player identities; explicit missing-data handling; small-sample stability; separate batting/bowling contributions; career-stage plausibility; modest bounded influence; overall/attribute consistency; new-save versioning; existing-save preservation; sensitivity tests and multi-seed simulation comparisons.

## Changes prepared in this pass

Player reports now derive and display GCC career totals alongside the latest season, with optional career batting average, strike rate and economy. Aggregation deduplicates the live season if it has already been archived. It follows the player across clubs and uses GCC records only. It does not mutate statistics, ratings, RNG or saves.

This is a useful completed step. The outstanding ratings work is real-life evidence calibration at the starting career stage. No simulated-performance permanent-development change is requested or planned on the basis of this investigation.

## Recovered prior calibration work

Repository review subsequently recovered `docs/GCC_V8_CALIBRATION_RELEASE_20261025.md`, `qa/calibration-20261024/model-contract.json`, `model.py` and `heldout-report.json`. They document the earlier9,422-match frozen dataset and a rejected context/opponent-adjusted replacement. Both recorded promotion gates are false. This is retrieved historical project evidence, not a fresh rerun. The small influence prototype in `qa/historical-blend-20261101` is a separately labelled guardrail experiment, not a promoted replacement and not included in GCC. Real evidence selection and double-count prevention remain prerequisites.


## Second research pass: decision quality and sustained play

Reviewed 1 November 2026. Primary sources, with GCC-specific interpretations kept separate from the source claims:

| Resource | Source finding | GCC decision and check |
| --- | --- | --- |
| [Sports Interactive FM27 navigation notes](https://www.footballmanager.com/fm27/features/fm27-clearer-interface-smoother-navigation) | The developer describes reducing clicks, moving navigation to predictable menus, displaying reports directly and adapting layouts to screen size. These are developer intentions, not independent proof of player satisfaction. | Keep career navigation stable. Put actionable terms in the report itself. Test a complete return path, not an isolated card screenshot. Current 761px bench names are physically readable after the Build30 pane change. |
| [Game Accessibility Guidelines: text formatting](https://gameaccessibilityguidelines.com/use-simple-clear-text-formatting/) | Clear fonts on unfussy backgrounds; for longer copy, mixed case, left alignment and generous line spacing. | Pending commitment terms use14px mixed-case text at1.5 line height on solid charcoal panels, with the related button in the same panel. Verify actual rendering and zoom before sign-off. |
| [W3C action feedback pattern](https://www.w3.org/WAI/WCAG2/supplemental/patterns/o4p10-status-feedback/) | Actions should provide understandable, prompt status feedback; missing feedback leaves users unsure of the result. This is supplemental guidance, not a standalone conformance claim. | Existing command announcements remain. Active commitments explain why medical management pauses assessment. Conversations cannot silently reward repeated clicking. |
| [Przybylski, Rigby and Ryan, 2010](https://selfdeterminationtheory.org/SDT/documents/2010_PrzybylskiRigbyRyan_ROGP.pdf) | Reviews a motivation model linking competence, autonomy and relatedness to engagement; usable controls support but do not alone establish enjoyable play. | Hypothesis: understandable, consequential squad choices support managerial agency better than routine trust farming. This is a design hypothesis requiring human playtesting, not a claim of validated GCC retention. |

Do not treat a famous game's current UI as unquestionable. The FM27 notes describe changes to FM26's tile-heavy navigation, demonstrating why the underlying task flow matters more than copying a fashionable card system.

### Pending implementation and boundaries

Rotation explanations require an actual omission concern, give two omissions of breathing room once per continuous spell out of the XI, and grant no immediate trust. A healthy selection begins a new spell. Active commitments must be honoured first. Existing saved explanations are conservatively carried forward when the old omission/talk record indicates one; new saves store the explicit guard. Annual reset removes it.

Commitment options describe the assessment horizon, nonselection consequence where relevant, medical pauses and bowling-innings threshold before choosing. Once active, the progress replaces further choices. Existing automatic bowling allocation is unchanged. Ordinary bowling tactics remain a separate unresolved design issue, not disguised as fixed.

### Concrete quality gates for further passes

1. Every important action can be found from its logical career screen. Record clicks, return context and keyboard focus.
2. Every decision presents its scope, cost and consequence before committing. Rejected actions preserve state and explain the cause.
3. Every reviewed screen is checked at desktop,761px and390px, plus zoom where relevant. No unreadable club colours, cut-off actions, floating labels or names broken into arbitrary fragments.
4. Scores reconcile with deliveries, season records and career totals. Replay/refresh cannot apply a match twice. Injury recovery advances on each completed round and promises pause correctly.
5. Progression and historical starting ratings have separate provenance and validation. No player becomes elite from one exceptional innings.
6. Human tests must include a first-time draft, difficult selection decision, loss, injury, unmet promise, transfer, offseason and long-career return. Automated success is not evidence that these are enjoyable.
7. Make ordinary events quieter than decisive events. Current mobile live dot-ball presentation merits a separate density/hierarchy review; this research pass does not change it.

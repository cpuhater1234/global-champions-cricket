# Player identity, uncertain careers and fair scouting

Status: proposed written design for Tom's review. Direction approved in conversation; this document and an implementation plan are not yet approved. No product changes accompany this specification.

## Intended experience

Tom wants recognisable real cricketers whose careers are usually close to their expected standard, with rare meaningful disappointments and unexpected successes. Maxwell should usually be excellent, but remembering real cricket must not guarantee an unbeatable draft. Good decisions should combine current quality, role balance, age, venue fit, development, form and actual results. Strong CPU recruitment must make prospects competitive without seeing their future.

Retain the accepted navy/lime/cyan/orange arcade presentation, manual XI and batting order, eight clubs, fifteen-player squads, 2008–2026, existing signing/draft pacing and offseason flow. No salary cap, wages, renewal forms, JSON save controls or new micromanagement. Current ratings remain visible. Rich detail belongs in Scout. No claims of perfected facts, fun, visual alignment or smoothness without appropriate evidence.

## Scope and alternatives

The first coherent implementation unit is the player model: factual identity and calibrated baseline → saved career outcome → current ability → estimated outlook and shared CPU valuation. Its supporting player-data review is part of release acceptance. Match simulation, chemistry and the overall role-fit formula retain their existing interfaces; their known limitations remain explicitly open. This avoids mixing a career correction with a new delivery simulator or a whole-game redesign.

More match randomness leaves repeat careers predictable. Independently randomising every rating loses recognisable identities. The selected approach separates historically anchored expectations from a persistent realised career, and separates that private outcome from recruitment knowledge.

## 1. Player identity and baseline profiles

Add a source-owned player profile catalog with a permanent `careerKey`, distinct from numeric roster IDs and display names. Existing players receive explicit keys; additions must not shift existing IDs or keys. Duplicate people and aliases resolve before seeding. Keys cannot depend on insertion order.

Each profile separates:

- Factual identity: canonical name, country representation, sourced DOB where available, broad bowling style, recognised keeping identity and evidenced role history.
- Model inputs: GCC eligibility window, estimated exit, expected peak/timing, year-specific batting job, bowling involvement, skill vector and confidence/provenance.
- Simulated data: saved realised career, current ability, form, injuries, appearances and results.

A historical debut is not automatically the correct GCC entry date; catalog fields distinguish those meanings. Exit assumptions are not labelled verified retirements. A broad AR classification must additionally distinguish batting-led, bowling-led or balanced ability and actual bowling involvement. A low batting slot cannot imply weak bowling involvement. All-rounders must not inherit universally strong batting and bowling from one overall peak.

Preserve existing specialist identities and fine skill differences when calibrating baselines. Role changes use explicit year windows and broad batting jobs (opening, top/middle order, finishing, lower order), not rigid penalties for adjacent slots. Style and keeper identity never change because of an outcome roll. Verify phase strengths from evidence where possible; otherwise mark the calibration as an estimate.

Review all 399 current profiles against a per-player ledger. Prioritise the 130 generated arrivals and bowling-led all-rounders, but do not certify the rest by inheritance. The ledger records inspected fields, sources, discrepancies, model decisions and remaining uncertainty. The thirteen missing names from the audit are an explicit inclusion review, not automatically thirteen arbitrary new peak ratings. Add each once identity, GCC entry and role/skill calibration are justified. No player should be silently omitted because a template is inconvenient.

Release requires every shipped player to have a reviewed identity/role and explicit calibration status. Unsupported precision is removed or labelled; no promise that a subjective numeric rating is an objective historical fact. Store factual citations in source/Scout detail where relevant, without turning the draft into a research table.

## 2. Stable realised careers

Introduce a versioned career-outcome domain module. It accepts a profile, immutable saved career seed and anchor; it returns a saved outcome record and pure year-specific skill vector. It must not consume or modify match/recruitment RNG. Use a documented fixed hash/PRNG algorithm, with domain-separated draws keyed by model version, career seed, careerKey and draw name. Do not use `Math.random`, time or roster IDs. Reordering or adding players must not alter existing players' draws.

Persist the outcome parameters at first initialisation for every seeded player, including future arrivals. An outcome contains version, careerKey, anchor year/skills, model baseline snapshot, primary and secondary skill-family offsets, and development timing offset. Saving the baseline snapshot prevents later catalog edits from silently rerolling an ongoing career. Source code version changes do not regenerate an existing valid outcome.

Proposed version-one distribution, explicit design defaults rather than historical probabilities:

| Component | Probability | Dominant-family mature offset |
| --- | ---: | --- |
| Typical variation | 94% | Triangular distribution from −4 to +4, mode 0 |
| Moderate disappointment | 2% | Uniform from −14 to −8 |
| Rare major disappointment | 1% | Uniform from −28 to −20 |
| Breakout | 3% | Uniform from +8 to +16 |

Draw a secondary-family offset from the same component at half amplitude plus an independent triangular −2..+2 term. For a balanced AR, both batting and bowling use full primary amplitude with separate −2..+2 terms. Support families use one-quarter amplitude plus independent triangular −1..+1 terms. Families are non-overlapping: batting = bat, power, control, pacePlay, spinPlay, finishing; bowling = bowl, newBall, death, bowlControl, variation, spin, pace; movement/fielding = running, fielding; keeping = keeping; mental = temperament, leadership. BAT/WK-BAT use batting as primary, BOWL uses bowling, batting-led AR uses batting and bowling-led AR uses bowling; balanced AR uses both. For specialists, the non-primary batting/bowling family receives zero career offset; a secondary offset is used only for a reviewed AR profile. Each support family gets its own draw. Non-bowling players retain negligible bowling; non-keepers cannot gain recognised keeping identity. Attribute values remain within existing legal bounds. Do not apply one multiplier to every skill.

The baseline at any year remains the expected year-specific curve. Add the realised family offsets with a smooth ramp from zero at the anchor to full effect four years later (or the final active year if sooner), using `t²(3−2t)` for clamped progress t. For entrants after 2008, full effect is reached four years after entry subject to the same rule. One-season careers have zero development variance; match/form variance remains. Long-term prospects therefore have meaningful uncertainty without rewriting initial current ratings. Peak-timing offset is a stable −1/0/+1-year draw with probabilities 20/60/20%; blend its baseline-curve effect through the same ramp and clamp it inside the active window. Timing never changes eligibility or retirement in version one.

Overall change uses the existing `GCC_RATINGS.roleFit` composite evaluated before/after skill changes on form-zero permanent-skill copies, applied as a delta to the expected overall badge. This preserves the baseline display scale while tying realised gains to actual skill changes. Clamp to 1..99. Do not add form or injury effects into permanent career skills. Existing overall-versus-composite calibration remains a separate documented issue; this design does not declare it solved.

No year-to-year rerolls and no usage-based experience grind. Benching, trading, releasing, injury cover, changing pace or reloading cannot change an outcome. Existing form/injury mechanics continue separately. The exact 2008 ability anchor remains unchanged in a new world; disappointing careers emerge through development rather than an unexplained opening-screen downgrade.

## 3. Fair estimates and strong CPU decisions

Create an explicit public scouting view containing current skills, age, role, confidence/provenance, expected baseline curve and observed development. Do not pass persisted realised outcomes, hidden offsets, future skill vectors or exact future exit truth to CPU/scouting valuation. This is a code boundary in a local single-file game, not an anti-cheat guarantee against inspecting the downloadable save.

Replace recruitment uses of `GCC8_CAREERS.value`, `projection` and `scoutProjection` with expected-value functions consuming that public view. Keep the existing current/future/role/ground weighting and club preferences initially. Annual picks, trades, optional releases and recruitment highlights must use the same permitted expectation model; do not leave an old omniscient route behind. Known current injuries, age decline, role needs and the actual draft selection budget still matter.

Expected baseline potential remains a model prior, not a promised peak. To learn from realised development, compare current underlying role-composite ability with that year's expected baseline. Forecast future residual with weight 0 at the anchor, then 0.25 per subsequent career year capped at 0.75. Do not extrapolate temporary form or a five-ball cameo into permanent skill. This gives repeated evidence influence while retaining uncertainty. Expected future value uses the existing six-year discounted horizon and longer-window treatment, evaluated on estimated curves rather than realised ones. Retirement/runway estimates use public age/role heuristics; do not read an exact private exit date.

For the same public view, changing only private future outcomes must leave CPU valuation and Scout byte-for-byte unchanged. Once current ability changes, both may update. Warner/Kohli-style prospect expectations retain real draft value even at modest current overall. No new free CPU repairs or extra roster slots.

Scout shows current rating, role/involvement, current form and an outlook such as “High upside · still developing” or “Proven quality · shorter runway”. Remove `known-career`, confidence=1 and exact guaranteed peak language. High/medium/low confidence describes evidence quality, not the secret draw. Strong and weak cohorts must retain recognisable cricket identities.

## 4. Save compatibility and failure handling

Add optional versioned career metadata and validate it before touching live state. Require finite bounded offsets, recognised versions, matching unique keys, valid anchor years and complete finite skill snapshots. An absent record triggers migration; a malformed present record fails validation and leaves the existing stored save untouched. Do not silently replace corrupted outcomes with a fresh favourable roll. Follow existing continue/error UI and corner-close conventions.

For old saves, anchor each active player's new model at the saved current year and exact saved underlying skills. Preserve that year on every reload; apply variation only in later years with the same smooth ramp. Future inactive entrants anchor at entry. Retired players and archived scorecards remain untouched. Do not inject newly added catalog players into an existing world's pool, reassign IDs, re-sign players or change existing retirement/entry schedules. New worlds use the expanded reviewed catalog; existing saves retain their universe. Corrected factual display metadata may be used without overwriting saved career skills or past scorecards.

For an old in-progress injury/form state, snapshot the underlying permanent fields already stored by the current engine, not the managed-XI preview values. Validate this distinction with fixtures. New worlds snapshot `careerSeed` alongside the initial world seed before recruitment or other RNG calls. `state.seed` is mutable and must never be the ongoing source. Migration takes the already-stable `weatherSeed` when present; otherwise it freezes the saved current seed once as the migration career seed, without pretending to recover a missing original seed. Migration is idempotent and is persisted through the existing autosave path without advancing a season or RNG. Old saves containing no future years get no artificial career reroll. On storage failure, show the existing actionable save error; never claim the migration was saved.

## 5. Arcade feedback without overload

Draft cards retain a bold current overall and simple batting/bowling feedback, with readable role labels and separate Pick/Scout. Bowling-led ARs receive meaningful bowling involvement. Use whole words in a non-fragmented element; no plural suffix spacing tricks. Do not add extra miniature ratings or a new potential number to every card.

Team room and annual review show an observed development summary: player, previous/current underlying overall, direction and role. A change of at least two overall points since the last annual boundary qualifies for a development spotlight. Otherwise use neutral squad continuity feedback. At most three strongest changes appear in the summary; all players remain available in the detailed roster. The notification is generated once per player/year from saved values and cannot duplicate on reload. Use varied factual cricket language without fabricated achievements.

Keep form feedback separate from development and base performance praise on actual recorded runs, wickets or relevant match contributions. No secret “flop”, “breakout roll” or exact future badge. No brand-new popup when the existing review/Scout can communicate the information. Preserve established compact dialog spacing and corner X controls.

Native rendered review must inspect long names, all role labels, contrasting gain/decline states, zero-change seasons, narrow screens and populated annual summaries. Parsed markup and source font sizes cannot establish alignment. If browser access remains restricted, retain that limitation explicitly and provide the existing user-operated capture path; do not certify visual quality.

## 6. Acceptance evidence

1. Pure model tests cover all shipped players and every active year: finite legal skills, role/style invariants, exact anchors, no cumulative drift and deterministic repeated calls. Hash vectors make algorithm changes explicit.
2. Run 10,000 world seeds on the pure model. Sampled mixture frequencies must lie within five binomial standard deviations of the declared probabilities. Repeated worlds and changed roster order reproduce exactly; most long-run stars remain close to expected quality, a nonzero rare severe tail exists, and eligible lower-rated prospects can materially exceed their baseline. Check raw offsets as well as clamped outcomes so ceiling effects do not conceal a broken draw. Players with insufficient runway are reported separately, not counted as failed mature-tail cases.
3. Maxwell is a representative acceptance fixture, not a special-case roll. At least 90% of full-ramp outcomes must retain peak overall within six points below his reviewed expected peak; the severe component must be capable of lowering his peak by at least fifteen points. A lower-rated long-run fixture must demonstrate at least an eight-point peak gain in some breakout worlds. If profile/overall weighting prevents these outcomes, revise the design/calibration visibly rather than adding name-specific random exceptions.
4. Private-future mutation tests cover foundation drafting, annual drafting, trade evaluation, release decisions and Scout. All must remain invariant before the changed future is observed. Strong-prospect valuation must beat otherwise comparable low-upside players without bypassing squad cricket needs.
5. Save/reload, trade/release, retirement, inactive arrivals, same-seed new worlds, changed draft pace/skip and unrelated RNG consumption reproduce the same outcome parameters and future permanent skills. Preserve selected XI/order and injury-cover ownership.
6. Migration fixtures cover old 2008 and later-year saves, midseason form/injury states, future entrants, completed 2026, storage failure, malformed records and a cold second resume. Current skills, records, pool membership and RNG state remain exact at migration.
7. Repeat numerical scorebook/archive checks, focused gameplay regressions, eight club draft paths and at least two complete 2008–2026 careers on the final artifact digest. No regression total substitutes for investigating a suspicious player profile or implausible match distribution.
8. Controlled cohorts compare balanced versus materially imbalanced squads and immediate-strength versus youth-heavy policies under shared seeds. Report wins, runs/wickets, finals, retirement burden and later squad strength. Treat results as calibration evidence, not proof of fun. Human play remains necessary to assess learning, challenge and feedback.
9. Maintain exact artifact/source/evidence hashes and distinguish new runs from reused captured matches. Native rendered evidence is required for visual claims; if unavailable, ship no visual certification.

## Review and implementation handoff

Self-review: the design separates facts, estimates and outcomes; private/public APIs; new-world versus old-save behaviour; and current-year versus future changes. Numeric probabilities are proposed game defaults with explicit tests, not sourced cricket facts. No implementation has started. Read the latest handoff and uncertainty audit alongside this specification.

After Tom approves this written specification, create the detailed implementation plan with the writing-plans skill. Its review and execution-method selection precede product changes under the currently applicable brainstorming workflow.

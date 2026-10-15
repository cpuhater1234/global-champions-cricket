# Player Careers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Preserve the existing no-subagent constraint; implement and review inline.

**Goal:** Make real-player careers recognisable but uncertain, recruitment fair and competitive, and development feedback clear without rewriting saved history.

**Architecture:** A reviewed profile catalog supplies expected skills; a separate versioned outcome module supplies saved realised skills. A public-only scouting view supplies all recruitment estimates. Existing engine/UI entry points delegate to these focused modules, keeping the single-file build and current gameplay flow.

**Tech Stack:** Existing browser JavaScript globals, JSON catalog, Python build, Node VM/assert QA; no new runtime dependencies.

**Spec:** `docs/superpowers/specs/2026-10-15-player-careers-design.md`

## Global Constraints

- Retain the accepted navy/lime/cyan/orange arcade presentation, manual XI and batting order, eight clubs, fifteen-player squads, 2008–2026, existing signing/draft pacing and offseason flow.
- No salary cap, wages, renewal forms, JSON save controls or new micromanagement.
- The exact 2008 ability anchor remains unchanged in a new world.
- No year-to-year rerolls and no usage-based experience grind.
- No claims of perfected facts, fun, visual alignment or smoothness without appropriate evidence.
- Preserve archived matches, old-save current skills, existing universe membership and roster IDs. New worlds receive reviewed additions.
- No deployment, Actions, release, external messages, subagents or browser-restriction bypasses. Repository checkpoints use the GitHub connector because this checkout has no `.git`.
- Written specification approved by Tom's “im sure it is good ... get to work”; this implementation plan still requires review under the currently applicable workflow.

## Review Focus

1. Older saves missing the original seed must freeze one migration seed and never reroll after resuming (Task 3).
2. Names/aliases, new catalog entries and reordered rows must not change existing keys, IDs or outcomes (Tasks 1–2).
3. A recognised keeper or bowling-led AR must retain cricket identity after poor development, injuries or role transitions (Tasks 1–3).
4. Hidden metadata may leak through trade/release/recruitment paths even after the headline draft projection is fixed (Task 4).
5. Season advancement, reload and retirement may duplicate or misattribute development feedback (Task 5).

## Shared contracts and file boundaries

Create `v8/domain/player_profiles.json` (catalog), `player_profiles.js` (lookup/validation/expected skill snapshots), `career_outcomes.js` (pure draws and realised skills), `scouting.js` (public estimates) and `development_feedback.js` (observed annual changes). Do not split unrelated legacy screens or match simulation.

Types below describe ordinary serialisable objects, not new TypeScript/build tooling:

- `Skills`: finite numeric fields bat, power, control, pacePlay, spinPlay, finishing, bowl, newBall, death, bowlControl, variation, spin, pace, running, fielding, keeping, temperament, leadership, overall.
- `Profile`: careerKey, canonicalName, aliases, identity with source references, calibration status, primaryFamily (`batting`, `bowling`, `balanced`), role windows, expected debut/exit/peak inputs, and calibrated baseline snapshots. Future model inputs are estimates, not guaranteed outcomes.
- `Outcome`: version=1, careerKey, anchorYear, anchorSkills, baselineByYear, component, familyOffsets, timingOffset. `baselineByYear` stores active years through 2026 so catalog updates cannot alter saved development. Support-family offsets and role windows are saved with their baseline version. The private record never becomes a scouting input.
- `PublicView`: careerKey, year, currentSkills, currentOverall, age, role, publicRoleWindows, publicExpectedByYear, confidence, anchorYear, anchorExpectedComposite and currentExpectedComposite. No outcome reference, private component/offsets, future realised skills or exact exit date.
- `DevelopmentRow`: careerKey, year, playerId, name, fromOverall, toOverall, delta, role; derived once from actual annual-boundary permanent ratings, not forecasts.

Function namespaces/signatures are defined per task. Engine code retains its player-object interface; domain functions return new plain objects unless expressly initialising state.

### Task 1: Reviewed profile catalog and stable identities

**Files:** Create `v8/domain/player_profiles.json`, `v8/domain/player_profiles.js`, `qa/v8_player_profiles_test.mjs`, `qa/v8_player_profile_ledger.json`; modify `v8/build.py`, `v8/engine/dynasty.js`, `v8/domain/player_jobs.js`.

**Interfaces:** `GCC8_PROFILES.lookup(nameOrKey:string):Profile|null`; `expectedSkills(profile:Profile,year:number,legacyBaseline:Skills):Skills`; `validateCatalog(profiles:Profile[]):string[]`. Catalog keys are explicit permanent strings, not generated from numeric IDs. Expected curves reuse `GCC8_CAREERS` for unchanged profiles while reviewed snapshots override deficient templates.

- [ ] **Step 1: Write failing catalog tests.** In `qa/v8_player_profiles_test.mjs`, load the source module in a VM and assert unique keys/canonical names/aliases, correct lookup through aliases, legal role windows, finite skill vectors, primary-family validation and source-or-estimate status for each field. Load the actual universe and assert every shipped name resolves exactly once; reordered catalog lookup returns identical profiles. Assert bowling-led profiles do not obtain frontline involvement from batting-slot inference and that Smith's existing year transition remains. Assert no new roster IDs are allocated by lookup.
- [ ] **Step 2: Run `node qa/v8_player_profiles_test.mjs`.** Expected initial failure: missing module/catalog, not a broken unrelated fixture.
- [ ] **Step 3: Review profiles and implement catalog/lookup.** Work from `qa/v8_individual_player_audit.json`; research identities and roles using primary sources, record links/field provenance, and distinguish subjective skill priors. Review all 399 records and the thirteen missing-name candidates from the audit. Correct bowling-led AR batting/bowling vectors and involvement individually; preserve current 2008 skill anchors. Add approved candidates to new worlds only, allocating IDs after existing entries, with explicit keys and eligibility estimates. Keep uncertain fields marked estimated; do not manufacture precise facts. Update the ledger with every inclusion/exclusion decision. Build embeds catalog and lookup before dynasty initialisation.
- [ ] **Step 4: Run `node qa/v8_player_profiles_test.mjs` and `python3 v8/build.py --freeze --output game/global_champions_cricket_v8_career_variation.html`.** Expected: all shipped players mapped, no duplicate identities or unresolved review entries, all baseline vectors legal, and successful build. Inspect all 130 formerly generic profiles; passing schema checks alone is insufficient.
- [ ] **Step 5: Checkpoint the catalog, provenance ledger, build wiring and tests.** Verify current branch head before a connector tree/commit/ref update. Exclude raw downloads, temporary logs and old saves.

### Task 2: Pure saved outcome model

**Files:** Create `v8/domain/career_outcomes.js`, `qa/v8_career_outcomes_test.mjs`; modify `v8/build.py`.

**Interfaces:** `GCC8_OUTCOMES.create(profile:Profile,seed:number,anchorYear:number,anchorSkills:Skills,baselineByYear:object):Outcome`; `skillsAt(outcome:Outcome,year:number):Skills`; `validate(outcome:Outcome):boolean`. No mutation of input profile/player/state. Expose `modelVersion=1` and a pure testable unit-interval draw keyed by seed/key/draw-name.

- [ ] **Step 1: Write failing pure tests.** Assert `skillsAt(o,o.anchorYear)` deep-equals anchorSkills; repeated calls and out-of-order year calls deep-equal; same seed/key survives reordered/new unrelated profiles; all values finite/legal; specialty and keeper identity unchanged. Test the mixture thresholds using controlled unit draws: [0,.94) typical, [.94,.96) moderate, [.96,.97) severe, [.97,1) breakout. Assert each declared offset range, family scaling, zero specialist-secondary offsets, timing −1/0/+1 with thresholds .2/.8, and smoothstep endpoints 0/1. Include a one-season zero-development fixture and a remaining-three-year fixture reaching full effect in its final year.
- [ ] **Step 2: Run `node qa/v8_career_outcomes_test.mjs`.** Expected initial failure: module/API absent.
- [ ] **Step 3: Implement the signatures with the spec's exact distributions.** Use fixed FNV-1a 32-bit hashing over UTF-8 encoded, length-delimited key components, then one xorshift32 output for each named draw; divide the unsigned result by 2^32 for [0,1). Define fixed vectors in tests and handle a zero xorshift state using 0x9e3779b9. Sample triangular ranges by inverse CDF and uniform ranges continuously, rounding only final annual skills. Use independently named draws for component/amplitude/timing/support families. Snapshot baseline years and apply smoothstep offsets and timing blending. Overall delta uses `GCC_RATINGS.roleFit` on form-zero permanent copies, preserving baseline overall; no implicit form, venue or captain effects. Return baseline values outside the saved active years without inventing active status; the engine remains responsible for eligibility.
- [ ] **Step 4: Run `node qa/v8_career_outcomes_test.mjs`.** Expected: deterministic vectors, all legal bounds and explicit anchor invariants pass. Manually inspect representative specialist, batting-led/bowling-led/balanced AR and keeper output curves.
- [ ] **Step 5: Checkpoint module, build wiring and pure tests.** Do not activate the new model in gameplay before Task 3's migration/validation path exists.

### Task 3: Engine integration and safe save migration

**Files:** Modify `v8/engine/foundation.js`, `v8/engine/dynasty.js`, `v8/domain/career_paths.js`, `v8/domain/save_validation.js`, `v8/build.py`; create `v8/domain/career_state.js`, `qa/v8_career_state_test.mjs`.

**Interfaces:** `GCC8_CAREER_STATE.initialise(state,mode:'new'|'loaded'):void`; `applyYear(player,year):void` delegates to `skillsAt`; `validRecord(record,player):boolean`. State stores `dynasty.careerModel={version:1,seed:number}` and each player stores `careerKey`/`careerOutcome`. Initialise before any load-time `applyCareerYear` call.

- [ ] **Step 1: Write failing integration fixtures.** Test exact 2008 anchors, old 2015 midseason permanent attributes/form/injury unchanged, inactive arrival anchors, completed2026 unchanged, no added players on old loads, stable IDs and archived scorecard deep equality. For old missing weatherSeed, assert a one-time saved seed is frozen and remains unchanged when state.seed later advances. Assert repeated/cold migration idempotence, changed trade/pace/RNG consumption invariance and no selection/order/cover ownership changes. Malformed present records must reject without overwriting localStorage; absent metadata migrates. Simulated storage failure must show existing save feedback and never claim success.
- [ ] **Step 2: Build candidate and run `GCC8_TEST_BUILD=game/global_champions_cricket_v8_career_variation.html node qa/v8_career_state_test.mjs`.** Expected initial failure: missing integration/metadata.
- [ ] **Step 3: Implement career_state and wire init/apply/save validation.** New-world initialisation snapshots a career seed before RNG consumption. Loaded worlds use existing career seed, otherwise stable weatherSeed, otherwise freeze the current saved seed once. Snapshot old current skills before any legacy curve application. Seed new profiles only in new-world mode; loaded pool membership is authoritative. Snapshot baseline, anchor and role windows once; do not mutate snapshots through `JOB_MODEL.prepare`. Apply realised skills before match/UI consumers, once per requested year without cumulative scaling. Keep exact migration anchor values through cold resume; prevent the existing load initialiser from overwriting them. Validate all optional metadata in the existing pre-mutation save gate. Retain old schedules/retirements and archives.
- [ ] **Step 4: Rebuild and run `qa/v8_career_state_test.mjs`, `qa/v8_migration_test.mjs`, `qa/v8_save_integrity_test.mjs` and `qa/v8_offseason_test.mjs` with `GCC8_TEST_BUILD` set to the candidate.** Expected: all pass and old fixture histories/pools/current skills unchanged. Inspect saved JSON privately to confirm outcomes persist; do not add save exports to the product.
- [ ] **Step 5: Checkpoint state integration and meaningful migration tests.** Include exact candidate digest in the commit evidence note; no final quality claim yet.

### Task 4: Public-only scouting and consistent recruitment values

**Files:** Create `v8/domain/scouting.js`, `qa/v8_fair_scouting_test.mjs`; modify `v8/engine/cpu.js`, `v8/engine/dynasty.js`, `v8/domain/cpu_market.js`, `v8/domain/cpu_releases.js`, `v8/ui/data.js`, `v8/build.py`, `qa/v8_career_strategy_test.mjs`.

**Interfaces:** `GCC8_SCOUTING.publicView(player,year):PublicView`; `estimateAt(view:PublicView,year:number):number`; `value(view:PublicView):number`; `outlook(view:PublicView):{label:string,detail:string,confidence:string}`. The adapter reads only current permanent skills, expected baseline and permitted public metadata; estimate/value/outlook accept no player or state references. Keep `GCC_AI.projectedValue(player,year)` as a compatibility facade calling this adapter, not realised `overallAt`.

- [ ] **Step 1: Write failing privacy/strategy tests.** Change only saved private offsets, component and future realised vectors, then assert deep equality for publicView, Scout copy, foundation draft scores, annual draft scores, trade values, release choices and recruitment-highlight qualification. Assert no input mutation. With the same current ability/role/age/ground fit, higher expected-upside prospects obtain higher future value; older prime players have shorter expected runway. Changing observed current permanent skills affects both estimates and CPU values; changing five-ball match stats alone does not. Test missing low-confidence profile without a confidence=1 fallback. Test the residual weights 0/.25/.5/.75/.75 by career years.
- [ ] **Step 2: Build and run `qa/v8_fair_scouting_test.mjs` on the candidate.** Expected initial failure at the hidden-future mutation assertions.
- [ ] **Step 3: Implement public adapter and route every valuation consumer.** Estimate public future curves using baseline plus the capped observed composite residual from the spec; horizon valuation keeps .86 annual discount, six-year immediate window and existing .65/.35 combination, using public age/role runway capped at2026. Do not trim at private exact retirement. Use projectedValue facade for trade/market/release routes currently calling career.value. Remove known-career/exact future/confidence=1 copy and CPU comments. Keep existing club preferences and selection-budget integrity. Add stable public expected baseline metadata for old saves without referencing their private future outcome records.
- [ ] **Step 4: Rebuild and run fair scouting, CPU market, logic and career strategy suites.** Update `qa/v8_career_strategy_test.mjs`: its old assertions that private peak mutation must lower CPU value explicitly encode omniscience and must become invariance assertions, while adding a separate changed-public-prior sensitivity fixture. Document this changed requirement; do not just delete failing assertions. Search all consumers of `dynastyCareer.peak`, `dynastyPeak`, `GCC8_CAREERS.value`, `known-career` and `scoutProjection`; classify remaining reads as actual career application, public prior or invalid leak. No live recruitment leak may remain.
- [ ] **Step 5: Checkpoint estimator, consumer updates, leak inventory and tests.** Expected deliverable: same private-future mutation cannot change a decision, while current strengths and prospect expectations still influence drafting.

### Task 5: Observed development and role feedback

**Files:** Create `v8/domain/development_feedback.js`, `qa/v8_development_feedback_test.mjs`; modify `v8/engine/dynasty.js`, `v8/ui/roles.js`, `v8/ui/data.js`, `v8/ui/offseason.js`, `v8/ui/screens.js`, `v8/ui/game.css`, `v8/build.py`, `v8/domain/save_validation.js`.

**Interfaces:** `GCC8_DEVELOPMENT.captureBefore(players,year):object`; `rows(before,players,year):DevelopmentRow[]`; `summary(rows):DevelopmentRow[]` returns at most three rows, ordered by absolute change then careerKey. Persist `dynasty.developmentByYear` and a year capture marker so reload cannot regenerate/duplicate. Every changed player stays in the detailed roster, including retired/departed players' boundary records where applicable.

- [ ] **Step 1: Write failing feedback tests.** Assert +2/−2 qualifies and +1/−1/0 does not; summary maximum3 with deterministic ties; actual recorded ratings rather than forecast; form-only changes excluded; zero-change neutral copy; repeated advance/reload yields one saved set; retired/departed identities remain attached to the correct year. Check safe escaping/long names and no `NaN`, undefined, secret component names or guaranteed peaks in draft/Scout/review strings.
- [ ] **Step 2: Build and run `qa/v8_development_feedback_test.mjs`.** Expected initial failure: feedback module/annual records absent.
- [ ] **Step 3: Implement capture and existing-screen feedback.** Capture permanent ratings immediately before annual career advancement, compare afterward, retain immutable rows. Use current review/roster/Scout sections; no additional compulsory popup. Keep bold overall, simple batting/bowling bars, readable complete role words, Pick/Scout controls, corner Xs and established compact action spacing. Describe involvement from reviewed bowling job rather than preferred slot. Keep observed form and career development distinct. Validate optional annual-row metadata without breaking old saves.
- [ ] **Step 4: Rebuild and run feedback, player clarity, experience, draft controls, interaction and offseason tests.** Inspect populated/empty/long-name strings. Prepare native capture cases for wide/narrow draft, Scout, roster and annual review; if rendering remains unavailable, record that exact limit rather than claiming alignment.
- [ ] **Step 5: Checkpoint feedback and its persistence/markup tests.** Preserve cricket terminology variation only where underlying recorded events justify it.

### Task 6: Distribution and controlled gameplay assessment

**Files:** Create `qa/v8_career_distribution_test.mjs`, `qa/v8_career_policy_review.mjs`; modify `qa/v8_uncertainty_audit.mjs` only to support new-model inventory without pretending prior evidence passed; retain old reports as historical diagnostics.

**Interfaces:** Distribution runner loads source modules/catalog and writes `qa/v8_career_distribution_results.json`; policy runner consumes candidate via existing `loadGame`/`loadLogicGame`, writes `qa/v8_career_policy_results.json`. Both include artifact/source digests and actual counts; failures exit nonzero.

- [ ] **Step 1: Write distribution assertions from spec.** Across seeds1..10000, test mixture frequencies within five binomial SDs; same-seed and reordered-catalog equality; all active-year bounds/anchors; one-season exceptions reported separately. Maxwell ≥90% within six points below reviewed expected peak and a severe fixture ≥15 below; an eligible lower-rated fixture reaches ≥8 above. Check raw offsets and actual clamped skill/overall outcomes separately. Failing tail effects require visible calibration review, never name-specific roll exceptions.
- [ ] **Step 2: Run `node qa/v8_career_distribution_test.mjs`.** Expected: pass once Tasks1–5 satisfy the spec. An acceptance failure is a real design/model mismatch to investigate before release, not a reason to weaken the threshold silently.
- [ ] **Step 3: Implement policy harness with fixed shared seeds8101..8112.** Compare four deterministic recruitment policies under identical worlds: balanced/current, balanced/youth, batting-heavy/current and bowling-heavy/current. Player value uses only public inputs; manual XI test policy is explicit. Record every policy's draft/XI choices, win rate, run/wicket figures, finals, optional moves, retirement burden and 2013/2018/2026 squad strength. Preserve current human-facing controls; this is an offline diagnostic only.
- [ ] **Step 4: Run `GCC8_TEST_BUILD=game/global_champions_cricket_v8_career_variation.html node qa/v8_career_policy_review.mjs`.** Expected: complete declared cohorts with legal rosters/fixtures and no runtime errors. Assess role imbalance and youth-versus-immediate tradeoffs; report uncertainty and counterexamples. Do not require a preferred strategy to win every seed or infer fun from a single aggregate.
- [ ] **Step 5: Checkpoint actual results and calibration findings.** Resolve causal defects within this scope; list unrelated chemistry/delivery-simulation limits honestly.

### Task 7: Final candidate regression and delivery

**Files:** Create `qa/v8_career_variation_scope.json`, `docs/GCC_V8_CAREER_VARIATION.md`; modify `docs/GCC_V8_NEW_CHAT_HANDOFF.md`. Adapt `qa/v8_statistics_crosscheck.py` and `qa/v8_statistics_frontend_review.mjs` to accept explicit fixture-root arguments while retaining their current default, so new candidate data cannot be confused with old captures.

**Interfaces:** Evidence scope binds final source/build hash, commands, seeds, exact counts, excluded diagnostics and limitations. Final artifact is `game/global_champions_cricket_v8_career_variation.html`.

- [ ] **Step 1: Freeze-build candidate and run syntax/embedded-script checks, all new suites, and existing focused regressions identified in `qa/v8_logic_scope.json`.** Pass the candidate explicitly via GCC8_TEST_BUILD; review any old deterministic-career expectation individually. Default-path tests must not accidentally validate old HTML. Freeze rebuild must be byte-identical.
- [ ] **Step 2: Run two complete final-artifact careers.** Commands: `GCC8_TEST_BUILD=game/global_champions_cricket_v8_career_variation.html GCC8_TEST_SEED=8209 GCC8_TEST_SCOREBOOKS=1 GCC8_TEST_REPORT_DIR=qa/career-variation/career-8209 node qa/v8_game_test.mjs` and the same with seed8311/directory career-8311. Expected: 19 seasons and266 regular user matches each, complete2026 ending, no errors; retain actual finals/cover/reload counts, including zero coverage where it occurs.
- [ ] **Step 3: Run eight club paths.** For club indices0..7, use seeds8401+10*index, `GCC8_TEST_CLUB=index`, `GCC8_TEST_LAST_YEAR=2008`, `GCC8_TEST_SCOREBOOKS=1` and separate report directories with the same candidate in `qa/v8_game_test.mjs`. Expected: legal complete squads, recognised keeping/bowling jobs, manual XI path and season completion for all eight.
- [ ] **Step 4: Independently audit newly captured scorebooks and saved frontend/archive statistics.** Use the adapted numeric scripts with the new fixture roots and existing plausible-bounds checker; capture parsed markup separately. Verify scorebook rows, wicket/fielding identities, legal-ball/extras/phase arithmetic, NRR and archived averages. These are numerical checks, not empirical historical calibration or rendered geometry.
- [ ] **Step 5: Perform available native visual review through the permitted user-operated capture workflow.** Check draft/reveal, Scout/modal X, role wording, team selection, development gain/decline/empty states and annual flow at wide/narrow widths. If access remains restricted, document unverified geometry/photos/focus/smoothness and do not invent evidence. Human enjoyment/difficulty review remains an explicit limitation even if all scripts pass.
- [ ] **Step 6: Review changes against the specification and five Review Focus items inline, write evidence report/handoff and checkpoint.** Verify digest after the final product edit. Re-run affected checks if final edits occur; no stale candidate counts. Only after that replace the existing playable Library identity with the verified new HTML, following the Library skill and preserving file identity/version history. Do not deploy or publish a website.

## Plan self-review and execution status

Coverage: spec identity/catalog→Task1; realised careers→Task2; save/engine→Task3; CPU/scouting→Task4; arcade feedback→Task5; distributions/strategy→Task6; final numerical/rendered evidence→Task7. All five Review Focus conditions have explicit owning tests. Interfaces use the same names/types across tasks. Native execution is consistent with the existing no-subagent constraint; no independent agent review is promised.

No product changes or implementation tests have been written/run for this plan. Product remains logic-review SHA256 `356325d44873facc0bcea04c667112d50c10acf1fab67e390b51f08b1ba13d03`, Library version23. Plan review is pending. After approval, use executing-plans and the required test-first/verification workflows; checkpoint completed tasks and keep evidence limits visible.

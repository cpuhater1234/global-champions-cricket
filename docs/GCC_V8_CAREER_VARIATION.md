# Player careers, fair recruitment and individual profiles

Implemented candidate: `game/global_champions_cricket_v8_career_variation.html`, SHA256 `ff3b637d3af692e361b0c96b452c4384dacd218c035ac38a1b6f50171843f485`. Same playable identity, version 25. Source implementation started at commit `6e7f1a2`; final corrections/evidence follow on the existing v8 branch. No deployment or merge.

## What changed

Expected careers and realised careers are separate. Each world saves one outcome per player with rare meaningful disappointment/breakout tails and skill-family variation. Current 2008 abilities remain anchored. Roles, bowling styles and keeping identity do not become random. New or continuing careers do not reroll on load, trade or draft speed.

CPU foundation/annual drafting, market values and releases now use public expectations and observed current ability, without reading private outcomes. Prospects remain valuable; future success is uncertain. Scout presents an outlook rather than a promised peak.

The catalog enumerates 412 players, including the thirteen missing candidates in the previous audit. Individual all-rounder batting/bowling priors, phase skills, involvement and specialist tail batting were corrected. Narine has an opening-role window; Phillips has a later off-spin all-rounder window. These are explicit model windows informed by primary sources, not exact universal position rules. All existing 399 identities were structurally/role reviewed. Forty-one records have source links; 371 remain explicitly uncertified legacy identities. Do not call every biography or numeric rating perfected.

Older saves retain current abilities, squad membership, IDs and recorded matches. Corrected future arrivals apply from entry; active players bridge toward corrected future profiles over up to four years without changing the saved current-year anchor. Outcomes persist centrally once per player to avoid copying career histories into every scorecard. Malformed records, cold reload, failed restore and storage failure have targeted checks.

Annual feedback shows observed current-rating changes, separates form/fitness, and shows only retained players under the returning core. Retired/traded development records stay historical rather than being relabelled as returning players.

## Evidence and exact scope

- Twelve distinct signed pools and twelve full player-year traversals: 409/412 have different underlying paths. Fleming, Pollock and Law have only a single active season and no later development to vary. CPU private-peak mutation leaves value/score unchanged.
- 10,000 pure world draws for Maxwell and a lower-rated long-run fixture: 9760/10,000 Maxwell careers stay within six points below expected peak; 72 major disappointments; 302 meaningful lower-rated breakouts. This is not 10,000 complete game careers.
- Two fresh 2008–2026 careers (8209/8311), eight club paths, a pre-update completed 2008 save continued through 2026 (8501), and a final-artifact two-season smoke (8609). Old 2008 history in the resumed fixture is not counted as newly simulated cricket.
- 28 regression suites across the matrix/final UI correction; eight relevant suites and the two-season smoke on the final artifact. The final change is only retained-development filtering in the offseason UI read module; all cricket, career, CPU, validation, persistence and controller script blocks are byte-identical to the matrix. See equivalence JSON.
- 955 captured matches/1910 innings passed plausibility bounds; secondary wicket/fielding row checks passed. 2723 frontend/archive checks reconciled 123 displayed scorebooks and 120 average rows. Parsed markup is not visual evidence.
- 48 controlled 19-season policy cohorts use actual draft/match/career functions but omit injuries, form updates, trades and full offseason administration. Qualification ties use alphabetical order after wins. Their original completed digest is retained; later migration-only/UI edits are supported by 12 identical fresh-world state comparisons and 16 identical repeated cohorts, not relabelled as 48 new runs.

| Recruitment policy | Win rate | Retirements across 12 worlds |
| --- | ---: | ---: |
| balanced-current | 53.8% | 217 |
| balanced-youth | 51.9% | 153 |
| batting-heavy | 34.4% | 215 |
| bowling-heavy | 36.4% | 202 |

Balanced recruitment outperformed materially one-sided recruitment in this fixture. Youth reduced retirement burden without becoming an automatic winning policy. This is directional calibration evidence, not a proof of ideal difficulty or addictiveness.

## Final review and limits

Separate same-author review covered the plan's five review focuses. The final fix pass addressed generic profiles surviving migration, lost runtime links after failed restore, malformed slot metadata, and retired/traded players appearing in returning-core feedback. No subagent review was used under the existing project constraint.

Native rendered alignment, inputs/focus/scroll, external stadium-photo loading and smoothness remain unverified under the existing browser restrictions. No screenshot evidence was acquired. Ratings are game estimates;371 legacy identities still need independent source certification. Empirical cricket calibration and human learning/enjoyment tests remain open. The existing club-game chemistry and overall/role-composite distinction remain, and aggregate innings are not a delivery-by-delivery engine. No salary-cap or wage administration was added.

## Decisions and costs

- Ruling: this is an isolated scratch checkout without .git; retain the existing connector-backed feature branch and use local briefs/ledger rather than git-dependent skill scripts — preserves authorised workspace — cost if wrong: checkpoint visibility rather than product semantics.
- Ruling: no subagent final review due to explicit existing project constraint — separate inline final review — cost if wrong: same-author review has weaker independence.
- Ruling: referenced TDD supplement could not be read through provider; apply full loaded TDD skill and behaviour-based assertions — cost if wrong: supplemental testing guidance missed.
- Ruling: freeze regenerates engine sources from v7 reference; direct engine edits were overwritten, confirmed by missing career metadata test — integration now lives in source-owned domain/career_adapter.py invoked by freeze — cost if wrong: adapter assertions/build failures catch reference drift.
- Ruling: snapshot yearly skill vectors use packed arrays to control browser-storage cost while preserving complete baseline data and readable domain accessors — cost if wrong: schema decoder errors, covered by cold-resume checks.
- Ruling: role/biography ledger distinguishes reviewed model assumptions from independently certified facts; unavailable source detail is not invented — cost if wrong: unsourced legacy identity errors may remain and are reported.
- Ruling: per-player enumerable career records duplicated into scorecards (two-season save 4,394,826 bytes) — central dynasty.careerStore persists each key once; non-enumerable player runtime references retain domain APIs, validated before load — cost if wrong: missing link on restore; central-store/cold-resume tests added RED before change. Long diagnostic careers interrupted and excluded pending restart.
- Ruling: full-universe historical regression hardcoded399 and deterministic forecast/current equality — updated to catalog count and realised-skill/current equality, because expected and realised curves must differ — cost if wrong: a forecast consistency defect could be missed, covered separately by public-view and outcome tests.
- Ruling: controlled policy cohorts isolate drafting/ageing using actual match functions with shared fixture RNG; trades, injuries and performance-form are excluded, while full UI careers test their integration separately — cost if wrong: cohort difficulty cannot be generalised to the full game. Original serial runs interrupted; final cohorts run in four ordinary test processes, no agents.
- Ruling: Phillips' later keeper-only template contradicted NZC/ICC all-rounder evidence — model role window changes from2022 with credible part-time off-spin, retaining keeping experience — cost if wrong: exact transition timing is a model approximation, explicitly documented. Regression written RED before correction.
- Ruling: related domain tasks checkpointed together in6e7f1a2 because the transitional adapter must connect catalog/outcomes/migration atomically — cost if wrong: less granular bisect history; final fixes and evidence have a separate checkpoint.
- Ruling: retain completed48 policy cohorts at6fc8415 after migration-only/UI changes; twelve complete new-world input snapshots and sixteen repeated cohorts matched exactly and all match/AI blocks are identical — cost if wrong: evidence applies only to the isolated no-load policy fixture, not legacy-save migration; full legacy career tested separately.
- Ruling: final build differs from d4f8516 matrix only in retained-development UI read filtering; retain full-career matrix and add eight final suites plus two-season smoke — cost if wrong: native UI still needs actual rendering; no visual certification claimed.
- Ruling: retain existing feature branch and deliver playable, following the established no-merge/no-deployment scope — cost if wrong: work is not integrated into a main branch.

The earlier unavailable TDD supplement was subsequently read from the current filesystem skill. Intermediate failed/interrupted diagnostics are excluded. Detailed commands, seeds, digests and result scope are in `qa/v8_career_variation_scope.json`. Large captured saves/scorebooks remain local fixtures; committed result JSON is evidence rather than a self-contained raw-fixture bundle. Reproduce policy equivalence by rebuilding the initial implementation commit for `GCC8_POLICY_BASE`; temporary baseline paths are not durable repo files.

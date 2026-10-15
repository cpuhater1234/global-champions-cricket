# Whole-game decisions and cricket-logic review

Candidate: `game/global_champions_cricket_v8_logic_review.html`.
SHA256: `356325d44873facc0bcea04c667112d50c10acf1fab67e390b51f08b1ba13d03`.
Build: `python3 v8/build.py --freeze --output game/global_champions_cricket_v8_logic_review.html`.
Parent checkpoint: `6fb986433ccc980ace537c1b65b2f9868807ac5b` on `work/v8-game-first-rebuild`.

## Assessment

The core loop supports a good cricket management game: scarce draft opportunities, competing immediate and future value, a manually selected XI, broad batting roles, conditions, form, injuries and annual squad turnover. Completing a career is necessary but does not prove that those decisions are well informed or enjoyable. This pass traced the inputs through their consequences and corrected several real contradictions. It does not certify every biographical field, historical rating, optimal CPU strategy or subjective enjoyment.

The right standard is that a choice has a cricket purpose, the player can understand its trade-off, the engine rewards it plausibly over time, and rivals face comparable constraints. Do not add a salary cap, training currency, routine renewals or cosmetic tactical buttons merely to make the game seem deeper. Keep the accepted arcade presentation and manual XI.

## Corrections implemented

| Finding | Previous consequence | Current behavior |
| --- | --- | --- |
| Injury workload checked only the user's XI | An identical Dale Steyn fixture had 0.0175 injury chance as a user player versus 0.0135 as a CPU player | Workload includes selected CPU XIs. Both chances are 0.0175 in the same fixture; 2008 remains the injury-free introductory season |
| CPU lists were automatically repaired after the annual draft | Clubs could exchange players outside their actual selections and the optional-release allowance | The active post-draft repair route is removed. Full legal lists remain unchanged. Essential keeper/bowling opportunity is reserved within foundation and annual draft picks |
| Removing repairs alone would leave passive CPU list management | Rivals could hold expendable depth indefinitely without exercising normal release decisions | Rival clubs may release within the same `min(2,max(0,4-retirements))` allowance. They protect their last keeper and remaining bowling capacity, require at least four materially better available alternatives, and must compete for replacements in the draft. No replacements are signed automatically |
| Finishing quality used the best four eligible batters wherever they were placed | A finisher at eleven could substantially influence the death rating despite very little chance to bat | Phase ability now weights expected batting opportunity by broad order position. Openers can survive to the death; middle/finishing jobs remain flexible. The team room explains the opportunity decision |
| Keeper identity and glove quality were conflated in advice | Fourteen late-career player-years fell below 65 keeping and could be described as having no keeper despite being a specialist | One shared recognition rule preserves specialist identity while retaining the lower quality and actual run cost. Best-XI preferences and visible role/advice reads agree |
| Squad-preview cache and leading phase options overlooked managed fitness | A player could be recommended at normal strength or remain in leading options while OUT | Preview uses the existing match fitness context; status changes invalidate the cache. Leading options omit OUT players and use managed attributes without permanently altering base skills |
| Biographical ages were wrong for prominent players and absent from draft cards | Age-dependent decisions lacked reliable visible information | Twelve primary-source birth-date corrections are recorded in `v8/domain/player_identity.json`; age turning that season is visible on cards. The identity layer also hydrates older saved players |
| Hazlewood's generic control template had pace 18 at its peak | A genuine pace bowler interacted incorrectly with pace-friendly conditions | His sourced pace identity is explicit and the model pace attribute follows the specialist bowling template. The numeric calibration remains a game estimate |
| Scouting outlook noise depended on mutable match RNG | An age-led outlook could change because unrelated match RNG advanced | That small judgement variation is stable for the player's year rather than the current match seed |

`cpuReleases` is optional saved metadata with club, ID, uniqueness and allowance validation. Older saved offseasons without it remain readable. Existing market saves do not receive retroactive CPU releases. Stored match results are preserved; future outcomes and newly calculated ratings can change under the corrected model. Fresh careers derive their foundation peak windows from corrected birth years. Existing explicit saved model peak/exit dates are not rewritten as if they were biographical facts.

## Decision inventory

This is a source/engine design assessment, not a claim that every interaction has been tested by a person in a native browser.

| Stage / player input | Information and consequence | Assessment |
| --- | --- | --- |
| Play, Continue, restart | Clear save ownership and destructive restart confirmation | Necessary; keep autosave, no import/export or routine save administration |
| Story / club reveal controls | Introduce the alternate-history Saudi league and the clubs | Atmosphere rather than strategy; pace/skip prevents repetition becoming compulsory |
| Select a franchise | Ground conditions and club identity affect recurring fixtures and recruitment context | Meaningful preference and planning choice. No secret player-quality bonus should be inferred from club colours |
| Signing pause / speed / skip | Determines presentation pace; the same league commitment process runs | Useful spectator stage. Copy correctly says these are league entrants, not user signings; no fake recruitment control |
| Foundation draw / annual draw | Random order, reversed snake rounds, transferred early picks and supplements | Clear scarcity and anti-tanking structure. A late first choice returns sooner; no benefit from deliberately losing for draft position |
| Pool search, role filter and skill sort | Discover relevant cricket jobs rather than read every attribute on every card | Useful tools. Overall alone is insufficient; age and roles now stay visible |
| Scout | Phase skills, roles, fitness, form and broad outlook | Supports depth without putting every number on the main board. Numeric peaks/retirement dates remain hidden. Generic arrival profiles are an outstanding calibration limitation |
| Pick a player | Spend an actual scarce pick on current quality, future value or a missing job | Central strategic decision. CPU future knowledge intentionally protects obvious historical superstars; it is not proof of perfect scouting realism |
| Watch CPU picks / speed / skip | See how the board changes without changing its eventual choices | Presentation control, not a sporting advantage; pace/skip equivalence regressions remain required |
| Select / remove / swap XI | Balance batting, bowling, keeping, form, availability and conditions | Central, manual and reversible. OUT selections are blocked; an awkward cricket shape remains a graded consequence rather than an auto-selection button |
| Move batting order / natural order | Change broad role fit and expected phase opportunity | Now more causally faithful. Positions one and two remain interchangeable in the isolated opening-role test; do not introduce exact-position quotas |
| Open rating detail | Explain the phase and identify available contributors | Useful feedback rather than a separate task. Managed and unavailable advice now agrees with match inputs |
| Lodge / prepare / review opposition and venue | Commit the next XI with context; does not erase an existing campaign | Necessary transition. Matchup labels compare ability, not probabilities, and do not imply user control of individual overs |
| Play / pause / speed / skip highlights | Reveal an already simulated match and actual phase facts | Clear viewing choice; not live tactical intervention. Do not describe proxy captaincy samples as real deliveries |
| Scorecard / averages / league players | Check whether plans worked over enough evidence | Important learning loop. One poor innings is not proof the model or a selection was wrong; target, wickets and phase lengths matter |
| Change XI between rounds | React to form, injury and next venue | Meaningful. Keep core ability primary so chasing one noisy match is not always rational |
| Round-seven trade | Swap player value/fit within the one-deal window; may require a new XI | Meaningful but optional. Rejection remains valid; accepted XI-changing trades return to selection |
| Sign injury cover | Temporarily replace an OUT player's role until recovery | Necessary response, distinct from a free permanent upgrade. Eligibility, fit, ownership and return links remain tested |
| Finals / spectator finals | Four qualifying clubs, semi-finals and final, with manual availability checks for an active user side | Progression plus stakes; spectator controls must not imply the user's club is participating |
| Review season / open squad update | Use actual results, contributors and confirmed departures to plan the next side | Clear sports progression, not a finance worksheet |
| Keep / optionally release | Retain automatically, or open a vacancy and risk finding a better replacement | Meaningful reversible deliberation followed by an explicit irreversible confirmation. Same maximum allowance for rivals |
| Offseason trade / offer a pick | Exchange player fit and future draft opportunity; contracts carry otherwise | Meaningful. No compulsory transaction, salary or renewal admin |
| Confirm list / reveal annual order / annual draft | Close release decisions, reveal scarcity, spend owned choices, refill vacancies | Guided sequence with no forced user pick for a full list; trading closes at draft start |
| Archive / legacy / close 2026 | Inspect stored history and end a finite career | Optional reward and continuity. No 2027 market or overwritten archived scorecards |

## Ratings: what actually changes cricket

| Input | Active role in the model | Interpretation / limitation |
| --- | --- | --- |
| Bat, power, control | Batting cores, phase ability, run allocation and boundary/ball distributions | Related estimates, not independent guarantees of runs |
| Pace play / spin play | Early/middle scoring and resistance to condition/style matchups | Batting skills; they must not be confused with the player's bowling style |
| Running / finishing | Middle rotation, closing scoring, resource depth and individual scoring profile | Batting opportunity now affects when these skills contribute |
| Bowl, new ball, death | Phase bowling quality and captain's automatic bowling plan | A phase specialist needs an actual credible workload, not merely a high unused number |
| Bowling control / variation | Economy/phase quality, bowling core and tactical selection | Tactical over-plan uses proxy performance to choose an attack; not an actual delivery ledger |
| Spin / pace | Style-specific attack and condition interaction | Broad quality estimates. No handedness or spin subtype is invented where the data does not supply it |
| Fielding / keeping | Small actual run and wicket effects, plus selection/keeper reads | Keeper identity is separate from current quality; selecting several keepers does not add their keeping scores together |
| Temperament / leadership | Execution cores, scoring exposure and restrained cohesion effects | No captain-selection control is exposed; do not imply one exists |
| Form | Small bounded execution effect, updated from performance | Should influence close decisions without making a good player unusable after one failure |
| MANAGING / OUT | Managed skill reduction or unavailable selection, recovery and aggravation | Same injury workload treatment for user and rivals; preview is read-only |
| Batting role / order | Broad fit penalties, crowding/depth and phase opportunity | Flexible jobs, not exact batting-slot rules |
| Max workload / usage prior | Legal capacity versus expected trust, workload and automatic over allocation | Four overs of legal possibility do not make an occasional bowler a frontline option |
| Chemistry / cohesion | Role clarity, leadership, club-game continuity and a small national-familiarity proxy | **Outstanding limitation:** continuity counts club games rather than actual XI pair history. It can overstate familiarity after changes; not a calibrated team-chemistry simulation |
| Overall badge | Current player standing / career anchor used in asset decisions | Does not directly alter match odds. It is not the same composite as the XI phase rating or an all-rounder's attribute average |
| Career curve / age / model exit | Development, decline, available years and CPU/market value | Model windows, not exact historical forecasts or public promises. Corrected birth dates are facts; chosen peaks/exits are calibration |
| Confidence | Evidence/scouting communication | Does not certify every attribute. Later arrivals still have provisional rather than individually empirical profiles |
| Venue / weather | Boundary environment, pace/spin matchups and automatic captaincy choices | Conditions are model descriptions. A label alone is not evidence of historical ground calibration |

## Remaining substantive design work

1. **Individual player calibration is not complete.** All 399 players pass structural and career consistency checks, but 130 later arrivals begin with broad style templates. Named corrections are useful, not a substitute for an evidence-backed individual batting/bowling/fielding profile. The twelve sourced dates do not certify the other 387 biographies. Retain a field-level source/verification distinction rather than silently treating model estimates as facts.
2. **Overall versus role-composite clarity needs calibration.** Six peak batting all-rounders have a difference above fourteen between their badge and the role-fit composite, particularly after correcting overpowered bowling templates. These are different summaries, so the difference is a review prompt rather than mathematical proof of a defect. Do not arbitrarily increase their bowling to make the numbers agree. A future calibration should keep elite batting all-rounders valuable for the right cricket reasons.
3. **Continuity needs actual lineup history.** Club-game count is too crude to claim that a newly selected XI has played those games together. A fair replacement needs equivalent evidence for every club, compatible save migration and bounded impact. Do not fake a user-only pair-history bonus.
4. **Challenge needs strategy comparisons and observed play.** The controlled quality experiment establishes causal advantage with uncertainty, not that the league is difficult enough for an expert or easy enough to learn. Next evaluation should compare sustained current-strength, balanced, prospect-heavy and deliberately unbalanced strategies over multiple seeds, then observe whether humans understand why decisions worked.
5. **Feedback must keep aggregate-model limits honest.** Scores are generated at innings/phase level, then apportioned into consistent scorecards. Player contributions and form are therefore model allocations, not the causal trace of a ball-by-ball simulation. Highlights reveal stored facts. Richer captaincy would need a real decision model before adding controls.
6. **Native presentation evidence is still missing.** No rendered alignment, actual click/focus/scroll behavior, external image loading, animation smoothness or subjective fun certification follows from VM checks. Preserve the existing browser restrictions and user-operated screenshot route.

## Evidence

`qa/v8_logic_results.json` contains 15,521 focused checks across 399 players / 4,946 active player-years, sourced-date hydration, age visibility, exact forecast/current agreement, idempotent hydration, injury parity, broad order flexibility, causal finishing opportunity, read-only managed fitness, unavailable-option filtering, CPU late-pick essentials, no free full-list swaps, shared release budgets, metadata resume/rejection and a controlled match experiment.

In 500 synthetic matches, an 85-skill XI beat a 65-skill XI 82.4% of the time, while both had identical overall badges of 75. This verifies that actual cricket skills produce a clear but non-certain advantage; it is not a measured normal-league win rate or proof of enjoyment. The order counterfactual isolates identical role fit: finishing rises 68→70 when the exceptional finisher moves from eleven to six. Other batting abilities were deliberately equal, so this is a limited causal test, not a typical lineup recommendation.

The identity manifest cites Cricket Australia and ICC profiles. Hazlewood's broad pace identity is sourced at `https://www.cricket.com.au/players/CA:1185/josh-hazlewood`; his numeric attribute remains calibrated game data. Structural source checks are not a claim that every profile is historically correct.

See `qa/v8_logic_scope.json` for final digest, complete career/club results, all regression outcomes, scorebook audit and exact exclusions. Earlier interrupted/failed diagnostic candidates and pre-CPU-release matrices are not counted as final-artifact careers.

The final injury-transition regression initially assumed its original XI persisted despite unrelated natural injuries. Its helper manually reselected the side and benched the cover, so expecting an automatic return into that old slot was wrong. The fixture now deliberately keeps the fit cover selected, explicitly sets a manual batting order, and compares the position immediately before recovery. The corrected regression passes actual two-round recovery plus a real midseason trade. No product change was made to force a recovered player into an XI after the user had benched his cover.

The two completed career harnesses qualified for finals twice each, four appearances across 38 seasons. This is a simple scripted selection/draft policy, not expert human play or an optimal-strategy comparison. It is a reason to investigate learning and difficulty calibration, not evidence that the challenge is already ideally tuned. Do not promote career completion counts into a claim of balanced enjoyment.

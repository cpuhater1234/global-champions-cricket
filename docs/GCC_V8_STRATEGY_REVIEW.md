# CPU and player-experience review

Reviewed the unchanged cricket-experience artifact, SHA256 `131899e5c596f7adad94ae3089cc8ac0be1802feb69c6c2d47228b6d0ca8756c`. This checkpoint adds review evidence, not production changes or a new playable build.

## Verdict

The foundation experience has a clear loop and meaningful cricket decisions. It is not yet a reliable long-term dynasty challenge: career development, foundation CPU projections, annual CPU drafting and trade valuation disagree about the same player's future. Correct that before adding more ratings, management systems or decorative interactions. Enjoyment and clean presentation cannot be certified from VM/source inspection; actual human play and permitted rendered evidence remain necessary.

## Confirmed strengths

Eight complete foundation drafts were run with seeds 2101, 2111, 2129, 2141, 2153, 2161, 2179 and 2197. The human-slot test strategy takes the highest current draft-quality player, leaving future prospects to the CPU. This is a targeted exploit test, not proof that every human strategy is beaten.

Each tested save has a distinct signed-ID pool. Signed counts are 169, 172, 174, 164, 171, 170, 171 and 173. Foundation recruitment uses weighted random acceptance from the player universe, not a fixed roster or a shuffled identical list. Club choices and draft order also vary. A real new world seeds from the clock; resuming the same save appropriately preserves its world. Annual named arrivals are a fixed career schedule rather than freshly sampled names every year.

Warner signed in five of these eight saves and was selected at overall picks 17, 20, 8, 8 and 8 (see JSON for exact seeds). He never survived to the last rounds in this sample. Kohli and the other tested future stars are also valued independently of their current overall. CPU club profiles, current quality, hidden dynasty value, role need, ground fit, scarcity and bounded decision noise all contribute. This is a genuine safeguard against hindsight bargain collecting, not a blanket guarantee on every possible pool.

All 56 CPU squads finished with at least one recognised keeper, two viable openers, seven batting options and 32 legal overs of squad bowling capacity. Squad capacity is not the same as selected-XI capacity or phase quality. Existing balanced-XI and injury handling add separate safeguards.

Older players decline and retire. In the actual career-advance fixture, Hayden is retired by 2011; Tendulkar goes from 90 in 2008 to 73 in 2013 and is retired thereafter. A veteran-heavy squad has genuine turnover and decline costs. Prime players are not all one-year rentals: buying someone with several good seasons left is a legitimate strategy.

## Priority findings

### 1. Foundation prospect development contradicts the CPU board

Foundation career metadata stores the 2008 overall as its peak. `applyCareerYear` applies a generic age ratio capped at 1.08. Warner begins at 71 and reaches only 77; Kohli begins at 72 and reaches only 78. Russell also remains tied to his low foundation baseline. The foundation CPU simultaneously values Warner at 98 and Kohli at 99 using explicit projections. It spends premium draft capital on growth that the simulation does not deliver.

The evidence is actual annual career advancement through 2026, in an isolated fixture without playing matches. It measures attributes/retirement and does not prove season performance. This is the most consequential balance issue uncovered in this pass.

Recommended correction: one source-owned career path per player with current skill, development timing, actual peak and remaining useful seasons. Anchor foundation skills exactly in 2008, preserve cricket role differences and age decline, and use the same path for future simulation and CPU value. Existing saved scorecards must retain their figures. Do not turn every young player into a star or expose exact hidden future ratings to the user.

### 2. Annual CPU drafting drops the career-aware foundation model

`cpuDraftPick` ranks by `tradeValue + roleNeed * 1.2 + seeded noise`. `tradeValue` uses current overall, age, form, perceived generic runway, injuries, ground and role need. It does not use career peak or projected development. Role need also enters twice, once inside tradeValue and once outside.

An instrumented, body-unchanged annual fixture lowered only Bumrah's career peak from 99 to 60. Annual valuation stayed exactly 95. This proves peak blindness, not a claim that he normally falls to any particular pick. The twelve-name 2013 fixture's selection order is diagnostic and is not a real annual draft result.

Recommended correction: use the shared career path in annual choices, with grounded present-versus-future and available role considerations. Retain squad safety, variation and club preferences without letting oversized repeated role bonuses erase asset quality. Test scarce keeper/bowler markets and transferred/supplementary choices separately.

### 3. Later arrivals and trades do not share the hidden career truth

The public AI projection table is 2008-specific. Later arrivals can fall through to `fallbackProjection`, whose comment incorrectly says it is only for synthetic players. In the review fixture Bumrah's generated career peak is 99, but that AI helper reads 85.25. Merely routing annual drafts through the old helper would therefore not fix the problem.

Trade valuation has the same current-strength bias. Prospects protected during the initial draft can be undervalued through subsequent trading. Use career-aware asset value for CPU decisions and trade refusals while keeping public scouting uncertain. Never use an exact retirement date as user-facing scouting certainty.

## Player experience assessment

- Learning: the visible sequence is clear: choose club, observe commitments, Pick/Scout, choose XI/order, prepare match, read result, manage the next season. Signing explicitly says these are league commitments rather than your club's signings. Manual XI selection and the natural-order tool support learning without removing the decision.
- Depth: conditions, batting jobs, phase skills, keeper/bowling resources, fitness, form, chemistry, trades and retirements already offer enough. Detailed data sits behind Scout, matchups and scorebooks. Adding more core-screen numbers would hurt the current direction.
- Mastery: composition, batting order and conditions matter. The broken prospect-growth/value connection currently weakens the most important multi-season trade-off. Fixing this adds meaningful depth without new controls.
- Match agency: playback is a reveal of a precomputed match. Most agency sits in selection and recruitment; it is not interactive ball-by-ball captaincy. This should stay clear to the player. A future small pre-match plan is worth considering only if it changes actual cricket outcomes and can be explained simply; do not add cosmetic tactical buttons.
- Repetition: nineteen annual drafts and 266 regular matches can become repetitive. Existing speed/skip and condensed summaries help. Stronger factual selection consequences, player development and persistent rival-team identities would add more value than lengthening every reveal. No human pacing/fatigue timing was measured.
- Feedback: current role boards simplify composition, but “Bowling depth covered” should not be read as “good death bowling”. The collapsed matchup view holds quality detail. Decision-level explanations should distinguish enough options from good options and connect performance to selection without asserting causal certainty from a single result.
- Scouting: generic age-based “HIGH UPSIDE” is not a measured individual ceiling. Keep uncertain language, but distinguish evidence-backed potential from simply being young once shared careers exist.
- Presentation: source uses the accepted arcade visual system, named roles and progressive disclosure. Native layout, mobile/zoom, focus, input, smoothness and readability remain unverified under the existing browser restrictions.

## Evidence

`qa/v8_strategy_review.mjs` and its result JSON: 355 checks, eight full foundation drafts, distinct pools, actual career-advance fixture and no unexpected errors. `qa/v8_annual_strategy_review.mjs` and its result JSON: ten checks with temporary read-only function exposure, a peak sensitivity test and the isolated annual selection fixture. No production behaviour was modified by instrumentation. Earlier broad career QA remains valid as regression evidence but does not establish enjoyable play or calibrated strategy.

No deployment, Actions, release or subagents. The next implementation priority is shared career development and CPU/market valuation, followed by targeted exploit and veteran-versus-prospect tests before broader career regressions.

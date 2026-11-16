# GCC v8 structural-risk investigation

21 October 2026. Investigation only. The playable remains unchanged at SHA-256 `6b4f46967d347f3f23c67554dfbb3c8f19f7af732c7fb6fa2086036715e7d030`.

## Verdict

There are measurable structural weaknesses underneath the improved presentation. The clearest are annual busywork, incomplete development feedback and substantial rating inflation. CPU recruitment preferences overlap strongly in a controlled opening-board probe, but actual squad compositions and champions are varied. A dominant recruitment strategy has not been established. These results justify targeted changes and further paired tests, not another general declaration that the career is finished.

## What actually ran

- One actual 2008–2026 career through the current game engine and UI dispatcher, including injuries, finals, annual administration, save checkpoints and final reload. Nottinghamshire; seed 101; 266 league matches, 19 archived seasons, 15,999 assertions, no runtime errors. The informed policy filled keeper and bowling coverage, otherwise drafted from the top of the displayed pool. It made one optional release in 2009 and no trades. XI selections were calculated by the test harness and submitted through manual selection commands. This is a stateful regression and structural trace in a VM DOM stub, not an unfamiliar player or browser playthrough.
- Twelve controlled nineteen-season policy cohorts, four recruitment policies across three paired worlds, with actual career, eligibility-guard, public CPU evaluation and match functions. Results and limits appear below. The cohort harness uses a simplified replacement snake and omits the full annual CPU wrapper, trades, optional releases, injuries, form updates and offseason UI. CPU teams use public evaluation; the full annual wrapper also adds role need and seeded noise. All policies use the same best-XI selection method. This isolates a limited recruitment comparison and does not establish optimal manual tactics or trading.
- Two native Chromium paths at 390px from completed-season saves through the next matchday. All counted actions used visible buttons, with zero page errors. No timed human observations.
- Opening CPU recruitment boards in three worlds with the same empty roster and available pool for every club within a world. This controls roster need to probe club differentiation; it is not a claim about completed squads.

## Findings and disposition

### 1. Annual work remains excessive: confirmed

The ordinary 2008-to-2009 path took 21 visible clicks: six entry/review/draw actions, two player picks, one completion dismissal, eleven XI selections and one lodging action. The 2010-to-2011 path had no user vacancies and still took 19 clicks, including the draw/draft route and rebuilding the XI. Neither count includes optional scouting, trading, releasing or batting-order changes. They describe tested routes, not a universal minimum.

The complete career had four no-pick annual windows: 2011, 2013, 2020 and 2022. Making the player repeat a recruitment ceremony with no recruitment decision is a genuine pacing weakness.

**Next change:** provide a clear route from annual review to XI review when the player has no vacancies, while keeping the optional market available. Let the user explicitly retain eligible members of the previous XI and review flagged changes, then confirm the team. Preserve manual responsibility and never silently replace unavailable players or select a new XI. Measure clicks again on zero-, one- and four-vacancy years and with retirement/injury changes. Meaningful management must remain accessible.

### 2. Development feedback loses cricket information: confirmed

The development recorder stores overall before/after values, not per-skill snapshots. The annual screen highlights up to three retained players with absolute overall changes of at least two; the expanded view still displays overall-only changes.

Across 224 consecutive-checkpoint retained-player transitions, 208 contained skill changes. Seven had unchanged overall despite changed skills. For example, in 2020 Tom Curran's control rose two while running and pace each fell four, with overall unchanged. This cannot be explained by an overall-only development record. These are checkpoint comparisons, so they omit the initial 2008-to-2009 transition; the separate annual development-row analysis covers all eighteen windows. Among 236 retained annual rows, 44 had changes below the headline threshold. They remain available in the expanded overall list, but their skill changes are not explained there.

**Next change:** record and display the relevant batting, bowling, keeping and fielding changes, with a short evidence-based explanation of how the player's role may be affected. Prioritise material changes instead of arbitrary overall-only labels. Do not invent a training cause: the current model advances career curves, and this investigation has not established player-controlled development causality. Older saves need an honest overall-only fallback.

### 3. Later-career rating inflation: strong observed risk

| League roster measure | 2008 | 2026 |
|---|---:|---:|
| Mean overall | 77.858 | 90.042 |
| Players rated at least 90 | 4/120 | 71/120 |
| Players rated at least 95 | 0/120 | 18/120 |
| Players rated 99 | 0/120 | 2/120 |
| Overall standard deviation | 6.432 | 4.888 |

A decomposition of the 12.183-point rise attributes 11.767 points to changes among players who remained on league rosters between adjacent years and 0.417 to player replacement. Internal club transfers cancel out of this league-wide calculation. This is chiefly development-driven in this world, not simply better recruitment replacing weak starters.

That risks making a 90 cease to communicate exceptional ability and reducing the legibility of player differences. It does not by itself prove run inflation, identical phase skills or identical match outcomes. Only two players hit the hard ceiling, so describing the entire league as capped would be wrong.

**Next investigation before tuning:** repeat this decomposition across independent full-flow worlds; compare age/cohort skill distributions and match scoring over time against the model's intended scale. Audit career-curve gains and their source evidence. Fix the cause if confirmed, then rerun recruitment comparisons. Do not conceal the problem with percentile labels or an arbitrary universal rating reduction.

### 4. CPU identity is shallow on opening boards; identical squads are not proven

Pairs of CPU boards shared an average 8.86, 9.25 and 8.79 names out of their top ten in the three controlled worlds. Club profiles do differ, but current/future/need/ground multipliers cluster closely and all use one common evaluation structure. Elite targets should naturally overlap; the empty-roster setup deliberately removes later roster-specific needs.

In the actual full-flow career, CPU rosters changed by a mean 1.675 players per club per year, with 18 unchanged rosters across 126 CPU annual transitions. Squads were not copies: in 2026 CPU specialist-bowler counts ranged from four to eight, all-rounders from one to four, and keepers from one to four. All eight clubs won a title; Stars and Sixers led with four each. These observations argue against claiming universal squad homogenisation or one unstoppable CPU club.

**Next change to prototype after baseline preservation:** stronger, readable club recruitment preferences grounded in age horizon, phase roles and home conditions. Test whether they produce meaningfully different legal squads without making clubs deliberately foolish. Audit specific recruitment decisions against alternatives. Arbitrary randomness is not an adequate substitute for identity.

### 5. Repetitive drafts: annual pacing confirmed; repeated-player solution not established

The full-career user made no repeat acquisition of the same player. Annual pools also remained substantial and replenished; for example, the first user choice in 2018 had 123 candidates, including 86 foundation-cohort players, while the first 2025 choice had 65 candidates, including 26 foundation-cohort players. This is not evidence of an empty or literally identical draft pool.

The stronger supported risk is that the same highest-overall ordering and recruitment ceremony can dominate attention even when the user's needs or available choices have changed. Four zero-pick years make that especially clear. Across the three controlled worlds, foundation draft pairs shared a mean 5.33 of fifteen choices for balanced-current, 1.67 for balanced-youth, 7.33 for overall-only and 11 for all-rounder-heavy. Different clubs, signing pools and opponents contribute to those differences. This shows that draft repetition depends on policy, rather than establishing that every draft repeats. User decision engagement has not been measured.

**Next change:** make changed squad needs, new arrivals and relevant phase specialists easy to see within the existing draft, without adding another compulsory screen. Keep full sorting and scouting. Validate whether a player can name a real tradeoff between two candidates and whether their reasons change across annual windows. Do not force churn or suppress strong veterans just to manufacture novelty.

### 6. Dominant recruitment strategy: bounded test, no universal answer

| Policy | Wins / 798 | Win rate | Wins in worlds 8201 / 8202 / 8203 |
|---|---:|---:|---|
| Balanced current ability | 430 | 53.9% | 135 / 153 / 142 |
| Balanced youth | 394 | 49.4% | 139 / 131 / 124 |
| Overall only, within coverage guard | 434 | 54.4% | 144 / 137 / 153 |
| All-rounder heavy | 398 | 49.9% | 127 / 134 / 137 |

Overall-only gained four wins across 798 matches against balanced-current, but the paired differences were +9, -16 and +11. That is not stable dominance. Youth recruitment performed better in one world and worse in two, with fewer retirements, so its longevity tradeoff should be examined alongside wins. All-rounder-heavy lost the balanced-current comparison in all three worlds; this bounded test offers no support for that being an exploit. Exact records are in `qa/structural-risk/policies.json`. The coverage guard constrains every policy, including overall-only; it is not an unconstrained illegal XI. Worlds are the independent comparison units, not thousands of independent matches. Three worlds cannot establish robust dominance, and omitted trades, injuries and form could change rankings.

The older twelve-world study compared balanced strategies against batting-heavy and bowling-heavy recruitment. It supported having a balanced squad under that harness. It did not test overall-only or all-rounder-heavy recruitment and does not settle this question. Do not present its historical artifact results as fresh current-build playthroughs.

**Next investigation:** expand paired seeds if an advantage repeats, then confirm promising policies in full-flow careers with manual selection constraints, injuries, form, retirement/release decisions and trade exploit checks. Require a stable, practically meaningful advantage across worlds before changing weights. Preserve counterexamples and report costs such as short-term wins versus future squad strength.

## Later-season identity and enjoyment

All clubs becoming champions is useful outcome variation, not proof that nineteen seasons feel different. The UI can still present a changed year as the same annual checklist. There is no evidence here that an unfamiliar human understood why their club declined or wanted to keep playing. The informed baseline's eighth-place finishes in 2021–2023 illustrate a useful recovery scenario to test, not proof of an unfair game or of enjoyable adversity.

A targeted observation session should ask the player to explain what changed since last year, identify a development consequence, make a draft tradeoff and describe a plausible recovery plan after a poor season. Checkpoints should cover early career, first major rebuild, a late losing run and a successful recovery. Record unprompted continuation, reasons for stopping, repeated low-value actions and whether explanations match actual state. AI can flag shallow choices and repeated workflows; it cannot supply evidence of human enjoyment.

## Immediate priority

1. Remove no-decision annual ceremony and unchanged-XI re-entry while preserving explicit manual team confirmation.
2. Make development changes visible and cricket-specific, including flat-overall changes.
3. Investigate development-driven rating inflation before broad balance tuning.
4. Strengthen CPU identity only with before/after decision and squad evidence.
5. Validate changed annual decisions and recovery comprehension with people; continue targeted structural simulations alongside this.

No gameplay or balance changes were made during this investigation. No release-readiness gate is closed by these results.

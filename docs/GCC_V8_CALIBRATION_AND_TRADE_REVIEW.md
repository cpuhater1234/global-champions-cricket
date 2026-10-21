# Career calibration and draft-pick trading

21 October 2026. Continues the structural-risk and career-experience work. Final playable SHA-256: `bf67db340a2f4614d1a5ca58d1fdabe467d673af29ce74a62a7a1b41d366ce1a`.

## Changes

### A consistent arrival-estimate scale for new careers

The audit separates 269 players with legacy foundation anchors from 143 template-generated entrants. The latter includes first-season entrant Tim Southee as well as later arrivals; this is a template-source distinction, not a claim that all 143 debut after2008. Their authored expected peak median was92 and mean91.664, versus a median88 and mean88.084 for the strongest143 foundation careers. This is a game-model comparison, not a measurement of historical cricket ability. Different confidence/provenance limits remain.

New template-generated records now apply a monotonic calibration: authored peaks through95 lose four points; above95, the mapping is `91 + 2 × (peak − 95)`. Thus95→91,96→93,97→95,98→97 and99→99. The exceptional top tier and ordering are preserved. The calibrated template-based cohort has mean87.874 and median88. Role-specific peak skill templates are scaled consistently, so this changes cricket ability rather than merely relabelling overall numbers. Existing age curves, retirement windows, private career variation and match calculations are unchanged.

The four-point scale correction was selected against the existing strongest143 foundation-career reference rather than against all269 players, which would compare a curated incoming pool with the entire foundation depth pool. It remains an explicit game-balance estimate and is reviewable in `v8/core/arrival_calibration.js`. It does not certify individual player ratings or prove a uniquely correct calibration.

**Existing saves keep their current ratings and stored expected/realised futures.** The calibration is applied only when creating new template-based player records. There is no automatic migration, reroll or restart. An old career therefore keeps its established rating trajectory; a new career uses the corrected scale.

### Draft picks are valued by marginal squad improvement

A fresh structural probe reproduced a lopsided deal from an actual completed2008 save: the CPU accepted78-rated Inzamam-ul-Haq plus a first-round pick for95-rated Dale Steyn. Nominal pick credit was95; the player's bid value was66 and the target ask98. Completing both annual-draft branches from the same state left the rosters identical except for that exchange: the user gained17 overall points in squad total and the CPU lost17. Its acquired pick had provided no compensating final-roster improvement. This is one reproduced exploit, not a claim that every pick-assisted trade is bad.

Pick credit now estimates the receiving club's incremental opportunity. It uses the actual selection's place in the annual queue, publicly estimated player values in the eligible pool, the club's other vacancy selections and replaceable retained players. A pick is an opportunity to improve a fifteen-player list, not an automatic second star's full value. Keeper/bowling/batting safeguards remain in place. The UI estimate and engine acceptance use the same receiving-club context.

The reproduced Steyn package is now declined without moving players or picks. A separate useful package remains accepted, transfers the pick exactly once, and rejects attempted reuse. Invalid rounds, missing clubs, an empty pool and non-existent full-list selections have zero credit. Pick valuation does not inspect private realised future offsets. This is an estimate of marginal value, not a perfect future-draft oracle.

## Evidence

- Twelve independent realised-career population probes: average2026 eligible-player ability87.037→83.806, and average count rated90+68.333→27.917. These universes have no team selection, matches or administration; cohort composition changes over time.
- One paired full-flow career per version, seed404, through2008–2026:2026 selected league mean89.475→86.225 and90+ count69→27 out of120. Both completed nineteen seasons and266 user league matches without runtime errors. Different recruitment and competition naturally change subsequent results. This is one paired world, not a population estimate.
- Twelve controlled recruitment cohorts, four policies across the same three seeds as the original comparison. Final win rates: balanced-current49.75%, balanced-youth51.25%, overall-only51.00%, all-rounder-heavy50.50%, each over798 matches. Rankings vary by world. This bounded test provides no evidence of an obvious dominant recruitment shortcut. It omits trades, optional releases, injuries, form updates and full annual CPU wrapper adjustments, as detailed in the raw report. Worlds, not matches, are the independent comparison units.
- The long cohort/full-career runs used the calibration prototype. Final/prototype fresh-world equivalence compares all412 players and every stored expected/realised career record in three worlds. Tim Southee’s provisional2008 template blueprint now also carries consistent calibration metadata; its public skills and saved future trajectories match the tested prototype. The final pick-value change is separately tested; those cohort policies do not trade. The prototype's older nominal pick pricing is not being represented as tested by the strategy comparison.
- The exact final playable continues an actual completed2025 prototype-career save through2026, checks the nineteen-season archive, ending and reload, and labels one exercised season separately from the full archived history.
- Existing-save compatibility compares current player data, teams, XI, batting order and the entire stored career model against the previous delivered build. All are identical. The fresh calibration is monotonic, idempotent and preserves99-rated authored peaks; outcome records validate.
- Ten existing gameplay/management suites pass on the final artifact. Native browser checks verify both the rejected exploit and a completed fair pick-assisted deal, ownership after each, visible confirmation and review contrast. Four native annual paths and twelve expanded scout-render cases also pass on the final artifact.

The previous five-click full-squad annual path, explicit prior-XI retention, relevant skill-change feedback and accepted arcade presentation remain intact.

## Limits and remaining work

No human understanding/enjoyment sessions were conducted. Three policy worlds do not exhaust strategies such as conditions, bowling types, batting order or trading across an entire career. The new pick estimate is bounded by public information and can still differ from the actual player available at that pick. Player-data provenance and target-platform release rehearsal remain open. No arbitrary club randomness or difficulty buff was added to manufacture CPU variety.

The matched career produced all eight champions in both versions. Titles were more concentrated in this particular calibrated world, with CSK winning six, versus a maximum four in its baseline. This should remain visible as a counterexample to any universal parity claim; a lower rating scale does not automatically guarantee competitive balance. The three-world policy comparison and this single career cannot settle long-run title concentration.

The fixes close a reproduced pick-pricing exploit and reduce demonstrated cohort inflation. They do not establish a perfected or release-ready game.

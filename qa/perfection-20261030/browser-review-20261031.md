# Connected Chrome playtest, 31 October 2026

Build observed: local candidate (14), matching the home-first scoreboard/draft restoration batch. Replay and fresh Watch match both immediately start playback, and the persistent batting-order note is absent. This is older than the pre-match-reveal batch. Do not certify the coin animation from this session.

## Actual browser work
- Continued Gloucestershire 2011 Round 2 paused at Thunder 40/3, 5.3 overs. Exact paused delivery restored. Home Gloucestershire remains left; away Thunder right.
- Round 2 result: Gloucestershire 80/0 in 10.2 chased Thunder 79/10 in 15.2. Result, awards, worm and batting/bowling tables consistent. Replay starts at zero; skip returns to same result.
- At 390 by 844, scorebook tables fit the dialog (316px table and wrapper, no overflow). No page horizontal overflow. Long dismissal text wraps within its column.
- Mobile XI tabs switch correctly. Bench-first swap disables continuation until a target is chosen; Cancel preserves XI. XI-first replacement of Ray Price by Andrew Hall succeeds, retaining slot eleven. Hall is marked out of role there; move up clears the mark. Venue guidance updates from five to six pace options.
- Mobile live scoreboard and controls fit: Resume/Speed heights44px; Skip full width. Tested home bowling and home batting cases. Names and score tokens remain legible.
- Round 3: away win at Mumbai, 185/5 vs179/6. Round4 MCG playback ran to completion with speed changes1/2/4/8: loss157/8 vs159/1. Awards and next-match routing visible. No duplicated result from replay/skip observed.
- After Round3 the trade entry disappears as required.
- Ladder, player stats, league leaders and all14 fixture cards inspected. Mobile ladder/stats scroll regions have tabindex and labelled regions, but the scrolling affordance is weak. League leaders hide SR/economy unnecessarily.
- Menu opens via its actual summary element. Opening How to play closes menu. Switching to How it works uses the same dialog. Back to game returns to result. No lingering submenu observed.
- Archive shows3 completed seasons,26 league wins,2 finals campaigns. 2010 scorebook shows16 appearances, correctly including two finals. Close/Return to career returns to the current result.
- Temporary mobile viewport reset before ending. Current browser left at2011 Round4 result.

## Source corrections from findings
- Scorebook innings headers use actual club colour and readable club ink. Table surfaces changed from broad blue-grey fills to charcoal, retaining numeric alignment and row contrast.
- Mobile league leader tables fit all four columns, removing the forced440px minimum. Wider tables get a concise swipe/arrow-key cue only when the existing overflow detector marks them scrollable.
- Ladder and archive copy now uses explicit “Ladder position” / “League position” instead of bare numbers in sentences.
- Mobile XI status becomes a compact grid with both actions side by side; preserves44px controls and all functions.

## Backend and limitations
- Second automated seed2026 completed2008–2026,19seasons,266league fixtures, annual retirements/drafts, finals/archives and career closure. All clubs checked for15players, unique ownership and recognised keepers; each scorebook checked for run/ball/wicket ledgers and legal bowling workloads.
- Together with seed101 this provides38automated seasons and532league fixtures. This is not exhaustive probability coverage or38browser-played seasons.
- Twenty-script syntax check and decision UI/regression/pre-match contracts pass. Integration passed: exact baseline match parity for two seeds over14 rounds each, legal promised bowling allocations, finals completion and management save/restore.
- New CSS/header corrections require fresh browser rendering. Latest coin reveal still requires correct updated file.
- Historical ratings, career-wide roles and year-specific grounds remain unaudited. The current2011 fixture list uses the modern named Punjab ground; this needs a sourced historical venue audit rather than an unsupported data edit.
- Remaining review: full new-career onboarding/draft at current CSS, extreme trade/retirement cases, actual phone hardware, keyboard pass of latest reveal, long-term narrative variety and human enjoyment.

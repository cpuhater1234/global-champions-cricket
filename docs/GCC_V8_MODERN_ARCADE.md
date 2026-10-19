# Modern arcade presentation and quieter decisions

Continues `work/v8-game-first-rebuild` at `5fe9fc5e6f2e0f19cd04b2e45cc8d5160142e9f8`.

## Experience

A cohesive dark sports presentation replaces the cream cards, thick accent borders, heavy button shadows and repeating decorative panels. Typography, hierarchy, spacing, navigation, dialogs and data surfaces share one palette. Lime identifies primary actions and active selection; club colours remain on club marks. Real venue photography and random home-stadium selection remain in use.

- **Draft:** compact candidate rows expose one action. Opening a player reveals Pick and Compare first, with detailed scouting and innings skills expandable. Squad names and analysis are available on demand.
- **XI:** the default page shows players instead of a toolbar on every row. Opening a selected player exposes batting-order controls and Move to bench. Bench-player detail exposes Select or Swap. Pending swaps turn the XI rows into replacement targets.
- **Mobile selection:** Starting XI and Squad occupy separate panes. Completing the eleven switches to the XI review; a pending swap forces the replacement pane and blocks hiding it. Selection remains entirely manual.
- **Matchday:** one venue-backed fixture composition, readiness and one dominant match action replace the multi-card dashboard. Ground and season detail expand below it.
- **Offseason:** a short overview shows retention, retirements and vacancies. Manage players opens a separate workspace. Incoming draft-class scouting remains available before releases are locked.
- **Player detail:** primary actions appear above the ratings. Reordering refreshes the current batting position without closing the player. Detailed scouting is optional.
- **Playback:** the HUD identifies the match being watched rather than the following scheduled round.

No cricket-engine, player-data or save-format changes. Club-mark foregrounds retain their supplied colour when readable, otherwise use a higher-contrast dark or white foreground.

## Density measurements

Matched real-save XI states and reconstructed start-of-draft states at standard zoom. Counts include all displayed controls on the page, including those below the fold; closed details and hidden mobile panes are excluded.

| View | Width | Before controls | After controls | Before page height | After page height |
| --- | ---: | ---: | ---: | ---: | ---: |
| XI | 1440 | 60 | 16 | 1592 | 1355 |
| Draft | 1440 | 41 | 16 | 2341 | 1150 |
| XI | 390 | 60 | 14 | 3003 | 1406 |
| Draft | 390 | 41 | 16 | 4952 | 2243 |

Draft candidates now occupy 82–94px rather than inheriting 280–374px card reserves. Geometry and control counts are specific to these fixtures, not general performance benchmarks.

## Verification

Final artifact: `game/gcc_v8_quiet_arcade.html`.
SHA-256: `ad8eb244b5adfce38dc66c6cb5152319ac82dd8376344b844637b5c241ded1c7`.

- 68 responsive core screen/dialog cases with native management, player, reorder, comparison and swap interactions. Includes actual single-match playback, result and scorebook. The matchday and draft render fixtures are explicitly reconstructed for presentation.
- 84 whole-flow screen/dialog cases and 104 later-career cases cover club selection, signing, draft, selection, management, finals, archives and the career ending.
- The final contrast correction changes legacy club/guide/player surfaces, step markers, feed text and badge foregrounds. The 84-case whole-flow run is repeated on that final artifact. The 68 core and 104 later-career geometry cases use the immediately preceding candidate; geometry outside the migrated legacy surfaces is unchanged.
- Eight contrast probes cover clubs, club guide, signing, review, expanded draft class, management, release and expanded scouting. They estimate contrast from computed text colour and the nearest opaque background, using 4.5:1 for normal text and 3:1 for large text. This is a targeted probe, not a complete accessibility certification.
- Native mobile journey makes eleven individual selections and verifies the review pane, with no automatic selection.
- Eight focused suites cover the quiet workspace, team selection, decision navigation, paced drafts, management boundaries, pre-match controls, annual management and comparison tools. Superseded permanent-button assertions were replaced with assertions for the new player-detail route; stale-pick and clock-pause checks remain.
- New regression checks reproduce and verify incoming draft-class access and correct playback round context. The phased-draft suite passes 714 checks.
- Independent review identified loss of incoming-class scouting as important. It was restored as a collapsed section and covered by a regression assertion. No remaining blocking finding was reported.
- A frozen-engine rebuild matches the delivered artifact byte for byte; whitespace checks pass.

Exact reports, hashes, resolved initial failures and scope are recorded in `qa/GCC_V8_MODERN_ARCADE_EVIDENCE.json`. The comparison does not establish long-term enjoyment, and prior full-career simulations are not recounted as new tests for this presentation pass.

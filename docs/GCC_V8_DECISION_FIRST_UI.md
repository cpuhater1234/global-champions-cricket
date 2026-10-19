# Decision-first player experience

Continues `work/v8-game-first-rebuild` from `a7ae0705c53b499f25e62d7c54eb118329f73d8c`.

## Player-facing changes

- Season navigation stays available across matchday, XI and results. Matchday, My XI, Ladder, Fixtures and Player stats are direct destinations.
- Matchday prioritises the fixture, next action, current XI readiness and recent results. Ground photos and conditions remain available in an expandable section.
- Pre-match setup puts Play and Change XI ahead of optional lineup and comparison panels.
- Empty selection shows one prompt and a progress strip instead of eleven placeholder rows. Full XIs still show eleven ordered players, manual selection and explicit swaps.
- Draft cards show shorter role information, with twelve initial candidates and twelve more per expansion. Scout retains full detail.
- Results put return, scorebook and replay actions near the outcome. Detailed innings comparison expands on demand.
- Season reviews lead with the outcome, club record and contributors. Next-season progression is prominent.
- Annual management makes retention automatic and the Confirm squad action clear. Scout is direct; Trade and Release expand under Manage. Confirmation shows who is exchanged without repeating full scouting reports.
- A dedicated workspace stylesheet controls density, spacing, mobile flow and hierarchy. Body copy remains at least 16px at standard zoom; prose uses normal weight rather than bold throughout.

## Guards preserved

No engine, player data or save-format changes. Manual XI selection, incomplete-XI match blocks, pending-swap guards, release budgets, market validation and confirmation snapshots remain active. Navigation does not change teams, XI, results or RNG. Returning from My XI now explicitly resets the destination to matchday.

## Verification

Compiled artifact: `game/gcc_v8_decision_first.html`.
SHA-256: `32fdae18fb4dddc2c8542f20b05bd51d62adddffdabeee9eff9daf9f5c9413bd`.

- 84 Chromium cases across 1440, 1024, 768 and 390px: no page errors, document overflow, clipped controls, selected sibling collisions or fragmented words. Real stadium requests deliberately fail for deterministic geometry.
- 104 later-career Chromium cases: real completed 2019, 2025 and 2026 saves; reviews, archives, scorebooks, reconstructed historical finals stages, following squad updates and career ending. No page errors, overflow or clipped headings/controls. These are rendered save states, not newly played nineteen seasons.
- 14 native-click assertions: responsive navigation, management disclosure, release cancellation and trade editor.
- 40 decision-flow assertions: navigation truth invariance, manual XI, pending-swap safety, empty state, management and exchange confirmation.
- Complete 2008 career loop: 819 checks, fourteen league matches, drafting, manual XI, reload and save checks. No quota failures; maximum observed save footprint 1,991,072 UTF-16 bytes.
- Twelve focused suites passed, including 665 retirement/release boundary checks, 77 malformed-save checks, 95 pre-match control checks and 75 annual-management checks.
- A fresh frozen-engine rebuild is byte-identical to the delivered artifact.
- Independent code review found no critical/important regression. It found the stale return-tab issue, now fixed and covered by the decision-flow test.

Browser inspection originally found narrow-panel broken player names, excessive signing whitespace and a wrapping small club badge. These were corrected before the final 84-case pass. The late-career harness now writes raw fixtures through the existing game codec, matching normal compressed game storage rather than exceeding browser quota with raw JSON.

The focused suite results are recorded in `qa/GCC_V8_DECISION_FIRST_EVIDENCE.json`. Superseded text/pagination assertions were updated to the intentional shorter review copy and twelve-player draft page size; domain checks remain unchanged.

## Assessment

This is a substantial navigation and information-hierarchy improvement, not a claim of a perfected release. Small screens still require scrolling through full squads. The browser checks establish specific geometry and interaction behavior; they do not establish long-term enjoyment, pacing or balance. Existing nineteen-season simulation evidence remains prior evidence and is not counted as a new run for this UI build.

# GCC UI rebuild: v7.9.3

The user played v7.9.2 and reported continuing overlap. Functional assertion counts did not establish presentation quality. This pass replaces ownership for the season, matchday/scorecard dialogs, offseason, trade room, annual draw/draft and final-list decisions. Home, first draft, squad/XI, finals/review and archive/legacy remain pending migration and real-browser review.

## Implemented

425 season selector branches and 192 matchday/scorecard selector branches were retired from the legacy/recovery sheets. `src/styles/season.css` owns these components. Headers and actions wrap, cards grow with content, long names wrap, the ladder has a deliberate horizontal table scroller, and panels stack according to available container width. The later-season form, fitness and injury strip also has a responsive owner layout; its former clipped names and tiny controls are retired. Win/loss states retain green/red cues within the cream and muted-green identity. The simulation, roster data and ratings are unchanged in this pass.

The native-browser diagnostic is opt-in: press **Alt + Shift + L** on a problem screen to download `gcc-layout-report.json`. It records current viewport, active screen/dialog, text rectangle intersections and clipping/overflow candidates. It makes no network requests and does not capture images or saves. When a modal opens, the report inspects that modal, rather than the covered background. Geometric warnings require review; no warning-free result certifies visual quality.

431 additional offseason/trade selector branches were retired. `src/styles/offseason.css` owns the market, contract/release rows, final-list cards, annual draft and trade dialog. Contract rows stack at narrow widths; player names and scout reads grow in normal flow; draft cards use flexible tracks; the full board scrolls deliberately. Trade copy now frames a club decision instead of explaining hidden numerical systems.

## Required architecture

- Preserve simulation/data as a separate domain. UI actions call guarded commands, and rendering reads state.
- Give each screen one owner stylesheet. Retire obsolete declarations during migration. Do not pile overrides on old geometry.
- Reuse components for player row, rating summary, fixture, result, table, modal and action group. Names and secondary copy belong in normal flow. Grid tracks use `minmax(0,1fr)`, and controls wrap or stack. Fixed dimensions belong to icons, not text containers.
- Render only changed regions, retain input/focus/scroll state, and schedule one timer per interaction. Use event delegation where large lists otherwise recreate handlers. Avoid layout animation for large changing lists; use restrained opacity feedback and respect reduced motion.
- Freeze the rendered build and review the same digest across desktop, narrow windows and mobile. Functional checks remain a separate gate.

## Review gate

For every screen and modal, inspect 1440, 1024, 768, 390 and 320 pixel widths plus 200% zoom. Include long player/club names, empty data, full lists, injury/replacement states, active swaps, paused/running timers, completed seasons and save reload. Check for clipped text, overlap, page overflow, hidden actions and loss of focus. Test mouse and keyboard, repeat actions, click while timers run, close/reopen dialogs, back navigation and reload. Profile draft scrolling, XI swaps and season ticks in native browser developer tools; inspect long tasks and frames rather than inferring smoothness from VM tests.

Migration order: season and its dialogs (implemented here), squad/XI, signing and draft, finals/review, offseason/trade/release (implemented here), archive/legacy, home. This does not mark those remaining screens approved.

## Evidence and limits

Source syntax, API/control/signing/interaction tests and parsed markup checks are available. Cascade tests include the new owner sheet and the new 13px text scale. These remain source/stub checks. No v7.9.3 screenshots, native click tests or performance traces have been inspected by the agent, because earlier browser security blocks remain in force. The candidate is a layout rebuild for review, not a claim that all overlap or interactivity is perfected.

## Game feel

The user clarified that every screen needs work and the game does not feel like a game. Layout repair alone is insufficient. Each stage must communicate the club’s situation, one clear next decision, its cricket stakes and an immediate response to the action. Supporting analysis belongs beneath that decision or in secondary views. Maintain continuity through club identity, rivals, form, injuries, league news and season progression, without adding invented outcomes. Annual draw/draft should read as events, trade as a negotiation, selection as preparation, and results as consequences. Avoid copy explaining implementation or hidden rating mechanics. This is a whole-game acceptance criterion, not a claim that this candidate has achieved it.

# GCC trade and draft rules, 23 October 2026

The requested rules are implemented in the existing playable. Build SHA256: `b96edcdbe94bdd2b244bdfd05c552289345de248665852a1ce55e4c738bd3106`. Both canonical game files and the delivered `GCC_v8_Career_Clarity.html` are identical, 1,920,353 bytes. Existing delivery updated to version 55.

## Rules enforced

- Natural retirement is uncapped. Retirements, cuts and outgoing traded players use a four-departure allowance; forced natural exits above four still occur, leaving no voluntary departures. Three retirements therefore permit one further outgoing player, by cut or trade. Incoming players do not refund this budget. Cuts remain limited to two.
- A club may complete at most two trades per season, shared across offseason and in-season activity. One two-player outgoing package counts as one deal and two player departures. CPU clubs use the same limits.
- Each side may offer up to two distinct players and two owned ordinary Round 1/Round 2 picks. Picks become available after the annual draw. Empty, duplicate, unavailable and oversized packages are rejected before any asset moves. Pick-only exchanges are supported; they use a deal but no player departure.
- The in-season window closes immediately when Round 3 is completed. It is open at rounds 0, 1 and 2, and closed at 3 onward. A stale review screen cannot submit after closing. In-season exchanges must preserve fifteen-player squads. Offseason unequal exchanges require real receiving capacity and cannot create an overfull roster.
- Extra recruitment rounds continue snake parity after the ordinary draft. Release vacancies, net outgoing vacancies from uneven exchanges and excess retirements receive supplementary selections. Full clubs skip surplus acquired picks.
- Ordinary entitlements lock at the order draw, or before a trade in an older lottery save. Buying a player cannot erase a pick already sold to another club. Started older draft saves retain their exposed order and cursor.

## Verification

Exact final build passed all 14 `qa/v8_*test.mjs` regression suites other than the long full-career runner; see `qa/departure-rules/regressions.json`. Additional exact-final checks: 2,928 rule/slot checks, 63 package/window checks and 127 transaction/save checks. The sold-pick regression failed before its fix and passed after it.

Native Chromium checks passed full review/edit/cancel at 320px, 390px with enlarged text, and 1280px, with four selected player cards, readable contrast and contained controls. The exact final build also completed release, accepted trade, cold reload, annual draft, manual XI and the first 2009 match. An actual started 2023 draft from the previous playable resumed with identical slot order and cursor. No stylesheet changed: all style blocks are byte-identical to the accepted palette build.

The broader candidate test also took the real completed-2022 career through its five-retirement 2023 offseason, drafting, manual XI, first match, playback pause/speed and cold reload. Eighty-four existing offseason layout cases passed. These two runs preceded the final compatibility guard for older lottery saves; the exact final build's native 2009 and package viewport runs were repeated afterward.

## Scope and continuity

The earlier 38-season audit belongs to the previous playable; those full careers were not rerun for this rule fix. Chromium tests do not certify other browsers, physical devices or independent enjoyment. Later-career rating crowding, initial CPU draft preference similarity and the unreproduced transition timeout remain the audit's existing watches; no speculative balance changes were made.

Evidence and reproducible scripts are in `qa/departure-rules`. `build.py` reconstructs this checkpoint from the prior accepted playable at commit9494eb1 and the final source modules. Large baseline saves and internal screenshots are local QA material. The generated dynasty source matches the delivered engine; other gameplay, career data, stadium images and visual styling are preserved.

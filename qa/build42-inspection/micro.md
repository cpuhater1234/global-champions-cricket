# Build42 micro inspection

Read-only inspection of maintained source and compiled deliver/GCC_v8_Playtest_42.html. Native browser belongs to root. No42 capture yet; no screenshot confirmation or whole-game approval asserted.

## Previous findings: source verification

- Badge fix is terminal and effective: `.gccui .g8badge` now has important nowrap/normal wrapping, border-box, zero padding and line-height1. Turn12px/sidebar14px type is explicit. This addresses the41 screenshot defect in source; native42 capture still required.
- Picked-player keyboard focus now has important3px outline with -4px offset, winning the generic exterior-ring contract. Source fix verified; native Tab screenshot still required.
- <=600px fixture-action icons now have important16px width/height/min-width/flex basis. Source fix verified; no42 visual result claimed.
- **Bat weighting remains unresolved in this compiled file.** `g8icon-cricket` still has group scale0.0244898 and stroke-width10, as41. No terminal CSS stroke-width fix was found. The41 faint-bat image finding must not be labelled visually fixed based on other changes. Check42 screenshot before further action.

## New source finding

**P3 — Menu summary loses authored hover differentiation through the final palette override.** Legacy `.g8utilitymenu>summary:hover` / `[open]>summary` set blue background, pale border/text and shadow. Later `.g8utilitymenu>summary:hover` explicitly sets box-shadow:none. The final `#g8app .g8utilitymenu summary` uses important background, text and border, overriding those non-important hover declarations. Shared button hover filter does not target summary. Thus the final menu control has no effective hover background, border, text or shadow change. Keyboard outline still works via shared important focus-visible rule. Suggested action: add a terminal summary-specific hover rule using neutral raised brightness/border, consistent with the rest of the game, then inspect hover/open at desktop. This is a cascade-evidenced source finding, not a42 screenshot observation.

## Underassessed views inspected

- Stats: seven-column club table intentionally retains horizontal scrolling; first column remains a stable text edge and numeric cells use tabular figures. League leader four-column panels have explicit narrow fixed columns. No concrete overflow claim without42 capture.
- Ladder: terminal row spacing is6px8px, type14px; title replaces visually-hidden caption. Club column has explicit left alignment and positional first column is52px centered. No obsolete double-title finding raised.
- Fixtures: two columns above760px and one below. Scores are atomic24px type; names can wrap within min-width0 flex spans; long ground names can wrap in card header. Completed footer combines result and scorebook, so request320px completed-fixture screenshot before deciding whether cramped.
- Menu: panel has a terminal width min(18rem,viewport minus2rem), overflow:auto and max-height70vh. Earlier190px minimum is overridden. No unsupported claim that the menu extends beyond the viewport.

## Capture requests

Actual42 desktop/phone draft; focused selected-player row;320px completed fixtures;390px populated stats/ladder; desktop menu hover/open. These are requests to root's existing browser flow, not user blockers.

# Build41 micro craft inspection

Inspected maintained source and compiled `deliver/GCC_v8_Playtest_41.html`, including terminal decision UI overrides. Read Build40 review first. No production edits; browser belongs to root. Findings below are source/cascade findings pending Build41 native captures, not screenshot observations.

## Ranked actions

1. **P2 — Draft selected-player keyboard ring is still outside a clipped group. Cascade-evidenced.** `v8/ui/decision-ui.css:476` requests a 2px inset ring (`outline-offset:-3px`) without `!important`. The shared keyboard rule at line38 declares outline and positive 3px offset with `!important`, so the intended inset rule cannot win. `.gccuiDraftGroup` at line465 has `overflow:hidden`. Selected player rows reach the frame edges, therefore the exterior ring can be clipped at the group boundary. The scout action has a later important inset fix at line818; selected player buttons need the same effective treatment. Verify Tab focus on the first and last selected players at desktop/mobile, preserving a visible complete ring. This is a cascade conclusion; no native screenshot yet.

2. **P3 — Phone fixture-action icons ignore their intended compact size. Cascade-evidenced.** At line588, the <=600px rule asks for 16px icons, but neither width nor height is important. The global `.gccui .g8icon` rule at line9 assigns 22px important dimensions and `min-width:22px`. It also assigns a 22px flex basis. The later `flex-basis:16px` may win that property, but width and min-width retain 22px. Thus buttons get the compact 12px text with a full 22px icon rather than the authored 16px treatment, using six unnecessary horizontal pixels each in the narrow two-column action group. Make dimensions/min-width/flex basis consistent in the narrow action scope, then inspect selection and opponent-preview buttons at 320/390px. This is an effective-cascade fact; visual severity needs capture.

3. **P3 — Narrow offseason stepper remains a dense three-column row with larger details than titles. Source hypothesis.** `arcade-charcoal.css:117–122` forces flex with each li flex:1, overriding the legacy <=1000px single-column grid. At <=760px only label text becomes 12px and item padding reduces. The detail span still inherits game.css:147's 1rem/1.45 (16px at the page default), while each step includes a fixed28px marker plus6px gap and12px horizontal padding. At320px, roughly100px per step leaves about54px for the detail/title. “Review your players”, “Fill vacant places” and “Name your side” can become tall narrow text blocks, while headings are smaller than explanatory copy. Root should inspect the three-step annual draft state at320/390px. If reproduced, use compact numbered labels with details only on the active step, or stack the stepper deliberately under a narrow breakpoint. Do not change this solely from source inference.

## Checked without claiming defects

- Mobile club guide controls have a terminal44px rule; earlier40px sizing is obsolete and should not be reported.
- Recruit-card narrow header receives a terminal container override; earlier two-column placement alone is not evidence of a current problem.
- Draft mobile companion toggle intentionally differs from desktop; no duplicate-action finding asserted.
- Player profile view buttons have terminal374px/760px layout rules; earlier three-column source is not enough to claim name clipping.
- Result actions intentionally become two equal columns at760px. Need actual long-label capture before flagging.
- Archive season table intentionally uses46% player and18% numeric columns, with narrower mobile cell padding. Need native long-name/large-stat evidence before flagging crowding.

## Coverage limits

No Build41 native captures available to this inspector yet. No claims of visual approval, perfect alignment, whole-game coverage or completion. Draft, XI, matchday, result, archive and offseason source paths were inspected; optical icon consistency beyond the explicit cascade conflict still needs rendered review.

## Actual Build41 desktop draft capture follow-up

Inspected `captures/draft.png` with the image viewer. Two additional screenshot-confirmed findings:

- **P2 — PBKS identity wraps to PBK / S in turn and club-sidebar badges.** HUD badge remains atomic. Compiled source has generic `#g8app span{overflow-wrap:anywhere}`; only the HUD receives the terminal atomic-text fix at decision-ui.css:822. Turn badge is42px with15px type; club-head badge is50px and inherits global1.15rem (about18.4px) badge type. These contexts need `white-space:nowrap;overflow-wrap:normal;word-break:normal;line-height:1;padding:0;box-sizing:border-box` and explicit12px turn /13–14px club-head type. Keep fixed width rather than globally changing to max-content, which could disturb adjacent grid layout. Verify longest four-character abbreviations in both badges.
- **P3 — Bat-role glyphs appear markedly fainter than search/action glyphs.** This is visible beside Opener/Top order and the selected Batters group. Final CSS does not suppress opacity or apply a filter; role color is authored gold #e2b368. The compiled `g8icon-cricket` symbol is a traced contour shape with a group scale0.0244898 and stroke-width10 source units, giving about0.225px stroke at22px. Thus asset path weight is the likely cause, rather than CSS opacity/contrast settings. Strengthen that specific existing symbol's contour weight (trial32–40 source units, inspect to avoid merging detail), preserving other icons and role colors. Asset-weight attribution is a source-supported hypothesis; faint rendering is screenshot-confirmed.

# Build45 independent panel  -  visual craft

**Subjective score: 7.2/10.** This is a bounded craft review of Build45 desktop home/matchday and mobile fixture/management captures, supplied Build43/44 context captures and Build45 effective source. It is not a whole-game audit or an accessibility certification. The interface is coherent and usable in these examples; it still looks more like a carefully skinned utility than a finished premium sports management game.

## Three strengths

1. **The score and roster number hierarchy works.** The Build44 fixture capture makes 124/4 versus 123/10 instantly legible; the Build43 XI capture gives selection count, XI rating and individual OVR distinct but related weights. Build45 terminal schedule CSS preserves 24px tabular scores and smaller wickets.
2. **Mobile controls largely have deliberate geometry.** The Build44 390px management capture has three intact view labels, a clear close button and no lateral spill. The Build44 320px story capture keeps the primary reveal action and Back inside a compact, understandable panel. Current45 management retains intact labels and contained dialog geometry. The story observation remains an older native result.
3. **The details are being corrected in the effective cascade.** Build45 has atomic Scorebook labels, fixed small fixture icons, a real Menu hover override, and a visible amber focus rule for the new current-fixture destination. I have not recycled the overridden42 Menu-hover defect.

## Ranked weaknesses

1. **P2  -  Management spends too much vertical space before its current actionable state.** Current `qa/panel45/captures/management-mobile.png` at390×844 shows Kemp’s identity/header tabs, batting-position panel, YOUR RELATIONSHIP, Wants a move, role prose, Why this matters, assessment tiles and recent figures before the active promise begins around y768. “1 full bowling opportunity remaining” is cut at the bottom. The unresolved request is clearly communicated, but its active commitment is too deeply buried. Build45’s nested relationship/commitment hierarchy explains the result; this is not a lateral-overflow defect. **Acceptance:** after selecting Management at390×844, show the entire active commitment status and remaining-opportunity count without further scrolling; reduce repeated framing and collapse background explanations behind a disclosure. Keep any promise terms paired with their action.

2. **P2  -  The actual next fixture loses visual priority to the venue.** Current `qa/panel45/captures/matchday-desktop.png` at1135×666 gives the long stadium name three bold lines around y455-531, while the home/away matchup cards begin at y595 and are cut by the fold. “vs Gujarat Titans” is a small row at y310. This is not a missing-action claim: Watch match is clearly visible. It is the wrong content hierarchy for a matchday screen. **Acceptance:** at1150×666 show both complete team cards and the match action together; make the full venue name secondary type or a compact expandable detail, while retaining the weather and XI readiness.

3. **P3  -  The XI view devotes its strongest first-screen real estate to framing rather than the XI.** In `qa/build43-inspection/captures/xi-ratings-390.png`, the first player begins around y628 and the second around y740. Five stacked regions precede the actual batting order: navigation, title, rating/actions, venue and squad/XI switch. Build45 retains the selection header and 44px icon/title treatment in its terminal CSS; native45 screenshot is needed before treating those old coordinates as current. **Acceptance:** show at least the first three complete batting-order rows at390×844 while retaining the necessary selection count and matchday action; compress the venue into secondary context and reduce duplicated header framing.

4. **P3  -  Menu open state is weaker than its hover state.** Effective Build45 source: the terminal important `#g8app .g8utilitymenu>summary:hover` now works, but the earlier `.g8utilitymenu[open]>summary` background/border/text declarations lose to the final important palette rule. The open details container gets a background/shadow, so this is a subtle state-polish issue, not an invisible-menu claim. **Acceptance:** after opening Menu with touch or keyboard and moving the pointer away, its trigger retains an intentional expanded-state treatment; verify closed, hover, focus and open independently at desktop and390px.

## Build45 native fixture result

Current `qa/panel45/captures/fixture-jump-mobile.png` shows the full Round9 target card around y291-521 with an unambiguous amber focus outline, the Up next footer and both teams visible. Root also verified native target focus. This closes the tested mobile current-fixture reachability concern; the old Build44 history-first screenshot is not a45 defect. The action’s full-width≤600px source treatment is intentional and the focus outline clears the card edges cleanly. No desktop or season-complete jump claim is made here.

## Current45 desktop note

The Build45 home image and compact matchday readiness strip are visibly stable at the captured desktop size. The home secondary Start new career control still stacks a lone play icon above its label despite ample width; it looks less deliberate than the horizontal icon/action grammar elsewhere. Treat as low-priority polish, not a functional defect.

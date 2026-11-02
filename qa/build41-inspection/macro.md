# Build41 macro inspection

Evidence: source inspection of the complete compiled HTML, including the final `gcc-charcoal-20261030` and `gcc-decision-ui-20261030` style blocks; maintained screen and decision UI templates; Build40 review. This is not a Build41 browser certification. No production files changed.

## Ranked findings

1. **Medium — Story / narrow phone — primary progression still follows all three explanatory steps.** Source-confirmed order is intro → three stacked step cards → launch actions → format metadata (`screens.js:13`; compiled HTML final setup rules around 3780–3840). Build41 correctly moves the Reveal action before format metadata, but that change does not address the larger vertical distance created by the three cards. Build40 browser review specifically reports launch below the phone viewport; Build41 retains that principal composition. **Bounded fix:** on mobile put the Reveal/Back action group immediately after the intro, retaining the step list below as supporting context, or collapse the three steps to a compact single summary. Avoid a second duplicate action group. **Verify:** fresh story at 390×844 and 320×568; primary action visible without scroll, no header overlap, logical DOM/tab order, and Back preserves the existing career.

2. **Low / verification candidate — XI / phone — top-only confirmation can become distant during roster edits.** The final decision template puts status and confirmation above venue, tabs and a roster of 76px minimum rows; no bottom confirmation is emitted. This is a source-confirmed placement, not a demonstrated failure. At eleven rows the final edit can be far below the confirmation. **Bounded fix only if reproduced:** add a compact sticky confirmation/status strip scoped to the active selection workspace, with the existing blocker text and disabled semantics; use a static fallback on short-height screens. Do not duplicate the entire status panel. **Verify:** select the eleventh player from the bottom, swap a lower-order player, change order at positions 10/11, and confirm the next action remains discoverable at 390×844 and desktop 1150×666. Check it does not obscure arrows or browser safe-area content.

## Hierarchy and material assessment

The actual final palette is charcoal with restrained club-colour action accents. Earlier blue/bronze/paper rules are overridden by later `!important` charcoal rules; recommendations based on those early colours would be invalid. Primary actions, pressed tabs and active navigation intentionally share the club accent. The final decision screens generally establish a good order: decision/title → operational controls → working content → optional details. Draft status and team-room confirmation now occupy upper decision bands; result continuation also appears beside the title. Recruitment keeps Start before signings counts/wire content. These are source-supported composition findings, not assertions about rendered balance.

No further material or global density rewrite is justified without current screenshots. The compiled cascade already centralises panel/inset/raised surfaces, removes decorative shadows in the final layer, and uses compact typography on the main decision screens. Another broad palette override would add cascade debt without evidence of benefit.

## Open verification gates

- Actual Build41 story viewport and action placement, chooser metadata wrapping/44px guide geometry, recruitment header and Start position.
- Draft after a lower-list successful pick: new turn banner and filters appear at top; rejected pick and scouting/filter focus do not jump unexpectedly. Existing regression is useful but not visual evidence.
- XI at 0/10/11 selected, pending swap, long player names; confirmation discoverability after lower-list edits.
- Matchday, live play, win/loss result, long scorebook/records and mobile overflow.
- Offseason overview, retained XI, departures/trade review, finals/spectator and end-career. These remain source-only here; no whole-game visual sign-off.

## Capture follow-up and candidate patch review

Evidence: inspected supplied native captures `xi-empty-mobile.png`, `xi-no-keeper-mobile.png`, `matchday-mobile.png` and `result-mobile.png`; read the final maintained CSS patch. The captures show a consistent charcoal surface hierarchy, legible squad/fixture groupings, matchday Watch match and result Next match within the initial phone viewport, and clear disabled Lodge XI plus a specific keeper blocker. No new consequential macro issue is visible in these four captures. The reported native lower-list swap measurement (status top −697.4px at scroll 892, focus Edit McCullum; supplied by root) promotes finding 2 from a hypothesis to a reproduced discoverability issue. The candidate patch reuses the existing status panel as sticky at widths ≤760px/heights ≥640px and sets the header to `display:contents`, correctly removing the short sticky containing block; short viewports retain normal flow. This is a bounded response without duplicate actions. The displayed captures precede that sticky correction and cannot certify its final occlusion/scroll behaviour; root's candidate native check should confirm the status remains visible while editing lower rows, with rows/arrows still reachable. No further generic density or materials work is warranted from this evidence.

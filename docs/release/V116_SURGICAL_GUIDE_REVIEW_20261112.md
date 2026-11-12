# Surgical guide correction | 12 November 2026

## Result and identity

Review candidate SHA-256: `79a2fbfe965453ad0ef04d238ee7047346fb38e537deeec47d91cfcbebf51c4a`.
Size: 6,655,242 bytes. Status: ready for user visual review, not a promoted playable release or whole-game UI sign-off.

Native evidence: https://github.com/cpuhater1234/global-champions-cricket/actions/runs/43154341321

All 54 paired states passed. No script errors or recorded layout failures. Verified real guide dispatch, three guide pages, expanded rules, 320/390/768/1024/1150/1440px layouts plus an 844x390 short viewport, return action, Tab navigation, native background-focus blocking, Escape and hidden closed dialogs. Chromium browser-level BODY focus boundary visits are recorded separately. Synthetic non-guide cascade fixtures remained identical; this is not full XI/player-report gameplay acceptance.

## Source correction

The previous adapted owner changed guide rows but retained the late Floodlit shell, condensed heading family, tracking and button appearance. The replacement owns the full guide surface: restrained charcoal, regular interface type, compact header and footer, aligned reference rows and consistent mobile controls.

- Authoritative guide owner: `v8/ui/decision-ui.css`.
- Reviewed owner snapshot: `qa/candidates/v116-guide-owner.css`.
- Guarded builder: `qa/v116_menu_surface_candidate.py`.
- Previous accepted baseline snapshot: `qa/fixtures/v116-accepted-guide-owner.css`.
- Previous baseline remains exactly `943643a36730f9db6630437b15111b5f82041b540998f793230aab1745be21e3`.

Every byte outside the existing guide region of decision-ui.css is unchanged. Runtime composition also excludes guide prompts from 92 existing late dialog selector sequences using zero-specificity conditions. It adds no stylesheet or script. All 22 scripts remain byte-identical; there are still 17 style elements. The previously verified captaincy/player-heading contrast correction is inherited.

Automatic approval review initially blocked shared-source promotion before native validation. After the scoped diff proof, successful native run and independent review, the direct guide-region write was approved as commit `6b8d925f2e75dea49fcdae6a470b9aacfdb72d32`. The builder now consumes that maintained guide owner and proves equality with the reviewed snapshot. Full maintained-source build parity remains UNVERIFIED; the late frozen overlay still requires its guarded adapter.

## Findings caught before delivery

The new harness initially queried a sibling footer as a descendant and could leave Chromium open after an exception. Those harness defects were corrected. Native testing then exposed a real missing content-wrapper constraint, which was fixed at the scoped owner. Focus tests were corrected to move focus before refocusing a control after explicit scroll resets. Screenshot review caught an inherited bright primary-button skin that layout checks alone missed. The final narrow-width check caught a footer transition omitted from reduced-motion handling.

No failing acceptance check was removed. The final run checks actual footer fills, shadows, geometry, equal mobile navigation heights and non-guide isolation. Desktop footer: 59px versus approximately 114px before; mobile navigation buttons: equal 68.39px.

Independent CSS review verified source boundaries, selectors, closed-state handling and preserved script identity. Independent visual review inspected actual desktop, rules and mobile comparisons, found no blocking visual fault in those captures and explicitly withheld user approval/whole-game sign-off. Mobile footer and expanded mobile rules were functionally exercised, but the compact published comparison images do not visually show all those states.

## Protected state and next work

Main, frozen v116, gameplay and the user's career were not advanced or replaced. The next UI work should apply this evidence-first ownership method separately to Matchday, XI and player reports, preserving their strong cricket composition. Captaincy discoverability, phase/rules consistency and wider source reconciliation remain open.

## Reference discipline

The implementation used Tom's prior decisions, Claude's actual v115 menu/CSS references, separate cascade and visual reviews, and narrowly applied primary typography/layout/dialog guidance:
https://fluent2.microsoft.design/typography
https://fluent2.microsoft.design/layout
https://fluent2.microsoft.design/components/web/react/core/dialog/usage

A layout test pass is not a design endorsement. Delivery requires actual capture review against the approved product direction.

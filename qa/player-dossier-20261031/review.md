# Build 22 verification and player dossier review

Build 22 was inspected in connected Chrome at 1150x666,390x844 and320x740. Desktop match controls330–401px; conditions401–468px rather than Build 21's640–706px. Squad sidebar428px rather than503px, while cause text is12px rather than11px. At 390px conditions512–598px, thumbnail80x80px; at 320px conditions end near633px with no page or visible-element horizontal overflow. Review XI opened correctly with Price in the selected XI and one regular spin option. No further match played.

## Dossier baseline

Andrew Symonds report:840px wide,641.6px dialog height,1782px body height. Content heights: identity118px, batting-order editor82px, abilities172px, relationship728px, player detail516px, phases52px. Management starts below the first ability panel. The page exposes different information types as a long stack, which is a recurring interaction cost.

## Changes

Focused Overview, Attributes and (owned-player context only) Management view buttons in the existing dialog. Core ability, outlook/development and GCC record remain in Overview. Detailed abilities display directly in Attributes, followed by existing phase disclosure. Management retains existing concern, why, state, recent performance, commitment and decisions. Identity, overall label and Pick/Select/Swap actions remain common. Selected-player batting order controls remain available.

Normal scouting opens Overview. Squad issue review opens Management directly. Decisions and batting-order edits retain the active view. Close then normal reopening returns to Overview. View controls are ordinary pressed buttons in a labelled group, not an incomplete composite ARIA tabs implementation.

Default playerRead output remains byte-identical for all15 tested roster players after one match, including current records. Optional section filtering uses the same public reads and ability values. Non-owned player management is not exposed. Cricket engine, persistence, data and ratings scripts are unchanged; controller changes concern report state and return/focus routing only.

## Independent review and fixes

Initial review found two issues:
1. A view change re-entered inspect and cleared trade/undrafted/offer return state. Same-report refreshes now preserve scoutReturn and scroll state. Command-level trade→scout→Attributes→Close test returns to trade.
2. Replacing the modal moved focus to Close. Stable view-button ids and an explicit focus target now restore the selected view after a view change. The offline host verifies logical focus targeting only, not physical browser keyboard behaviour.

Independent re-review reported both resolved and no new P1/P2 finding. Both expanded suites were rerun independently without report writes.

## Verification

Twenty inline scripts parse. New suites pass: focused views, direct management entry, view retention, reopen reset, read-only rendering, trade return and logical focus target; default read parity, non-owned management exclusion, actual command-level select/swap/order/draft-pick from report views. Existing coordinated UI and matchday hierarchy contracts and engine regression also pass.

Actual Build 23 layout, keyboard focus, scrolling, report switching at 320/390px, long names and trade-review return still need Chrome verification. Review controls may need sticky treatment for long attribute/management content; this is a follow-up to inspect, not a claimed completed improvement.

## Browser connection limit

The browser stopped responding while closing the inspected Symonds profile. After over 60 seconds the pending tool call was cancelled; no further clicks were stacked. The last confirmed state was the profile open at default desktop sizing, not a confirmed return to matchday. Do not infer a game crash from this connection timeout.

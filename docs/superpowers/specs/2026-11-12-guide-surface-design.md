# GCC guide surface correction

## Intent and authority

Tom has rejected the current menu and repeated broad redesigns. His established
direction is Claude's restrained styling with compact v116 navigation, strong
cricket identity, readable controls and less heavy navy. This bounded candidate
corrects the guide overlay first; it does not replace the game design wholesale.

## Root cause

The adapted guide owner controls rows but leaves the shell, title, heading family,
tracking and button appearance under a late Floodlit owner. It also deliberately
uses the display-font token, so a fallback font cannot fix the inherited condensed
face. Its two-tier footer is authored geometry, not a responsive accident.

## Approach

Keep shared game styling and the existing guide markup/actions. Exclude the three
guide prompts from the late Floodlit dialog selectors, then replace the existing
guide owner in place with one complete surface owner. Generic inherited styling
remains available for other dialogs. A new global theme would risk every strong
screen; another appended guide override would repeat the ownership mistake.

The owner was initially staged at qa/candidates/v116-guide-owner.css after automatic
approval review blocked shared-source promotion before native validation. Native
run 43154341321 then passed all 54 paired states with non-guide fixture parity.
Following that evidence, promotion of the guide region only was approved as commit
6b8d925f2e75dea49fcdae6a470b9aacfdb72d32. The authoritative owner is now
v8/ui/decision-ui.css; the builder proves it equals the reviewed snapshot. Full
maintained-source build parity remains a separate unverified contract.

## Candidate design

- One quiet near-charcoal surface, restrained cool accent, pale readable text.
- Inter interface text and headings; keep sports display typography elsewhere.
- Compact fixed header outside the scrollable reading pane. No content behind it.
- Six starting steps: two equal desktop columns, one mobile column, small circular
  numerals, consistent left edges and controlled paragraph measures.
- Expanded reference rules: separated full-width rows, heading on the left and
  explanation on the right at desktop; stacked on mobile. No paired prose slabs.
- A single compact footer row at desktop: quiet guide navigation and a secondary
  return control. Three horizontal guide options on mobile, with return below.
- Existing cricket icons remain, normalized to the same optical size.

## Constraints and verification

Base is the full-acceptance menu candidate plus the verified three-rule contrast
correction. Preserve all 22 scripts, 17 style elements, gameplay, copy, actions,
manual XI, club identity, photographs, save and user's career. No root theme or
shared app/button/font token is changed. The frozen release and main remain intact.

Render all guide pages, expanded rules and multiple scroll positions at
320/390/768/1024/1440px and short desktop/landscape heights. Require readable
font families, no horizontal overflow, reachable close/return controls, correct
reading-pane geometry and same action counts. Compare screenshots with the rejected
baseline at identical dimensions. Inspect Matchday, XI and player reports for
spillover; compute their CSS outside guide prompts before and after.

Automated layout success is a functional gate. Visual acceptance requires judging
the actual captures against Tom's direction. Do not relabel this candidate approved.

## External references used narrowly

https://fluent2.microsoft.design/typography
https://fluent2.microsoft.design/layout
https://fluent2.microsoft.design/components/web/react/core/dialog/usage

These inform reading hierarchy, spacing and dialog anatomy; they do not define
GCC's brand. Claude's actual CSS and Tom's decisions remain the product references.

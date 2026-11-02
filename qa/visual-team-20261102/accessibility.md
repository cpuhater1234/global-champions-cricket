# Accessibility and typography review — build 33

Scope: read-only source audit of `deliver/GCC_v8_Playtest_33.html`, `v8/ui`, and patch assembly. Only current capture inspected: `captures/home-desktop.png` (1135×657). No browser interactions or unobserved rendering claims. Findings below distinguish definite source defects from visual verification work.

## Prioritized findings

1. **P1 — Mobile selection view lacks programmatic selected state.** `v8/ui/decision-ui.js` selection markup emits `.gccuiPaneTabs button[data-action=teamPane]` with only class `selected`; `components.js:7–10` only automatically sets `aria-pressed` for `seasonTab`, not `teamPane`. The two buttons switch visible Squad/Starting XI panels at the narrow breakpoint. **Correct:** emit `aria-pressed=true/false` on both pane buttons (consistent with existing report-view group); optionally `aria-controls` for named panel IDs. **Verify:** at 600px and below, keyboard toggle both ways; accessibility tree reports exactly one pressed button and hidden pane controls are absent from tab order.

2. **P2 — Small type is concentrated in information needed for decisions.** `decision-ui.css:461` sets picked-player role metadata to **11px**; `:448` coverage explanation is **11px**; `:599` Overall label is **10px**; `:538` campaign labels are **10px**, uppercase with `.06em` spacing. Current home capture also shows 12px league-format labels (`:296`). This is a readability/premium hierarchy concern, not an automatic WCAG minimum-font-size failure. **Correct:** use 13–14px sentence-case metadata; reserve 11–12px uppercase for nonessential kickers; maintain 1.4–1.5 line height. **Verify:** native-size screenshots at 1280px and 390px, plus 200% text enlargement, keep role/coverage/season context readable without truncation or overlapping controls.

3. **P2 — Mobile controls reduce action text to 12px.** `decision-ui.css:577` forces match actions and child spans to **12px!important** at ≤600px; `:630` does the same for player report view buttons at ≤760px. Targets remain ≥44px high, so this is typography rather than target-size failure. **Correct:** retain 14px labels and allow button wrapping or full-width stacking as available width narrows. **Verify:** 320px and 390px captures with longest action/report labels; no clipped text, 44px minimum target height, and 200% text enlargement remains usable.

4. **P2 — Coverage bars lose visual weight for dark clubs.** `.gccuiCoverageTrack` is `#111718` and its fill uses raw `--ui-team` (`decision-ui.css:451–452`). Exact sRGB contrast calculations across **all 36 clubs** show **16 fills below 3:1**, including Somerset **1.04:1**, Warwickshire **1.06:1**, Yorkshire **1.22:1**, Gujarat **1.25:1**, KKR **1.40:1**. Numeric coverage labels make the data independently available, so do not claim a categorical WCAG failure; the graphical comparison is still effectively invisible for those teams. **Correct:** neutral accessible fill (e.g. warm gold), or a contrasting outline/alternate lightened accent for coverage data. Keep raw club colour for identity accents. **Verify:** render coverage for all 36 clubs; fill-to-track contrast ≥3:1 while exact numeric counts remain visible.

## Checks that should not be reported as defects

- `clubInk` (`components.js:13–16`) evaluates relative luminance and chooses safe ink when the authored pair falls below 4.5:1. Computation using all 36 current club definitions: lowest corrected text contrast **4.5506:1**, Nottinghamshire `#f0d58a` on `#0d6b45`. Shared club heads explicitly inherit this ink; selected report views and career primary actions also use `--club-ink`. Ordinary shared primary/default/pressed buttons use fixed contrasting palettes. Disabled controls are visually faded intentionally.
- Central move helper supplies `aria-label="Move batter up/down"`; no missing-arrow-label issue.
- Shared focus-visible rules in charcoal and decision CSS use warm neutral 3px outlines with `!important`. The later raw club outline on picked-player buttons does **not** override that important rule. Do not report it as the rendered focus colour.
- Report navigation is a valid pressed-button group, not an incomplete ARIA tab widget; controller restores focus to the selected report button.
- Native dialog uses `showModal`, labelled heading and close button; opener focus restoration exists. Source alone cannot establish full assistive-technology behavior.
- Reduced-motion is implemented for reveal JS, coin animation, gccui descendants, toast fade, stadium fade, and brand transition. Shared legacy buttons retain a 120ms colour/filter transition outside gccui, a low-priority polish issue rather than major motion exposure.
- Overflowing tables receive a labelled focusable region via `accessibleTables` in the retained baseline script. Keyboard horizontal scrolling still warrants browser verification; lack of a duplicate implementation in v8/ui is not a missing feature.

No responsive clipping defect is asserted from the lone desktop home capture. Required additional renders: 320/390px selection, draft coverage, player report, match actions; 200% text enlargement and keyboard focus traversal.

## Bounded coverage correction for root implementation

Preserve every authored club fill and existing numeric meter labels; add an inset neutral stroke to positive-width fills only. Inset paint avoids layout changes and track overflow clipping of an outside outline:

```css
#g8app .gccui .gccuiCoverageTrack>i {
  box-shadow: inset 0 0 0 1px #c2c9cc;
}
```

`#c2c9cc` has 10.80:1 contrast against track `#111718` (calculated sRGB; greater than the 3:1 requirement). The 5px track retains a 3px-high club-colour interior; all 36 club definitions retain their exact fill. This establishes a high-contrast shape boundary even for Somerset/Warwickshire. Zero-width meters remain empty. Verify screenshot at 100%/200%, particularly tiny nonzero values; retain adjacent numeric coverage for precision. This is a proposed source-level correction, not a browser-verified render claim.

## Targeted RED contract

Added `accessibility-contracts.mjs`; run `node qa/visual-team-20261102/accessibility-contracts.mjs`. Against current build 33: **expected RED**, exit 1, two failures (teamPane squad/xi states absent); five guards pass (both existing seasonTab cases, arrow names, ordinary non-toggle action, no game errors). Tests inspect generated button tags from actual `X.views.team()` after a real offline draft; they make no geometry or browser assertions. CSS font-size targets remain editorial suggestions and were not converted into brittle source-string tests.

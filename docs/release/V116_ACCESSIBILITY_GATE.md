# Exact-candidate accessibility gate, 13 November 2026

Candidate: `GCC_v116_Draft_Cards_Review.html`  
SHA-256: `c45684a540d098ec35beeb8a959995e88292bccded4ce1314390140d1e7720ab`  
Disposition: **HOLD, unpromoted**. No game artifact or canonical product body was edited. No new download is required. Frozen v116 and main remain untouched.

## Scope and evidence interpretation

Only the next accessibility gate was executed: keyboard operation/focus, current live-score DOM/accessibility-tree updates, responsive layout, verified native 200% Chromium zoom, and the specific tablet signing-control inconsistency. The previously closed signing persistence, two-tab, and full gameplay/save acceptance were not rerun. An existing disposable checkpoint supplied screen setup only. The user's career was not used.

The first diagnostic [43345703324](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/43345703324) was incomplete: its live setup skipped the required Match preview, so the game correctly rejected Play. Its keyboard assertions also conflated a native browser-chrome Tab boundary with focus escaping into background page controls. Initial offscreen navigation findings did not distinguish the intentional horizontal scroll container. These raw findings are retained as diagnostic history, not confirmed product failures. The corrected diagnostic adds the missing preview, retains browser-boundary evidence, verifies subsequent focus, and explicitly checks scrollable career-navigation reachability.

## Tablet usability triage

At 768px, Resume signing is 62px high while Speed and Skip to end are 44px high. Labels fit; controls are readable. Resume and Pause work using keyboard Enter. The focused control has a visible 3px outline and is unobscured. The screenshot was inspected. **Cosmetic inconsistency deferred; no UI patch.**

## Confirmed narrow-screen visual finding

In the 320px Matchday screenshot, the two-line Season record label overlaps the 0-0 value. This is a readability defect in the compact summary tile. It is separate from the tablet button-height inconsistency. Record for an isolated follow-up; no broad layout rewrite in this gate.

## Limits

DOM and Chromium accessibility-tree exposure do not certify actual NVDA, JAWS or VoiceOver spoken output. No browser matrix, storage-failure matrix, or full career-horizon certification is implied. Automated green status means that the diagnostic completed, not that promotion criteria passed. Manual spoken-output verification remains necessary before a live-announcement signoff.

## Live-score evidence

Corrected diagnostic 43346095047 recorded seven changing score messages. The visible score 9/1 matched the accessible text “Mumbai Indians: 9 for 1 after 0.5 overs. Setting the target.” Chromium exposed the region as non-ignored status, live=polite, atomic=true, including the score context. Keyboard Pause stopped the counter and Resume/Pause operated successfully. However, seven updates used seven different status-container instances. Treat this as a live-region interoperability risk, not proof of absent speech. [W3C ARIA22](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA22.html) calls for the status container to exist before inserting the message; an actual assistive-technology check is still outstanding.

## Native zoom limits

200% browser zoom was activated and verified at physical widths 1440 and 640: CSS inner widths 720 and 320, devicePixelRatio=2, outer/inner ratio=2. The zoomed raster capture is visibly clipped relative to the DOM geometry, so these screenshots do not establish a full visual reflow pass. DOM width/control checks and keyboard observations are retained; do not confuse them with complete zoomed visual approval. No CSS transform or injected font-size substitute was used.

## Final keyboard and responsive result

[Final diagnostic 43346413874](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/43346413874) completed:33 captured states,105 focus observations, no runner or page-runtime errors. The raw report contains three focus-visibility findings. At320px, actual Tab traversal reaches Fixtures while the button remains partly offscreen (x279.84,width87.72); its centre is obscured. This remained after250ms for scrolling to settle. At360/390px, initial programmatic focus on Matchday after a viewport change also remains partly offscreen; those two observations are not presented as independently reproduced Tab-only failures. The narrow navigation needs focused triage before promotion. No WCAG conformance certification is claimed.

Dialog opening with Enter, Escape close and opener restoration, focus indicators on actual controls, and live Pause/Resume were exercised. Native Tab traversal may visit browser chrome, represented by BODY as activeElement; this boundary is recorded and not misreported as a background-page-control escape. The diagnosis is bounded to Chromium and the tested dialogs/states.

Machine evidence: [summary](accessibility-gate/43346413874/summary.json), [full report](accessibility-gate/43346413874/report.json), and synthetic screenshots in the same folder. The initial and intermediate runs remain historical evidence; the final run supersedes their harness assumptions. Raw machine findings remain unchanged. This written review adds the visually confirmed Season record overlap and zoom-capture limitation.

## Promotion decision and next work

**Do not promote.** Retain frozen v116 as rollback. Next focused work is narrow career-navigation focus visibility and the320px Season record tile, followed by actual screen-reader speech verification and reliable zoomed visual evidence. Do not broaden this into archive/offseason density, mobile draft redesign, cricket logic or cascade consolidation. The tablet height inconsistency remains cosmetic/deferred. Source/build parity was freshly checked locally:17 styles,22 scripts, no changed bodies,6,655,156bytes, exact c456 hash.


## Follow-up: edited accessibility candidate, 13 November 2026

Candidate: `GCC_v116_accessibility_review.html`, built from `v116/canonical` on `work/v116-candidate-acceptance`  
SHA-256: `c8990d219359ce23f697db136d47e44673427167cec0bae83638e61ceb5909a0` (6,655,238 bytes)  
Disposition: **HOLD, unpromoted.** Frozen v116 and main untouched. No new download.

### Change (CSS only, one owner)

`v116/canonical/styles/31-gcc-floodlit-visual.css`, existing `@media (max-width:700px)` block of the "22 ─ Small screens" owner. Two declarations changed; no other body changed. All 22 script bodies remain byte-identical to frozen v116, so no `--allow-runtime-changes` build was used and no engine/save behaviour changed.

1. **Season record tile.** Root cause: `10-gcc-decision-ui` fixes the first tile row at `18px`; at 320px the label wraps to two lines and overflowed into the value row. The compact tile rule now adds `grid-template-rows:auto auto auto`, so label, value and note each get natural height. No fixed heights, absolute positioning or override block. The same defect affected League position at 320/360px and is fixed by the same rule.
2. **Career navigation focus.** Root cause, measured: Chromium does not scroll a horizontally scrolling container when a newly focused child is already partly visible, so Tab left Fixtures at x279.8–367.6 inside a 16–304px scrollport. Separately, `overflow-x:auto` clips vertical overflow, so the 3px + 2px-offset focus ring was cut off 5px at the bottom of every nav button. The compact nav rule now adds `scroll-padding-inline:7rem` (wider than the widest nav button, so any partly clipped button falls entirely in the padded band and gets scrolled into view) and `padding-bottom:.4rem` (room for the full ring). Fixtures is not hidden and keyboard order is unchanged.

### Evidence (local Chromium run against the exact rebuilt file)

Evidence folder: [accessibility-gate/local-20261113-c8990d21](accessibility-gate/local-20261113-c8990d21/). The CI workflow `v116-accessibility-gate.yml` now pins this hash and reruns all three harnesses on push; its run supersedes this local record when it lands.

- **Focused harness** `qa/v116_narrow_focus_layout.cjs`: 126/126 PASS. At 320/360/390px, label and value text rectangles (measured from text line boxes, not the grid-cell box) do not intersect for all four tiles, text is contained and unclipped, and there is no document horizontal overflow. At 320px Season record now wraps to two lines (y185–218) with the 0-0 value below it (y222–258). Real Tab from the HUD Menu into the nav, then Shift+Tab back, at 320 and 360px: every nav button visited in order, focus ring rendered, control and full ring inside the nav scrollport and viewport, unobscured at its left/centre/right points, no horizontal page scroll. Fixtures after Tab at 320px: x140.8–228.6, ring 135.8–233.6 inside 16–304 (bottom 150 inside 151.4). Screenshots inspected.
- **Existing gate harness** `qa/v116_accessibility_gate.cjs` (only change: expected hash comes from `GCC8_EXPECT_SHA256`): automation PASS, 33 states, 105 focus observations, 1,018 observations, **0 findings** (previous run: 3 focus-visibility findings, including the 360/390px initial Matchday focus observations). Dialog Enter/Escape/restore, live Pause/Resume and 768px signing triage unchanged.
- **200% zoom** `qa/v116_zoom200_capture.cjs`: native zoom verified (CSS 720px at 1440 physical, CSS 320px at 640 physical, DPR 2). Root cause of the earlier clipping: Playwright `page.screenshot()` computes its clip in CSS pixels and ignores browser zoom, so it captured the top-left quarter. The new harness uses CDP `Page.captureScreenshot` without a clip, asserts every image is innerWidth×DPR by innerHeight×DPR (±1 device px rounding), and scrolls in overlapping steps (20% overlap, measured below any sticky header) until the end is reached. 22 unresized, uncropped viewport captures of Home, Matchday and the player dialog at both widths; 44/44 PASS: no horizontal overflow, scrolling reaches the end of each page and dialog, no clipped or offscreen text/controls (visually hidden accessible titles excluded), and dialog keyboard focus ring visible. All captures were inspected; no clipped text, controls, score content or focus indicators were seen. Observation, not a clip: at CSS 320px the sticky player header uses about 58% of the dialog height, leaving about 178 CSS px for scrolling content.

### Not done / still blocking promotion

- **Real screen-reader speech: NOT TESTED.** The sandbox has no NVDA/JAWS/VoiceOver. Chromium still exposes one polite/atomic status, but the region instance changes on every update (7 instances for 7 messages). No live-score code was changed, because no speech defect has been reproduced. This must be run by a person on Windows (NVDA + Chrome) or macOS (VoiceOver + Safari) using the protocol in the handoff.
- **Visual sign-off** of the zoom captures above is by this reviewer only; there is no independent whole-game approval.
- Untested: short landscape screens (`max-height:520px`) keep an existing `!important` nav padding owner, so the bottom 5px of the nav focus ring may still be clipped there; Firefox and Safari focus scrolling with `scroll-padding`; widths other than 320/360/390 for the new focus assertions.

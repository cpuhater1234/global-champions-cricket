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

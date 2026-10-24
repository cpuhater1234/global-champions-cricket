# Accessibility completion evidence — 24 October 2026

Exact delivered candidate SHA256: `3dd348dd956017563dc006d64a2364a15a0b2d7a3d97bb9d92e3fae3399fcbdf`.

## Actually executed

`targeted.cjs` ran against the unchanged delivered candidate in actual headless Chromium. `results.json` records 19 observations: 17 passed, one deliberately extreme reflow combination failed, one observation is informational. `chromium-accessibility-tree.json` is a real CDP accessibility tree, not a screen-reader transcript. `chromium-playback.png` records the tested playback surface. No production files changed.

Passed: first keyboard focus has visible outline; named native dialog; 25 Tab cycles contained within modal/native focus boundary; Escape restores analysis opener; scout order controls have descriptive accessible names; playback preserves control focus while advancing; live commentary uses status role; reduced-motion playback has no running browser animations; startup under throwing Storage methods remains playable without uncaught errors. These assertions cover the specified surfaces only.

All nine XI viewport/text combinations were inspected. Eight pass, including 320px viewport at default and 200% root text, and 1280px/640px at 400% root text. No visible tested XI button/summary/select fell below 24 CSS px in either dimension. This is a geometry check, not a physical touch accuracy study.

## Findings and limitations

- Combined 320px viewport **and** 64px root font (400% text scaling) produces page overflow. It is more severe than ordinary 400% desktop browser zoom from 1280px, whose effective 320px viewport at default CSS root text passed. The overflowing XI metrics and navigation descendants are recorded in `results.json`; do not mislabel this as a failure of the ordinary 400% zoom check. It is an additional resilience finding, not a claim of WCAG failure. Root text scaling approximates text enlargement; it is not native browser zoom.
- Live commentary exposes the current over/ball and event text via `role=status`; the sampled announcement text does **not** include the cumulative score (`1.4 · LIVE BALL Andrew Strauss. Keeps the scoreboard moving.`). The visible score is separately exposed in the accessibility tree. An experienced screen-reader user must assess whether match state is sufficiently understandable and whether fast playback floods their speech queue. Consider optional cumulative score in a paced live summary only after this observation; the automation cannot establish actual spoken output or timing.
- The arrow helper already supplies `Move batter up/down` labels. No product patch is proposed for these controls.
- Firefox and WebKit launch attempts failed because their configured executables are absent in the current environment. The prior finish-pass evidence remains historical; this run does not claim fresh Firefox/WebKit execution.
- The restored Chromium binary was truncated (151,949,824 bytes; ELF missing section headers) and crashed before launch. Decompressing the bundled `chromium.br` to `/tmp/accessibility-chromium` recovered a valid engine. This is an environment repair, not a game defect.
- Available tool discovery found no physical device farm, hardware input, or screen-reader service. Native computer APIs are disabled. No physical phones/tablets, OS screen-reader interaction, novice participants or returning-player participants were observed. These gates remain OPEN; `participant-session-kit.md` is ready to run them without fabricated observations.
- This pass did not install axe, claim a complete WCAG audit, or repeat historical broad engine/viewport tests. Storage denial check covers startup only; historical save/interruption tests are not newly represented as physical background/lock-screen evidence.

## Reproduce

From the repository root, with the primary runtime Node modules available:

```sh
export NODE_PATH="$CODEX_PRIMARY_RUNTIME_NODE_MODULES"
export LD_LIBRARY_PATH=/workspace/scratch/bed56f4334a5/browser-runtime
node qa/accessibility-20261024/targeted.cjs
```

The harness currently uses `/tmp/accessibility-chromium`; restore it from the bundled Brotli asset if the transient runtime is reset. Browser installation is intentionally not hidden by reporting unavailable engines as passing. Results are descriptive; the JSON explicitly retains failed observations.

## Follow-up: runnable session recorder and score patch

`participant-runner.html` is a self-contained companion recorder with an observer window and separate participant window. Consent gates launch. It captures anonymous relative timings, action acceptance, view/modal transitions, observer-assessed outcomes and optional participant confidence, and downloads JSON locally. Sandboxed opaque-origin game storage is replaced by a private memory map, preserving all existing browser saves. Its CSP blocks networking. It is for disposable sessions, not persistent save validation. `runner-test.cjs` and `runner-test-results.json` verify the recorder in actual Chromium; the test export is marked automation/emulation and must not be represented as a human participant session.

`proposed-live-score.patch` is a narrow proposed production change, not applied to production. The existing live status region announces commentary but omits the visible cumulative runs, wickets and overs; this is a concrete gap in equivalent automatic match feedback. The patch adds a visually hidden score/overs/chase summary inside the existing status region and explicitly sets atomic delivery. It keeps the visual interface, playback cadence, focus and game state unchanged. `live-score-test.cjs` reproduces the missing summary on the unchanged candidate, then verifies the proposed patch for ordinary balls, wickets, innings completion and a chase. `live-score-results.json` records the actual Chromium result. The standalone `live-score-candidate.html` exists only to exercise the proposal. This fixes the semantic omission; it does not establish screen-reader speech timing or human comprehension at high playback speed, which still require real assistive-technology sessions.

### Exposure-mode limit

The recorder is deliberately network-blocked and therefore uses offline fallback images/fonts. It tests offline robustness and comprehension, **not the complete normal visual experience**. Its UI and exports now explicitly identify `offline-fallback-artwork-network-blocked`. The participant kit includes a separate direct-normal-build manual-observer path for confirming representative loaded artwork without wrapper/CSP distortion. Do not merge these exposure modes in evidence claims.

### Exact live-score patch anchor

Production file: `game/gcc_v8_product_candidate.html`, final ball-by-ball presentation script, function `X.ballReveal` (starts near line 8523 in original SHA256 `3dd348dd956017563dc006d64a2364a15a0b2d7a3d97bb9d92e3fae3399fcbdf`). In its return template, replace the unique substring `<div class="g8ballmoment" role="status"><span class="g8eyebrow">` using `proposed-live-score.patch`. The patch adds `aria-atomic="true"` to that existing status container and inserts a clipped, visually hidden `g8liveread` span immediately before its eyebrow. It uses only already-calculated local values: `batClub.name`, `total`, `wickets`, `overText`, `target`, `required` and `remaining`. No simulation, save, timer, or calibration module changes are involved. Apply the semantic change to the authoritative source module if this HTML is generated; find that module by this unique anchor rather than assuming a source filename. This agent inspected/changed only the QA candidate copy and proposed patch, not the authoritative source.

Authoritative source located: `v8/ui/match_story.js`, `X.ballReveal` at line 50, return template at line 63. `v8/build.py` includes `match_story` in its UI concatenation list near line 202. `proposed-live-score-source.patch` applies the same verified semantic change directly to that source module; no production module was modified.

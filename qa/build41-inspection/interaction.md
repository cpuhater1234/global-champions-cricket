# Build41 interaction and accessibility inspection

Scope: read-only inspection of `deliver/GCC_v8_Playtest_41.html`, `v8/ui/controller.js`, `v8/ui/decision-ui.js`, and Build40 review. No browser session used by this reviewer. No production changes. Offline host is a render stub; it cannot establish native focus, keyboard traversal, live-region announcements, layout, or screen-reader behavior.

## Findings

### Medium — inherited unbounded delivery status updates

Evidence: compiled HTML line 11251 renders the changing current delivery as `role="status" aria-atomic="true"`, including score, equation and delivery commentary. Its data-key changes each beat. Line 11223 schedules ordinary deliveries at 700/350/175/88ms depending on playback speed; controller.js:94 renders after each beat. Thus an atomic live status is replaced about eleven times a second at 8×. This is the same unresolved source issue documented in the Build33 interaction review, not a newly introduced Build41 regression. Actual announcement queuing or dropped announcements remains unverified.

Reproduction: play a match, begin playback and cycle Speed to 8× with a screen reader enabled; compare commentary announcements with the current displayed delivery and try to reach Pause. The source confirms the update rate; this reviewer has not claimed a browser/screen-reader reproduction.

Fix: retain visible delivery updates, but use a persistent dedicated polite status for over summaries and decisive events while running. Announce a single current delivery when paused or explicitly stepped. Keep current score available as ordinary accessible text. Check 1×/8×, Pause/Resume, Skip to result and reduced motion with native assistive technology. No production fix or speculative offline reproducer added.

### Medium — successful keyboard draft pick loses focus (native confirmed)

Root browser reviewer confirmed: pressing Enter on Pick Mahela Jayawardene committed the sixth squad pick, reset scrollY to 0, and left `document.activeElement` as BODY. This makes subsequent keyboard navigation restart outside the draft decision. This reviewer did not control that browser; native evidence is attributed to root.

controller.js:202 closes a dossier, commits the pick and requests top scroll. render(false) restores focus only if it can find the same element ID or action/args; the picked card has disappeared. finally at line 300 scrolls without nominating a focus target. Pool and dossier selections share this handler, so both require coverage.

Minimal safe patch recommendation: give decision-ui.js:38 turn `<h2>` a stable `id="gccuiDraftTurnTitle" tabindex="-1"`. After a successful engine pick in controller.js:202, set `pendingFocus='#gccuiDraftTurnTitle'` if the draft remains incomplete. Keep pendingScrollTop for existing scroll behavior. Because completeDraft() may switch to team in the same dispatch, only apply the turn target if the current view is still draft/annual draft and a turn exists; preserve team stage focus on the final selection. CPU refresh uses render(false)'s ID lookup, so stable heading identity restores it after subsequent club choices. Rejected picks must leave both flags unset. The existing finally branch centers pendingFocus, so to retain the intended exact top-of-page result either prioritize the already-requested top scroll after focusing this heading or add a narrow draft-turn case using focus({preventScroll:true}) plus scrollTo(0,0). Avoid changing reveal-control focus scroll behavior globally.

Focused failing contract: `draft-focus.mjs` checks pool and dossier success paths expose this stable focusable heading and explicitly focus it, plus a subsequent render preserves its focus. This is an offline focus-intent stub, not native keyboard certification. It is expected red before production changes. After patching, run it with draft-position, finish-draft/annual contracts, and native keyboard Pick from both locations; check subsequent CPU picks, final pick into XI, rejected pick, modal Close and search/filter preservation.

## Positive evidence

Native dialog is labelled by `g8dialogTitle` (HTML4297), modal close has a specific accessible name, cancel is prevented and routed through the same close command (controller.js:318). Modal open pauses the presentation clock and close restores the stored opener. Replacement player/squad reports preserve squad-return route and scroll. This is source/contract evidence, not a native focus-trap certification.

Stage changes focus the `tabindex=-1` main. Utility-menu Escape restores its summary. Rejected commands announce errors through `g8feedback` or dialog-local status and do not throw from dispatch. Invalid/stale draft picks are guarded before commitment. Draft empty results supply a concrete recovery instruction. XI confirmation exposes its selection blocker; pending swaps disable conflicting tools and dispatch guards reject them. Save failures show a persistent explanation and install an exit warning. No additional concrete command/navigation defect was established in the inspected routes.

## Build41 checks and limits

- `GCC_FILE=deliver/GCC_v8_Playtest_41.html node qa/visual-team-20261102/accessibility-contracts.mjs`: 8/8 pass (`accessibility.json`). Checks pressed states, batting-order accessible names and no host errors.
- `GCC_FILE=deliver/GCC_v8_Playtest_41.html node qa/build40-review/draft-position.mjs`: pass (`draft-position.log`). Successful pick resets 1600→0; rejected pick preserves 1600; filters retained.
- `node qa/build41-inspection/draft-contracts.mjs`: pass (`draft41-contracts.log`). Target-only copy of existing `qa/draft-room-20261102/contracts.mjs`, because original hardcodes old candidate and ignores GCC_FILE. Covers empty/full squad overlay, selected-player return, scroll/filter preservation, phase guard and draft-state immutability.
- `GCC_FILE=deliver/GCC_v8_Playtest_41.html node qa/whole-game-20261102/swap-guards.mjs`: 7/7 pass (`swap-guards.json`). Disabled markup plus guarded dispatch preserve selection.
- `node qa/whole-game-20261102/result-navigation.mjs deliver/GCC_v8_Playtest_41.html`: pass (`result41-navigation.json`); this script requires argv, not GCC_FILE. Earlier `result-navigation.json` and `draft-contracts.log` are old candidate runs and are explicitly excluded as Build41 evidence.

These checks do not certify keyboard order, visible focus, target size, native dialog return focus, screen-reader announcements, browser error recovery, full career completion, or final/spectator routes. No generic redesign recommendations are implied.

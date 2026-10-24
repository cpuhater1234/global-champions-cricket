# GCC participant validation kit

Status: ready to run; no participants recruited or observed. Automated agents are not human participants. Record only observed outcomes. Obtain consent for session recording and avoid capturing unrelated browser tabs or personal details.

## Setup

Test the delivered build; record URL, SHA256, date, OS/version, browser/version, physical device/model, input method, viewport, zoom/text size, reduced motion, assistive technology/version and participant experience. Use a fresh profile for novices. Returning players use a copy of their own save or the provided foundation fixture. Never overwrite the participant's only save. Ask for permission before importing test data.

Run at least one novice without cricket-management experience, one returning player, one regular keyboard-only player, and experienced screen-reader users with their usual setup. Physical matrix: iPhone/Safari/VoiceOver, Android/Chrome/TalkBack, Windows/Chrome or Firefox/NVDA, macOS/Safari/VoiceOver. Test desktop browser zoom at 200% and 400%; mobile OS large text and browser text scaling separately. Emulation does not close these checks.

## Moderator script

“This is a test of the game. Please say what you expect and what you are trying. You can stop at any time. I will initially avoid explaining how it works.” Give tasks individually without naming interface controls. Record assistance separately from independent success. Stop a task when the participant requests help or after five minutes; ask what they expected before providing help.

| Cohort | Task prompt | Observe |
|---|---|---|
| Novice | Start a career and choose a club you would enjoy managing. | Knows consequences, finds help, chooses and confirms club independently. |
| Novice | Build your squad. Find out why you might pick one player over another. | Draft progression, scouting comprehension, timing pressure, accidental picks. |
| All | Choose eleven players and change the batting order. | Discoverability, keyboard/touch completion, descriptive order controls, selection feedback. |
| All | Watch part of a match. Pause it, change its speed, and find the final result. | Announcements, score comprehension, focus stability, user control of updates. |
| Returning | Leave mid-match, close the tab, and return to the same career. | Position retained, paused/running expectation, save confidence. |
| Returning | Review the last match and decide what to change for the next one. | Outcome comprehension and independent navigation. |
| Keyboard/AT | Open a player guide, explore it, and return to your previous task. | Dialog title announcement, traversal, Escape, opener focus, underlying content unavailable. |
| Physical mobile | Use the game in portrait and landscape with large text. | Touch accuracy, obstructed controls, nested scrolling, keyboard overlap. |
| All | Explain what you would do next and whether progress is saved. | Next action and save-state understanding, trust and recovery. |

For experienced screen-reader participants: ask them to report verbatim what is spoken for score changes, wickets, innings changes, navigation changes, dialogs, unavailable actions and save failures. Do not infer a spoken announcement merely from ARIA markup. Test announcements at each playback speed and after pause/resume. Let the user choose their normal navigation mode.

## Recovery checks

With a disposable career, deny storage/site data, reload after a failed save, background during playback, lock/unlock phone, switch orientation, and resume after an incoming call/interruption if participant agrees. Record elapsed time, state before/after, visible warnings and recovery actions. Storage denial must not silently imply durable progress.

## Outcome sheet (copy once per participant)

Participant pseudonym: ____  Cohort: ____ Consent: ____
Environment/build fields above: ____

| Task | Independent / assisted / failed / stopped | Time | Errors and assistance | Verbatim observation | Issue ID |
|---|---|---|---|---|---|
| | | | | | |

After tasks: “What was hardest?”, “What did you think would happen?”, “Was anything missing or surprising?”, “Would you know how to continue tomorrow?” Record confidence and severity without substituting moderator opinion for user observation.

## Release decision

Remain open until the physical-device and screen-reader sessions actually run. Block release for inaccessible core tasks, focus traps without escape, lost save data without warning, or controls unusable at supported zoom/text sizes. Assign an owner and reproduce each issue; rerun the affected task with the affected setup after a fix. A passing automated run is supporting evidence only, not WCAG conformance or human usability certification.

## Run the local recorder

Open `participant-runner.html` in a desktop browser. Select the exact delivered game HTML, and optionally a **copy** of a save JSON. Confirm participant consent and choose the observed cohort/setup; launch the separate participant window. The observer retains this page and its task controls; the participant window has only the game, plus the confidence dialog after a task ends. Read prompts from this kit, start each timer, observe the result, then choose the actual outcome and end the task. Confidence is optional. Stop recording and export JSON locally. The recorder never infers success from actions or navigation.

The embedded game uses a sandboxed opaque origin and a private in-memory Storage shim. It cannot read or overwrite normal browser saves. Progress is temporary and is discarded when the window closes; therefore this harness cannot validate real persistent save/reopen behavior. Run the separate physical recovery sessions against a disposable normal-game profile for that gate. An imported save is kept only in the participant window's temporary storage, never included in telemetry. Exports include a random session ID, game SHA256, enumerated setup/cohort, relative times, action names/acceptance, view/modal transitions, observer outcomes and confidence. No raw game state, player records, command arguments, entered text, file names, real names or save contents are exported. No network access is allowed by the runner/game CSP. Do not put personal details into export filenames or share exports without participant consent.

`runner-test-results.json` is explicitly an **automated emulated test**, not a participant session. It verifies recorder mechanics only. Real participant observations are still required to close the novice, returning-player, physical-device and screen-reader gates. If a popup is blocked, allow it locally and retry. “Resume” in this recorder means within the still-open isolated session; closing the participant window discards its test progress.

## Representative visual experience: separate manual-observer path

The recorder's CSP blocks external images and fonts. Its embedded game displays offline fallback artwork, so those sessions establish **offline robustness/comprehension evidence only**, even with a real participant and physical device. Exports explicitly record `exposureMode: offline-fallback-artwork-network-blocked`. Do not label them normal artwork or complete visual-experience validation.

For representative artwork, open the exact normal delivered build directly in its usual browser and hosting context, with its normal permitted image loading. Use a disposable browser profile and a copied save; do not overwrite a real career. Do not embed it in the recorder. Confirm the expected venue artwork actually loaded before starting and record failed/missing images. The observer should use the paper/table outcome sheet in this kit, a separate stopwatch, and the usual task prompts; record outcomes manually. Record exposure as `normal-build-direct / representative-artwork-confirmed` only when artwork was visibly confirmed, otherwise `normal-build-direct / artwork-degraded`. This manual path has no recorder dispatch instrumentation or automatic timing. Obtain consent independently for any screen recording and exclude personal data.

Record the exact build hash/URL, artwork exposure mode, network state, browser/device, input/assistive technology and zoom/text settings with every session. Keep direct-normal-build observations separate from offline-wrapper observations; neither substitutes for experienced screen-reader or physical-device evidence unless that setup and participant were actually observed.

# Player experience correction, 20 October 2026

Continues remote `work/v8-game-first-rebuild` at `22c671a9f309b39db6d51f60dde62c5e995efb86`.

## Failures and corrections

The opening title fragmented at 59 of 201 sampled widths. The font grew with viewport width while its column reached a maximum width; a higher-specificity legacy rule permitted breaking words anywhere. The title now uses its own column as the sizing container and keeps each title word intact. It does not hide overflow as a workaround.

- Replace oversized italic workflow headings with smaller functional titles. Keep the italic arcade treatment for the game title and selected sporting emphasis.
- Put secondary archive/help functions in a keyboard-accessible Menu. Keep season destinations on a compact navigation strip; all five fit at the checked 390px layout. Extremely narrow layouts retain horizontal navigation scrolling.
- Give bench players direct Select/Swap actions with player-specific accessible names. Selected-player rows visibly advertise editing. Keep batting order/removal in player detail and preserve pending-swap protections. Remove the duplicate return-to-matchday button where the persistent Matchday navigation already provides it.
- Show age, cricket job and a strongest relevant phase on draft candidates, with distinct role accents and a visible Scout cue. All-rounders consider both batting and eligible bowling. Phase labels identify the discipline rather than an ambiguous “Middle overs.” Keep advanced scouting and comparison available on demand.
- Show conditions on matchday and start the match directly through Watch match. Keep Match preview as an optional route. Both routes use the same XI checks and play exactly one round. The previous prepare/play command contract remains supported.
- Give Resume/Pause the primary playback emphasis; make Skip secondary.
- Lead the annual update with actual vacancies and visible retirement names. Clarify that continuing leads to the draft draw. Preserve optional management, incoming-class scouting, release consequences and trade review.
- Correct long club-name fitting and match-button word fragmentation at 320px. Give failed venue images a restrained named fallback while preserving random real home venues and actual stadium photographs.

## Verification and practical limits

Exact artifact and report hashes are recorded in `qa/GCC_V8_PLAYER_EXPERIENCE_EVIDENCE.json`.

- 603 title checks: 201 widths from 320 to 1920px, in 8px steps, across Arial/sans, Georgia/serif and Courier/monospace families. No fragmented title words, title overflow or document overflow.
- 119 core screen/dialog checks, 147 opening-flow checks, 182 later-career checks, all across seven widths including 320, 820 and 1480px.
- 144 additional stress states across twelve viewport/text-size conditions. Expanded player, preview, offseason, management and trade sections; short windows; effective zoom-layout width; 125% root text sizing. Native browser zoom itself is not automated.
- Native keyboard dialog focus/escape, eleven individual selections, a replacement, direct match playback and reload recovery checked in the browser.
- Fresh mobile career uses 150 native interface actions without fixture injection or direct state mutation: foundation draft, eleven manual selections, 14 real league matches, postseason, annual management, annual draft, a second manually selected XI and the opening 2009 match. The script reads model data to guide balanced decisions, so it is not unfamiliar-player research.
- Targeted contrast probes cover eight surfaces, including expanded scouting and release review. Remote photos are deliberately failed during geometry tests for deterministic results. This does not certify every live photograph or a complete accessibility audit.
- Focused runtime suites cover decisions, team workspace, paced drafting, trade accept/refuse/cancel, confirmed release, playback, clocks, guards and save recovery. Two obsolete layout/copy assertions were updated while retaining their underlying transaction checks.
- Independent read-only review found the bowling all-rounder summary defect. A failing regression reproduced it, the fix passed, and re-review confirmed Ashwin displays Middle bowling 79. No remaining important issue was identified within that source review's scope.
- Frozen-engine rebuild is byte-identical to the delivered HTML. No cricket engine, player-data, career-rule or save-format changes.

This pass establishes specific fixes and broader interface coverage. It does not establish that the game is perfected, that an unfamiliar person can complete it without coaching, or that all nineteen seasons remain enjoyable. Those require observed playtesting. Full-career checkpoint screens are rendered from existing real saves; they are not represented as a new nineteen-season manual playthrough.

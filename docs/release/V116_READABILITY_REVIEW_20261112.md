# v116 reading-colour review | 12 November 2026

## Candidate identity and change

- Base: pinned flat-menu candidate `943643a36730f9db6630437b15111b5f82041b540998f793230aab1745be21e3`.
- Candidate: `bdfa54f5784b42eb1a0ac06065b2d2333c55548dd07789ccd41560b6848e82e0`, 6,641,172 bytes.
- Builder: `qa/v116_readability_candidate.py`.
- Exactly three reading colours change within the existing `gcc-v116-perfection-pass` style owner: captaincy phase labels, career-outlook heading and GCC-record heading.
- Each uses `--gcc-text` with a readable fallback instead of raw `--gcc-accent`. Club-colour borders and other identity treatments are retained.
- No selectors, stylesheets or scripts are added to the built HTML. All 22 scripts remain byte-for-byte unchanged.
- The accepted signing/finals corrections and flat-menu owner are inherited from the pinned base.

## Confirmed defect

The user's open Lucknow preview resolved all three phase-label spans to `rgb(23,70,139)`. This matches the inspection report. The rule owning those spans uses the club identity colour for reading text. The two dossier heading rules have the same dependency.

## Verification

Local guarded rebuild, all 22 JavaScript syntax checks, Python syntax checks and workflow shell/YAML checks pass. The frozen release still hashes to `b27cf0b4c7e6e4e7a78eaa5c80154dfd0f70657ce9f774dd405505e97e82c6d0`.

Native cascade regression: https://github.com/cpuhater1234/global-champions-cricket/actions/runs/43142418439

The regression extracts all 17 real stylesheets and uses scoped DOM fixtures with the actual prepare/player modal contexts. It first requires the baseline to fail on all five Lucknow text targets at 320/390/1440px, then requires the candidate to pass a 4.5:1 threshold across every extracted club colour. Contrast is calculated against representative opaque gradient/theme surfaces, not pixel-sampled translucent backgrounds.

The native build and regression steps passed. The baseline reproduced the defect; the candidate passed all 540 samples across 36 colours with minimum approximate contrast 12.515:1. The job's final conclusion was failure solely because artifact upload hit GitHub's storage quota. The complete result summaries and upload error were verified in job 130932295244's logs. A follow-up workflow change retains JSON reports in the log, makes only the download upload optional, and limits its retention to one day. Every mandatory test is unchanged. Fixture coverage is not full visual, gameplay or persistence acceptance. A local native-browser launch was unavailable because the workspace disallows the socket used by Chromium; no sandbox override was requested.

## Baseline acceptance infrastructure

The official Ubuntu archive substitution cleared dependency installation in run https://github.com/cpuhater1234/global-champions-cricket/actions/runs/43141508809. That run also passed candidate identity and all five signing widths and was executing the 19-season test at the latest check. The remaining acceptance steps must finish before full acceptance is claimed.

## Limits and protected state

This remains a review adapter, not maintained-source build parity. The frozen release, main branch and user's live career are unchanged. No fixture was played. Captaincy discoverability, phase timing, broader source ownership and full visual refinement remain separate work.

## Baseline acceptance completion

Run 43141508809 subsequently completed successfully, including all responsive, two-tab recovery, menu-layout and final saved-career rendering verifiers. The user's downloaded consolidated-menu build restored Lucknow 2010 Round 3, 1-1, NRR 0.53, XI rating 79 in the connected browser. No match was played.

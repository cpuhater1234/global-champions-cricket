# GCC v86 release reconciliation — 28 October 2026

Playable SHA256 `8b0519d4fef0e10a0a05356387788e346c9a36487ca500eb755055aae36a147a`, 8,072,165 bytes. Both game aliases and the supplied download are identical.

The branch after external work had v84 standalone HTML, a source-only v85 ground-condition fix, and three later source-only design edits. The final external edit left workspace.css at 3,045 bytes, replacing the tested 223 KB foundation. Reconciliation retains the v84 foundation, appends the v85 condition strip, preserves the external floating-art removal intent, then applies the latest external club-surface stylesheet verbatim. Earlier broad style replacements are not replayed: they would remove unrelated tested fixes. Source-only changes are now embedded in the playable.

All 20 inline scripts remain byte-identical to v84. No simulation, roster, ratings, ground values, controller, save codec or persistence change. Main/protected baseline is untouched.

## Reproduce current release

Run `python qa/release-sync-20261028/build.py --promote`, then `python qa/release-sync-20261028/check_sync.py`. A checkout uses pinned commit `2bf294306fdac36ec6888f1ff154f27c734e19cd` as its v84 base; baseline.html is an optional local cache. The saved v84 stylesheet, v85 patch and two small override inputs define the exact presentation output. Historical builders intentionally reproduce historical builds; they are not current promotion commands.

## Fresh validation on the exact v86 bytes

- Source parity, 20 syntax-valid and unchanged inline scripts; 193 unique non-script static IDs. The prior split state fails the parity check (parity-RED.log); the consolidated build passes (parity-GREEN.json).
- Native Chromium: 84 captures across 21 primary screen states at 320,390,768,1440px; zero page errors or detected local/document overflow.
- 324 club-guide cases: all 36 clubs at 3 widths and 3 font sizes. No detected heading/badge overflow; all 36 embedded photographs decoded with credit.
- 60 additional ground-condition cases for Punjab and Glamorgan across five widths and three font sizes: three readings present, no label/value collision or container overflow.
- Targeted enlarged-title, player-record label and short-landscape sticky-header regressions pass. Draft outside-card hit and local board overflow checks pass. Home/nav checks pass, including no home restore-file button and all five mobile tabs.
- Real saved super-over sampled name/score contrast minimum 9.82:1; all ten narrow phase labels remain single-line. Final2026 copy retains the corrected retrospective wording.
- Visually inspected desktop home, phone club selection/guide, narrow XI and enlarged-club screenshots.

This is a fresh Chromium presentation/regression pass, not a new WebKit, physical-device, power-loss or full-career certification. v84 WebKit evidence retains its original scope. Captures include presentation fixtures and expanded states, not 84 independent gameplay runs.

# GCC v88 — restore the colourful Breakaway Eight cards

Restore the earlier full-width club-colour headers, badges, card bodies and spacing on leagueDraw. The user explicitly preferred that earlier design; the compact redesign experiment was discarded and was never published or saved as the download.

The later external club-surface override now excludes leagueDraw. A zero-specificity :where ancestor preserves its original specificity and effect on other pages. All20 inline scripts, including reveal timing, league selection, simulation and automatic saving, remain byte-identical to v87. The Career backup entry and photo-caption glyph removals remain in place.

SHA256 `e3b3c9295fcc01d6a6f561b136c4144d64f9c291cd4982a11f9fbcad9803f853`, 8,074,024 bytes. Both game aliases and the download match. Reproduce with `python qa/breakaway-restore-20261028/build.py --promote`; pinned v87 base `7df3aeef9f6d085e023104c646b710ae00393259`.

Fresh native Chromium checks:

- RED demonstrates the current padded/nested card style differs from the earlier version.
- GREEN225 comparison cases: five viewports320/390/768/1024/1440, three root font sizes16/24/32, five club groups covering all36 clubs, and sealed/partly revealed/fully revealed states. Computed card styles and dimensions match v84 exactly; no document horizontal overflow. Choose your club still works.
- Twelve comparisons of club selection, team and season screens across four widths retain exactly the current v87 computed styles.
- Four menu/caption viewport cases, all36 caption checks and a saved-career reload pass; zero page errors. Backup menu entry and caption icon remain absent.
- All20 scripts are syntax-valid and exact to v87. Embedded workspace CSS and both aliases match source/output. Desktop and phone screenshots inspected.

The original oversized card design is intentionally restored, not represented as a new compact design. This is a targeted Chromium presentation rollback, not a new complete-game, WebKit or physical-device certification. The earlier v84 comparison file is an optional local cache; check.cjs reconstructs it from pinned git history when missing.

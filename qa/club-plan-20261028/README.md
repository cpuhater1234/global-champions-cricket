# GCC v98 — readable, compact cricket UI

Pinned base: game v97 on commit6f53f4196e55b70d8aabb9eb4ec94426d03323c4, SHA256caa5f46cdd1ddb438a4864a59a43ec964eaf0564dc55034afa1e2c1042cc9b46.

- Build Your Side uses three open, numbered scouting notes with dividers; desktop rows share the panel height, mobile fits content. Existing headings and all advice are preserved.
- Recruitment and other page subtitles now use readable light ink. Dark input/select fields explicitly own both ink and background. The scan reproduces dark subtitles and white-on-pale trade selectors in v97.
- Signed decisions, committed counts, completed trades and wins use solid green cues. Declines/losses remain red; neutral content and disciplines retain solid navy/cobalt/purple. Ground scale bands are opaque and retain their neutral midpoint.
- Draft-order cards regain a480ms reveal wipe. Fixed rectangle geometry remains; repeated unrelated renders do not replay it, and reduced motion skips it. Original club invitation animation remains.
- Snake draft has a distinct small label, separate reversal explanation and a ruled paragraph below; it stacks on mobile.
- Compact player cards preserve all fields, align discipline text exactly with player names, retain44px Pick controls, prevent rating-digit wrapping and use one subtle cricket figure per discipline header.
- Compact draft bars show genuine squad options: openers, top order, middle order, finishers, keepers, all-rounders, regular pace and spin. Keepers/all-rounders can cover multiple jobs. Bowling part-timers are excluded. No targets, quotas or selection restrictions.

## Evidence

See `summary.json` for the final run counts and hash. Native Chromium tests cover:

-240 club-guide layouts across20 sampled/expansion clubs,4 widths and3 text sizes; no boxes, overlap, unused desktop bottom gap or horizontal overflow.
-108 main-screen/menu/guide/dialog viewport cases;15,888 computed text-contrast samples, zero failures, no local/document overflow or page errors. Normal text threshold4.5:1; large text3:1. This is computed CSS evidence, not full pixel or physical-device certification.
-216 paused/automatic reveal states and36 own/CPU turn states preserve geometry.
-144 compact player-card samples across4 widths and3 font sizes; zero role-label alignment offset, no rating wrapping, all card fields retained; a real pointer click picks a player.
-2 complete foundation drafts,240 total picks,30 user picks,58 skip/pick scroll checks, legal unique15-player squads.
-Actual model fixtures verify Gilchrist as keeper/opener, Afridi as spin/all-rounder, Sehwag's part-time bowling excluded, and distinct top-order/finisher options. Empty roles remain absent and rendering is read-only.

All20 scripts pass Node syntax checks. Only presentation scripts13 and19 change; other18, including simulation, persistence and player data, are byte-identical to v97.

Independent review found a grouped-selector replacement defect; the helper now preserves whole grouped selectors, the heading group is checked explicitly, and the final suite passes. Visual inspection also caught narrow rating digits; RED evidence and a passing regression are included.

## Rebuild

Run `python qa/club-plan-20261028/build.py`. The builder uses the exact local `baseline.html` when present, or retrieves it with git show from the pinned commit; it refuses a different hash. It writes the QA candidate and canonical presentation sources. Promote the same validated bytes to both game aliases and the saved playable. Historical builders must not promote a newer release.

## Merged accessibility PR reconciliation

PR#1 merged while this release was in progress. Its4 QA evidence files are retained. The merged match_story.js had a syntax error at line5 and duplicated older presentation code. The current playable already contained the intended atomic cumulative-score announcement. Restore that module from the validated standalone, keep runtime bytes unchanged, and align source with the playable. `live-score.cjs` checks every rendered delivery/notice frame against the visible scoreboard and innings/chase context without render mutations. See `pr-reconciliation.json` and `live-score.json`; no claim about human screen-reader queue/timing.

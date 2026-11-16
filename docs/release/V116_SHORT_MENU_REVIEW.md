# Short-landscape HUD and menu review, 16 November 2026

Opened reference: GCC_v116_Readability_Review.html, SHA-256 `06e92365056a411309609434654d841e9cabd920b655549d4d4bd79c632c8e00`, 6,682,610 bytes. Candidate `9d9f5313fd53ae1794329d846e9cafdefd23929d47c2a069e571df9c344b9dd3`, 6,682,797 bytes. Working branch only: work/v116-candidate-acceptance. Main/frozen v116/perf untouched; no stable promotion.

## Reproduction before editing

Read-only native run43777691881 tested568×320,640×360,844×390,1024×520,1440×520 and320×568. The original menu already contains Your club/Game guide sections, 44px targets and its own scrollport. Every guide opens/closes and restores Menu focus; complete compared career state is unchanged. No invented need for another menu grouping or lower-contrast labels.

Actual failures: all five career-nav focus rings clip in short viewports; menu focus clips while tabbing at568×320 and640×360. Wider short HUDs are159.39px tall because the club badge gets an auto-placed third grid row, versus109.39px at narrower landscape sizes. Screenshots also show page controls painting above menu content below500px height. Existing CSS31 changes HUD to position:static in this range, making z-index60 ineffective while a backdrop-filter establishes a stacking context.

Baseline artifact14187565148 ZIP SHA-256 `0088edceb64fb59913ba079ca5d24c0535693e7744e4a6c85dde290eea4a3e7f` verified before extraction. Native568×320,844×390 and1024×520 menu captures inspected.

## Isolated correction

CSS31: replace the existing short-height position:static declaration with position:relative. The header still scrolls normally; z-index now controls its stacking context.

CSS32: within its existing max-height520px responsive owner, hide the redundant mini club badge (full club name/year and GCC logo remain), and inset career-nav/menu-button focus outlines by3px. Keep existing3px focus width,44px targets, typography, grouping, hit targets and actions. No additional stylesheet, broad button override or new repeated-ID strength.

Exact source guard PASS: only CSS31/32 differ from the opened file, all22scripts and every other byte identical. Critical engine/controller/data pins and negative self-tests PASS. No changes to ability components, gameplay, saves or menu command logic.

## Exact paired gate

Run43778223475 compares the opened reference and candidate across the six sizes. Baseline failure tolerance is limited to the reproduced nav/menu focus and menu stacking findings; incomplete runs/unexpected errors still fail. Candidate checks every nav focus ring, menu control target/visibility/topmost centre hit, section/command labels and enabled states, all three real guide journeys, close target, Escape/focus return, and full compared career preservation. HUD must fit two rows below520px and recover at least49px at1024/1440 widths. Final exact run PASS12 paired states, zero candidate failures. Baseline records31 focus/stacking findings once topmost-centre checks are included. At1024/1440×520 the HUD shrinks159.39→109.39px (50px recovered); narrower landscape remains109.39px and portrait320×568 is unchanged. All nav/button outlines fit, every menu focus centre hits its own button, all three guide journeys preserve Menu focus return and complete compared career. Final1024×520 and568×320 native captures inspected: menu no longer paints beneath page controls; focused bottom menu command is fully visible. Artifact14187252259 ZIP SHA-256 `6170c272cfe8c4bd801ffd31e10f314964cda3fd8fe5637b9e58877f69209c8c` verified before extraction.

Native Chromium only, genuine active2010 career; no full-browser or audible-screen-reader certification. Keep the currently open Readability build. This fix can be staged for the next bundle rather than requiring a new download immediately.

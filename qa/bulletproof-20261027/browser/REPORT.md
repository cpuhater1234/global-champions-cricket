# Native browser stress audit

Baseline product SHA256: `696bdfea1a5d177d144a652316c0d39e1d34a1522df990ef32852e45e84d9097`.

`stress.cjs` / `report.json`: 384 geometry cases, 32 visible states × widths320/390/768/1280 × root fonts16/24/32px; six supplementary checks. Fresh actual controls from home through draft and existing save fixtures for team, match, scorebook, review, archive, offseason. No pageerrors, page/dialog horizontal overflow, NaN/undefined/Infinity, or unlabelled visible controls in these cases. Existing fixture v8UI/v8Match/v8Reveal presentation metadata nulled to make currentScreen authoritative; this is explicit fixture injection, not continuous career coverage.

`trade-compare.cjs` / `trade-compare.json`: genuine career save snapshot `trade-source.gcc.json`, presentation metadata nulled. Actual review→offseason→Manage players→Trade.48 additional geometry cases for empty/package/review/response. Empty offer review disabled; cancel review preserves teams; declined double-send preserves allowance2; favorable double-send accepted exactly once allowance2→1. Strategy uses read-only packageProblem and ratings to choose legal strong overpayment; submitted via native selects/buttons. No pageerrors. The source career agent's latest save can change; captured local source is authoritative evidence.

`interactions.cjs` / `interactions.json`: native dialog scroll reaches max;35 Tabs cycle within native modal including BODY transition but no outside interactive control; Escape closes; backup download parses, review and restore succeed; injected long player name390px produces no overflow;10 repeated scout open/Escape cycles leave no open dialog.19 helper control clicks. Long name is test injection. Screenshots inspected at actual top900px crops for team/home/scout/offseason/scorebook;320px/32px HUD severely cramped.

`draft-match.cjs` / `draft-match.json`: new-page paused-match exact restoration; double Watch next only advances one match. Deterministic snake-turn fixture makes native Pick doubleclick add TWO different players across adjacent snake picks. Captured in standalone regression below.

## Confirmed baseline defects and regressions

1. Compare inaccessible: draft playerCard early return emits Scout/Pick; later Compare branch dead; scout dialog lacks Compare. `compare-regression-red.json` fails visible Compare assertion. Root patch candidate `e34fc6...` passed `compare-regression-green.json`: Scout→Compare→select alternative→both names and ability text→close→Pick exactly once. No product file edited by this audit.
2. Native double Pick at snake boundary silently drafts2 players. `snake-regression-red.json`: pick7 roster0→pick9 roster2; native click detail1 target104, detail2 target14. `snake-turn-before.gcc.json` is prepared fresh draft assigned eighth draft club before any picks, to deterministically exercise consecutive turn. Standalone test asserts exactly one addition and honors GCC8_TEST_BUILD/GCC_TEST_PHASE.
3.320px/32px HUD club text is squeezed by fixed Menu, splitting Round/Offseason inside words and consuming most viewport. `header-regression.cjs` asserts150px club text column and single-line Round2; red screenshot and measured geometry supplied. Proposed mobile full-width club row and restrained decorative slogan at narrow width; no CSS edited here.

## Limits

Emulated Chromium, not physical devices or screen-reader testing. Root font enlargement is not browser zoom. No networking required; photo rendering offline. No exhaustive OS/browser matrix, contrast scan, or every possible career/trade input permutation. No Settings feature surfaced; utility menu contains backups and3 help/story dialogs. Compare native entry is currently impossible on baseline, so baseline compare geometry cannot honestly be claimed. Geometry alone does not establish usability; header issue found by screenshot inspection despite zero horizontal overflow. First exploratory harness failures were corrected fixture/harness assumptions, not product bugs; final report.json has no harness failure. No GitHub mutations or product edits.

## Candidate validation (follow-up)

Root implemented fixes in separate candidate. Candidate `5c4b334e5e472253772286a909069120ce44f0d72224905004a46e60010175e4` passed Compare12 viewport/font cases (plus real selection/close/Pick), header club geometry12 cases, and fixture320px/32px nine word-range checks. Match fixture hero improved2019.75px→1502.61px high; names/badges and Review/Watch words now remain whole.320px/32px club text90.92px→256px; Round2 now one line.768px/32px club text23.47px→377.47px. Native draft guard on preceding JS-identical candidate e455 passed native doubleclick once and retained two deliberate Enter or two separate click picks (event.detail0/0 and1/1).

Additional tablet-nav defect reproduced on5c4:768px/24–32px career buttons shrink and break words despite parent nowrap. `header-regression-nav-red.json` captures per-word text ranges and fails. Root notified for scoped no-shrink/nowrap button fix. Normal390px/16px and1280px/16px screenshots inspected and legible;390 header has extra Menu row and no giant empty panel.

Extreme320px/32px modal titles still split words around the close control (e.g. Compare). Content is scrollable, controls remain usable, native select retains focus. This audit does not claim every visual word wrap is eliminated or all36 fixture names can stay unbroken at twice text size. Long single names wider than available space necessarily wrap.

## Final scoped candidate

`c7ba52edcbee16d66b8651362a61939cd6c0507382b6bea49f81b51869b1bafb`:

- `header-regression-final.json`:12 viewport/font cases pass; all navigation words whole, no page overflow;320/32 club width256px and Round2 one line;768/32 club width377.47px and Round2 one line, header570.14px high. Normal390/16 and1280/16 screenshots visually inspected.
- `fixture-layout-final.json`: all9 word ranges one line;320/32 team labels/badges and Review/Watch action words now whole. Actual viewport top/bottom screenshots inspected.
- `compare-regression-final.json`: root reran native Compare title words plus12 geometry cases and Pick once. `compare-modal-final.png` visually inspected: Compare/your/options each whole, close clearly visible at corner, focused select legible. This supersedes the earlier modal-title limitation.
- `interactions-final.json`:8 interaction checks pass;35 Tabs reaches `data-action=close`; no outside interactive focus; BODY remains a transient native modal cycle state. Escape, scroll to bottom, backup download/review/restore, injected long name,10 repeated scout cycles pass. No pageerrors.390/16 and1280/16 Scout viewport screenshots inspected.

Baseline findings are preserved as RED evidence rather than overwritten. No product edits made by browser-audit agent. Remaining limits are browser/device/screen-reader coverage and untested state permutations, not newly observed candidate defects. The broad432 baseline geometry cases were not rerun wholesale after scoped fixes; affected candidate Compare/header/fixture/dialog behaviors were tested directly. Native draft guard retained intended Enter and separate-click behavior on the JS-identical pre-CSS candidate; root has final guard result.

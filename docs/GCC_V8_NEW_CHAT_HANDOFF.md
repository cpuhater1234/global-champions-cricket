# Global Champions Cricket: current v8 handoff

Updated 21 October 2026. This replaces the obsolete initial-scaffold handoff. A playable v8 exists and has received substantial gameplay, state, native interaction and visual testing. Do not restart the rebuild or revert to the old cream theme.

## Current source and delivery

Repository: `cpuhater1234/global-champions-cricket`.
Working branch: `work/v8-game-first-rebuild`. Fetch its current head before editing or publishing. `main` is not automatically promoted.

Latest versioned playable: `game/gcc_v8_product_candidate.html`.
Canonical continuation build: `game/gcc_v8_quiet_arcade.html`, copied from the latest verified versioned build.
Delivered filename: `GCC_v8_Career_Clarity.html`.
Final career-clarity SHA-256: `fbdf332daf353070410815461ba62a112be14a4354ad82f912229cba4c679291`.

Read the latest review before changing anything:

- `docs/GCC_V8_PRODUCT_COMPLETION.md` is the release-gate contract. `docs/GCC_V8_CAREER_CLARITY_REVIEW.md` and `qa/GCC_V8_CAREER_CLARITY_EVIDENCE.json` describe the current checkpoint: visible annual development, direct guarded management actions, upfront trade effects/warnings carried to final review, responsive repairs, native release/trade/reload/draft/manual-XI/first-2009-match, 204 rendered cases, ten suites and an exact-build two-season regression. Human comprehension/enjoyment, model/provenance and target-platform/release rehearsal gates remain open. Do not relabel progress as a completed elite product.

- `docs/GCC_V8_CORE_LOOP_REVIEW.md` and `qa/GCC_V8_CORE_LOOP_EVIDENCE.json`. Direct guarded picks on draft cards, less repeated draft information, explicit midseason XI return, result-first continuation with the actual next opponent. Final evidence: six focused suites, 120 rendered fixture checks, fresh native two-match journey with save/reload and XI review, and one runtime season. Broader offseason design and genuine unfamiliar-player/human enjoyment evidence remain open.

- `docs/GCC_V8_DECISION_CLARITY.md` and `qa/GCC_V8_DECISION_CLARITY_EVIDENCE.json`. Repairs arbitrary automatic comparisons and two real narrow-screen XI transitions. Final evidence: 60 expanded states, native comparison keyboard checks, fresh native 390px draft-to-first-match/reload, five focused suites and one runtime season. These are informed tests; human and independent cold-player evidence remains open. Do not repeat the previous assessment-to-completion overclaim.

- `docs/GCC_V8_RENDERING_CLARITY.md` and `qa/GCC_V8_RENDERING_CLARITY_EVIDENCE.json`. Direct player reports exposed transient/expanded states missed previously. This pass fixes reported rendering and changes comparison actions; final48expanded cases and11focused suites pass. Broader browser evidence is scoped to identical scripts with final comparison-bar CSS retested separately.

- `docs/GCC_V8_EXPERIENCE_TEST_PROGRAMME.md` and `qa/experience-programme/assessment.json` for the new actor/assessor programme, pilot findings and explicit remaining gaps.
- `docs/GCC_V8_MOBILE_CLARITY.md` and `qa/GCC_V8_MOBILE_CLARITY_EVIDENCE.json`.
- `docs/GCC_V8_PLAYER_JOURNEY_REVIEW.md` and its evidence JSON.
- `docs/GCC_V8_MICROSCOPIC_AUDIT.md` and its evidence JSON.
- `docs/GCC_V8_FIRST_PLAYER_PLAYTEST.md` for prepared observation tasks. No unfamiliar-player sessions have been conducted by these automated audits.

The current temporary workspace is not an authoritative repository identifier. Historical workspaces, Library filenames and old commit references in other documents are checkpoints, not instructions to rewind. Some local checkouts track only selected files and retain many remote files as untracked. Preserve the remote base tree when publishing selected changes; do not replace it with an incomplete local tree.

## User intent and constraints

Tom wants a clear, polished cricket management game with an arcade visual identity, real stadium photographs and a random home stadium. He has repeatedly rejected crowded panels, small text, words breaking unnecessarily, duplicate explanations, unclear trading/releasing and regressions in already-good behavior. A passing test count does not establish a satisfying player experience.

Preserve alternate-history2008–2026, eight clubs, the five-day league signing window, fifteen-player snake draft, manual XI and batting order, fourteen-match seasons, finals, annual retirement/development/trading/drafting, injuries and cover, saves and legacy. The alternate-history powerplay is four opening overs plus a two-over surge, selected automatically by the captain for both sides; playback does not add mid-innings tactical commands. There are no product JSON import/export controls. There is no wage-management or salary-cap system. Do not invent contracts or exact future player peaks. Do not add a manual-XI bypass or balancing changes without evidence.

The user has authorized autonomous GitHub work and reversible implementation. Do not repeatedly ask for permission to continue already-authorized work. Do not publish to main or silently remove established features.

## Current implementation

`v8/ui/` contains the actual visible interface: components, screens, controller, cricket reads, role/comparison tools, offseason flow, match presentation, clock, DOM patching and workspace styles. `v8/domain/` holds domain modules and adapters. `v8/engine/` contains generated engine snapshots. The builder produces a standalone HTML with a hidden compatibility host and the visible v8 interface.

For UI-only work:

```sh
python3 v8/build.py --output game/gcc_v8_candidate.html
```

If changing an adapter that generates engine code, use `--freeze` and verify the generated diff. A build without `--freeze` uses the existing engine snapshots and will not incorporate adapter changes. Do not regenerate from abandoned source experiments. Preserve deterministic build identity and explicitly identify the artifact each test used.

## Recent verified repairs

The microscopic pass repaired real batting-order mutation on profile/render/cold restore, stale trade ownership, annual development attribution for legacy trades, zero-legal-ball chase accounting, modal focus, keyboard-scrollable tables, unsafe saved view lookup, theme contrast and enlarged title fitting.

The player-task pass exposed sorted draft metrics, retained full-XI ordering instructions, surfaced factual result comparisons, corrected loss/win class selectors, labeled projected-XI scope, made every new arrival scoutable and clarified pick trading and keeper replacement routes.

The mobile pass uses six initial candidates on narrow screens, puts bowling guidance above the list, shortens the redundant turn panel, aligns paired innings scores when there is room and preserves stacking at320px or enlarged text. Season reviews compare league wins against the immediately preceding archived year. It does not alter cricket decisions or rules.

## Evidence and remaining gaps

Do not collapse different evidence layers into a universal release claim. Runtime suites use a VM host; browser tasks are guided; later-screen checks use fixtures. The earlier nineteen-season career and eight-club matrix covered43 seasons and602 managed league matches on their documented corrected code. The later six-season paired trade pilot found a persistent rating advantage but no demonstrated winning dominance; its RNG naturally diverged, so it cannot estimate comparative win rates.

The understanding-review candidate passed66 stable-input suites with no source changes during execution,68 rendered browser states, four skipped/paced signing cases and three-world player-pool/RNG parity. Its CSS is byte-identical to mobile clarity; only closing-summary calculation and signing-wire rendering changed. No new full-career claim is made.

The earlier65-suite batch ran the mobile logic candidate. Finishing changes were CSS-only; final executable scripts were checked byte-identical and final layouts/native interactions were retested separately. Consult the evidence JSON for hashes and exact outcomes.

The new cold AI pilot found a real signing-count contradiction: future debutants were being called declined invitations. The source summary and old completed feed display now use eligible counts without modifying player state. The limited immediate same-career resume and directed count check are source-blind AI evidence, with full-page transport and harness-recovery limitations. Current future actor transport is viewport screenshot-only after review caught offscreen and clipped text exposure. Do not retroactively apply that improved scope to earlier trials. A later39-action same-career session completed the15-player draft and consulted projected XI analysis, but stopped at XI0/11 near its budget with transport limitations; no match/enjoyment claim. It used intermediate viewport text, not current screenshot-only transport. Initial operating batch and human sessions remain incomplete.

Still unestablished: unfamiliar-player comprehension, sustained enjoyment, larger multi-seed/club strategic balance, native Windows/Safari/touch comfort, screen-reader speech and genuine background-tab behavior. Automated contrast engines can miss gradients: the loss card previously passed broad flows while remaining unreadable. Include win/loss/neutral variants and actual visual inspection, not only viewport counts.

Keep old versioned artifacts as checkpoints. Update the canonical build only after verification, replace the existing user deliverable rather than proliferating unrelated copies, and keep the handoff current.

The previous checkpoint chronology is preserved in `docs/archive/GCC_V8_HANDOFF_HISTORY.md`. Earlier player-data, empirical calibration, composite-rating and chemistry limits are not closed by presentation audits; consult the corresponding career/profile reports before claiming otherwise.

## Save visibility follow-up, 21 October 2026
See docs/GCC_V8_SAVE_VISIBILITY_REVIEW.md. New artifact hash add512cdc4f7945924b4c3c764cc85dd93ea66909367d32663a22b32d677c525. Persistent header warning clears only on successful save; season-review enlarged-text overflow repaired. Independent player review attempts produced no evidence because workspace credits blocked agents. Broader completion gates remain open.

## Draft and scouting presentation follow-up
See docs/GCC_V8_SCOUT_CLARITY_REVIEW.md and qa/scout-clarity. Current artifact hash 20106af30b6002b05f3e05ce7a1ac7f4ecc7eee363e0001c8eaef23a5952c3c3. Detailed skills grouped and cricket terminology revised; header sizing, straight-toe bat icon, latest-signing sidebar and XI rating contrast repaired. Comparison logic unchanged. Builder now replaces data and screens modules as well as controller/offseason, and applies source cricket SVG.

## Player-facing audit after scout clarity
Read docs/GCC_V8_PLAYER_FACING_REVIEW.md. Inspection only; no product changes. Fresh 1280/390 native opening capture through first pick under qa/player-facing-review. Confirmed layout-shifting draft feedback, long mobile intro/club-choice pacing, repeated signing explanation and result Round 1 vs global Round 2 context. Prioritised next pass recorded. Real photos, systematic motion, finals/archive/end-career visual replay and independent enjoyment remain outside this inspection.

## Entry pacing and draft stability implementation
See docs/GCC_V8_ENTRY_CLARITY_REVIEW.md. Artifact hash fbb56696056606156f336d56587e37df4fcea2c06158fa49c402f4321376eebf. First audit priorities now implemented: concise optional-story intro, compact mobile club chooser, non-shifting draft acknowledgement, no empty selected disclosure, viewed-result HUD round and explicit next round. 60 opening cases, 84 annual cases, ten gameplay suites and native fresh two-match/reload verified. Continue remaining player-facing priorities rather than repeating another inspection-only pass. Preserve manual XI and accepted comparison design.

## Match / XI / career presentation
See docs/GCC_V8_MATCH_CAREER_REVIEW.md. New artifact hash 1b6376ea5d1358d12daea4932b7f9ec79d41fa1fb1220fd8cddf50c30bfedb3d. Score-first ball playback, compact controls after batters/bowler, readable boundary markers, no empty trail reserve; sticky XI command panel; shared archive/final career records; finals name/badge wrapping. Current QA in qa/match-career: 156 match/career +84 annual render cases, ten suites, fresh native two-match/reload. Synthetic long archive and 2026 layout explicitly distinguished from actual career play. Builder replaces match_story too. Independent enjoyment/platform/model/provenance gates remain open.

## Cricket detail / alignment follow-up
See docs/GCC_V8_CRICKET_DETAIL_REVIEW.md. Artifact hash 6b4f46967d347f3f23c67554dfbb3c8f19f7af732c7fb6fa2086036715e7d030. Draft avatars and Pick icons removed, bat redrawn with long blade/narrow handle, club-guide side-by-side panels equal height, standalone takeover/intro/scout decision actions centred, clearer cricket guidance and compact trade spacing. 60 specific +84 annual layout cases, ten suites, fresh native two-match/reload pass. Builder now also patches components/roles. Remaining engagement/completion gates still open.

# Global Champions Cricket: current v8 handoff

Updated 20 October 2026. This replaces the obsolete initial-scaffold handoff. A playable v8 exists and has received substantial gameplay, state, native interaction and visual testing. Do not restart the rebuild or revert to the old cream theme.

## Current source and delivery

Repository: `cpuhater1234/global-champions-cricket`.
Working branch: `work/v8-game-first-rebuild`. Fetch its current head before editing or publishing. `main` is not automatically promoted.

Latest versioned playable: `game/gcc_v8_understanding_review.html`.
Canonical continuation build: `game/gcc_v8_quiet_arcade.html`, copied from the latest verified versioned build.
Delivered filename: `GCC_v8_Understanding_Review.html`.
Final understanding-review SHA-256: `24f91cafc6b4469afe730e8cca1f84c07b3c80abeb3b8a7fa9f3ab2bea0171a1`.

Read the latest review before changing anything:

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

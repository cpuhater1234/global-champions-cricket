# GCC v116 — stable playable release handoff

Status updated 11 November 2026: **v116 is the frozen stable playable release artifact.** This handoff records the controlled release decision, tested evidence and remaining engineering limits. No GitHub Release/tag has been created, and the old `main` game code has not been merged.

## 11 November 2026 verification update

- [Native two-tab stale-save/recovery run #42968272367](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/42968272367): **PASS**. One stale Round 1 tab could not overwrite the newer Round 2 career, and native localStorage/IndexedDB checkpoints and continued career identity were preserved.
- [Frozen source identity and exact extraction run #42970876618](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/42970876618): **PASS**, 17 styles / 22 scripts in exact v116. This is lossless extraction, not historical `v8/build.py` parity.
- [39-block lineage audit #42971180377](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/42971180377): **PASS**; 21 blocks with exact partial/full source correspondence, 10 heuristic-only, 8 unmapped.
- [Static CSS cascade inventory #42971485315](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/42971485315): **PASS**. 70 cross-block same-context selector/property repetitions, 52 with different values. This is not a count of confirmed user-facing defects.
- **Open:** full maintained-source parity, visual/manual sign-off, other storage failure modes and extended native career persistence.

## Stable release operating rules

- **Single playable source of truth:** `v116/GCC_v116_release (1).html`. Keep the SHA-256 above pinned.
- **Do not change the frozen HTML for cleanup**, release notes, testing, source refactors or visual experimentation. Keep testing/documentation changes separate.
- **Known-good evidence:** 19-season isolated career acceptance; native single-tab save/reload/Continue; and a real-browser two-tab stale-save rejection and recovery on exact v116, each with its stated scope.
- **Still open:** other concurrent-edit/storage-failure scenarios and reconciliation of maintained source with the exact binary. The targeted two-tab stale-save scenario **passed** in [run #42968272367](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/42968272367).
- **Repository discipline:** `main` remains historical code; the default landing page points here. Do not merge historical styles or rebuild v116 from an older source pipeline. No duplicate release files or new branches were created by this designation.

## Current identity

The project owner has designated **v116 as the current stable playable build**.

- Branch: `v116`
- Upload commit: `7d6772364788fe4469b9bdac855ec33451e8974d`
- Exact uploaded path: `GCC_v116_release (1).html`
- Recorded Git blob SHA: `088cf689ef3a464b06e8512627811ad60864b3e8`
- Recorded size: 6,635,097 bytes
- Artifact SHA-256: `b27cf0b4c7e6e4e7a78eaa5c80154dfd0f70657ce9f774dd405505e97e82c6d0`
- Portable acceptance test: `captaincy_layer_v116.py`; current test Git blob SHA: `3c6b1d121f6d3c640e86fc7f26b523394ab3d30a`.

Git blob identifiers and standalone SHA-256 checksums are different identifiers. Preserve the exact release filename and bytes. This stable playable designation is distinct from a merge into `main` or the publication of a GitHub Release/tag.

## Owner-supplied perfection-pass report

The owner pasted a v116 handoff reporting:

- Recruitment wire changed to an intentional quiet-feed empty state.
- Clearer Scout → Pick drafting affordance and aligned Pick actions.
- Persistent squad-needs strip for wicketkeeper, openers, pace, spin and bowling mix.
- Improved mobile draft action rhythm and long result-heading wrapping.
- Existing save, draft legality, match, accessibility and navigation contracts preserved.
- Protected-function/browser QA PASS; responsive audit with zero findings; live-match progression, scorecard opening, save/reload/Continue and desktop/mobile scouting checks PASS.
- 42/42 scorecard-level fixtures completed without errors.

These are reported results, not independently rerun during this repository cleanup. The separately named implementation plan and perfection report were referenced in the pasted handoff; their full contents were not supplied here.

## Captaincy evidence and limits

The earlier perfection-pass handoff explicitly deferred functional captaincy. The owner subsequently described captaincy as the latest layer and uploaded a browser test alongside the release.

The uploaded test targets visible `powerplay`, `middle` and `death` selectors, starts a match, skips playback and inspects the saved result's `captaincy` metadata. It includes two 390px scenarios, page/console-error checks, a document-overflow check and an assertion that selected plans appear on the completed result.

The original captaincy test had Manus-specific paths. It has now been replaced **in place** with a portable runner: `python captaincy_layer_v116.py --html "GCC_v116_release (1).html"`. The runner pins the release SHA-256, uses disposable browser contexts, accepts configurable paths and marks `--mode isolated` as non-native. Two isolated tactical UI scenarios passed on this exact uploaded HTML. **Native HTTP storage, reload and Continue Career were subsequently verified in GitHub Actions** (run #3 below). Separate random careers do not prove controlled tactical causality.

The final assertion compares whole result dictionaries from separate new careers. It does not by itself establish controlled tactical causality. A stronger follow-up should compare identical fixtures and random conditions, varying only the plan, and cover persistence, replay/playback consistency, default behaviour and invalid/legacy saves.

## Additional verification on exact v116 HTML (10 November 2026)

- Isolated engine stress: **100 independent 14-round seasons**, **1,400/1,400** valid user-match delivery ledgers, no reported simulation errors. Controlled same-seed tactics changed scores in 100/100 paired comparisons and winners in 17/100. These are repeated regular seasons, not one 19-year career.
- Two separate isolated UI tactical smoke cases passed from Draft through Match Result at 390px, with no captured JS errors or horizontal overflow. Storage was simulated rather than native.
- Two bounded 2008–2010 career journeys passed with 42 user matches each, including annual drafts, 2008/2009 archive transitions and injury-triggered XI adjustments. A continuous 19-year browser run exceeded the restricted test limit, and is **not** a pass.
- **A 19-season 2008–2026 isolated career passed** with 266/266 validated league matches, 18 year-boundary restarts, five finals campaigns and injury-cover UI recovery. Native save/reload passed later in GitHub Actions (run #3). **A targeted native two-tab conflict/recovery test passed on 11 November; broader storage cases and maintained-source build parity remain open.** The gameplay HTML is unchanged. The engine stress sample still showed ~19.7% all-out innings and ~20.6% fours per recorded delivery.

## Native browser CI acceptance (10 November 2026)

- **Run #3:** [GitHub Actions 42751656106](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/42751656106), commit `ebcd1342cbbe05bc9232fd11c4b893e593306d03`, **success**.
- Both Playwright scenarios completed under `--mode http`, using fresh browser contexts and the exact v116 release SHA-256. The test verified saved Round 1 result metadata, club, year, round, XI and selected captaincy after browser reload and Continue Career.
- Runs #1 and #2 had passing gameplay test steps but were marked failed solely because the account's GitHub Actions **artifact storage quota** prevented screenshot/log uploads. The workflow now writes a compact job summary instead of uploading artifacts.
- **Scope boundary:** the CI pass covers two single-tab journeys, not simultaneous competing writers, legacy saves or the full dynasty using native storage.
- No modifications to game HTML or maintained source were made for this CI fix.

## Next work

1. Preserve the exact uploaded HTML and establish a standalone checksum.
2. Obtain the complete implementation plan and perfection/captaincy evidence for this exact artifact.
3. **Completed for two single-tab scenarios:** native HTTP save, reload and Continue Career passed in run #42751656106. **Completed for one two-tab scenario:** stale writes rejected and latest career restored in [run #42968272367](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/42968272367). Extend to other competing-writer and storage-failure cases before certifying the full subsystem.
4. Verify captaincy selection persistence before a match, completed-result metadata after reload, playback consistency and bounded simulation effects under controlled conditions.
5. Continue visual review across recruitment, draft, XI, match preview/live/results, management, trades, finals and archive at desktop and mobile widths, including enlarged text. Fix concrete issues rather than adding blanket decorative layers.
6. Reconcile the uploaded release with maintained source and prove documented build parity before any source-based release promotion. The [source round-trip](V116_SOURCE_RECONCILIATION.md) passed; a [39-block lineage map](V116_BLOCK_LINEAGE.md) and [static CSS cascade report](V116_CASCADE_INSPECTION.md) now identify the remaining work. These are **not** independent maintained-source build parity.
7. Review a deliberate promotion into `main`; only then create an agreed release/tag and update the default-branch entry point.

Earlier v112 cold-start and source-reconciliation findings remain historical evidence, not automatically open or resolved v116 defects. Reproduce them on v116 before assigning their status.

## Cleanup boundary

For the **10 November documentation cleanup alone**, only the root README, this handoff and the repository organization guide were changed. Subsequent 11 November QA/doc commits are separately recorded in GitHub. No HTML, gameplay, test implementation, baseline hash record, old checkpoint, branch setting or release tag is changed. No branch is deleted or merged.

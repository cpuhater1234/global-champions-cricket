# Current v116 review candidate handoff

13 November2026. Working branch: `work/v116-candidate-acceptance`. The `v116` branch reports dated11November describe the frozen release and early signing experiment; they are historical evidence, not the current candidate acceptance record.

## Current staged offseason visual candidate

Offseason overview/development density pass is staged for focused native and raster review. Base is archive candidate29730258…1b37e9; staged SHA-25643861f74249975c287b45bc5136d1f68d5518f42522ee69ef9341c518a5e8fc1 (6,656,470bytes). Only existing CSS owners10/31 change. All22 runtime bodies unchanged. See [offseason review](V116_OFFSEASON_DENSITY_REVIEW.md). No stable promotion or new download in this staging step.

## User scope update and next visual candidate

The user explicitly excluded actual screen-reader speech testing from scope. It is **not a promotion blocker** and no installation or manual speech test is required. Historical HOLD explanations below record the prior scope and are superseded by this instruction. Speech support remains unverified; no accessibility certification is claimed.

Archive density pass is complete for its bounded QA scope. [Final run43398872443](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/43398872443) passed64 paired states with0 findings/errors; see [archive review](V116_ARCHIVE_DENSITY_REVIEW.md). Base is c8990d21…5909a0. Only archive selectors in existing styles/10 are edited: more compact header and season rows; phone year and Open season share a row with result text below. Offseason and gameplay remain separate. Candidate SHA-256 297302580de76f464e47bf9e153646264a46a1d7fe09958ec6aabb01141b37e9 (6,656,214bytes). It remains an unpromoted review candidate; the archive-specific gate passed. Next focused visual pass: offseason overview/development density. Frozen v116 and main are not being edited.

## Previous c899 accessibility candidate (historical HOLD scope)

New candidate SHA-256 `c8990d219359ce23f697db136d47e44673427167cec0bae83638e61ceb5909a0` (6,655,238 bytes), built with:

```sh
python qa/v116_canonical_source.py build --source v116/canonical \
  --output qa/results/GCC_v116_accessibility_review.html \
  --report qa/results/GCC_v116_accessibility_build.json
```

Change: two CSS declarations in the existing compact owner `styles/31-gcc-floodlit-visual.css`; changed bodies = `styles/31` only; all 22 scripts byte-identical to frozen v116. `manifest.json` deliberately still records the c45684a5… snapshot, so `--check-manifest` fails until this candidate is reviewed and recorded. Details and evidence: [V116_ACCESSIBILITY_GATE.md](V116_ACCESSIBILITY_GATE.md#follow-up-edited-accessibility-candidate-13-november-2026).

| Gate item | Result | Limits |
|---|---|---|
| 1. 320px Season record overlap | Fixed. Label/value text boxes separate at 320/360/390; no horizontal overflow | Chromium only |
| 2. Fixtures keyboard focus | Fixed. Tab and Shift+Tab at 320/360: every nav control and full ring visible, unobscured, page not shifted. Existing gate: 0 findings | Chromium only; short landscape screens not covered |
| 3. Live-score speech | **Not tested** (no screen reader in the sandbox). No code change | Blocks promotion |
| 4. 200% zoom | Recaptured unclipped at CSS 720/320: Home, Matchday, player dialog; 44/44 checks; captures inspected | Single reviewer; Chromium only |
| 5. Rebuild / SHA | Done; CI workflow pinned to the new hash | Old saved reports are not evidence for this file |

Gameplay and save/reload were not re-run because no runtime body changed. That rests on the build report and the frozen-script comparison, not on a new gameplay run.

## Artifact identities

| Role | File | SHA256 |
|---|---|---|
| Frozen rollback reference | `GCC_v116_release (1).html` | `b27cf0b4c7e6e4e7a78eaa5c80154dfd0f70657ce9f774dd405505e97e82c6d0` |
| Previous review candidate (recorded manifest snapshot) | `GCC_v116_Draft_Cards_Review.html` | `c45684a540d098ec35beeb8a959995e88292bccded4ce1314390140d1e7720ab` |
| **Current edited accessibility candidate (HOLD)** | `GCC_v116_accessibility_review.html` | `c8990d219359ce23f697db136d47e44673427167cec0bae83638e61ceb5909a0` |

Current candidate size:6,655,238bytes. It is not a stable release or tag. Main and frozen release have not been promoted or overwritten. All22 script bodies compare byte-identically with frozen v116; changes are in existing style bodies.17 style blocks remain, with deliberate cascade consolidation still separate.

## Historical c456 candidate: signing-width acceptance

The obsolete72px day-cell minimum from the later cleanup owner is already removed. The composition owner retains the shrinkable day cells. The original report remains accurate for its own11November artifact and390/1440 initial-state probe.

Day1–5 indicators are noninteractive spans, not day-selection buttons. Focused testing must run actual signing progression, pause it, and inspect initial/during/completed states rather than inventing a day-click interaction.

[Exact-current-candidate focused acceptance43341503931](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/43341503931) passed every workflow step. All result reports identify SHA256c45684a540d098ec35beeb8a959995e88292bccded4ce1314390140d1e7720ab.

-15 initial/during/completed signing states at320/360/390/768/1440px: five day labels contained/readable,44px controls, no document horizontal overflow or page errors.
-5 actual paused mid-signing durable-save/reload/Continue checks: same club/year/day/resolved decisions/feed/player availability restored; then signing completes and the draft board is reached.
-2 independent390px native full new-career/draft/manual-XI/match scenarios: selected captaincy metadata,11-player XI, club/year/round/results preserved through real HTTP save/reload/Continue. No page or console errors or measured captaincy-board horizontal overflow.
- Native two-tab test: stale Round1 writes rejected after Round2 saved elsewhere; localStorage/IndexedDB/latest career identity preserved, then post-Continue checkpoints agree.

That acceptance run left the c456 artifact unchanged. The later c899 candidate contains only the two CSS edits documented above. Frozen rollback reference remains byte-identical. This closes the named candidate verification gap; it does not certify every browser, storage failure mode or full-dynasty native scenario. It builds the canonical source, verifies checksum, then runs15 signing states across320/360/390/768/1440px, real mid-signing save/reload/Continue at those widths, two full native gameplay/save/reload/Continue scenarios and guarded two-tab stale-write recovery. All browser contexts/careers are disposable; the user's actual career is not used.

## Historical c456 signing visual review

All15 initial/during/completed signing renders were inspected at the five requested widths. Day labels and controls remain readable;320px intentionally wraps each Day label across two lines. No clipping or document-width regression was observed. At768px during signing, Resume signing wraps and is taller than its adjacent Speed control; this is a minor recorded consistency issue, not a claim that the full interface is visually finished. No product edit was made in this verification pass.

## Reproducible candidate source

[Source parity run43339977558](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/43339977558) passed. `v116/canonical` contains the lossless template,17 CSS owner bodies,22 script bodies and manifest. `qa/v116_canonical_source.py build --source v116/canonical --output qa/results/candidate.html --check-manifest` reproduces the recorded c456 snapshot byte-for-byte. For the current c899 candidate, use the non-strict build command above and require its exact hash and the single changed CSS owner; the manifest intentionally remains the previous snapshot. Runtime-body drift is rejected unless explicitly acknowledged for renewed engine QA.

This supplies a safe, repeatable path for the staged candidate. It does **not** prove historical `v8/build.py` or the legacy v8 module tree reproduces v116. Do not use that older pipeline to replace the playable candidate. Future canonical edits require fresh native acceptance against the newly built file; historical composer workflows do not automatically cover them.

## Existing bounded UI evidence

- Draft cards/shared arrivals:100 paired states, run43339252905; actual Scout and Pick behavior tested in disposable careers.
- Trade forms:120 paired states, run43337856145; Review/Edit, partner changes and critical career state preservation. Selected-pick packages genuinely unavailable in that retained-roster checkpoint and recorded as omitted.
- Player reports:90 paired states, run43336190086; all three tabs, narrow header and rating/close separation.
- Earlier reveal/decision and XI/analysis passes are recorded in their release review documents. These do not substitute for exact-current persistence checks.

## Historical c456 accessibility findings (superseded by fixes above)

The exact c45684a5…e7720ab candidate has now undergone the next bounded accessibility diagnostic. See [V116_ACCESSIBILITY_GATE.md](V116_ACCESSIBILITY_GATE.md) for evidence, diagnostic corrections, confirmed findings and limits. **Promotion remains HOLD**. No product body changed and no new build download is required.

The 768px signing-button height difference is visible but cosmetic in the tested state: labels fit, minimum height44px, keyboard Resume/Pause works, focus is visible/unobscured. Deferred without a patch. Final native diagnostic [43346413874](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/43346413874) completed33 states/105 focus observations without runner/page errors. Actual320px Tab traversal leaves Fixtures partly offscreen;360/390px initial-focus observations also need triage. A separate confirmed320px Matchday readability defect is the Season record label overlapping its value. Live-score text updates and is exposed as polite/atomic in Chromium, but the status container is replaced each update; actual spoken announcements remain unverified.200% native zoom was activated, but zoomed raster capture clips and does not provide complete visual signoff.

## Current next gate and promotion decision

**HOLD, unpromoted.** The two narrow-screen defects and the clipped zoom-capture process are resolved for the exact c899 candidate in the bounded Chromium evidence. Do not repeat those completed checks or the prior gameplay/save acceptance without a new change or failure that justifies it. The remaining release gate is actual live-score spoken output using a screen reader, following the protocol above. This connection provides no verified screen-reader speech output; DOM/AX evidence cannot close that gate. Do not change the live-score script merely on the assumption that replacing the status region causes lost speech.

The13 November reconciliation re-read all three CI reports from run43361047557 (gate:0 findings/1,020 observations; narrow:126/126; zoom:44/44), inspected31 existing screenshots (22 zoom viewport segments,2 zoom focus images,7 narrow/focus images), and locally rebuilt the exact6,655,238byte c899 artifact. No tests were rerun, no game body was edited and no new download was made during reconciliation. Discarded unused replacement diagnostics prepared before the external work was discovered.

The tablet height difference remains cosmetic/deferred. Remaining visual work includes archive/offseason summary density, mobile draft chrome/companion, long-club-name live alignment, remaining match-specific surfaces and separately verified cascade consolidation. Those are separate passes. Short landscape screens and Firefox/Safari focus scrolling remain outside this bounded evidence. The previous71/100 whole-interface assessment is not rescored by individual component tests; no whole-game final visual approval is claimed.

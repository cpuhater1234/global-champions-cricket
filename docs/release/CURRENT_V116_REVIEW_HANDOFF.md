# Current v116 review candidate handoff

## Latest shared XI analysis review, 14 November 2026

GCC_v116_Shared_Analysis_Review.html, SHA-256 a522817bd41de2a1153e62c9701bf415cd5a4e773f265bf43ba1979ccc8620d5,6,662,969bytes. Builds on Interface Review0a1c8a2a. Removes19duplicate teamAnalysis rules; shared analysis owner10 now governs draft/offseason/XI, with intrinsic200px columns. Only CSS10 differs; all22runtime bodies identical. Final run43590169905 passed10paired XI states and16draft-card role/width states, zero failures/errors. All12XI ratings/colours/groups/XI IDs preserved. Desktop/tablet analysis157.63px shorter; phone50.19px taller for readable single-column rows. Final tablet/phone analysis and keeper card captures inspected. See [shared analysis review](V116_SHARED_XI_ANALYSIS_REVIEW.md). Review only, unpromoted; prior Interface Review is rollback. Local working source remains qa/workspaces/career-integrated/canonical; do not build older local v116/canonical feature checkpoint.

Next confirmed visual findings: player-development panel appended below XI ratings retains nested skill-change boxes; narrow draft role/sort selectors truncate native selected captions (seen at320px). Draft rating strips themselves passed four roles/four widths without a product change. Current comparison renderer has no active entrypoint found in current scout controls; record separately, do not wire a feature during visual cleanup. Not all grouped ratings, menus or17historical stylesheets are certified finished.

## Latest combined interface review, 14 November 2026

GCC_v116_Interface_Review.html, SHA-256 0a1c8a2a8ba09bfdb2385aa20e085b53638854ef297fdfb55819e90ec9269c46, 6,665,551 bytes. Includes all prior career-record/club-card work plus club-guide ownership cleanup, shared player scout/attribute rating spacing, transparent nested rating wrappers, and Your club/Game guide utility-menu sections. Guide run43587359397 passed32paired states; final ratings/menu run43588418168 passed24paired states at four widths, zero failures. Final mobile captures inspected. See [club guide](V116_CLUB_GUIDE_REVIEW.md) and [ratings/menu](V116_RATINGS_MENU_REVIEW.md). Relative to Club Cards Review only CSS09/10/31 and runtime29 header-menu markup differ;21other runtime bodies byte-identical. Frozen v116/main untouched, unpromoted. Club Cards Review remains rollback.

Remaining visual work is not certified complete: inspect other grouped-rating contexts (draft cards, comparisons, XI/team balance and phase groups), and review the content organisation inside the How to play/How it works dialogs separately from the now-grouped utility dropdown. User reports faint fills/tight bars across game; continue tracing real winning CSS before edits, not adding blanket global overrides. Existing17stylesheets still retain historical rules; no claim of global consolidation.

## Delivered compact club cards, 14 November 2026

GCC_v116_Club_Cards_Review.html: 4b167b19fe092c28f4183497a7522072f289812955890228e37b2a7fa550e01e, 6,671,554 bytes. Builds on Career Record Review. Club cards use compact icon/short-ground-name rows; trait paragraph removed from cards, full details remain in guide. Removed conflicting owner31 ground panel rule; existing owner10 owns row. Native run 43585943796 passed eight grid states/four widths plus guide checks. All phone ground rows 44px, aligned bottom spacing, no failures. Mobile/desktop/tablet captures inspected. Only CSS10/31 and card renderer27 differ; 21 other runtime bodies unchanged. See [club-card review](V116_CLUB_CARD_GROUNDS_REVIEW.md). Not promoted; prior Career Record Review is rollback.

## Delivered career-record review, 14 November 2026

GCC_v116_Career_Record_Review.html, SHA-256 32d28ef2b6e59b150e6f7319dd85199772a238aa966fc9fe2ad52aa8c18fd800, 6,671,221 bytes. Integrates approved uncapped career points/club-only records/honours and automatic eight-club reveal completion with latest verified analysis UI. Native run 43585178498: 20 states, 55 checks, zero failures. Ending reload/ledger preservation, timed/manual/skip/restored reveal, focus and retained club/draft confirmations verified. Mobile and desktop ending rasters inspected; phone word breaks/venue fill corrected before delivery. See [integration review](V116_CAREER_INTEGRATED_REVIEW.md). Review only, not stable. Frozen v116/main untouched. Accounts/global rankings not implemented; 1000+ rarity uncalibrated. Deferred record-display choices: alphabetical tied leader; Best season uses title then wins. Previous Secondary Review remains rollback.

## Verified shared analysis summary, 14 November 2026

Candidate b8f34a5d48836a5157f245a1ca8c0c72101d74a947eeaaa9b69576190beeff2a (6,660,175 bytes). Run 43583054824 passed 20 targeted states at four widths, zero failures. Mobile draft/offseason rasters inspected. Compact summary and plain discipline headings replace nested analysis boxes. Only CSS owners 10/31 differ from delivered Secondary Review, all 22 scripts identical. See [summary review](V116_ANALYSIS_SUMMARY_REVIEW.md). Staged for next consolidated bundle; no additional download yet, unpromoted. Next: reconcile isolated career-record/club-flow feature carefully with this verified UI source, then native feature verification.

## Verified shared analysis rows, 14 November 2026

Staged candidate 5c4bbca8873cd3e94bb1a62ac7a9a344edfc94a72848d8f373a6d15d43091fa2 (6,658,693 bytes). Only existing CSS owner 10 differs from delivered Secondary Review; all 22 runtime scripts identical. Run 43582518510 passed 20 targeted states including expanded offseason panels; zero failures. Draft and offseason 320px rasters inspected. See [analysis rows review](V116_ANALYSIS_ROWS_REVIEW.md). User-opened Secondary Review remains unchanged; no additional download yet. Unpromoted. Next: remove remaining nested analysis/summary visual chrome, then reconcile isolated career-record/club-flow feature.

## Latest secondary UI review, 13 November 2026

GCC_v116_Secondary_Review.html, af1e36b9c6b43fb914823e5949fa53d4ad22c82fec69f350b56472940a5ab322, 6,658,064 bytes. Final run 43460180335 passed 460 states with zero failures/word-break flags. See [secondary review](V116_SECONDARY_OWNER_REVIEW.md) for exact scope and limits. Review only; promotion HOLD. Narrow analysis density remains. Career record/automatic club flow remains separate, native verification pending. Frozen v116/main untouched; Finals Review remains rollback.

13 November2026. Working branch: `work/v116-candidate-acceptance`. The `v116` branch reports dated11November describe the frozen release and early signing experiment; they are historical evidence, not the current candidate acceptance record.

## Verified live-score header source candidate

After the user opened Mobile Draft Review (d9f497f1…bef54af4), a read-only renderer diagnostic reproduced unequal live-score header/score alignment with long actual club names. CSS trial passed60 layouts. Exact final candidate passed60 renderer cases in run43406907121, including added checks that club words stay intact. Candidate9e1fec325f6d5dc08e16b79ce4cf2019e2c4aa0872d076a283cf1b1a70a01601 (6,657,151bytes) has passed bounded exact native/raster verification; only existing owners10/31 differ from the delivered reference, all22scripts unchanged. [Live header review](V116_LIVE_HEADER_REVIEW.md). The user's delivered/opened file remains Mobile Draft Review d9f497f1…bef54af4; the verified header correction is staged for the next review bundle. No additional download in this pass. No stable promotion.

## Current mobile draft review build

Mobile draft chrome/companion pass is complete for its bounded scope. Final run43403856003 passed104 paired states with0 findings/errors. Base98a664ca…e4b230; candidate SHA-256d9f497f1c58c2637f686b8e0a2bb9dff6a6ed75846142b0aa466cbd9bef54af4 (6,656,949bytes). Only existing CSS owner10 differs from the offseason base. Squad/Speed share a narrow row; enabled Skip keeps its own row; header/filters use less space; narrow squad role counts use two columns. Main companion and Analysis/League picks remain accessible. [Mobile draft review](V116_MOBILE_DRAFT_REVIEW.md). Playable review copy: GCC_v116_Mobile_Draft_Review.html at the exact hash above, bundling archive/offseason/mobile draft passes. No stable promotion. Next: user review, then long club names and live-match header alignment.

## Current offseason review candidate

Offseason overview/development density pass is complete for its bounded scope. [Final run43401126905](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/43401126905) passed60 paired states with0 findings/errors. Base is archive candidate29730258…1b37e9; current SHA-25698a664ca2f125a54a4f72454d685dd08dbea698eb48d206367ee1a1a7ee4b230 (6,656,487bytes). Only existing CSS owners10/31 change. All22 runtime bodies unchanged. See [offseason review](V116_OFFSEASON_DENSITY_REVIEW.md). Phone overviews save98–141px; tablets save365px. Additional skills remain available and expanded cards do not stretch their neighbours. No stable promotion or new download. Next: mobile draft chrome/companion layout.

## User scope update and next visual candidate

The user explicitly excluded actual screen-reader speech testing from scope. It is **not a promotion blocker** and no installation or manual speech test is required. Historical HOLD explanations below record the prior scope and are superseded by this instruction. Speech support remains unverified; no accessibility certification is claimed.

Archive density pass is complete for its bounded QA scope. [Final run43398872443](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/43398872443) passed64 paired states with0 findings/errors; see [archive review](V116_ARCHIVE_DENSITY_REVIEW.md). Base is c8990d21…5909a0. Only archive selectors in existing styles/10 are edited: more compact header and season rows; phone year and Open season share a row with result text below. Offseason and gameplay remain separate. Candidate SHA-256 297302580de76f464e47bf9e153646264a46a1d7fe09958ec6aabb01141b37e9 (6,656,214bytes). It remains an unpromoted review candidate; the archive-specific gate passed. The offseason pass is documented above; next is mobile draft chrome/companion layout. Frozen v116 and main are not being edited.

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

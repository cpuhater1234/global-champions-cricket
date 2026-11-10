# GCC v116 — current handoff

Recorded: 10 November 2026. This is a documentation and repository-navigation checkpoint, not a new game release or a test execution report.

## Current identity

The project owner identifies **v116 as the latest release**.

- Branch: `v116`
- Upload commit: `7d6772364788fe4469b9bdac855ec33451e8974d`
- Exact uploaded path: `GCC_v116_release (1).html`
- Recorded Git blob SHA: `088cf689ef3a464b06e8512627811ad60864b3e8`
- Recorded size: 6,635,097 bytes
- Uploaded test: `captaincy_layer_v116.py`
- Test Git blob SHA: `a48305e2b3353781308de1c778a35106a7192270`

These Git blob identifiers are not standalone SHA-256 checksums. The release filename is preserved to avoid unnecessary copies or accidental byte changes. The owner-designated current release is not the same as a verified merge into `main` or a GitHub Release/tag.

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

The original captaincy test had Manus-specific paths. It has now been replaced **in place** with a portable runner: `python captaincy_layer_v116.py --html "GCC_v116_release (1).html"`. The runner pins the release SHA-256, uses disposable browser contexts, accepts configurable paths and marks `--mode isolated` as non-native. Two isolated tactical UI scenarios passed on this exact uploaded HTML; native HTTP save/reload remains unverified in this restricted environment. Separate random careers do not prove controlled tactical causality.

The final assertion compares whole result dictionaries from separate new careers. It does not by itself establish controlled tactical causality. A stronger follow-up should compare identical fixtures and random conditions, varying only the plan, and cover persistence, replay/playback consistency, default behaviour and invalid/legacy saves.

## Additional verification on exact v116 HTML (10 November 2026)

- Isolated engine stress: **100 independent 14-round seasons**, **1,400/1,400** valid user-match delivery ledgers, no reported simulation errors. Controlled same-seed tactics changed scores in 100/100 paired comparisons and winners in 17/100. These are repeated regular seasons, not one 19-year career.
- Two separate isolated UI tactical smoke cases passed from Draft through Match Result at 390px, with no captured JS errors or horizontal overflow. Storage was simulated rather than native.
- Two bounded 2008–2010 career journeys passed with 42 user matches each, including annual drafts, 2008/2009 archive transitions and injury-triggered XI adjustments. A continuous 19-year browser run exceeded the restricted test limit, and is **not** a pass.
- Native save/reload, two-tab recovery, a full 19-year career and source-build parity remain open. The gameplay HTML is unchanged. The engine stress sample still showed ~19.7% all-out innings and ~20.6% fours per recorded delivery.

## Next work

1. Preserve the exact uploaded HTML and establish a standalone checksum.
2. Obtain the complete implementation plan and perfection/captaincy evidence for this exact artifact.
3. Run the now-portable captaincy test in default HTTP mode on an ordinary computer or CI runner to verify real browser storage. Use disposable careers only.
4. Verify captaincy selection persistence before a match, completed-result metadata after reload, playback consistency and bounded simulation effects under controlled conditions.
5. Continue visual review across recruitment, draft, XI, match preview/live/results, management, trades, finals and archive at desktop and mobile widths, including enlarged text. Fix concrete issues rather than adding blanket decorative layers.
6. Reconcile the uploaded release with maintained source and prove the documented build reproduces the intended artifact before any source-based release promotion.
7. Review a deliberate promotion into `main`; only then create an agreed release/tag and update the default-branch entry point.

Earlier v112 cold-start and source-reconciliation findings remain historical evidence, not automatically open or resolved v116 defects. Reproduce them on v116 before assigning their status.

## Cleanup boundary

Only the root README, this handoff and the repository organization guide are changed by this cleanup. No HTML, gameplay, test implementation, baseline hash record, old checkpoint, branch setting or release tag is changed. No branch is deleted or merged.

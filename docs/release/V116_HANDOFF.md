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

The test was inspected, not run during this cleanup. Its existence alone does not prove the exact uploaded HTML passes it. It hard-codes `/home/ubuntu/gcc-work/GCC_v116_release.html`, an output directory and `/usr/bin/chromium`; the uploaded release has a different filename. Make the input/output/browser paths configurable before documenting a portable command.

The final assertion compares whole result dictionaries from separate new careers. It does not by itself establish controlled tactical causality. A stronger follow-up should compare identical fixtures and random conditions, varying only the plan, and cover persistence, replay/playback consistency, default behaviour and invalid/legacy saves.

## Next work

1. Preserve the exact uploaded HTML and establish a standalone checksum.
2. Obtain the complete implementation plan and perfection/captaincy evidence for this exact artifact.
3. Make the captaincy test portable and run it against the uploaded release in a disposable career; never reset a real user save for QA.
4. Verify captaincy selection persistence before a match, completed-result metadata after reload, playback consistency and bounded simulation effects under controlled conditions.
5. Continue visual review across recruitment, draft, XI, match preview/live/results, management, trades, finals and archive at desktop and mobile widths, including enlarged text. Fix concrete issues rather than adding blanket decorative layers.
6. Reconcile the uploaded release with maintained source and prove the documented build reproduces the intended artifact before any source-based release promotion.
7. Review a deliberate promotion into `main`; only then create an agreed release/tag and update the default-branch entry point.

Earlier v112 cold-start and source-reconciliation findings remain historical evidence, not automatically open or resolved v116 defects. Reproduce them on v116 before assigning their status.

## Cleanup boundary

Only the root README, this handoff and the repository organization guide are changed by this cleanup. No HTML, gameplay, test implementation, baseline hash record, old checkpoint, branch setting or release tag is changed. No branch is deleted or merged.

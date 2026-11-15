# Shared button hover consistency review

Delivered/opened file remains GCC_v116_Preview_Header_Review.html, SHA-25618e0cb75b25cfc5298419009edd29525c04e3a26d7e4f98405a8ea5856aa6adc. No new user download this pass.

Staged source candidate GCC_v116_Button_Motion_Candidate.html: SHA-256bef10eecd83346a9cc4d2961a51d670c20f342fe4a6ae4f90d9cd2b2ab052fef,6,665,976bytes. Review only, unpromoted; awaiting inclusion in next combined playable review.

## Finding and source ownership

Current shared main/dialog button foundations in owner31 use matching font/weight/line-height/padding/radius/min-height. Context-specific sizes and distinct secondary fills remain intentional and were not blanket-restyled. No declaration consolidation was attempted merely because multiple definitions exist.

Actual discrepancy: main primary-hover transform none versus later dialog primary-hover translateY(-2px)!important. Baseline native run43699097625 intentionally reproduced eight stationary-hover assertion failures: Match preview primary moves -2px at1440/768/390/320 in BOTH normal and reduced-motion modes; Matchday stays stationary in all eight cases. The dialog primary selector is more specific than the later reduced-motion generic button selector, so the reduced-motion override does not win. This corrects the initial assumption that reduced motion suppressed the lift.

Single source declaration changed in existing CSS31: dialog primary hover transform none!important. Brightness/filter feedback, labels, dimensions, typography, radius, commands and enabled states retained. All22runtime bodies byte-identical to the delivered Preview Header Review. No new stylesheet or engine/save change.

## Verification

Final read-only native run43699334443 PASS:32hover observations,32paired screen states plus2synthetic long-name layout probes, zero failures. Verified scope: two primary-button surfaces × four widths × two motion modes × before/after =32hover observations. Existing32paired screen states and two synthetic long-name layout probes retained. Exact candidate hash enforced; unchanged hover feedback/style/actions asserted. All16candidate hover cases measured zero horizontal/vertical movement. Final artifact and baseline reproduction reports retained beside this document; screenshots in workflow artifacts subject to retention. No match played; inspection/close preserves disposable career state. Baseline failure is expected reproduction evidence, not a claim that a release was accepted with failing checks.

Frozen v116/main and Cline performance branch untouched. Canonical source on work/v116-candidate-acceptance includes this staged correction; user's opened build remains18e0cb75. Broader button/cascade/accessibility certification is not claimed.

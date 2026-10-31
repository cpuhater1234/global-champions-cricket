# Build21 rendered review and correction

Connected Chrome: local GCC_v8_Playtest_21.html, Gloucestershire2011 Round8.

## Verified improvements

Campaign context appears above fixture: position4/8, record4W3L,7of14played,NRR-0.08, formWLLWL (rounds3–7). Main Watch match control occupies342–388px at1150px width, compared with the baseline near the viewport's lower edge. Actual baseline after continuation measured1150x722; standard666px target also used. At390x844, Watch match is436–482px, height46px; page scroll width375px so no horizontal overflow. At320px, page width305px and no visible-content element overflow was detected.

Symonds row shows both the five-innings bowling concern and two full opportunities remaining. Haddin and Goodwin rows show seven fit matches without selection. Latest result and supporting information are bounded panels. Review XI and Return to matchday route correctly. Swapped fit Ray Price for Andrew Hall in the XI through ordinary UI; spin-cover guidance updates0to1 and removes the bench recommendation. No match played in this review; browser left at Round8 matchday with Price selected. Viewport reset before finishing.

## Remaining failures observed

1. Tactical warning still appears at640–706px desktop and813px mobile, after artwork and club cards. It can be missed before choosing Watch match.
2. Mobile venue image is forced into an80px column by an older important rule, while its inner image gets110px height and parent gets88px height. Computed styles confirmed the conflict. This is inconsistent sizing, not intended new layout.
3. Squad sidebar remains503px tall. Header82px plus14px bottom margin, row heights105/90/90, disclosure72px. Cause text11px is too small for a decision-heavy game. Several newer compact header rules lose to more specific earlier selectors.

## Source correction

Conditions move immediately after match controls and before venue artwork. An opponent line next to controls supplies fixture identity before the player acts. Home/away club cards retain home-first ordering. Mobile venue uses a consistent80px square thumbnail with natural parent height; remove the superseded conflicting media rule rather than layering another mismatched rule.

Squad cause text becomes12px, names15px, status13px and review buttons12px with44px height. Scoped selectors now match the existing specificity. Remove wasted header margins and nested disclosure padding, preserving all cause/commitment text and all additional decision rows. No engine, controller, save, player data or match rules changed.

New structural contracts require conditions before artwork and opponent identity beside controls. General home-first test was corrected to inspect the actual club-card container, since the new opponent caption can legitimately name the away opponent first. This avoids testing incidental text order rather than home/away visual order.

Rendered verification of these corrections remains pending in Build22. Expected geometry is not asserted as observed fact. Next checks: desktop666px target,390and320mobile widths, long opponent/ground names, open disclosure and keyboard focus. Latest no-backup UI constraint remains preserved.

Independent source re-review found no concrete new regressions or cascade errors in the correction. All20inline scripts parse; new hierarchy contracts and existing decision UI contracts pass. Build22 parity confirms19scripts byte-identical to Build21, with only coordinated presentation module18 changed. This evidence does not replace the pending browser rendering check.

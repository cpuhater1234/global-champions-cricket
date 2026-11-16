# Live draft spacing audit, 16 November 2026

Opened Rating/HUD candidate2eddc625a42583fb8d83957dd215e16791f302742c0f5d9f26db9e052102af79,6,683,716bytes. Initial read-only native run43783066575 checks an actual fresh foundation draft at0/5/11 legal user selections, five role filters, four widths and mobile squad views. No fabricated team state or connected user career. Source/game unchanged for this audit.

Active renderer: scripts28 card()/poolBoard() with numeric2/3-attribute tiles. The needs strip is separately injected into the main draft companion by scripts38 using its coverage meters; CSS37 gives it an outer tinted box plus filled readiness pills and smaller mobile type. It is not part of the card abilitybar renderer. Mobile squad content comes from draftCompanion(false), a distinct layout from the main companion.

Checks include filter caption widths/44px controls, role/card attribute counts/labels/figures, empty-filter states, document overflow, needs-strip containment and agreement with role coverage, selected-player counts/control heights in mobile squad, and preservation of roster/seed/draft order/picks/pick cursor while filtering/viewing reports. Visual density/spacing is judged from actual captures, not selector counts or a functional PASS alone. Initial run PASS66states, zero failures. Captures at5selections/1440 and11selections/320 plus11-player mobile squad inspected. Cards use readable numeric tiles; filters preserve full captions and44px controls; needs counters agree with live coverage through0/5/11legal selections. This does not constitute overall visual approval. The confirmed visual outlier is the extra tinted, orange-edged needs box and five outlined/filled readiness pills:86.89px tall at1440/768,77.95px at320, with10.56px phone text.

Frozen v116/main/perf untouched. User-opened Rating/HUD remains rollback; no new build/download from an audit alone.

## Bounded needs-strip correction

Candidatefd2391fdcaed0062c37b6464b67a004e6eb86dfb6708d6f9fb57a134bb6eb6ff (6,683,588bytes) changes only existing CSS37 needs-strip rules. Remove the enclosing tint/orange edge/rounded frame and individual pill fill/borders; retain a quiet bottom separator and consistent12px body-font counters, tabular figures and8×12px gaps (8×10px below700px). Preserve all five labels/counts/classes/tooltips and their readiness text colours. Replace the old smaller mobile override in its owner rather than append a competing patch. No cards/filters/role-meter geometry or scripts38 insertion logic changed.

Exact guard PASS: only CSS37 differs from opened2eddc6;22scripts/all remaining bytes identical. Engine/source/controller pins and negative integrity self-tests PASS. Final run pending. Paired gate covers66before/66after states, exact role/attribute/needs/filter/mobile data, needs colours/tooltips and actual draft state/seed/order/picks/cursor checkpoint hashes. No change to the rules, CPU picks, needs thresholds or player ratings.

The first visible mobile card starts low because the existing full-caption filters stack below the header. This remains a distinct structural density question, not permission to reintroduce clipped half-width select captions. Existing role-coverage meters count squad options out of15; they are secondary count meters, not player-ability bars out of99. No universal track-height patch is applied to them.

Initial artifact14189740574 ZIP SHA-2565b484133d553abae8bbee3f30d1a0e51d5eedca656684ec62b0c1140b29f16a0 verified before extraction. Native Chromium/disposable foundation draft only; no broad all-browser/full-career acceptance claim.

## Diagnostic trial

Run43783786692: both66-state native probes and actual draft checkpoint hashes passed, but the comparison rejected firsta1d534 candidate because the larger12px text wrapped MIX at320px: needs height82.59px versus77.95px baseline. Recorded widths showed five counters require191px plus48px gaps=239px, while the320px strip has234px content width. Existing mobile gap now10px instead of12px: total231px; keep12px text and outer padding unchanged. This is a responsive fit correction, not a relaxed acceptance assertion. Final exact run pending.

## Final exact acceptance

Run43784215600 PASS132states (66paired layouts), zero failures. Finalfd2391 candidate keeps all role/card metrics/actions, filters/empty states, needs text/classes/tooltips/colours, coverage and mobile squad text identical. Actual draft checkpoint hashes for0/5/11 selections match baseline, including roster/seed/order/picks/cursor and compared dynasty. Viewing/filtering reports also preserves each checkpoint. Needs height86.89→49.80px at1440 (37.09px saved),86.89→82.59px at768 (4.30px),77.95→49.80px at320 (28.16px). At390 the12px text adds3.42px versus the old10.56px type; no clipping or material expansion. All66native states retain44px action targets and correct role-specific2/3numeric attributes.

Final artifact14189004792 ZIP SHA-256998b17c3699052fbd8d639caf883071141e8eecdeb0b31fcba1f2a728415082a verified before extraction. Final desktop5-pick capture inspected; phone needs-strip fit is verified by native geometry (the top-of-page phone capture does not itself show the below-fold companion). Candidate source guard and engine pins PASS. No new standalone download; stage this with the next focused pass. Main/frozen v116/perf untouched, unpromoted.

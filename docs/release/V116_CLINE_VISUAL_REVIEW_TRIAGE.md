# Cline visual review triage, 15 November 2026

User supplied visual plan from survey of v8/ui/*.css and GCC_v116_release_optimized.html. Review is useful as a list of concerns, but those are historical source/output, not current canonical candidate. Active maintained candidate is v116/canonical on work/v116-candidate-acceptance; local working mirror qa/workspaces/career-integrated/canonical. Do not run older v8 build pipeline or replace current candidate with optimized frozen HTML.

## Keep and verify

Shared button ownership/typography consistency deserves a separate component-level cascade review. Multiple definitions alone do not make CSS nondeterministic: inspect actual matched/winning declarations in each active context. Preserve tested target heights, contrast, keyboard focus and action hierarchy while removing actual redundancies at their owners. Avoid another global override layer.

## Already present in current candidate

Dark colour scheme: existing CSS09 root. Focus-visible: existing CSS09/10/31, including current shared cyan3px outline and guide-specific focus treatment. Proposed blanket Phase1 is therefore not a verified missing-feature fix. Actual focus visibility/clipping still needs context-specific testing; do not equate source presence with universal certification.

## Do not apply as a blanket patch

Changes to corner radius7→8 or10→12 do not establish cleaner layout. Added3–5px button shadows, panel shadows, decorative gradient lines and uppercase primary buttons work against the established quieter UI direction and may recreate wrapping/density issues. overflow:hidden on control containers can clip focus rings or content. Global focus outline suppression is not a zero-risk change. Keep visible keyboard focus and test actual controls.

Career intro/clubcover selectors cited by the plan are not found in current active renderers28/29. Their legacy presence is not proof of an active visual defect. Do not restyle unused or overridden markup as if it were the playable source.

The ongoing phone preview-header pass is independently grounded in exact current native captures, not implementation of the older blanket plan. Cline performance branch remains untouched. No direct message was sent to Cline.

## Follow-up clarification supplied by user

Cline subsequently identified the correct canonical owner10 narrow preview selectors, the intentional94px reduction and the separation between perf/optimized-assets-v116 and work/v116-candidate-acceptance. This corrects its original careersteps attribution. The current playable file contains zero v8/ui/ references. Further live UI review should use canonical source/current embedded candidate. Historical v8/workspace cleanup is separate maintenance; it is not required to explain current match preview rendering. No broad historical CSS patch was applied.

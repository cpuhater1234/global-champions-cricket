# Squad-management row rhythm review, 16 November 2026

Opened rollback: GCC_v116_Rating_HUD_Review.html, SHA-2562eddc625a42583fb8d83957dd215e16791f302742c0f5d9f26db9e052102af79,6,683,716bytes. Immediate staged baselinefd2391fdcaed0062c37b6464b67a004e6eb86dfb6708d6f9fb57a134bb6eb6ff includes the verified draft-needs correction. Candidatea196081b22960520c4c8f23c7053828198c2a2a3b693bba8dde3a6999dc6c13a,6,683,580bytes. Main/frozen v116/perf untouched; review only, no stable promotion.

## Reproduced current behavior

Read-only run43786418751 passed28 states: five offseason role filters and XI/bench views at1440/768/390/320. Actual trade/release previews opened and closed without changing the complete compared career; XI keyboard report opening/Escape restored row focus. Original geometry was contained, so this is not reported as a clipping defect.

Native management images show an old gradient/role-edge card treatment and display-font names/boxed ratings. At320px a fixed name flex basis wraps the rating below the name; two8rem-basis preview actions stack separately. First management row311.94px at320,201.98at390,149.11at768 and170.70at1440. My XI/bench rows already held up in this bounded inspection and were left alone.

## Existing-owner correction

CSS01 management-action component becomes a two-column grid; remove its two obsolete responsive child flex-basis declarations. Existing responsive row layout stays intact.

CSS31's three general app button base/secondary/hover selectors defer only to g8manageactions buttons. Other buttons, menus, dialogs and XI controls keep their existing contracts.

CSS32's existing management owner now provides neutral workspace/rows with simple separators; no role-coloured row frames or hover lift. Grid-align the name and22px tabular rating, use16px body-font names and13px role details, retain statuses/concerns/promises and scout cue. Secondary actions use14px type,44px targets and quiet normal surfaces; release preview retains warm text, while actual confirmation controls are outside this scope. Short-HUD/reduced-motion suffix was compared byte-for-byte with the prior owner and is unchanged.

No new stylesheet, controller or rule change. Exact guard versusfd2391: CSS01/31/32 only,22scripts/all remaining bytes identical. Direct guard versus opened2edd: only existing CSS01/31/32/37 differ, including the previous needs-strip pass;22scripts/all other bytes identical and17style blocks retained. Critical source/controller pins and negative self-tests PASS.

## Focused exact acceptance

Initial paired run43787960660 rejected a QA capture omission: the assertion referenced radius but paint() had not recorded borderRadius. Actual rendered data, alignment,44px targets, previews and career preservation passed. Test capture fixed without editing game CSS or changing candidatea196081. Do not call that rejected run completed acceptance.

Final run43838294949 PASS56states (28paired layouts), zero failures. Names, roles, ratings, statuses, action text/arguments/ARIA/disabled flags and preview labels match baseline. Every management row is shorter. First-row heights:170.70→131.75px at1440;149.11→131.75at768;201.98→184.63at390;311.94→184.63at320 (127.31px saved). Name/rating stay aligned; preview actions remain44px with14px text. All XI/bench row heights and control widths/heights/fonts match baseline exactly. Actual trade/release previews preserve the full compared career; XI Enter opens a real profile, Escape restores row focus; both complete compared careers remain unchanged.

Final artifact14212735791 ZIP SHA-256862551cee6cee055a44fd8a387e9d7a8e094b8204584c80b79c2f15b9d87d613 verified before extraction. Desktop,320px and long-row320px captures inspected; long names and amber concerns remain readable. Native Chromium only, real2010 offseason/active-career fixtures. No actual trade/release was confirmed in this pass; no all-browser, storage-failure, speech or full-career certification.

## Delivered combined review

GCC_v116_Squad_Rhythm_Review.html, exacta196081 hash above,6,683,580bytes; libfile_9795e4bb025481918e41f0f03ac8536b. Includes the separately verified quieter draft-needs strip. Retain opened Rating/HUD2edd as rollback; user has not confirmed downloading/opening the new file. Frozen v116/main/perf untouched, unpromoted.

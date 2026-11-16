# Live rating-component inventory, 16 November 2026

This is a source-route inventory, not a claim of whole-game visual acceptance. It distinguishes actual UI routes from retained legacy helpers before applying shared styling.

| Surface | Actual implementation | Current evidence / decision |
|---|---|---|
| Player Overview / Attributes | scripts28 profile wrapper, scripts21 abilityRead, scripts22 full skills; CSS10 dossier scope | Native32 paired states passed in43776486479.10px full-width tracks, label/value above, semantic colours and figures retained. |
| Injury cover | scripts29 cover command calls scripts21 playerCard with draft=false; two abilityRead bars per candidate | Live compact three-column label/track/value rows. Existing CSS10 row22px minimum,10px gaps,6px tracks. One existing height declaration changes to10px. Native run43779046325 PASS8 paired states/four widths, all18options, exact colours/fills/labels, unchanged card heights and actual signing/XI preservation. |
| Active draft / arrivals | scripts28 card()/poolBoard()/arrivalCard() overrides older scripts27 poolBoard | Numeric gccuiPlayerSkills tiles, with2attributes for keepers and3 for other roles; not the legacy g8abilitybar UI. Do not add bars to these cards under a blanket consistency patch. Current density still needs a bounded rendered check before new edits. |
| Trade player summaries | scripts29 trade player markup, existing .g8tradeplayer .g8abilitybars display:none in CSS01 | Legacy ability-bar markup is hidden. Modern name/role/age/facts summaries were separately reviewed. Do not revive hidden bars or claim a broad abilitybar override improves them. |
| Old player comparison | scripts23 playerComparison()/comparisonCandidates() | No current compare command binding in scripts29, or calls to these helpers from current renderers. Leave retained code intact; not live coverage. |
| XI / manage rows | scripts28 roster/selection renderers | Numeric overall/role data, management tags and explicit actions; not all are abilitybar consumers. Inspect live rows for rhythm/secondary-action hierarchy separately. |
| Team phase-rating breakdown | scripts29 rating command, scripts22 phaseOptions | Live info dialog with top3 eligible options and shared abilityRead. A real remaining bar consumer; needs native rendered check, not assumption that every remaining thin-looking track belongs to draft/trade. |

Shared qualities to preserve across real components: readable labels and figures, tabular/right-aligned numbers where applicable, semantic rating colours, known fill percentages,44px actions, and no clipping. Shared language does not require identical geometry or introducing bars where the current design deliberately uses numeric tiles.

No extra stylesheet, universal20px values, forced uppercase labels, gradient replacement of rating colours, or boxed category padding admitted from outside review. Frozen v116/main/perf remain untouched. The separate repaired statistics helper is not a completed gameplay authenticity audit.

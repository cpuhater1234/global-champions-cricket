# Independent read-only review

Reviewed published v79 baseline SHA256 `696bdfea1a5d177d144a652316c0d39e1d34a1522df990ef32852e45e84d9097` and candidate `5c4b334e5e472253772286a909069120ce44f0d72224905004a46e60010175e4`. Independently confirmed 20 script bodies, only indexes 10 and 19 changed. Reviewed five string patches, CSS, relevant command/storage/table engine code and existing regression evidence. Did not rerun expensive career simulations or modify product files.

## Critical

None identified in reviewed changes.

## Important

1. **Source update is not idempotent and already duplicated Compare.** `qa/bulletproof-20261027/build.py:35–36`, patch anchor at lines 11–13; `v8/ui/controller.js:96`. The new Compare replacement ends with its old `${canSelect?btn(...)` anchor. Consequently, even an already patched source still has exactly one old anchor and passes the assertion; `s.replace(old,new)` adds another Compare expression on every `--update-sources` run. Source currently contains two consecutive identical Compare buttons, whereas reviewed candidate contains exactly one. Reproduction without mutation: count the Compare condition in source versus candidate (2 versus 1), or evaluate applying this replacement twice to a string. Fix by checking for an already present new replacement before replacing old text, removing existing duplicate, and verifying repeated source-update/build runs preserve bytes. This is source/rebuild correctness; it does not show duplicate Compare in current reviewed HTML. **Resolved by parent after review:** duplicate removed, update now skips an existing replacement, and repeated-update byte equality is recorded in `core/source-idempotence.json`. Candidate hash unchanged at that point.

## Minor

1. **Some retained evidence and prose describe older candidates.** `browser/compare-regression-green.json` records SHA `e34fc6…`; snake GREEN records `e94479…`; `saves/table-validation-regression-results.json` and `saves/REPORT.md:18` identify `726d8c…` and a three-patch build. These support earlier iterations only. Final results must record current candidate hash, and report prose should identify superseded evidence. Parent reports final reruns are in progress; this is not a product failure.

## Assessment and limits

Table checks match actual engine accounting (`v8/engine/foundation.js:2733–2740`): regular season has 14 games, each result increments one win and loss and awards two points; NRR remains permitted to be negative. The added guard affects draft clicks only and retains keyboard clicks (detail zero); it addresses the reproduced second native click on a newly rendered snake-boundary pick. It is not a general transaction lock or proof against every input modality.

Backup handling continues to validate before opening and uses existing storage conflict checks. The new `save()` after presentation restore updates the visible warning and explicit session-only feedback when persistence fails; it does not introduce a remote write or data transmission. Returning true from resume when live restore succeeds but persistence fails is consistent with this explicit session-only behavior. Existing quota evidence distinguishes healthy persistence from a playable imported session and preservation of prior stored bytes.

The CSS adds responsive layout only; the media queries and native flex/overflow properties are compatible with the Chromium evidence. Root font-size enlargement is not physical-device testing, browser zoom, or screen-reader verification. Existing stale-hash runs and initial harness assumptions must not be presented as current-candidate product failures or universal passes. No finite QA suite proves absence of all possible bugs.

Parent subsequently identified a 768px/32px-font navigation wrapping issue and is preparing a separate CSS fix and native regression. This review is scoped to the candidate hash above; it does not certify the pending CSS revision.

## Final CSS follow-up

Reviewed final candidate SHA256 `c7ba52edcbee16d66b8651362a61939cd6c0507382b6bea49f81b51869b1bafb`. Independently read and hashed current candidate, confirmed script indexes 10 and 19 remain the only bodies differing from baseline, and inspected final CSS against base modal/header styles. No new Important fix identified.

The navigation child `flex:0 0 auto` and `white-space:nowrap` preserve whole labels while the existing parent supplies horizontal scrolling. The small-screen generic modal header now uses one column, reserves close-button space in its eyebrow, and positions the close control within the existing sticky positioned header. More specific existing special-prompt selectors continue to take precedence. These changes affect layout, with no storage or gameplay changes. This remains a Chromium/layout assessment, not a complete browser or assistive-technology certification.

`browser/header-regression-nav-red.json` reproduces 768px/32px-font fragmented navigation on prior hash `5c4b…`; `browser/compare-regression-modal-red.json` reproduces fragmented Compare title at 320px/32px on that same prior hash. Current `browser/header-regression-final.json` and `browser/compare-regression-final.json` both identify exact final hash `c7ba52…` and report pass. These are matched final-candidate evidence for the corresponding layouts and comparison interaction. `core/source-idempotence.json` records two repeated updates leaving source bytes unchanged and controller matching embedded code. Older GREEN files remain historical evidence and should not be relabeled as current runs.

No unrelated core tests were rerun in this follow-up. Broader final-save/native/career suites must be reported from their own exact-hash artifacts once available; this reviewer does not infer their completion from the CSS-specific GREEN results.

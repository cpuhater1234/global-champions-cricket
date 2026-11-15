# Trade review gate, 15 November 2026

Candidate branch only. Staged base e58d2b82eb88f5e118b0c676365c9d1f9a9953c27b60c3643fc0d889400dc171; next candidate 4410cf1969981e0ac7d8fe00c452628d63fc5b307928051e7c4c5c12f9ad5098 (6,667,664 bytes). Opened/downloaded a4743f84 Matchday Details build remains unchanged. No new standalone download or promotion.

## Confirmed issue and isolated correction

An actual 2009 checkpoint legally progressed to its 2010 market displayed a last-wicketkeeper rejection while enabling Confirm and send offer. Core `packageProblem` already rejects that package. The controller review button only checked syntactic package validity/budget, so its availability did not reflect the displayed rejection.

Owner29 now disables confirmation when the existing `read.packageProblem(deal)` returns a reason. Direct confirm dispatch also checks that same reason before clearing the review, so a blocked attempt leaves the review available for editing. Review remains available to explain the problem; legal offers keep their existing route and outcomes. No engine trade rule, valuation, counter or simulation changed. Owner26 has one contextual copy correction: A previous promise was not kept.

`qa/v116_trade_review_replacements.json` records all three exact replacements. The configurable source guard proves every other HTML byte identical to e58d. Owner26/29 pins were explicitly reviewed and updated; the other nine critical-owner pins remain unchanged.

## Verification

Regression first failed against e58d because a blocked package offered enabled confirmation. Updated VM regression passes: real last-keeper case disabled, direct dispatch rejects with actual engine reason, full career state unchanged, Edit retains chosen players; legal Brett Lee / Wayne Parnell exchange is still accepted with identical final markup and complete dynasty state against e58d. VM test seeds Math.random to retain transaction sequence identity between independent runs.

Pins and three mutation probes pass. Management kept/broken/rejection differential passes. Native CI run43705287128 PASS:24 paired states at1440/768/390/320 across blocked review, legal review and accepted result, zero failures. Only blocked confirmation becomes disabled; other actions and rendered review/result text are unchanged. Tab reaches Edit trade for a blocked package and Confirm for a legal one; focused controls remain fully visible with focus styling. No horizontal overflow or captured sub-44px controls. Native direct blocked dispatch leaves state unchanged; legal accepted trade produces identical complete dynasty state against e58d. Artifact14158442184 retains screenshot evidence subject to retention. The320px blocked/keyboard, legal/keyboard and completed viewports were inspected; long review content scrolls within its dialog, so one viewport does not show its whole content. Broad previously closed season/storage acceptance was not repeated for these bounded controller/presentation changes.

Commands from repo root:

```sh
GCC8_TEST_BUILD=candidate.html GCC8_BASELINE_BUILD=baseline.html node qa/v116_trade_review_gate.mjs
python qa/v116_copy_source_guard.py --before baseline.html --after candidate.html --replacements qa/v116_trade_review_replacements.json
```

The checkpoint defaults to `qa/results/whole-ui-career/checkpoint-2009.json`; override `GCC8_TRADE_CHECKPOINT` when using another retained copy of that exact fixture.

## Terminology audit scope

Current runtime owners were searched for commitments/campaign/assets/resources. Signing commitments are league-entry decisions and remain appropriate; internal campaign/resource/CSS identifiers remain stable; finals campaign is normal cricket usage. Only the confirmed management promise inconsistency changed here. This is not whole-game language or visual certification.

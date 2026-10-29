# Cricket Career Story Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Ship a complete, persistent selection-pressure story connected to a compact cricket matchday.
**Architecture:** Pure deterministic event functions plus a thin adapter reading scorecards and the existing XI. Journal events are saved with dynasty state through existing save machinery; presentation is read-only.
**Tech Stack:** Existing standalone HTML/CSS/JS, Node unit tests, native Chromium.
**Spec:** docs/superpowers/specs/2026-10-29-career-story-design.md

## Global Constraints
- Existing match calculation, cricket RNG, injury/form rules and protected baseline stay unchanged.
- Work from playable SHA 8b7e386590c49f3bd64eb15b13a20a4f5d14f5505a2354e56725233cc1eb2b84.
- Only one first-slice arc; no claims of the full relationship/promise system being implemented.

## Review Focus
- Not-out/DNB innings must not generate false failure stories.
- Rendering, replays and repeated actions must not duplicate events or reveal results early.
- Missing/malformed journals and old saves must remain usable.
- Other careers/seasons and retired/traded players must not inherit active concerns.
- Selection changes and result facts must agree; no fictional motive or causality.

### Task 1: Story event functions
Files: v8/ui/story.js; qa/career-story-20261029/unit.cjs.
Interfaces: detect(input)->arc|null; resolve(arc,fixture)->event; record(journal,event)->journal; clean(journal,identity)->journal.
- [ ] Write/run failing tests for low innings, healthy same-role challenger, DNB/not-out exclusions, outcomes, deduplication, bounds and identity isolation.
- [ ] Implement pure functions; run unit suite.

### Task 2: Career integration
Files: v8/ui/story.js adapter; controller.js match action; screens.js matchday/team/result.
Interfaces: storyPreview(), storyBefore(), storyAfter(context,result), storyPanel(), storyResult(result), storyLive().
- [ ] Test live adapter and save/reload with a real fixture; missing feature must fail.
- [ ] Capture actual selection before simulation, record one event afterwards, preserve existing save/skip/replay paths.
- [ ] Run browser checks for persistence, fact accuracy and no replay mutations.

### Task 3: Matchday and release
Files: v8/ui/story.css; screens.js; candidate builder; QA README.
- [ ] Reproduce old 647px mobile fixture and define compact/readable layout checks.
- [ ] Replace fixture presentation, show ground identity and attach relevant story.
- [ ] Inspect mobile/desktop screenshots; test 320/390/768/1440 widths with 16/24/32px root text; all scripts syntax; unchanged engine hashes.
- [ ] Fresh whole-change review; fix important findings with tests. Save playable, sync sources/aliases/QA to active GitHub branch, verify hashes.

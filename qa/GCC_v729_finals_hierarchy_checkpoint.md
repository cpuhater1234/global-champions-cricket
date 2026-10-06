# GCC v7.2.9 Finals Hierarchy Checkpoint

## Status

Accepted surgical Finals presentation hardening on top of v7.2.8.

## Source of truth

- Input: `game/global_champions_cricket_v7_2_8_season_result_hierarchy.html`
- Output: `game/global_champions_cricket_v7_2_9_finals_hierarchy.html`
- v7.2.8 SHA-256: `8840a74bf804e6f06cf2efe9cf0cde3544d7d09509cafbcc766e52b95f10cd2f`
- v7.2.9 SHA-256: `cab3b93391f1e526281ea77ac65e2088938339336db122cb997e35b06d364eb8`
- Passing Finals QA run: `37406759338`

Rebuild and verify:

```bash
python qa/rebuild_v729.py
python qa/check_v729_finals.py
node --experimental-websocket qa/browser_v729_postseason_journey.mjs
```

## Problem fixed

The Finals screen already had a persistent hierarchy for each knockout state, but the presentation layer also added transient bulletins that repeated the same information.

Examples found in v7.2.8:

- semi-final result: floating `Grand Final bound` over a page already saying `One match from the title` and `You are through`
- Grand Final reveal: floating `Grand Final set` over a page already headed `The Grand Final`
- Grand Final loss: floating loss bulletin over the completed-finals result
- a stale Grand Final-set bulletin could still be visible when the championship completion screen appeared

## Surgical change

v7.2.9 removes transient Finals bulletins for:

- semi-final result
- Grand Final pairing reveal
- Grand Final loss

Finals transitions hard-clear earlier feedback before rendering the next persistent state.

One cinematic exception remains intentionally:

- winning the title triggers a short `GLOBAL CHAMPIONS` ceremony moment

That ceremony clears back to the normal completed-finals page.

## Scope protection

The guardrail confirms:

- exact v7.2.8 source SHA
- exact v7.2.9 target SHA
- non-presentation script blocks unchanged
- Finals simulation and match data logic unchanged
- JavaScript syntax clean

No intentional change to:

- knockout simulation
- scorecards
- player statistics
- regular-season standings
- qualification
- Grand Final pairing logic
- save/dynasty systems

## Browser acceptance

The full journey passed through:

- regular season
- Finals entry
- semi-final
- semi-final scorecard
- Grand Final reveal
- Grand Final
- championship completion
- Season Review
- mobile Season Review

Verified hierarchy:

- semi-final result has no floating duplicate
- Grand Final reveal has no floating duplicate
- title loss has no floating duplicate
- title win has exactly one championship ceremony
- championship ceremony settles to a clean steady state
- no tested page-level horizontal overflow

## Acceptance decision

v7.2.9 Finals Hierarchy is accepted at:

`cab3b93391f1e526281ea77ac65e2088938339336db122cb997e35b06d364eb8`

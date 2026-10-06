# GCC v7.2.8 Season Result Hierarchy Checkpoint

## Status

Accepted surgical Season presentation hardening on top of authoritative v7.2.7.

## Source of truth

- Repository: `cpuhater1234/global-champions-cricket`
- Branch: `work/v7.2-structural-rebuild`
- Input: `game/global_champions_cricket_v7_2_7_team_room_transition.html`
- Output: `game/global_champions_cricket_v7_2_8_season_result_hierarchy.html`
- v7.2.7 SHA-256: `05b88d1158efa063a90c9d7dbadfbac5278de08f16129ffe7a419a74f8b7e58a`
- v7.2.8 SHA-256: `8840a74bf804e6f06cf2efe9cf0cde3544d7d09509cafbcc766e52b95f10cd2f`
- Passing v7.2.8 Season QA run: `37405766441`
- Passing branch head before checkpoint: `7091c81ffa7571aee2507d603d943772621fd2c9`

Rebuild and verify:

```bash
python qa/rebuild_v728.py
python qa/check_v728_season.py
node --experimental-websocket qa/browser_v728_season_journey.mjs
```

## Problem fixed

The Season page already contains a persistent match-result story with:

- round and venue
- score
- margin
- contextual match read
- best performers
- next fixture
- scorecard access

The presentation layer was simultaneously adding a floating win/loss bulletin containing the same result.

That duplicated the most important information on the screen. On mobile the floating result could obscure the Season heading and intro.

The Season-entry `The season begins` bulletin similarly duplicated the Round 1 hierarchy already owned by the Season screen.

## Surgical change

### Season entry

`startSeason` now hard-clears XI feedback at the transition and allows the Season page to own the Round 1 state.

It no longer adds a redundant floating `The season begins` moment.

### Match results

`resultMoment(res)` no longer generates a second floating win/loss bulletin.

It still retains:

- persistent match-story rendering
- match-story landing animation
- ladder movement animation

The result card is now the single source of truth for the round outcome.

## Scope protection

The guardrail confirms all non-presentation script blocks remain byte-identical.

No intentional change to:

- match simulation
- innings logic
- schedule
- standings
- NRR
- player statistics
- scorecards
- ladder calculations
- finals qualification
- season results
- dynasty/save logic

## Browser acceptance

The full browser journey passed from foundation setup through all 14 regular-season rounds.

Verified:

- clean Round 1 Season entry
- no floating Season-entry bulletin
- Round 1 match story owns the result
- Round 1 scorecard opens with two innings, batting and bowling tables
- Round 5 accumulated state
- Fixtures view
- Ladder view
- Analysis view
- Players view
- Round 5 mobile layout
- Round 10 run-home state
- Round 14 regular-season completion and handoff
- no page/runtime/console errors
- no tested page-level horizontal overflow

## Visual acceptance

### Round 1

The Season heading is unobstructed and the persistent story is the only result presentation.

### Mobile Round 5

The screen presents, in order:

1. Season stage
2. primary action
3. latest match result
4. next fixture
5. record / position / NRR
6. Season navigation and deeper context

No floating result covers the heading.

### Round 10

`The run home` state remains readable with a single match story, current position and finals-line ladder context.

### Round 14

`Regular season complete`, the final match story, final record/position and `View Season Review` handoff are distinct and readable.

## Acceptance decision

v7.2.8 Season Result Hierarchy is accepted at SHA:

`8840a74bf804e6f06cf2efe9cf0cde3544d7d09509cafbcc766e52b95f10cd2f`

The checkpoint is authoritative once this checkpointed branch head re-passes the permanent GitHub QA gates.

# GCC v7.2.4 Signing Week Structural Checkpoint

## Status

Fifth structural v7.2 checkpoint. Signing Week has been rebuilt as a focused live process rather than a dense status dashboard, while preserving the existing recruitment outcome logic.

## Source of truth

- Repository: `cpuhater1234/global-champions-cricket`
- Branch: `work/v7.2-structural-rebuild`
- Input: `game/global_champions_cricket_v7_2_3_draft_structure.html`
- Output: `game/global_champions_cricket_v7_2_4_signing_week_structure.html`
- v7.2.3 SHA-256: `ff2c6bd7c351d2f709f6952c1faf81a462d700458b4f3b251a71246faf58de32`
- v7.2.4 SHA-256: `477493c2610715ecb474e3042ec1e10ffc5015e202ac754a9f95c891dc7153a3`
- Passing GitHub Actions run: `37399923285`
- Passing branch head before this checkpoint: `2cb27530046d5270eddaeda735b4a92dcdf52154`

Rebuild and verify with:

```bash
python qa/rebuild_v724.py
python qa/check_v724_signing.py
node --experimental-websocket qa/browser_v724_signing.mjs
```

The candidate is reconstructed from v7.2.3 plus:

`qa/patches/v723_to_v724_signing.patch.gz.b64`

The permanent GitHub gate is:

`.github/workflows/v724-signing-qa.yml`

## Structural objective

Signing Week previously behaved like a dashboard for a process the user mostly watches:

- KPI strip
- five day states
- ticker
- current call
- large league feed
- multiple controls

The structural rebuild makes the default screen answer:

1. What day are we on?
2. What is happening right now?
3. What changed recently?
4. When can I move to the draft-order draw?

Deeper league-wide detail remains available deliberately rather than competing with the live stage.

## Structural changes

### One live signing stage by default

The primary view now centres the current signing call and the immediate consequence.

At the unopened state the tested copy reads:

- `NEXT CALL`
- `The first name is waiting`

The draft-order action remains disabled until the player pool is resolved.

### Five-day progress is compact and legible

Signing Week uses a five-pill day progression rather than presenting multiple parallel dashboard elements.

Browser QA verified:

- five day pills
- Day 0/5 opening state
- Days 1, 2, 3, 4 and 5 all observed during the live run
- five completed pills at closure
- Day 5/5 completion state

### Recent consequences are bounded

The default live view surfaces only the latest four signing decisions.

Browser QA verified the completed live view rendered exactly four recent decisions.

### Full league wire is genuinely secondary

The league-wide history is hidden by default behind:

`VIEW FULL SIGNING WIRE`

It returns through:

`BACK TO LIVE WINDOW`

A QA review found that the first v7.2.4 candidate falsely labelled this as the full wire while retaining/rendering only a truncated feed. That candidate was rejected before checkpointing.

The final candidate changes `pushRecruitFeed` only to retain enough presentation history for every player decision plus Signing Week metadata, and `renderRecruitment` renders that retained history in the secondary wire.

The recruitment decision model itself is unchanged.

## Protected code scope

The static guardrail permits changes only to these existing named functions:

- `prepareRecruitment`
- `pushRecruitFeed`
- `renderRecruitment`

and one new UI helper:

- `toggleRecruitWire`

No named recruitment-decision, player-willingness, CPU recruitment, draft, simulation, season or dynasty function was modified.

Protected script blocks remain byte-identical outside the allowed Signing Week presentation block and the UI-version marker.

## Static guardrail results

`qa/check_v724_signing.py` passed against the exact GitHub reconstruction.

It verifies:

- exact v7.2.3 source SHA
- exact v7.2.4 target SHA
- one live Signing Week stage
- five-day progress
- recent-decision panel
- full wire secondary by default
- complete feed retention
- removal of the old recruitment KPI strip
- removal of legacy 22-entry and 60-entry wire truncation
- Pool Locked handoff
- Draw Draft Order CTA
- no duplicate DOM IDs
- nine JavaScript blocks parse
- protected script blocks unchanged
- protected named functions unchanged

Passing CI output recorded:

- source SHA-256 `ff2c6bd7c351d2f709f6952c1faf81a462d700458b4f3b251a71246faf58de32`
- target SHA-256 `477493c2610715ecb474e3042ec1e10ffc5015e202ac754a9f95c891dc7153a3`
- full signing wire retained and secondary by default: yes

## Browser acceptance results

Passing GitHub Actions run: `37399923285`

Environment:

- Google Chrome 154.0.8037.57
- Node 22.23.3

### Desktop opening state, 1440 x 900

Tested state:

- screen: recruit
- universe: 269
- target signed in this run: 169
- summary: `DAY 0/5 · 0 IN · 0 OUT · 269 WAITING`
- progress pills: 5
- live view visible
- full wire hidden
- recent decisions: 0
- draft-order draw disabled
- legacy KPI strips: 0
- page-level horizontal overflow: 0

### Wire toggle

The secondary wire opened deliberately and the live stage hid correctly.

- heading includes `Every call in one place.`
- return action available
- page-level horizontal overflow: 0

### Speed control

The browser test cycled the existing signing speed control to:

`SPEED 4×`

The underlying recruitment sequencing remained functional.

### Full live five-day run

Observed days:

- Day 1
- Day 2
- Day 3
- Day 4
- Day 5

Final pool:

- signed: 169
- target: 169
- declined: 100
- unresolved: 0
- universe: 269

Integrity:

- signed + declined = 269
- decision history entries = 269
- recent decisions rendered in live view = 4
- retained full feed entries = 276
- full wire rendered entries = 276

Completion:

- roll state: `POOL LOCKED`
- summary: `DAY 5/5 · 169 IN · 100 OUT · 0 WAITING`
- completed day pills: 5
- draft-order draw enabled
- desktop horizontal overflow: 0

### Draft-order handoff

After Signing Week closure:

- active screen: `draftDraw`
- draft-order clubs: 8
- handoff passed without runtime errors

### Skip path

A fresh dynasty was tested through `SKIP TO FINAL POOL`.

That run produced:

- target signed: 171
- signed: 171
- declined: 98
- unresolved: 0
- universe: 269
- decision history entries: 269
- retained/rendered wire entries: 276
- draft-order draw enabled

The skip path therefore preserves the same resolved-pool and complete-history guarantees as the live path.

### Mobile, 390 x 844

Opening state:

- five progress pills
- full wire hidden by default
- controls present
- page-level horizontal overflow: 0

Completed full-wire state:

- live view hidden
- full wire visible
- retained feed entries: 276
- rendered wire entries: 276
- decision entries: 269
- universe: 269
- page-level horizontal overflow: 0
- wire-panel horizontal overflow: 0

### Runtime quality

Final browser result:

- page errors: 0
- protocol/runtime exceptions: 0
- console errors: 0

## QA evidence

Run `37399923285` uploaded:

- reconstructed v7.2.4 candidate
- desktop Signing Week opening screenshot
- desktop Signing Week completion screenshot
- mobile Signing Week opening screenshot
- mobile full-wire screenshot
- machine-readable browser report

under the `gcc-v724-signing-qa` workflow artifact.

## Scope protection

This pass did not intentionally modify:

- player database
- player ratings
- player willingness model
- CPU recruitment decision logic
- draft AI evaluation
- CPU draft logic
- simulation engine
- innings model
- season engine
- dynasty save architecture
- trades
- injuries
- XI Selection logic

The only non-rendering adjustment is `pushRecruitFeed` history retention so the deliberately requested full league wire is actually complete.

## Acceptance decision

v7.2.4 Signing Week is accepted at SHA:

`477493c2610715ecb474e3042ec1e10ffc5015e202ac754a9f95c891dc7153a3`

The checkpoint should be considered authoritative only once this checkpoint commit itself re-passes the permanent v7.2.4 GitHub gate.

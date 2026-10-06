# GCC v7.2.5 Draft Order Draw Transition Checkpoint

## Status

Draft Order Draw audit and transition hardening checkpoint.

The Draw itself did not require a structural redesign. Functional and distribution testing passed on v7.2.4, but visual QA exposed one real transition defect: a stale `FRANCHISE CONFIRMED` signature bulletin could survive a very fast Club -> Signing Week skip -> Draft Order Draw path and overlap the Draw hierarchy, most visibly on mobile.

v7.2.5 fixes only that carry-over state.

## Source of truth

- Repository: `cpuhater1234/global-champions-cricket`
- Branch: `work/v7.2-structural-rebuild`
- Input: `game/global_champions_cricket_v7_2_4_signing_week_structure.html`
- Output: `game/global_champions_cricket_v7_2_5_draw_transition_hardening.html`
- v7.2.4 SHA-256: `477493c2610715ecb474e3042ec1e10ffc5015e202ac754a9f95c891dc7153a3`
- v7.2.5 SHA-256: `ed7767c447fb1e0ed48b14bf93f69ec6e5af6f4307611c869b6182996b9291f2`
- Passing GitHub Actions run: `37401291346` attempt 2
- Passing branch head before this checkpoint: `43b55ed9dacb1f11e5de268ed9e152320a628700`

Rebuild and verify with:

```bash
python qa/rebuild_v725.py
python qa/check_v725_draw.py
node --experimental-websocket qa/browser_v725_draft_draw.mjs
```

The candidate is reconstructed from v7.2.4 plus:

`qa/patches/v724_to_v725_draw.patch.gz.b64`

Permanent gate:

`.github/workflows/v725-draw-qa.yml`

## Audit decision

The Draft Order Draw does not need a broad redesign.

Its existing structure is appropriate:

- one clear question: `Where will you pick?`
- eight visible first-round slots
- progressive reveal
- pace control
- deliberate `REVEAL ALL`
- user position highlighted
- correct snake-order return pick
- clear `ENTER DRAFT ROOM` handoff
- no persistent navigation competing with the reveal

The only accepted product change is the transition fix below.

## Product defect found by visual QA

Automated layout checks reported zero horizontal overflow on v7.2.4, but screenshot review caught a transient visual collision.

On a rapid transition into the Draw:

- the `FRANCHISE CONFIRMED` bulletin could remain visible
- desktop hierarchy was partially obstructed
- mobile hierarchy was materially obstructed
- the bulletin overlapped the Draft Order kicker and top of `Where will you pick?`

This was not fixed with CSS repositioning.

The root cause was that core `setupDraft()` uses its private `go()`, so the presentation-layer wrapper around exported `go()` did not clear the active signature moment before entering `draftDraw`.

## v7.2.5 fix

The presentation layer now wraps exported `setupDraft()` and calls `clearMoment()` before the existing implementation runs.

No Draft Order generation or reveal logic changed.

The exact added behavior is limited to:

`setupDraft -> clear stale signature moment -> existing setupDraft logic`

## Static guardrail

`qa/check_v725_draw.py` passed.

It verifies:

- exact v7.2.4 source SHA
- exact v7.2.5 target SHA
- the only intended game delta is in the presentation choreography block
- the UI version marker advances to `v7.2.5-draw-transition-hardening`
- the new `setupDraft` presentation wrapper exists
- all other protected script blocks remain byte-identical
- all nine JavaScript blocks parse

Passing output:

- source SHA: `477493c2610715ecb474e3042ec1e10ffc5015e202ac754a9f95c891dc7153a3`
- target SHA: `ed7767c447fb1e0ed48b14bf93f69ec6e5af6f4307611c869b6182996b9291f2`
- game-code delta: UI choreography only

## Draft Order acceptance results

### Initial state

- active screen: `draftDraw`
- navigation hidden
- eight placeholder cards
- zero live cards
- `0 of 8 positions drawn`
- first envelope ready
- Continue disabled
- Reveal All enabled
- pace starts at 1x
- stale moment visible: false
- desktop horizontal overflow: 0

### Randomisation and distribution sanity

The browser harness ran 512 controlled deterministic seeds.

Results:

- unique eight-club orders: 512
- duplicate orders: 0
- every draw contained eight unique clubs
- every club reached every first-round position repeatedly
- tested user-club position counts: 65, 69, 64, 61, 66, 66, 59, 62

Observed counts across all clubs/positions remained broadly centred around the expected 64 appearances per slot.

### Reveal sequence

At 4x pace the browser observed every intermediate reveal count:

- 0
- 1
- 2
- 3
- 4
- 5
- 6
- 7
- 8

The user club was highlighted exactly once in the correct slot.

### Snake-order arithmetic

The test validates each displayed Round 2 return pick against:

`16 - zero-based Round 1 slot`

Equivalent global snake return:

`17 - Round 1 pick`

Example passing run:

- user Round 1 position: Pick 6
- displayed return: Pick 11 overall
- all eight Round 2 labels correct

### Completion controls

At 8/8:

- status: `The snake order is locked`
- Continue enabled
- Reveal All disabled
- Pace disabled

### Reveal All

The explicit skip path was tested after one envelope had revealed.

Result:

- all eight positions completed
- Continue enabled
- final count: 8 of 8

### Draft Room handoff

`ENTER DRAFT ROOM` correctly transitioned to:

- active screen: `draft`
- player workspace visible
- full Draft Board hidden by default

### Desktop

- initial horizontal overflow: 0
- completed horizontal overflow: 0
- visual hierarchy verified manually from QA screenshot
- stale franchise bulletin absent

### Mobile, 390 x 844

- eight-slot reveal renders as a single-column flow
- initial horizontal overflow: 0
- completed horizontal overflow: 0
- user club highlighted once
- stale franchise bulletin absent
- visual hierarchy manually verified from QA screenshot

## Visual QA

The v7.2.4 automated audit originally passed layout metrics but screenshot review rejected the screen because of the stale bulletin collision.

The v7.2.5 screenshots were manually reviewed after browser QA:

- desktop opening state: clean
- mobile opening state: clean
- no overlay obscuring the Draw kicker or headline
- no compensating spacing hack introduced

This checkpoint therefore explicitly treats screenshot review as a required complement to overflow/runtime checks for transition-heavy screens.

## Runtime quality

Passing browser attempt:

- page errors: 0
- runtime/protocol exceptions: 0
- console errors: 0

The first v7.2.5 workflow attempt failed before loading the game because Chrome did not expose its DevTools endpoint on that GitHub runner. The unchanged job was re-run and passed end to end. No product or harness code was changed between those attempts.

## Scope protection

v7.2.5 does not modify:

- Draft Order shuffle algorithm
- RNG
- snake-order arithmetic
- reveal timing logic
- player database
- ratings
- Signing Week logic
- Draft logic
- CPU drafting
- XI Selection
- simulation
- season engine
- dynasty/save systems

## Acceptance decision

v7.2.5 Draft Order transition hardening is accepted at:

`ed7767c447fb1e0ed48b14bf93f69ec6e5af6f4307611c869b6182996b9291f2`

The checkpoint becomes authoritative once this checkpoint commit itself re-passes the permanent v7.2.5 GitHub gate.

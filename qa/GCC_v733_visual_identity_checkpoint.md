# GCC v7.3.3 Visual Identity Checkpoint

## Status

Accepted fourth v7.3 game-experience build on top of the frozen v7.3.2 Cricket Language & Comprehension checkpoint.

v7.3.3 is a visual-system and identity pass only. Gameplay, copy, DOM structure and interaction architecture remain protected.

## Source of truth

- Repository: `cpuhater1234/global-champions-cricket`
- Branch: `work/v7.3.3-visual-identity`
- Frozen parent checkpoint: `7452d927cf1c522f585829477cefed1330f3edb1`
- Parent v7.3.2 SHA-256: `693558f48012bc878672e7dedd4524eaed7616597319d5539dba0c9d9b7994da`
- v7.3.3 generated SHA-256: `88c1c2b21ae7593d77b94babfda74e8df247e1f1e13be7f5de89a80abe62f650`
- Final accepted product/engineering run: `37570026362`
- Tested code head: `b6e3d16b4c07d3dce46d527df4d3a74abbcbcb20`

Rebuild and verify:

```bash
python qa/rebuild_v733.py
python qa/check_v733.py
node --experimental-websocket qa/browser_v733_visual_identity.mjs
```

## Product objective

Give GCC one deliberate cricket identity while making the interface quieter.

The visual pass follows a strict rule:

**Cricket first. Fewer visual devices. Stronger hierarchy.**

The build intentionally removes more decorative weight than it adds.

## Identity

### Raster badge removed

The previous header used an embedded raster GCC badge inside its own dark-green rounded treatment.

That asset is removed completely.

### Canonical cricket mark

The header and launcher now share one restrained SVG mark:

- three stumps;
- two bails;
- one cricket ball;
- one-colour line treatment;
- no enclosing badge;
- no shield;
- no gradient;
- no raster image.

The mark is intentionally simple enough to remain legible at small header/mobile sizes.

### Wordmark

The full competition name remains the primary brand:

**GLOBAL CHAMPIONS CRICKET**

The mark and name now read as one lockup rather than a logo box beside a separate title.

## Header

Accepted changes:

- transparent editorial header;
- one clean bottom rule;
- old gradient topbar accent removed;
- active navigation uses a quiet underline;
- inactive navigation remains subordinate;
- raster image count in brand: 0;
- SVG brand mark count: 1;
- mark hover movement removed;
- header mark shadow/border removed.

Desktop header height: 74 px.

Mobile header height: 68 px.

## Launcher

The launcher is now the cleanest expression of the GCC identity.

Removed:
- top/bottom launcher hero rules;
- launcher kicker;
- nested framing around the mark;
- raster logo treatment.

Preserved:
- fast New Dynasty route;
- saved dynasty route;
- Import Save;
- 2008 Story.

### Fresh launcher

Manual review accepted:

- mark is clearly cricket-specific;
- title hierarchy dominates rather than decoration;
- large cream field feels intentional rather than unfinished;
- one primary New Dynasty action, rendered in deep green when no save exists;
- secondary links remain quiet;
- no line crosses or competes with the hero/year.

### Continue launcher

Saved dynasty launcher correctly hands primary emphasis to the club-specific continue action, e.g.:

`CONTINUE BRISBANE HEAT`

This is accepted over generic `CONTINUE DYNASTY` because it provides stronger in-world context.

Desktop and mobile continue states both passed without horizontal overflow.

## Surface system

Accepted reductions:

- global decorative body overlay removed;
- global shadow tokens neutralised;
- routine panel shadows removed;
- routine player-card shadows removed;
- club-card hover shadow removed;
- button gradients replaced with flatter paper/green treatments;
- section rule normalised to one editorial rule;
- active navigation simplified;
- routine season panel made flatter.

Ceremonial Finals/Review content was not flattened into routine workspace styling.

## Team Room

The v7.3.0 XI interaction remains untouched.

Visual cleanup accepted:

- old decorative `SELECTION SHEET` pseudo-label removed;
- XI sheet now uses a simple strong top rule;
- right-hand XI profile uses a restrained gold top rule;
- redundant shadows removed;
- selected/unselected state remains clear;
- all 15 remain visible;
- batting-order controls remain where they were.

### Mobile

The previous faint decorative label no longer competes with `FIRST XI / Batting order`.

Manual review found the mobile reading order materially cleaner:

1. Team Room / XI context;
2. season-start action;
3. batting order;
4. XI players and controls.

Page-level horizontal overflow: 0.

## Season

Routine Season Hub surfaces were flattened without changing layout or information order.

Manual review accepted:

- result/next-fixture hierarchy remains dominant;
- tabs remain easy to scan;
- the screen feels calmer;
- no loss of Finals-line or recent/next emphasis;
- no page-level horizontal overflow on desktop/mobile.

## Draft / Annual Draft

No recruitment architecture changed.

Accepted visual result:

- foundation/annual Draft keep the same player-card language;
- rating hierarchy remains strong;
- filters/search remain obvious;
- list balance remains visible;
- board remains secondary;
- fewer shadows makes the recruitment room feel more like the same editorial product as Season/Team Room.

Annual Draft desktop/mobile both remained clean and readable.

## Visual-only protection

The static guardrail verifies:

- exact parent SHA;
- exact target SHA;
- all 9 JavaScript blocks unchanged except the UI-version label;
- visible product copy unchanged;
- DOM id set unchanged;
- button count unchanged;
- raster header badge absent;
- SVG cricket mark present;
- substantial file-size reduction from removing the raster asset.

Result:

- Protected JS blocks unchanged: **yes**
- Visible copy unchanged: **yes**
- DOM ids/buttons unchanged: **yes**
- Raster header badge removed: **yes**

## Browser acceptance

The accepted Chrome journey completed:

- fresh launcher desktop/mobile;
- club choice;
- Signing Week;
- Draft Order;
- foundation Draft;
- Team Room empty XI;
- Team Room complete XI;
- Team Room mobile;
- Season Hub desktop/mobile;
- innings analysis;
- Finals;
- Season Review;
- 2009 offseason;
- Trade Centre;
- annual Draft Draw;
- annual Draft desktop/mobile;
- Final 15;
- pre-season;
- 2009 Team Room;
- continue launcher desktop/mobile.

Runtime quality:
- page errors: 0
- runtime exceptions: 0
- console errors: 0
- tested page-level horizontal overflow: 0

## Product-gate decisions

### Accepted: simpler mark

The new mark is less distinctive as a standalone commercial sports logo than an ornate crest would be, but that is intentional.

It succeeds because it:
- is recognisably cricket;
- works at header size;
- belongs to the existing editorial visual language;
- does not compete with team/player/event content;
- removes the strongest AI-generated visual cue in the old build.

### Accepted: more negative space on launcher

The launcher is deliberately sparse.

The space now belongs to the title and primary action rather than filler panels/rules.

This is accepted because the screen has one job: enter the dynasty.

### Accepted: flatter routine screens

Season, Team Room and Draft are quieter.

The pass did not flatten:
- Finals;
- Season Review;
- major reveal moments.

Routine and ceremony therefore remain visually distinct.

## Known items for v7.3.4 Golden Dynasty

The visual pass is accepted, but the final multi-season test should specifically watch:

- whether the new sparse launcher still feels strong after repeated sessions;
- whether any routine screen became too visually flat after several hours of play;
- whether the header nav remains readable once later-year navigation changes;
- whether Team Room mobile remains efficient after repeated injury/selection cycles;
- whether annual Draft and Final 15 remain tolerable in years 3+;
- whether there are any inherited micro-components whose old border/shadow language now stands out against the simplified system.

These should be judged in context during the Golden Dynasty pass rather than reopened individually now.

## Acceptance decision

v7.3.3 Visual Identity is accepted at SHA-256:

`67d509ff1386df6b95fcb5582d659e48f1baccea6c46e34a7ae9a27a51a703e2`

The next coherent workstream is **v7.3.4 Golden Dynasty**.

That phase should not begin with more redesign.

It should play the accepted product repeatedly across 2008-2010 and classify findings only as:

- KEEP
- REBUILD
- CONSOLIDATE
- CUT

The purpose is to judge whether GCC now works as one compelling multi-season game, not whether individual screens can be polished further.

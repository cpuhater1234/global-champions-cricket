# GCC v7.3.2 Cricket Language & Comprehension Checkpoint

## Status

Accepted third v7.3 game-experience build on top of the frozen v7.3.1 Dynasty Continuity checkpoint.

v7.3.2 is a copy/comprehension build. It does not change the core game systems or the accepted v7.3.0 / v7.3.1 interaction architecture.

## Source of truth

- Repository: `cpuhater1234/global-champions-cricket`
- Branch: `work/v7.3.2-cricket-language`
- Frozen parent checkpoint: `681273feb13d103dc8fdb5d9d1fed2527f63b7c2`
- Parent v7.3.1 SHA-256: `ef7c04895020da2922af5e12ad830c602f453233b72ec942f92aa03e677ab19f`
- v7.3.2 generated SHA-256: `693558f48012bc878672e7dedd4524eaed7616597319d5539dba0c9d9b7994da`
- Final accepted product/engineering run: `37568060765`
- Tested code head: `19f8a42d965de0e23a550f592ec71044b5fb3828`

Rebuild and verify:

```bash
python qa/rebuild_v732.py
python qa/check_v732.py
node --experimental-websocket qa/browser_v732_cricket_language.mjs
```

## Product objective

Make the established GCC journey read like one cricket game.

Each major state should make clear:
1. what is happening now;
2. what cricket decision belongs to the player;
3. what happens next.

This pass deliberately avoids tutorial chrome, new panels, structural redesign and extra controls.

## Deterministic rebuild

The original compressed patch transport proved fragile in GitHub Actions.

The final accepted rebuild therefore applies the audited copy substitutions directly to the exact frozen v7.3.1 source and verifies the resulting v7.3.2 SHA.

This produces the exact accepted game file:

`693558f48012bc878672e7dedd4524eaed7616597319d5539dba0c9d9b7994da`

The browser harness is stored as normal source rather than base64 shards.

## Static protection

The v7.3.2 guardrail verifies:

- exact parent SHA;
- exact target SHA;
- nine JavaScript blocks remain syntactically valid;
- protected script blocks are unchanged;
- protected gameplay functions are byte-identical;
- DOM id set is unchanged;
- button count is unchanged;
- required v7.3.2 language is present;
- rejected stale/admin wording is absent.

Protected gameplay includes:
- foundation Draft logic;
- XI selection mechanics;
- batting-order mechanics;
- season simulation;
- Finals and Review logic;
- annual Draft rules and CPU evaluation;
- cuts / Final 15 logic;
- trades;
- injuries;
- replacement-player rules.

Result:

- Protected gameplay functions unchanged: **yes**
- DOM IDs/buttons unchanged: **yes**

## Accepted language changes

### Signing Week

The purpose of the five-day window is now explicit.

Accepted opening:

> Five days decide who enters the Draft.

The supporting copy explains that each decision changes the foundation Draft pool and that the Draft Order follows when Day 5 closes.

The right-hand context now uses:

- `WHAT IT MEANS FOR THE DRAFT`
- `The Draft pool is still open.`
- yes = player enters the Draft;
- no = player is out before Pick 1.

The state updates naturally as the window progresses and when the pool locks.

### Team Room

The accepted v7.3.0 interaction remains untouched.

The copy now separates the jobs of each area:

- page intro explains the XI and natural batting-order starting point;
- selection line reports the current state;
- fixture/conditions context informs the cricket choice;
- squad note explains why all 15 remain visible;
- batting-order note explains when to move players;
- warnings only describe real cricket problems.

Accepted examples:

- `0/11 selected.`
- `Build a balanced XI. Warnings will flag a missing keeper or insufficient bowling.`
- `Selected players stay visible so you can compare the full 15.`
- `11 spots still open.`
- `XI complete. Choose SWAP beside a bench player, then choose who comes out.`

Later seasons use round/year-specific selection language rather than stale foundation copy.

### Offseason

The dynasty shell now frames one cricket objective:

> Retirements, trades and the Draft reshape the list. Finish with fifteen, then name the XI for Round 1.

The headline stat is phase-aware instead of showing stale capacity wording.

Supported states include:
- list spots;
- Draft still live;
- cuts after Draft;
- to release;
- list lodged.

### Trade Period / Trade Centre

Trade copy is shorter and list-focused.

Accepted language includes:

- `Trade before the Draft Draw`
- club needs change player value;
- `Make a cricket trade.`
- `Build the deal around what each list needs.`
- `Choose the player you want, then decide what you are prepared to send.`

The trade mechanics themselves are unchanged.

### Annual Draft

The accepted v7.3.1 architecture remains frozen.

Copy now uses:

- `LIST BALANCE`
- `X/15 on the list`
- `Add what the list needs most. Search the pool, compare roles and make the pick.`

No extra panel or second roster rail was introduced.

### Final 15

The reason for the cut is explicit:

> The Draft has taken you over fifteen. Release N before you can name the XI.

The off-season headline simultaneously reports the number `TO RELEASE`.

### Pre-season

Once the list is legal:

- `15/15`
- `LIST LODGED`
- `The 15 are lodged.`
- `Now name the XI that opens the season. Form carries over lightly; selection starts again.`

The primary next action is `NAME THE 2009 XI`.

### Dynasty season strip

Administrative sports-science wording was removed:

- `Fitness watch` -> `Fitness`
- `No managed loads` -> `No restrictions`

## Protected language intentionally kept

The journey audit did not force rewrites onto already strong screens.

The following remained effectively protected unless required for regression testing:
- club choice;
- Draft Order ceremony;
- foundation Draft architecture/copy hierarchy;
- Season Hub structure;
- Finals ceremony;
- Season Review structure.

The product gate explicitly preferred keeping good copy over increasing the size of the diff.

## Browser acceptance

The final Chrome journey completed:

- club choice;
- Signing Week;
- Draft Order;
- foundation Draft;
- empty Team Room;
- complete/mobile Team Room;
- Season Hub;
- innings analysis;
- Finals;
- Season Review;
- 2009 offseason;
- Trade Centre;
- annual Draft Draw;
- annual Draft;
- annual Draft mobile;
- Final 15;
- pre-season;
- 2009 Team Room.

Final runtime quality:
- page errors: 0
- runtime exceptions: 0
- console errors: 0
- tested page-level horizontal overflow: 0

## Product QA decisions during the pass

A green static result was not treated as sufficient.

Several browser assertions were deliberately changed because the live game wording was better than the earlier draft expectation.

Examples:

### Empty XI

The browser exposed `11 spots still open.` before an XI exists.

This was accepted over premature bench-swap language because it describes the current state rather than a future interaction.

### Finals

Existing Finals language was preserved:

- `Four clubs remain.`
- `One loss ends the season.`
- opponent / ground / conditions context.

The language pass did not rewrite a screen that was already doing its job.

### Season Review

The weakness panel dynamically became:

- `NEXT SEASON`
- `The first fix`

followed by the actual evidence-based cricket weakness.

This was accepted over a generic static heading because it points directly at the first offseason problem.

## Manual screenshot review

The final evidence set was manually reviewed after the automated journey passed.

Accepted states include:

- Signing Week: clear five-day Draft-pool consequence and one primary action;
- Team Room desktop: clear XI ownership, visible full squad and natural batting-order help;
- Team Room mobile: readable selection hierarchy and clear season-start action;
- 2009 offseason: phase sequence, list state and arrivals/trade priority are immediately legible;
- Trade Centre: concise, cricket-specific decision language;
- annual Draft desktop/mobile: list balance and player decision remain dominant;
- Season Review: unobstructed season story, strengths and first offseason fix;
- Final 15: required number of releases and reason are visible immediately;
- Pre-season: 15/15 lodged state and next XI action are unambiguous.

The first Final 15 / Pre-season evidence captured the wrong scroll position, and an earlier Review image was obscured by an accelerated-QA ceremony modal. Those screenshots were rejected as evidence. The harness was corrected and a fresh fully green evidence run produced the accepted captures.

## Known deferred visual items

These do not block the copy/comprehension build and belong to v7.3.3 Visual Identity:

- GCC launcher/masthead still needs a cleaner cricket-specific identity;
- historical logo/mark treatment still feels too generated and boxed;
- some faint decorative labels/linework can still compete with content on small screens;
- Team Room mobile still has minor visual-density/alignment issues despite the interaction and copy being clear;
- broader surface/border consolidation should be handled as one art-direction pass, not piecemeal.

## Acceptance decision

v7.3.2 Cricket Language & Comprehension is accepted at SHA-256:

`693558f48012bc878672e7dedd4524eaed7616597319d5539dba0c9d9b7994da`

The next coherent workstream is **v7.3.3 Visual Identity**.

That phase should establish one deliberate GCC visual system and remove unnecessary visual furniture without reopening the gameplay architecture now accepted in v7.3.0, v7.3.1 and v7.3.2.

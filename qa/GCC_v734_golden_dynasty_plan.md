# GCC v7.3.4 Golden Dynasty Plan

## Objective

Judge the accepted v7.3 product as one multi-season cricket game.

v7.3.4 does not begin with another redesign. It begins with repeated play.

The test must answer:

- does 2008 teach the game naturally?
- does 2009 feel like a richer continuation rather than a reset?
- does 2010 still feel coherent once novelty is gone?
- do injuries, trades, Drafts, Final 15 cuts and XI changes interrupt at the right moments?
- does fast simulation respect player ownership?
- do repeated workflows remain tolerable?
- do the accepted visual/language systems still hold after several hours of equivalent game state?

Every finding is classified only as:

- **KEEP** — already game-quality;
- **REBUILD** — structurally wrong;
- **CONSOLIDATE** — good idea duplicated/inconsistent elsewhere;
- **CUT** — does not improve cricket, comprehension or enjoyment.

There is no generic "polish later" bucket.

## Frozen parent

v7.3.3 Visual Identity is the product baseline.

Protected parent SHA-256:

`88c1c2b21ae7593d77b94babfda74e8df247e1f1e13be7f5de89a80abe62f650`

Protected checkpoint commit:

`9a34d05f27b8d56b0fe123375e1af7a22bc12217`

No v7.3.0-v7.3.3 interaction should be reopened without evidence from the Golden Dynasty.

## Golden dynasty route

### 2008 — learn the game

Play from a clean launcher through:

1. New Dynasty
2. club choice
3. Signing Week
4. Draft Order
5. full 15-round foundation Draft
6. first XI
7. regular season
8. at least one manual XI change during the season
9. Finals path where applicable
10. Season Review
11. enter 2009 offseason

Questions:
- does every major screen have one obvious job?
- is the first Draft exciting rather than exhausting?
- does the XI choice feel owned by the player?
- does the Season Hub move quickly enough?
- does the Review create a reason to care about next year?

### 2009 — prove dynasty continuity

Play the complete offseason and season:

1. retirements / new arrivals
2. optional trade evaluation
3. Draft Draw
4. annual Draft
5. Final 15
6. pick 2009 XI
7. play at least one normal round
8. force a meaningful injury interruption
9. solve the injury from the bench if possible
10. force a replacement-player case if the squad cannot legitimately cover
11. resume season
12. open the mid-season trade window
13. complete or reject a trade deliberately
14. finish regular season
15. Finals where applicable
16. Season Review
17. save/reload at a meaningful mid-dynasty point

Questions:
- does year two feel like the same game?
- are the annual Draft and Final 15 proportionate to their importance?
- do injuries interrupt only when the player must act?
- is temporary cover clearly temporary?
- can the player tell why a trade helps or hurts?
- does save/resume return to the exact decision state?

### 2010 — test repetition

Advance through:

1. offseason arrivals/retirements
2. Draft Draw
3. annual Draft
4. Final 15
5. XI
6. enough season rounds to test repeatability
7. one save/resume

Questions:
- do repeated systems remain readable?
- does the annual Draft still feel worth engaging with?
- does Final 15 become paperwork?
- does the Team Room remain efficient?
- does the header/navigation still read correctly in year three?
- does the player still have a clear reason to play another season?

## Deliberate stress cases

The Golden Dynasty must explicitly test:

### XI ownership

- empty XI
- partial XI
- complete XI
- bench swap
- batting-order change
- injured selected player
- return to season after repair

Reject if the human XI changes silently.

### Injury / replacement

Case A: bench can cover.
- auto-run stops
- player changes XI manually
- no replacement market is forced

Case B: squad cannot cover under the real rules.
- replacement market becomes available
- temporary nature is explicit
- replacement joins correctly
- injured player returns correctly
- temporary cover exits correctly

### Trades

- inspect at least one plausible deal
- inspect at least one bad deal
- confirm the other club evaluates value independently
- verify roster uniqueness after accepted trade
- verify traded picks continue to resolve correctly if a pick is included

### Draft repetition

- annual Draft player pool still uses the canonical recruitment architecture
- filter/search state behaves predictably
- user selections are recorded once
- CPU selections advance correctly
- traded pick ownership is honoured
- no duplicate player IDs

### Final 15

- exactly 15 players after cuts
- no hidden auto-cut
- released players return to the correct free-agent state
- repeated use in 2009 and 2010 is judged for tedium

### Save / resume

Save/reload during:
- annual Draft;
- season after at least one round;
- injury-required Team Room if technically supported.

The same phase, roster, XI, batting order, pick cursor and relevant pending decision must return.

## Product metrics

Record for each major workflow:

- number of user clicks/actions required;
- whether any action is administrative rather than cricket-driven;
- number of modal interruptions;
- number of forced waits/ceremonies;
- whether the next action is visible without scrolling on desktop;
- mobile horizontal overflow;
- runtime / page / console errors.

These are diagnostic metrics, not targets to minimise blindly.

## Game gate

At each major state answer yes/no:

- Is the current cricket decision obvious?
- Does the human own the important choice?
- Is uncertainty useful rather than arbitrary?
- Does the result create consequence?
- Does the interaction match the same job elsewhere?
- Would this still be tolerable in season five?
- Is anything here only because the implementation needs it?
- Would removing something improve the game?

Any "no" becomes a classified finding.

## Engineering gate

Across the full Golden Dynasty:

- no duplicate players across rosters;
- no roster below/above legal limits outside explicit offseason/cut states;
- XI always exactly 11 when a match begins;
- batting order contains exactly the XI;
- no unavailable player starts a match;
- max bowling-over rules remain valid;
- save/reload preserves dynasty state;
- annual Draft ownership remains valid;
- temporary replacement lifecycle resolves;
- no runtime/page/console errors;
- desktop/mobile overflow remains clean on sampled states.

## Evidence

Capture at minimum:

### 2008
- launcher
- first Draft user pick
- completed XI
- mid-season Season Hub
- Finals
- Review

### 2009
- offseason
- annual Draft first pick
- Final 15
- XI
- injury interruption
- repaired XI
- replacement market if triggered
- mid-season trade
- season resume after reload
- Review

### 2010
- annual Draft
- Final 15
- XI
- season after several rounds
- continue launcher

## Acceptance philosophy

v7.3.4 should be allowed to conclude with **no game-code changes** if the accepted product survives the Golden Dynasty cleanly.

Do not invent work to justify the version.

If defects are found:
- group related findings into one coherent fix;
- preserve the frozen v7.3.3 parent;
- change only what evidence requires;
- rerun the full Golden Dynasty after the fix.

## Final deliverable

The v7.3.4 checkpoint must contain:

1. exact tested game SHA;
2. full Golden Dynasty journey report;
3. KEEP / REBUILD / CONSOLIDATE / CUT classification;
4. engineering-state audit;
5. manual visual/product review;
6. explicit list of anything deferred beyond v7.3.

The final question is not "is every screen polished?"

It is:

**Would a cricket fan finish 2010 and choose to play 2011?**

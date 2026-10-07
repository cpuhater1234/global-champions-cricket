# GCC v7.3.4 Golden Dynasty Checkpoint

## Status

Accepted final v7.3 product gate.

v7.3.4 proves the v7.3 product across a continuous 2008-2010 dynasty and contains one isolated launcher-continuity fix discovered by that test.

## Source of truth

- Repository: `cpuhater1234/global-champions-cricket`
- Branch: `work/v7.3.4-golden-dynasty`
- Final game: v7.3.4 Golden Dynasty
- Parent v7.3.3 SHA-256: `88c1c2b21ae7593d77b94babfda74e8df247e1f1e13be7f5de89a80abe62f650`
- Final v7.3.4 SHA-256: `ac7e0479d3c5fe4b5ae6d3648f71267d74e540af3b127f08e6decfe03d6bb9bc`
- Frozen v7.3.3 checkpoint: `9a34d05f27b8d56b0fe123375e1af7a22bc12217`
- Pre-fix Golden Dynasty QA head: `f0f877102920f4aff842b3abc190d756c8073336`
- Pre-fix Golden Dynasty run: `37571273144`
- Final checkpoint run: pending current CI
- Evidence artifact: `gcc-v734-golden-dynasty-qa`

## Golden Dynasty result

The Golden Dynasty completed the full automated 2008-2010 route. During that test, one launcher continuity defect was isolated: a saved 2010 dynasty could display the unloaded default year (2008) in the masthead before Continue. v7.3.4 fixes that wrapper-only issue and leaves simulation, ratings, product copy and core interaction logic unchanged.

The final run passed:

- frozen v7.3.3 deterministic rebuild;
- frozen v7.3.3 static/product guardrail;
- Golden Dynasty harness syntax;
- Chrome launch;
- full 2008-2010 Golden Dynasty;
- evidence upload.

Runtime quality:

- page errors: 0
- runtime exceptions: 0
- console errors: 0

## Launcher continuity fix

Golden Dynasty identified a genuine repeated-session defect:

- after saving in 2010 and reloading to the launcher, the masthead could show `2008`;
- the saved club and Continue action were correct;
- the problem was the generic year decorator reading unloaded in-memory state after the launcher had already read saved metadata.

The final v7.3.4 fix is isolated to the dynasty/launcher wrapper:

- launcher year reads saved metadata while the launcher is open;
- saved launcher hides in-game navigation until Continue;
- fresh launcher remains 2008;
- New Dynasty / 2008 story restore 2008 correctly;
- Continue restores live dynasty navigation and live year state.

No simulation, ratings, Draft, XI, injury, trade or match-engine code changed.

Classification: **KEEP after isolated fix**

## 2008

Verified as one continuous foundation experience:

- fresh launcher;
- club choice;
- Signing Week;
- Draft Order;
- full 15-round foundation Draft;
- user-owned XI selection;
- Season Hub;
- regular season;
- Finals;
- Season Review;
- 2009 offseason handoff.

Classification: **KEEP**

## 2009

### Manual XI ownership

Verified:

- 15-player squad remains visible;
- user selects 11 manually;
- no Recommended XI action;
- 11 unique XI players;
- 11-player batting order;
- Round 1 begins only from a valid XI.

Classification: **KEEP**

### Season save / resume

After Round 1, a hard reload restored:

- year;
- round;
- user roster;
- XI;
- batting order;
- Season screen.

Classification: **KEEP**

### Injury interruption with bench cover

A selected player was made unavailable while four fit bench players remained.

Verified:

- fast season run stopped before the next user match;
- Team Room opened;
- round did not advance;
- the XI was unchanged;
- selected injured player remained visible;
- both return actions displayed `CHANGE REQUIRED`;
- user manually swapped a bench player into the XI;
- season resumed with 11 valid players.

Classification: **KEEP**

### Legitimate temporary replacement

A second stress case left only ten healthy contracted players.

Verified:

- five contracted players unavailable;
- replacement market opened legitimately;
- 12 candidates displayed;
- copy explicitly described temporary cover;
- selected replacement joined as temporary cover;
- roster temporarily moved to 16;
- replacement entered the XI through a user-owned swap;
- when the injured player returned, the temporary player left automatically;
- replacement mappings cleared;
- roster returned to 15;
- XI returned to 11;
- batting order returned to 11.

Classification: **KEEP**

### Mid-season trade

At Round 7:

- trade window opened;
- inspecting and closing the Trade Centre did not consume the opportunity;
- a valid deal was completed deliberately;
- the other club evaluated the offer;
- user roster remained 15;
- league player ownership remained unique;
- XI remained legal;
- completed trade persisted through hard reload.

Classification: **KEEP**

### 2009 completion

Verified:

- 14 regular-season rounds;
- Review reached correctly;
- dynasty continued into 2010.

Classification: **KEEP**

## 2010 repetition

### Offseason

Verified:

- 2010 offseason loaded;
- five-stage dynasty timeline remained coherent;
- league ownership remained unique.

### Annual Draft

Verified:

- same canonical annual-Draft architecture;
- user-owned first selection;
- CPU selections advanced;
- save/reload preserved Draft phase, cursor, picks and roster;
- 16 scheduled picks completed;
- player ownership remained unique.

Classification: **KEEP**

### Final 15

Verified:

- post-Draft list above 15;
- user-owned releases;
- exactly 15 players before pre-season;
- no hidden auto-cut.

Classification: **KEEP**

### 2010 Team Room and season

Verified:

- same Team Room interaction;
- 15 squad rows;
- manual 11-player XI;
- 11-player batting order;
- first three rounds completed;
- same navigation and Season views as 2009;
- save/reload restored year, round, roster, XI and batting order;
- continue launcher remained valid.

Classification: **KEEP**

## Final engineering state

At the end of the Golden Dynasty:

- year: 2010
- round: 3
- total league roster entries: 121
- unique league player IDs: 121
- user roster: 15
- unique user roster IDs: 15
- XI: 11
- unique XI IDs: 11
- batting order: 11
- unique batting-order IDs: 11
- batting order exactly matches XI: yes

No duplicate player ownership was present.

## Wicketkeeper rule audit

Golden Dynasty exposed a season in which the user chose an XI without a recognised keeper.

This is **not an unimplemented rule**.

The current product deliberately permits that choice and applies cricket consequences.

### Player-facing consequence

Team Room reports:

- `Keeper · Needed`
- `No recognised keeper`
- `There is no recognised keeper in the XI. Expect it to cost runs behind the stumps.`

The Season analysis can report:

- `There is still no recognised keeper in the XI.`

Season Review can report:

- `Wicketkeeping · Selection`
- `You went through the season without a recognised keeper. That gave away chances behind the stumps.`

The How to Play dossier explicitly states that the player can gamble without a recognised keeper and will pay for missed chances / poor work behind the stumps.

### Match-engine consequence

Keeping is causal in the innings engine.

Defending quality includes:

```js
const defenceRuns = (82 - bowl.fielding) * .08 + (84 - bowl.keeping) * .035;
```

Poor keeping therefore increases the opponent's phase run total.

Expected wickets also include:

```js
+ (bowl.keeping - 84) * 0.004
```

Poor keeping therefore reduces wicket pressure as well.

The team profile includes actual XI keeping quality, and the overall XI read treats a recognised keeper as a real cricket advantage rather than a hard roster quota.

### Keeper acceptance decision

**KEEP the existing rule.**

Do not add a hard squad or XI quota.

The correct GCC philosophy is already implemented:

> the player may choose an emergency/non-specialist keeper, but the match engine and post-match analysis make that choice costly.

This preserves player agency while making list construction matter.

## Final classification

### KEEP

- 2008 foundation flow
- player-owned XI selection
- injury interruption
- bench repair
- temporary replacement lifecycle
- canonical annual Draft
- Final 15
- Season / Finals / Review hierarchy
- save/resume
- mid-season trade flow
- v7.3.3 launcher / visual identity
- existing wicketkeeper consequence system

### CONSOLIDATE

- Trade evaluation and list-needs logic should continue to share the same valuation model as the game expands.

### REBUILD

None from the Golden Dynasty.

### CUT

None from the Golden Dynasty.

## v7.3 conclusion

v7.3 achieved its purpose. The final binary is v7.3.4 with the isolated launcher continuity fix above.

The game now behaves as one coherent dynasty product across foundation year, second season and repeated third-season workflows.

No further UI or structural redesign is justified by the Golden Dynasty evidence.

The next phase is **v7.4 Dynasty Balance & Longevity**.

v7.4 should test the unchanged product deeper into the dynasty and focus on:

- rating progression / decline;
- player career ageing;
- CPU squad rebuilding;
- long-term trade value;
- Draft-pool quality;
- role scarcity;
- injury frequency;
- replacement frequency;
- ground effects;
- scoring/statistical era evolution;
- dominant strategies;
- league parity and repeat champions;
- whether years 4-6 still create a reason to play another season.

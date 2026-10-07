# GCC v7.4 Dynasty Balance & Longevity Plan

## Objective

Test the frozen v7.3.4 product as a long-running cricket dynasty before changing any balance constants.

v7.4 begins as an evidence phase.

The core question is:

**Does the league remain believable, competitive and worth playing from 2008 through at least 2014 once the foundation novelty is gone?**

## Frozen parent

- Parent checkpoint: `4a7a0f97f7d61bdffa31d9f9c9153194f66edf54`
- Final v7.3.4 game SHA-256: `ac7e0479d3c5fe4b5ae6d3648f71267d74e540af3b127f08e6decfe03d6bb9bc`

No UI, copy or interaction redesign is in scope unless long-horizon evidence exposes a genuine usability failure.

## Existing long-term systems to audit

The current engine already contains:

- explicit historical career windows;
- debut / peak / exit years;
- age-driven progression and decline;
- attribute-specific ageing;
- deterministic player arrivals;
- retirement removal;
- annual Drafts;
- CPU role-needs weighting;
- CPU trade valuation;
- CPU roster-shape protections;
- form movement from match performance;
- age / pace / XI-load injury risk;
- temporary injury replacements;
- year-based scoring environment;
- dynasty history and manager records.

v7.4 must judge whether those systems interact correctly over time.

## 1. Career progression and decline

Audit players across career types:

- young player arriving well before peak;
- player already in prime in 2008;
- fast bowler ageing through early/mid 30s;
- batter ageing through mid/late 30s;
- all-rounder with split batting/bowling value;
- keeper-batter;
- historical star with a late peak.

Check annually:

- overall;
- batting;
- bowling;
- power;
- pace;
- control;
- variation;
- fielding;
- keeping;
- trade value;
- Draft value.

Acceptance:

- young players improve gradually rather than jumping unrealistically;
- peak players are recognisably strongest near their intended window;
- physical attributes decline faster than craft attributes;
- older elite players can remain useful without remaining permanently elite;
- decline does not make players unusable overnight;
- no player exceeds plausible rating bounds;
- retired players do not re-enter the active pool.

## 2. Player-pool supply and role scarcity

For every offseason record:

- active players;
- rostered players;
- free agents;
- new arrivals;
- retirements;
- BAT;
- WK-BAT;
- AR;
- BOWL;
- recognised keepers;
- viable bowling options;
- openers;
- finishers.

Acceptance:

- enough players exist to maintain eight legal 15-player squads;
- keeper scarcity can create interesting choices but not systemic impossibility;
- bowling depth does not collapse across the league;
- one role does not become permanently over-supplied;
- new arrivals replace outgoing generations at a believable rate.

## 3. CPU squad building

Track all eight clubs annually.

Measure:

- squad average overall;
- best XI average;
- keeper coverage;
- bowling depth;
- batting depth;
- opening options;
- finishing options;
- average age;
- oldest / youngest player;
- players retained year to year;
- players acquired by Draft;
- players acquired by trade.

Acceptance:

- CPU clubs protect basic cricket shape;
- weak clubs can improve;
- strong clubs can age or lose ground;
- CPU clubs do not hoard one role while ignoring obvious holes;
- annual Drafts actually change roster quality;
- clubs do not converge into indistinguishable squads.

## 4. Draft quality and value

For every annual Draft:

- Draft order;
- pick owner;
- player selected;
- player rating at selection;
- trade value;
- role need;
- player age;
- later career peak;
- later seasons retained by drafting club.

Audit:

- top picks generally have stronger expected value than late picks without being perfectly ordered;
- CPU role-needs weighting can override pure overall appropriately;
- traded picks resolve to the correct owner;
- young future stars are not always ignored because of lower current overall;
- older current stars are not systematically overvalued;
- supplementary picks remain exceptional rather than routine.

## 5. Trade market

Across offseasons and mid-season windows measure:

- number of CPU trades;
- player age / rating / role exchanged;
- value difference for each club;
- whether basic roster shape remains valid;
- repeat trading of the same player;
- user-facing accepted/rejected trade thresholds;
- pick values when included.

Acceptance:

- trade frequency is low enough to feel meaningful;
- trades are not universally same-age/same-rating swaps;
- CPU clubs solve real needs;
- trade value reflects both current quality and runway;
- no obvious exploit repeatedly converts ageing players into young stars;
- no circular or duplicate ownership occurs.

## 6. Injuries and temporary replacements

Across multiple seasons record:

- injuries per club-season;
- OUT vs MANAGING;
- average absence;
- injuries by age;
- injuries by role;
- pace-bowler incidence;
- replacement-market eligibility;
- replacement signings;
- replacement return events.

Acceptance:

- injuries matter without dominating;
- older players / pace bowlers are somewhat riskier;
- most seasons do not require constant replacement administration;
- temporary cover remains uncommon and meaningful;
- replacement lifecycle always returns rosters to legal state.

## 7. Form

Track form distributions each round and season:

- share at -3 / -2 / -1 / 0 / +1 / +2 / +3;
- persistence of hot/cold runs;
- relationship between recent performance and form;
- regression toward neutral.

Acceptance:

- form moves because of performance;
- form does not become permanently stuck at extremes;
- one poor/great match does not dominate a full season;
- form meaningfully affects selection/value without outweighing underlying ability.

## 8. Scoring environment and historical era

The current engine applies a gradual year-based scoring environment.

Audit by year:

- average first-innings score;
- average chase score;
- run rate;
- wickets per innings;
- fours;
- sixes;
- 50s;
- 100s;
- team all-outs;
- successful chase rate;
- highest / lowest totals;
- player strike rates;
- bowler economy rates.

Acceptance:

- later years become more aggressive gradually;
- six-hitting increases without cartoonish inflation;
- wickets and all-outs remain plausible;
- bowling does not become irrelevant;
- season-to-season movement is smaller than genuine long-term era movement.

## 9. Competitive balance

For each season:

- ladder;
- champion;
- grand finalists;
- top-four clubs;
- wins by club;
- NRR spread;
- repeat champions;
- consecutive Finals appearances;
- worst-to-best movement;
- best-to-worst movement.

Across the audit window measure:

- title concentration;
- top-four concentration;
- club win percentages;
- parity;
- dynasty formation;
- rebuilding success.

Acceptance:

- elite teams can sustain success;
- no club is locked permanently at the top or bottom by structural bias;
- CPU rebuilding creates meaningful movement;
- repeat champions are possible but not automatic;
- standings retain enough variance to feel like sport.

## 10. Human-strategy exploit audit

Run at least three user strategies where practical:

### Current-value strategy
Prioritise highest current overall.

### Dynasty-value strategy
Prioritise younger players / longer runway.

### Role-fit strategy
Prioritise squad balance, ground fit and role needs.

Compare:

- wins;
- Finals;
- titles;
- roster age;
- Draft returns;
- trade returns.

Reject if one simplistic strategy dominates regardless of context.

## Test shape

### Primary Golden Longevity run
One full dynasty from 2008 through 2014 with detailed state capture.

### Multi-seed league audit
At least three deterministic league runs through 2014 using the same advancement policy.

This is for distribution evidence, not UI judgment.

### Targeted career probes
Directly record a selected set of historical players across every year without altering their career truth.

## Hard engineering invariants

At every season boundary:

- every active roster ID is unique league-wide;
- each lodged club roster has exactly 15;
- each match XI has exactly 11;
- batting order exactly equals XI membership;
- retired players are not rostered;
- temporary replacements are not retained after their linked return;
- Draft pick ownership resolves once;
- no player is drafted twice;
- no NaN / undefined ratings;
- ratings stay within 1-99;
- save/reload preserves long-term dynasty state;
- runtime/page/console errors remain zero.

## Output

v7.4 audit should produce machine-readable annual tables for:

- league balance;
- roster composition;
- player progression;
- Drafts;
- trades;
- injuries;
- scoring environment;
- manager/player history.

The product report must classify findings only as:

- **KEEP**
- **TUNE**
- **REBUILD**
- **CUT**

`TUNE` is permitted in v7.4 because this phase explicitly tests numerical balance.

## Change discipline

Do not modify balance merely because a single season looks unusual.

A tuning change requires one of:

- repeated multi-seed evidence;
- a structural invariant failure;
- a clearly implausible historical career curve;
- a repeatable dominant strategy;
- a systematic role / market imbalance.

If tuning is required:

1. group related constants into one coherent change;
2. retain the frozen v7.3.4 parent;
3. rerun the full longevity audit;
4. compare before/after distributions.

## Final acceptance question

**By 2014, does the league look like six years of cricket history happened to it?**

A successful result should show ageing, new stars, club movement, changing scoring conditions and meaningful roster decisions while still feeling recognisably like the same GCC world.

# GCC v7.7 Release Hardening Plan

## Objective

Prove that the accepted GCC product is robust enough to stop redesigning.

v7.7 is a final whole-game bug bash and replayability gate over the frozen v7.6 product.

It begins with no gameplay change.

## Frozen parent

Accepted v7.6.0 Matchday & Season Immersion SHA-256:

`3a8b8bb9b9d67558ea19bda4b595b0ab083209f3ccb0607d209aaad04155b55f`

Branch source:

`work/v7.6-matchday-immersion`

Protected product areas:

- v7.3 interaction architecture;
- v7.3 visual identity;
- v7.4.1 cricket model / balance;
- v7.5 Archive / Legacy;
- v7.6 Matchday;
- save schema unless a reproduced defect makes a migration unavoidable.

## Release-hardening principle

**No defect, no change.**

Do not manufacture backlog work to justify v7.7.

Every finding must be one of:

- **BLOCKER** — corrupts or prevents a career;
- **MAJOR** — breaks a cricket decision, state continuity or core interaction;
- **MINOR** — real user-facing defect worth correcting before release;
- **KEEP** — behaviour is intentional and game-quality;
- **NO CHANGE** — technically unusual but not harmful enough to justify churn.

Only BLOCKER / MAJOR / justified MINOR findings may change the binary.

## Test matrix

### 1. Three full careers

Run seeds:

- 101;
- 202;
- 303.

Each must reach 2026.

Use a mixed play strategy:

- manually play selected regular-season fixtures through Matchday;
- use RUN SEASON for stretches where speed is appropriate;
- manually complete Finals where the user qualifies;
- complete every offseason, Draft and Final 15 through real product paths.

Required end-state:

- 19 archived seasons;
- resolved 2026 career;
- eight legal 15-player club rosters;
- unique league ownership;
- no retired player rostered;
- no stale temporary replacement mapping;
- no illegal XI / batting-order state.

### 2. Repeated-workflow audit

Sample at minimum:

- 2008;
- 2010;
- 2014;
- 2018;
- 2022;
- 2026.

At each sample year judge:

- Team Room;
- Matchday;
- Season Hub;
- offseason;
- annual Draft;
- Final 15;
- Archive.

Questions:

- Is the current cricket decision obvious?
- Is any step now paperwork rather than cricket?
- Does a repeated screen still justify its click?
- Does any copy sound generated, generic or implementation-led?
- Does the player still have a clear reason to continue?

### 3. Save / resume stress

Hard reload / Continue during:

- regular season after a manual Matchday;
- Team Room with an injured selected player;
- temporary replacement lifecycle;
- annual Draft after at least one user pick;
- Final 15;
- offseason trade state;
- mid-season trade state;
- late dynasty (2022+);
- completed 2026 career / Archive.

Must preserve:

- year;
- phase;
- round;
- roster ownership;
- XI;
- batting order;
- injury state;
- replacement mapping;
- Draft cursor / picks;
- trade completion state;
- history.

### 4. Matchday regression

Across early, middle and late dynasty:

- Round 1;
- early table;
- run home;
- Round 14.

Verify:

- preview is read-only;
- weather / venue / opponent are truthful;
- remaining-match copy is correct;
- injured XI cannot bypass Team Room;
- PLAY MATCH resolves exactly one accepted round;
- RUN SEASON bypasses preview;
- Finals remain separate.

### 5. Responsive / content extremes

Desktop:

- 1366 x 768;
- 1440 x 900.

Mobile:

- 390 x 844.

Sample long names, unusual table states and dense injury/offseason states.

Reject page-level horizontal overflow.

Modal content may scroll vertically where intended.

### 6. Copy sweep

Search the final player-facing HTML for:

- debug terms;
- raw formula explanations;
- TODO / temp / placeholder wording;
- duplicate section labels;
- generic business language;
- stale version language;
- technical implementation terms.

Any replacement must preserve cricket meaning and not reopen accepted interaction.

### 7. Performance / longevity

Track per career:

- browser process survival;
- page/runtime/console errors;
- history size;
- scorecard/state accumulation;
- responsiveness at 2026;
- ability to open Archive and season detail at the end of the career.

A browser-environment execution ceiling must be separated from a reproducible GCC defect.

## Engineering protection

Before any binary change, establish an exact v7.6 rebuild.

For every candidate fix:

- pin parent v7.6 SHA;
- preserve all unrelated functions byte-identically;
- add a regression test that fails on v7.6 and passes on the candidate;
- rerun the affected career segment;
- rerun final static guardrails.

No broad refactor is permitted during hardening.

## Acceptance

v7.7 passes when:

- three 2008-2026 careers complete;
- no BLOCKER remains;
- no unresolved MAJOR remains;
- justified MINOR fixes have regression evidence;
- no duplicate ownership;
- no illegal end-state roster / XI;
- save / resume survives all sampled decision states;
- Matchday remains deterministic;
- Archive remains truthful and read-only;
- page/runtime/console errors are zero in accepted runs;
- sampled desktop/mobile states have no page-level horizontal overflow;
- there is no evidence supporting another feature phase before release.

## Final question

**If a cricket fan starts a new dynasty tonight, is there anything left in the product that would make us wish we had done one more development phase first?**

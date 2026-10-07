> **Superseded:** this file documents the rejected first v7.4.1 threshold-only candidate. The accepted build and final 2008-2026 evidence are in `qa/GCC_v741_form_symmetry_checkpoint.md` and `qa/v741_full_horizon_summary.csv`.

# GCC v7.4.1 Form Symmetry Candidate

## Status

Evidence-backed tuning candidate. **Not yet accepted.**

The v7.4.0 League History build remains the last fully browser-accepted game until v7.4.1 completes the same multi-seed distribution audit.

## Source of truth

- Parent branch: `work/v7.4-dynasty-balance`
- Candidate branch: `work/v7.4.1-form-symmetry`
- Parent v7.4.0 SHA-256: `6317af10bbda0aa8ee1f61c825d12097c216ec58beef54df2f2524e75f1136eb`
- Candidate v7.4.1 SHA-256: `87a8746df03711c6fc8a0b8c37f3756034f0dd4fca5c06311478303ee4211dad`

## Why this tune exists

Three deterministic v7.4.0 longevity runs were completed successfully through 2014:

- seed 101;
- seed 202;
- seed 303.

Across 15 audited seasons from 2010-2014:

- mean players in positive form: **53.13**;
- minimum positive-form players in a season: **46**;
- maximum positive-form players in a season: **59**;
- mean players in negative form: **3.00**;
- minimum negative-form players in a season: **0**;
- maximum negative-form players in a season: **7**.

This was systematic across all three worlds rather than one unusual dynasty.

## Root cause

The current `updateFormForMatch()` logic generates:

- strong positive batting: `+1.0` for 50+;
- good positive batting: `+0.55` for 30+ at 130+ SR;
- poor batting: `-0.45` for 5 or fewer from at least five balls;
- strong positive bowling: `+1.0` for 3+ wickets;
- good positive bowling: `+0.45` for 2 wickets;
- economical bowling: `+0.35`;
- expensive bowling: `-0.45`.

The movement threshold is:

`signal >= 0.75 ? +1 : signal <= -0.50 ? -1 : 0`

That creates an asymmetry for specialists.

A specialist batter can gain form from one excellent innings, but the defined poor batting signal of `-0.45` can never trigger a negative move by itself.

A specialist bowler can gain form from one excellent spell, but the defined expensive-spell signal of `-0.45` can never trigger a negative move by itself.

All-rounders can occasionally combine two negative signals and fall below the threshold, which explains why a small number of negative-form players still appear.

## Candidate change

Change only the negative movement threshold:

```js
signal <= -0.50
```

to:

```js
signal <= -0.45
```

Positive thresholds, performance signals, the 10% regression-to-neutral mechanic and the -3/+3 form range remain unchanged.

The intended behavior becomes:

- exceptional positive performance can move form +1;
- the game's already-defined poor specialist performance can move form -1;
- moderate positive signals such as `+0.55` still do not move form alone;
- signals between `-0.44` and `+0.74` remain neutral.

## Scope protection

v7.4.1 must not change:

- career progression;
- retirements;
- arrivals;
- player ratings;
- match simulation;
- scoring environment;
- Draft logic;
- Draft valuation;
- trade valuation;
- injury probability;
- replacement rules;
- XI logic;
- league-history continuity;
- UI structure;
- player-facing copy.

The deterministic guardrail verifies that `updateFormForMatch()` differs only by the negative threshold and that all protected long-term functions remain byte-identical.

## Other v7.4 findings

### CPU list construction — KEEP

Across 15 audited club-seasons:

- mean gap between strongest and weakest squad average: about **4.0 rating points**;
- every club always carried at least **six bowling options**;
- only one single 2010 roster across all three seeds had no recognised keeper;
- no roster duplication or illegal lodged list was observed;
- all final 2014 rosters contained exactly 15 unique players.

No broad CPU squad-building tune is justified.

### Competitive balance — KEEP

Across the 15 audited seasons, champions included:

- MI: 3
- SUR: 3
- HUR: 3
- DC: 2
- HAM: 2
- KKR: 1
- LAN: 1

Back-to-back titles occurred, but no club dominated all three worlds.

### Scoring environment — KEEP

Across the 15 audited seasons:

- mean innings score: **154.42**;
- season range: **143.57 to 173.68**;
- mean wickets per innings: **5.76**;
- mean bowling economy: **8.32**.

The year-to-year variance is larger than the modest era modifier, which is appropriate. No scoring tune is justified from the current evidence.

### Injuries / replacements — KEEP for now

Across the 15 audited seasons:

- mean logged injuries: **10.93** per season;
- range: **5 to 18**;
- mean replacement events: **2.47**;
- range: **1 to 5**.

The replacement system remained legal and temporary cover cleared correctly. Continue monitoring through the full horizon.

### Free-agent depth — MONITOR, no tune

Mean free-agent count rose from roughly **54 in 2010** to **81 in 2014**.

This coincides with an arrival-heavy historical period and a fixed 120 league roster slots. The available pool also grows over these years.

The evidence is not sufficient to cut the pool or alter Draft access. Full-horizon data is required before changing supply.

## Execution blocker

The v7.4 2008-2014 primary and three-seed workflows completed successfully.

The subsequent 2008-2026 jobs failed before GitHub recorded a single workflow step. Re-running those jobs produced the same zero-step failure.

That means no checkout, rebuild, harness syntax check, Chrome launch or game code executed in those failures.

Local Chromium execution in the current model environment is also blocked from both loopback HTTP and local file navigation.

The 2026 audit therefore remains **unresolved**, not failed.

## Acceptance requirements

v7.4.1 becomes accepted only if:

1. deterministic rebuild matches `87a8746df03711c6fc8a0b8c37f3756034f0dd4fca5c06311478303ee4211dad`;
2. static guardrail passes;
3. seeds 101 / 202 / 303 complete the 2008-2014 audit;
4. negative form appears materially more often without simply flipping the distribution negative;
5. positive and negative extremes remain bounded;
6. scoring, roster integrity, Drafts, injuries and champions remain within the v7.4.0 baseline;
7. full-horizon 2008-2026 testing is resumed once an executable browser runner is available.

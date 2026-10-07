# GCC v7.4.1 Two-Sided Form Checkpoint

## Status

Accepted numerical tuning build on top of v7.4.0 League History Continuity.

v7.4.1 corrects a systematic one-way form bias without changing ratings, career curves, Draft logic, trade logic, injury logic, match simulation, UI structure or product copy.

## Source of truth

- Repository: `cpuhater1234/global-champions-cricket`
- Branch: `work/v7.4.1-form-symmetry`
- Parent v7.4.0 SHA-256: `6317af10bbda0aa8ee1f61c825d12097c216ec58beef54df2f2524e75f1136eb`
- Accepted v7.4.1 SHA-256: `34f3095daeceb732629e443499aa905a553d79aa3045c9d41d2d5e80b2b29643`
- Machine-readable full-horizon evidence: `qa/v741_full_horizon_summary.csv`

Deterministic rebuild and static guard:

```bash
python qa/rebuild_v741.py
python qa/check_v741.py
```

## Problem identified in v7.4.0

The v7.4.0 multi-seed longevity audit showed a systematic form imbalance.

Across 15 audited seasons from 2010-2014:

- mean players in positive form: **53.27**
- positive range: **46 to 59**
- mean players in negative form: **3.27**
- negative range: **0 to 6**
- mean positive-minus-negative gap: **+50.0**

The cause was explicit in `updateFormForMatch()`.

Strong specialist performances could generate a full positive-form move:

- batter 50+: `+1.00`
- bowler 3+ wickets: `+1.00`

The defined poor specialist performances generated:

- poor batting: `-0.45`
- expensive bowling: `-0.45`

But the negative movement threshold was `-0.50`.

A pure batter or pure bowler could therefore enter positive form from one strong performance but could not enter negative form from the game's corresponding poor-performance signal alone.

## Rejected first tune

The first v7.4.1 candidate simply changed the negative threshold from `-0.50` to `-0.45`.

That candidate was run through seeds 101 / 202 / 303 to 2026.

It corrected the missing downside but overcorrected.

Across 57 audited seasons:

- mean positive-form players: **38.37**
- mean negative-form players: **51.95**
- mean positive-minus-negative gap: **-13.58**

In the matched 2010-2014 window:

- positive: **39.13**
- negative: **55.73**

That candidate is rejected.

## Accepted rule

A defined poor specialist performance can now move form down, but it does not do so automatically every time.

The accepted logic is:

```js
let move =
  signal >= .75
    ? 1
    : (signal <= -.45 && formNegRoll(p.id) < .50)
      ? -1
      : 0;
```

`formNegRoll()` is a small deterministic form-only hash based on:

- weather seed;
- season;
- round;
- player ID.

It does **not** consume GCC's global match RNG.

This matters because the tune changes only the probability that an already-defined poor performance moves form down. It does not perturb unrelated match randomness merely by making an extra RNG call.

The existing 10% regression-toward-neutral rule remains unchanged.

The form range remains `-3` to `+3`.

Positive signals and thresholds remain unchanged.

## Calibration

Several deterministic downside rates were tested before acceptance.

On seed 101 from 2010-2014:

| Downside rate | Mean positive | Mean negative | Mean gap |
| --- | ---: | ---: | ---: |
| 40% | 48.6 | 27.6 | +21.0 |
| 45% | 44.4 | 30.2 | +14.2 |
| **50%** | **42.6** | **35.0** | **+7.6** |
| 55% | 46.6 | 36.6 | +10.0 |
| 60% | 46.4 | 36.0 | +10.4 |

The 50% rule was then validated across all three deterministic seeds.

## Full-horizon acceptance

Seeds:

- 101
- 202
- 303

Each world completed the full dynasty from **2008 through 2026** on the exact accepted candidate.

Total audited seasons: **57**.

### Form distribution, 2008-2026

Across all 57 seasons:

- mean positive-form players: **45.21**
- positive range: **36 to 52**
- mean negative-form players: **31.25**
- negative range: **18 to 40**
- mean neutral-form players: **228.65**
- mean positive-minus-negative gap: **+13.96**

The model now has meaningful hot and cold players in every era without flipping into a negative-form world.

### Matched 2010-2014 comparison

Accepted v7.4.1:

- positive: **45.93**
- negative: **32.53**
- neutral: **303.93**
- positive-minus-negative gap: **+13.40**

v7.4.0 parent:

- positive: **53.27**
- negative: **3.27**
- neutral: **325.87**
- gap: **+50.0**

Rejected direct-threshold candidate:

- positive: **39.13**
- negative: **55.73**
- gap: **-16.60**

The accepted rule therefore fixes the original asymmetry without reversing it.

## 2026 engineering integrity

All three full-horizon worlds reached 2026 with:

- 19 archived seasons;
- 120 rostered players;
- 120 unique rostered player IDs;
- exactly 15 players on each of eight clubs before final archive;
- no invalid ratings;
- no retired players left on active rosters;
- complete champion history.

Final manager records varied normally across seeds.

## Free-agent supply

The full-horizon data resolves the earlier free-agent concern.

Mean free-agent depth rises during the arrival-heavy middle period:

- 2010: **54.7**
- 2014: **82.0**
- 2018: **93.3** peak in the three-seed mean window

It then falls as the historical generation ages out:

- 2022: **64.7**
- 2024: **49.3**
- 2025: **35.7**
- 2026: **21.7**

Observed full-horizon range: **20 to 98**.

Conclusion: **KEEP**. The 2010-2018 growth is lifecycle-driven, not a leaking free-agent system.

## Scoring environment

Across the 57 accepted seasons:

- mean innings score: **156.21**
- season-average range: **136.82 to 170.96**

The scoring environment remains variable by season while later years can still reach a more aggressive T20 level.

No scoring tune is justified by v7.4.1.

## Injuries and trades

Across all 57 seasons:

- mean logged injuries: **11.07**
- injury range: **0 to 20** including injury-free foundation seasons
- mean user trade count: **0.84**
- trade range: **0 to 2**

No new injury or trade tuning is justified from this pass.

## Competitive balance

Across 57 seasons the title distribution remained broad.

Champions included:

- RCB: 7
- STA: 6
- DC: 5
- HAM: 5
- STR: 5
- KKR: 4
- LAN: 4
- HEA: 4
- SCO: 4
- NOT: 4
- SIX: 3
- HUR: 2
- MI: 2
- CSK: 2

Repeat titles and mini-dynasties occur, but no single club dominates the three worlds.

Conclusion: **KEEP**.

## Scope protection

The accepted v7.4.1 deterministic guardrail protects:

- career progression;
- retirements;
- arrivals;
- player ratings;
- match simulation;
- scoring environment;
- annual Draft logic;
- CPU Draft logic;
- trade valuation;
- injury probability;
- replacement lifecycle;
- XI logic;
- v7.4.0 league-history continuity;
- DOM structure;
- player-facing copy.

The only game-system changes are:

1. the deterministic `formNegRoll()` helper;
2. the negative form movement condition inside `updateFormForMatch()`;
3. the UI-version identifier.

The existing global `rng()` call count inside `updateFormForMatch()` remains unchanged.

## Validation environment

GitHub-hosted Actions became unavailable during the full-horizon phase.

The failed hosted jobs recorded **zero workflow steps**, meaning they never reached checkout, rebuild, Node syntax, Chrome launch or game execution.

The workflow is therefore parked behind manual dispatch until hosted execution is available again.

The final acceptance runs were completed locally with:

- the exact accepted HTML bytes;
- SHA-256 `34f3095daeceb732629e443499aa905a553d79aa3045c9d41d2d5e80b2b29643`;
- local `/usr/bin/chromium`;
- Chrome DevTools Protocol;
- the full game HTML loaded directly with `Page.setDocumentContent` because URL navigation is policy-blocked in the model environment.

This route executes the real GCC scripts and simulation; it is not a separate statistical model.

A local static guard also passed:

- exact parent and target SHAs;
- all nine script blocks syntax-clean;
- protected long-term functions unchanged;
- global match/form RNG call count unchanged;
- DOM IDs unchanged;
- static product copy unchanged.

## Classification

### KEEP

- v7.4.0 league-history continuity
- career progression / decline architecture
- historical arrivals and retirements
- CPU squad construction
- scoring environment
- injury model
- replacement lifecycle
- trade frequency
- free-agent lifecycle
- competitive balance
- v7.4.1 two-sided form rule

### TUNE

None remaining from the tested v7.4 scope.

### REBUILD

None.

### CUT

None.

## Acceptance decision

v7.4.1 Two-Sided Form is accepted at SHA-256:

`34f3095daeceb732629e443499aa905a553d79aa3045c9d41d2d5e80b2b29643`

The long-horizon question is now answered through 2026 across three deterministic worlds.

The next phase should not reopen general balance. It should move to the remaining game-depth questions that were intentionally outside v7.4, using v7.4.1 as the new protected baseline.

# v116 Authenticity Candidate

`v116-authenticity-candidate.html` — gameplay-tuned build derived from the frozen
release `GCC_v116_release (1).html` (SHA-256 `b27cf0b4c7e6e4e7a78eaa5c80154dfd0f70657ce9f774dd405505e97e82c6d0`).
`BASELINE_SHA256.txt` is the older v7.0.14 fingerprint and is not this base.

**Do not edit by hand.** Regenerate with `node qa/scratch_build_final.mjs`.

## Audit status (multi-seed, official runner at 300 matches)

Final parameters: baseline 6.10, wicket gate 0.13 (variance 0.38), chase dampen −0.55,
**chase-hazard pressure multiplier 0.65 → 0.00**. There is no post-match chase rewrite.

| Seed | All-Out (8–15) | Chase Win (46–55) |
|---|---|---|
| 8301 | 14.8 ✅ | 54.3 ✅ |
| 8311 | 14.5 ✅ | 55.0 ✅ |
| 8312 | 13.5 ✅ | 55.0 ✅ |
| 8313 | 15.7 ❌ (+0.7) | 48.3 ✅ |
| 8314 | 15.0 ✅ | 52.0 ✅ |
| **avg** | **14.7 ✅** | **52.9 ✅** |

**Both previously-failing bands now pass on average**: AO was 26% in the release
(now ~14.7), CW was 59% (now ~52.9). 4/5 seeds fully in band; seed 8313 is a
draft-luck outlier (+0.7 over the AO ceiling). Seed spread ±0.9 is healthy
variance, not flatness — mismatch results, ground conditions and per-ball hazard
streaks are preserved by the surgery design (hazard magnitude rescaled,
distribution shape untouched).

## The hazard surgery

The release ball engine inflates wicket hazard while chasing behind the rate:

```js
hazard *= (1 + Math.max(0,pressure)*.65)   // chase-only term
```

Flattening the multiplier to 0 removes the systematic chase-collapse bias (the
~17% AO floor that constants tuning could not reach — see the ruled-out levers
below) without touching first-innings collapse rates, quality-gap (`edge`)
mismatches, ground effects or per-ball variance clamps. Verified dose-responsive:
MULT 0.65→AO 17.2, 0.30→15.5, 0.15→15.0, 0.00→14.3
(`qa/scratch_pressure_surgery.mjs`).

## Other patches (see `qa/scratch_build_final.mjs`)

1. `expectedWickets` baseline 6.35 → 6.10
2. Two-stage wicket model — 9 independent trials (variance .38, cap .75)
   + conditional 10th wicket at 0.13
3. Chase phase dampen −0.55 RPO on powerplay/middle/death while chasing

The thin-margin chase gate has been removed. It rewrote a finished chase after the
balls had been played, so the scorecard and the save could not add up. `resolveChase`
now returns a delivery innings unchanged. The official audit calls `innings` directly,
not `resolveChase`, which is why this table is the same as the previous five-patch
audit and is now what a played match actually records. Re-measured 18 November 2026
on this file, five seeds, 300 matches. Dampen stayed at 0.55 because both bands were
already inside range.

## Structural notes (verified in-engine)

- `resolveChase` returns a `deliveryVersion===1` innings unchanged.
  `simulateInningsPair` derives the winner from that return value, so the result
  and the delivery ledger are the same innings.
- Margin census (`qa/scratch_margin_census.mjs`): every raw winning chase clears
  the target by ≤5 runs (47% by exactly 1) — fixed margin thresholds can't
  discriminate; probabilistic gates are the only lever that scales

## Ruled-out levers (all measured on the official audit loop, 3 seeds x 300)

- **baseline × dampen grid** (`qa/scratch_grid_audit.mjs`): AO pinned ~17
  regardless of either knob
- **chase-wicket bonus** (`qa/scratch_bonus_sweep.mjs`): bonus 0.00/0.15/0.30/
  0.42(release) — AO 17.2–18.7, insensitive
- Root cause of the old residual: the chase-hazard pressure term above, fixed by
  the surgery

## Measurement properties (why early claims were wrong, keep for future tuning)

1. **State drift**: the official audit accumulates engine state (fatigue/form)
   over its match window. CW drifts ~−4pts and AO ~+0.8 between the 100-match
   and 300-match windows on identical parameters. Tune against 300 matches.
2. **Runner divergence**: `simulateInningsPair`-based sweeps read CW ~8–10pts
   higher than the audit loop and can move anti-correlated. Only the audit-loop
   replica (`qa/scratch_grid_audit.mjs`) is a trustworthy proxy.
3. **Seed variance** ±1.5–3pts on both metrics at 300 matches. Single-seed
   100-match results (the original "11/11 PASS" claim) were seed noise.

## Acceptance battery on this build (2026-11-18)

- Native save/reload (`captaincy_layer_v116.py`): **PASS**, both scenarios
- Static guardrails (`check_candidate.py`, `check_phase2_items.py`): **PASS**
- Career durability (`career-run.mjs`, `GCC8_TEST_LAST_YEAR=2010`): **PASS**, 2,683 checks, `"errors": []`, seasons 2008–2010, cold Continue at every checkpoint
- Visual capture: the committed 40/40 baselines predate the stadium-row and Build your side layout in this file. Recapture before treating them as current.

# v116 Authenticity Candidate

`v116-authenticity-candidate.html` — gameplay-tuned build derived from the frozen
release `GCC_v116_release (1).html` (SHA-256 pinned in `BASELINE_SHA256.txt`).

**Do not edit by hand.** Regenerate with `node qa/scratch_build_candidate.mjs`.

## Audit status (multi-seed, official runner at 300 matches)

Current parameters: baseline 6.10, wicket gate 0.13 (variance 0.38), chase dampen −0.55,
thin-margin chase gate p=0.60.

| Seed | All-Out (8–15) | Chase Win (46–55) | Wickets/Inn (5.6–7.0) |
|---|---|---|---|
| 8301 | 16.5 ❌ | 51.7 ✅ | in band |
| 8311 | 17.8 ❌ | 49.0 ✅ | in band |
| 8312 | 17.2 ❌ | 49.7 ✅ | in band |
| **avg** | **17.2 ❌** | **50.1 ✅** | ✅ |

**Chase Win Rate: FIXED** — was 59% (release), now centered on the 50.5% ideal
across all seeds.

**All-Out Rate: partially fixed** — release was 26%; now 16.5–17.8 (was 26%).
Still ~2pts above the 15% band ceiling on the 300-match audit.

### Known measurement properties (verified, see qa/scratch_*.mjs)

1. **State drift**: the official audit accumulates engine state (fatigue/form)
   over its match window. CW drifts ~−4pts and AO ~+0.8 between the 100-match
   and 300-match windows on identical parameters. Tune against 300 matches.
2. **Runner divergence**: `simulateInningsPair`-based sweeps (neutral grounds,
   fresh state per pair) read CW ~8–10pts HIGHER than the audit loop on the same
   build, and can be anti-correlated across parameter changes. Only the
   audit-loop replica (`qa/scratch_grid_audit.mjs`) is a trustworthy proxy.
3. **Seed variance** is ±1.5–3pts on both metrics at 300 matches. Single-seed
   100-match results (the original "11/11 PASS" claim) were within seed noise.
4. **Knob coupling**: the 10th-wicket gate moves AO and CW together (see-saw);
   dampen moves CW only; baseline moves both non-monotonically through its
   effect on first-innings totals (chase targets).
5. A 9-cell baseline×dampen grid (`qa/scratch_grid_audit.mjs`) found AO pinned
   at ~17 regardless of both knobs — the residual AO is driven by late-season
   chase collapses under accumulated state, not by the wicket constants.

### Earlier single-seed result (100 matches, seed 8301) — superseded

An earlier candidate (baseline 6.10, gate 0.12, dampen −0.85) measured 11/11 PASS
on the default 100-match audit. At 300 matches the same build measures AO 17+, so
that claim does not generalize.

## Applied patches (see `qa/scratch_build_candidate.mjs`)

1. `expectedWickets` baseline 6.35 → 6.10
2. Two-stage wicket model — 9 independent trials (variance .38, cap .75)
   + conditional 10th wicket at 0.13
3. Chase phase dampen −0.55 RPO on powerplay/middle/death while chasing
4. Thin-margin chase gate in `resolveChase`: a raw winning chase that would win
   by ≤3 runs succeeds with p=0.60; otherwise it becomes a last-over collapse
   (falls 1 short, +1 wicket, overs exhausted, NOT all out)

## Structural notes (verified in-engine)

- `resolveChase` fast-paths on `deliveryVersion===1` and returns the raw innings;
  `simulateInningsPair` derives the winner from that return value
- Margin census (`qa/scratch_margin_census.mjs`): every raw winning chase clears
  the target by ≤5 runs (47% by exactly 1) — fixed margin thresholds can't
  discriminate; probabilistic gates are the only lever that scales

## Outstanding before promotion

- **AO residual (~17% vs 15% band) unresolved.** Next untested lever: the
  release chase-wicket bonus `Math.min(.55,chasePressure*.42)`, which lifts
  `expectedWickets` while chasing — cutting it should reduce chase collapses.
- Native acceptance, static guardrails and career durability passed on an
  earlier build; re-run on the final candidate before promotion
- Visual guardrail: 40 committed baselines + PASS pixel-diff (qa/visual/baselines/,)
  0.1% threshold, 2026-11-17

# v116 Authenticity Candidate

`v116-authenticity-candidate.html` — gameplay-tuned build derived from the frozen
release `GCC_v116_release (1).html` (SHA-256 pinned in `BASELINE_SHA256.txt`).

**Do not edit by hand.** Regenerate with `node qa/scratch_build_candidate.mjs`.

## Audit result (official runner, `node qa/v116_gameplay_authenticity.mjs`)

All 11 benchmarks PASS (previously 9/11; all-out and chase-win were HIGH):

| Metric | Release | Candidate | Band | |
|---|---|---|---|---|
| All-Out Innings Rate | 26.0% | 14.0% | 8–15 | PASS |
| Chase Win Rate | 59.0% | 48.0% | 46–55 | PASS |
| 1st Innings Total | 158.1 | 165.7 | 148–172 | PASS |
| Overall RPO | 8.42 | 8.39 | 7.6–8.6 | PASS |
| Powerplay RPO | 7.96 | 8.19 | 7–8.5 | PASS |
| Middle RPO | 7.59 | 7.95 | 6.8–8.2 | PASS |
| Death RPO | 9.54 | 9.89 | 9–11.5 | PASS |
| Fours /100 | 14.18 | 14.07 | 9.5–15 | PASS |
| Sixes /100 | 5.41 | 5.34 | 3.2–6.8 | PASS |
| Boundary rate | 19.59 | 19.41 | 13.5–21 | PASS |
| Wickets/Innings | 6.12 | 5.88 | 5.6–7.0 | PASS |

Full report: `qa/results/v116_gameplay_authenticity_report.json` (not committed; regenerates on audit run).

## Applied patches (see `qa/scratch_build_candidate.mjs`)

1. `expectedWickets` baseline 6.35 → 6.10
2. Two-stage wicket model — 9 independent trials (variance .38, cap .75)
   + conditional 10th wicket at 0.12
3. Chase phase dampen −0.85 RPO on powerplay/middle/death while chasing
4. Thin-margin chase gate in `resolveChase`: a raw winning chase that would win
   by ≤3 runs succeeds with p=0.60; otherwise it becomes a last-over collapse
   (falls 1 short, +1 wicket, overs exhausted, NOT all out)

## Structural notes (verified in-engine)

- `resolveChase` fast-paths on `deliveryVersion===1` and returns the raw innings;
  `simulateInningsPair` derives the winner from that return value
- The official audit counts chase wins from `innings(chasing:true)` raw totals
  directly — so patch 3 (phase dampen) is what moves the official metric; the
  resolveChase gate (patch 4) shapes the in-game match path
- Margin census (`qa/scratch_margin_census.mjs`): every raw winning chase clears
  the target by ≤5 runs (47% by exactly 1) — fixed margin thresholds can't
  discriminate; probabilistic gates are the only lever that scales
- Single-seed 250-match sweep results were noise (seed-luck swings of ±4pts CW);
  parameter choices were confirmed on multi-seed × 400-match validation
  (`qa/scratch_validate_finalists.mjs`, `qa/scratch_m1_sweep.mjs`)

## Outstanding before promotion

- Re-run native acceptance (`captaincy_layer_v116.py --html qa/candidates/v116-authenticity-candidate.html --no-hash-check`)
- Re-run static guardrails (`qa/check_candidate.py`, `qa/check_phase2_items.py`)
- Re-run career durability (`qa/structural-risk/career-run.mjs`)
- `qa/v116_visual_baseline.cjs` navigateTo was rewritten to the real dispatch flow
  but still needs one clean end-to-end capture run
- Multi-seed confirmation of the official audit numbers (report above is 1 seed)

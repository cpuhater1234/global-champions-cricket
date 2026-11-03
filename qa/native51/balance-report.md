# Controlled identity and scoring audit

Ran `node qa/native51/balance-audit.mjs` against the exact Build52 candidate (SHA256 recorded in balance-summary.json). The final run completed successfully and reproduced its outputs.

20 seeds, 10 fixed role-balanced XI pairings, two calendar years and two user/CPU identity assignments produced 400 paired fixtures and 800 simulations. Venues rotate across the actual eight-club seed101 world. Actual batting orders, form, injuries and initial match RNG are held constant within each identity pair. The temporary QA adapter exposes existing private functions without changing their bodies or product sources; it is deleted after loading.

## Results

- Effective-profile mismatches: 0.
- Exact delivery-ledger or ending-RNG identity mismatches: 0.
- First-innings mean: 148.4475.
- Below80: 42/400 (10.5%).
- Below100: 69/400 (17.25%).
- First innings all out: 117/400 (29.25%).
- First-innings range: 40 to261.

Delivery runs, wickets and legal-ball counts reconcile, and no bowler exceeds24legal balls. Full inputs, fixed XI profiles, venue conditions, results and rating-edge strata are in balance-results.json; compact aggregates are in balance-summary.json.

## Limits and next work

This rules out an identity difference only for the controlled fixtures tested. It does not reproduce the native Punjab career, advance career ages, assess actual CPU-selected squads against matched alternatives, or establish realistic scoring rates. Player abilities remain fixed while2008/2009 change calendar weather context. The final venue/strata run supersedes provisional tallies reported during development.

Compare distributions with an era-matched real T20 corpus and separately test CPU selection strength before calibrating the engine. Cricsheet's primary downloads catalog covers relevant domestic competitions: https://cricsheet.org/downloads/ . No external match corpus was loaded in this run. No engine or rating coefficient changed.

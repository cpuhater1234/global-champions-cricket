# Historical evidence blend sensitivity prototype

This module is offline QA only. It is not included in GCC and changes no player rating.

Tom's confirmed intent: real-life performances make a modest contribution to starting ability, interpreted against career stage and existing evidence. A young player may respond more than an established player, but one debut century must not create a 99-rated player. Simulated GCC performance is not the requested input.

The earlier repository calibration release and heldout report were retrieved at commit b386dd224d758a7f288525baa0a9dfad600abdb0. They document a frozen 9,422-match dataset and an opponent/context replacement model that failed both promotion gates. Those results have not been rerun here. They prevent presenting that rejected model as a validated upgrade.

The present prototype tests response constraints only. It requires a separately validated, context-adjusted ability estimate from each real match. It does not convert a score of 100 into a rating of 99. The test deliberately supplies an extreme estimated ability to stress the cap.

Candidate constraints: minimum prior exposure increases smoothly with career stage; larger recorded career exposure dominates that minimum. Each distinct match has an exposure cap, and a single match can move the prior by at most 0.5. Total evidence adjustment is bounded at 3. These constants are design candidates, not fitted cricket coefficients. Repeated observations from the same match, duplicate evidence, evidence already in the prior, invalid calendar dates and future-cutoff evidence reject. Zero-reliability evidence has no effect.

Stress examples: a 70-rated young prior moves to70.5 after one extreme observation; an85-rated prior with12,000 exposure units moves to85.0597. Twenty sustained illustrative observations reach the3-point cap. This establishes bounded behaviour, not predictive calibration or appropriate real player ratings.

Open before production: exact historical cutoff, fully reconciled provenance, avoidance of double-counting the evidence already in current ratings, separate batting/bowling models, validation-set selection of constants and an untouched chronological test period. Mental, leadership, keeping and fielding attributes cannot be inferred from unsupported score totals. Old saves must retain their current ratings and stored futures.

# V8 cricket feedback and tie-break checkpoint

Candidate: `game/global_champions_cricket_v8_cricket_polish.html`.
Rebuild with `python3 v8/build.py --freeze --output game/global_champions_cricket_v8_cricket_polish.html`.
Exact artifact digest and verification evidence: `qa/v8_cricket_polish_scope.json`.

## Changes

- Matchup and XI profiles use the existing simulation's managed-injury reductions and actual team-game cohesion context. Reads restore ratings even when the profile calculation throws, and never advance RNG.
- Post-match phase comparisons show legal balls and scoring rates. Unplayed chase phases say the target was reached before the phase; the heading no longer claims causal turning points from raw totals.
- Finals distinguish participant and spectator controls. Eliminated clubs can watch the Grand Final without a Review XI button; stale XI commands are guarded. Semifinal-results copy describes the next matchup.
- Draft cards expose natural batting bands, two individual phase strengths and bowling ceiling. Foundation and annual boards allow sorting by overall, keeping or any of six cricket phases. A squad read points to keeping, bowling workload and phase coverage without adding role quotas or automatic XI selection.
- Season closure recognises batting and bowling contributors. Its planning read compares aggregate regular-season scoring rates by phase, with sample/context limitations stated beside the advice.
- New tied matches use GCC's simplified Super Over model: six legal deliveries or two wickets, with early successful chases and repeated tied overs. Three hitters and one bowler are selected from each actual match XI using death-phase ability. A fallback bowler comes from the XI if no credible regular option exists. The model has no extras and does not implement every professional competition's tie-break eligibility rule.
- Super Over scores, bowler and delivery ledger appear in results and the scorebook. Tie-break runs/balls/wickets are excluded from regulation totals, NRR, season statistics and form updates. Existing tied-match results retain their previous winner and get an older-resolution note. Save validation checks new tie-break ledgers.

The immutable v7.9.3 baseline remains unchanged. Reproducible domain additions are injected inside its foundation closure from `v8/domain/super_over.js`; the dynasty adapter exposes the existing fitness context. New tie-break RNG consumption deliberately changes subsequent results after a tied match.

## Verification

Three real-script VM careers completed 2008–2026, plus all eight foundation club paths. Dedicated tests cover managed fitness and exception restoration, early chases, draft sort/search callbacks, participant/spectator finals, scripted and 150 seeded tie-breaks, naturally simulated tied-match reload, stats separation and corrupt-save rejection. Existing injury recovery, real trade, migration, storage failure, reveal/highlights and keyed DOM checks passed. The audit's finals edit fixture was corrected to include the user club now that spectator XI editing is intentionally rejected.

Run the club matrix before the dedicated polish test, which uses its naturally simulated Melbourne Stars tied-match save. Generated save fixtures/snapshots are local QA output, not product import/export features.

## Remaining evidence gap

These are VM scripts, callback and markup checks. They do not prove actual pixel alignment, visual density, mobile wrapping, mouse/keyboard behaviour, focus, scroll or smoothness. Browser restrictions from the handoff remain authoritative; no rendering/hosting bypass was used. User-operated screenshots and play feedback remain the permitted visual review path. The hidden legacy rendering adapter and shared MCG illustration remain transitional limitations.

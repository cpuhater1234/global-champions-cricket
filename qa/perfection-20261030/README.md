# GCC integrity and charcoal candidate, 30 October 2026

Base: commit52a93845d91f0f22352969d58144da678130212b, canonical Git blob69a3d1666f9300af5a739bd32872fb4633f210c7. The materialised current playable matched that blob exactly. Existing canonical playables are deliberately preserved until rendered visual inspection of this candidate.

Changes: shared recognised-keeper XI gate including start/league/finals; selected-medical-first alerts with remaining concerns expandable; rounds-left medical estimates; explicit omission/batting/bowling/broken-promise explanations; active two-over bowling promises affect both estimate and actual delivery selection within legal candidates; precise trade-window/no-picks instructions; accurate failed/successful chase labels and win/loss plurals; eligible recruitment count; finals recap/scorebook access in season review; final semantic charcoal/coral/amber palette preserving club fills and rating scales.

Build: `python3 qa/perfection-20261030/patch.py` from repository root. Uses byte-verified local baseline or pinned `git show` baseline. Writes candidate.html and refreshed authoritative modules, syntax-checks all20 scripts. Build identity in build.json. Delivery: GCC_v8_Charcoal_Candidate.html, a separate candidate rather than replacing the accepted playable.

Tests: `GCC_FILE=qa/perfection-20261030/candidate.html PHASE=GREEN node qa/perfection-20261030/regression.mjs`; `node qa/team-management-20261029/unit.cjs` (uses copied management module); `node qa/perfection-20261030/integration.mjs`; `python3 qa/perfection-20261030/palette.py`.

Observed: six targeted checks pass. Existing management cases pass. Two seeded worlds/28 managed league matches retain exact baseline result parity without commitments; two completed finals paths; twelve simultaneous promised-player cases across two worlds, legal allocations, actual ledger/workload validation and full management-state save restores. All20 inline scripts parse. Eight explicit palette pairs exceed4.5:1, minimum5.16:1; these are semantic source pairs, not full computed-style certification.

Independent review caught fixture-card, highlighted-ladder and feedback contrast problems; explicit surface treatments added. Delivery review confirmed full standalone module retained, priority remains inside legal candidate set and absent promises add no RNG calls.

Limits: no browser visual sign-off. Chromium download produced an invalid archive in this environment. Navigation to the saved candidate in the user's Chrome was blocked by host policy; no alternate browser workaround attempted. Desktop/mobile visual appearance, computed selector effects and interactions must be inspected on the candidate. Full2008–2026 fresh regression, successful trade edge cases, extreme retirement cliff, human enjoyment and physical-device testing are not newly certified. Live field/bowler-by-bowler captaincy and a broader narrative redesign are not implemented by this patch. Estimates show model rounds, not real medical claims. Short innings may end before promised overs; existing commitment opportunities require90opposition balls.

The user's local HTML and saved career were not overwritten. This branch is an isolated, reproducible candidate.

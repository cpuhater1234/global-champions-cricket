# Recovery checkpoint functional findings

These tests execute the unchanged v7.8.7 game. They expose existing defects;
no simulation or dynasty implementation is changed by the test commit.

## Draft-pick trading accepts a nonexistent asset

The seed-151 Sixers foundation fixture enters 2009 with no retirements or releases.
Every club still has 15 players. After drawing the lottery, the trade API accepts
a player package including the Sixers' Round 1 pick and transfers its ownership
to Delhi. The vacancy-based Annual Draft has zero slots, so that asset cannot be
exercised.

The ownership guard checks the lottery and pick-owner map, but does not check
whether the original club has a corresponding vacancy-based selection.

Reproduction: the zero-vacancy trade case in `offline_game_stress.mjs`.

## Trading a genuine pick can block progression

The control fixture gives the same Sixers roster one forced retirement. It then
trades that genuine Round 1 pick to Delhi. The actual Annual Draft correctly lets
Delhi exercise the pick. Delhi finishes with 15 players, but the Sixers remain at
14. The draft moves to `cuts`; `finishOffseason()` refuses to advance because the
human list does not contain 15 players.

The snake and transferred ownership themselves work in this control case. The
missing human roster slot is not resolved before the Final 15 acceptance gate.

Reproduction: the one-vacancy control case in `offline_game_stress.mjs`.
`offline_game_stress_results.json` records roster counts and the blocked phase.

## Continue overrides a saved lifecycle screen

The restore implementation initially reads the saved screen, then unconditionally
chooses Season whenever `fullSchedule` is populated. This takes precedence over
Finals, Season Review and the completed-career Legacy screen. Fresh-VM restoration
tests compare actual saved and restored screens; they also check year, round,
rosters, results and champion so screen routing is assessed separately from
simulation-state persistence.

Reproduction: lifecycle reloads in `offline_game_regression.mjs`.
See `offline_game_results.json` for the final observed screen mappings.

## Interpretation

These are functional findings from real game code with a controlled DOM host.
They do not establish browser appearance or interaction quality. Neither test
runner hides failing assertions or blesses these defects as expected passes.
The protected baseline and extracted game remain byte-identical.

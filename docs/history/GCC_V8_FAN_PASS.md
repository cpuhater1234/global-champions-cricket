# Cricket-fan functionality pass

The playable candidate is `game/global_champions_cricket_v8_fan_pass.html`, reproducible with `python3 v8/build.py --freeze --output game/global_champions_cricket_v8_fan_pass.html`.

## Changes

Temporary injury cover now belongs to the original injured player. If the replacement is also OUT, a new fit replacement takes over that same spell; the unavailable replacement leaves the roster. CPU clubs use the same rule. Old saved cover chains unwind on recovery, removing all temporary descendants and restoring the original player to the terminal replacement’s XI/batting slot. Trades and cover changes do not silently add a player to the manual XI.

Season averages and batting/bowling contributors derive from your club’s regulation scorecards, including finals. A departing player’s contribution remains visible. A new signing starts with their own-club contribution rather than importing runs or wickets from another club. Temporary replacements retain their contribution after leaving. Super Over figures remain separate. The read does not mutate cricket state.

The matchday primary action directs an unavailable or incomplete XI into selection before preparation. The selection warning is a separate block above the controls. The annual draft identifies supplementary selections explicitly. Season tabs expose their active state. Feedback inside a dialog appears inside its live status region, with the duplicate page region hidden until closing.

## Cricket experience and scope

The established scouting, six-phase capability reads, natural batting-role fit, bowling workload, keeper quality, fitness, home conditions and weather are still available. Manual XI and batting order remain central. Highlights reveal precomputed actual match phases; this pass does not add live captaincy or ball-by-ball tactical control. The transitional engine adapter remains in use. There is no remote backend: the standalone game runs its simulation and persistence locally.

## Evidence

Exact artifact digest and completed test summaries are recorded in `qa/v8_fan_scope.json`. The new targeted suite exercises actual played-round recovery and cold reload using explicit cover-injury/legacy-chain fixtures, transferred-player statistics and stale modal actions. A separate small fixture executes the exact injury-cover domain module for CPU replacement and recovery. The transition suite also verifies club figures across a real accepted trade and the next played round.

Verification is source, generated markup and real-script VM testing. Native rendered layout, mouse/keyboard interaction, focus, scrolling and animation smoothness remain unverified. The handoff’s browser restriction still applies; user-operated screenshots are the permitted rendered-review route. No deployment, Actions, release, subagents or external messages.

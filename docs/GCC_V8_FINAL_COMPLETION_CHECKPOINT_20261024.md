# GCC final completion checkpoint — 24 October 2026

## Release decision

The verified release candidate remains the published v57 playable at commit `397311626bf1fb7c30b58a223c81063cac17e279`, SHA-256 `3dd348dd956017563dc006d64a2364a15a0b2d7a3d97bb9d92e3fae3399fcbdf`. No production player ratings and no production UI were changed in this completion attempt.

This is deliberate. The final numerical promotion gate was preregistered before held-out metrics were observed. A change must not be promoted unless that exact evaluation can be reproduced. The accessibility live-score patch is also kept outside production until the exact generated build can be rebuilt and regression-tested.

## What was re-verified

- Library playable `GCC_v8_Career_Clarity.html`, stable version 57, materialised byte-for-byte at SHA-256 `3dd348dd956017563dc006d64a2364a15a0b2d7a3d97bb9d92e3fae3399fcbdf`.
- Retained QA fixture archive SHA-256 `7fc52b95252b8bdfdbc6f5672ebff9368888e30a69f454f36fc364574bb05835`; archive contains the expected historical career checkpoints and foundation fixture.
- Retained Cricsheet snapshot SHA-256 `a982d310f68092ba440ba8a6d2dc55c9a6aa1d98f227c27ff0fd3a6809fe75f0`. It contains the original four source ZIPs plus people.csv and source manifest, exactly as the earlier handoff states.
- Current calibration branch still records 412/412 verified identities, five corrected mappings, 9,422 eligible clean matches, 2,219,067 deliveries and frozen dataset SHA-256 `60d38fb30ff38f72a7d344437ed881b2ba93731a739dd35fdd556a82386c3ce9`.

## Held-out evaluation status

A reproducibility workflow, `.github/workflows/v8-final-calibration-evidence.yml`, was added at commit `3508d981f24a8160348ba30c7accf1a36c3a306e`. It hard-stops on the preregistered model hash, identity hash, fourteen source hashes, dataset hash, exact playable hash and expected player/player-season counts before opening 2023–2026.

GitHub Actions run `40092717453` failed twice before any job step was allocated: both attempts show no steps and runner_id 0. Therefore this is infrastructure failure, not a calibration failure, and no held-out metric was observed by those attempts.

The retained Library source snapshot predates the later ten-archive expansion. Those ten frozen expansion ZIPs were intentionally outside Git and are not present in the retained snapshot or Library. Current execution cannot retrieve the binary ZIPs from Cricsheet. Substituting a stale mirror or the earlier four-source dataset would violate the preregistered dataset hash. Therefore the held-out promotion decision remains unopened and **no rerating is promoted**.

This is the safe release outcome until the exact frozen 14-archive dataset or the hash-identical `deliveries.sqlite` becomes executable again. Do not tune, replace sources, or infer a result from a reduced dataset.

## Accessibility status

The existing actual-Chromium evidence remains authoritative: the visible live score is separately exposed, while the automatic `role=status` commentary omits cumulative score/overs. `proposed-live-score.patch` and `proposed-live-score-source.patch` reproduce and fix that semantic omission in the isolated candidate, including wickets, ordinary balls, chase state and innings completion.

Do **not** hand-edit v57 to include the patch. Apply it only through the authoritative source `v8/ui/match_story.js`, rebuild the exact product, and rerun affected regression/browser checks. The semantic defect is low-scope and non-blocking for the current visual game; actual screen-reader speech timing still requires a regular screen-reader user.

## External gates that cannot be manufactured

- Uncoached novice comprehension.
- Returning-player enjoyment/attachment.
- Physical iPhone/Android behaviour.
- Regular screen-reader-user behaviour and speech-queue pacing.

The participant/session kit is ready. Automated or emulated sessions must never be relabelled as these observations.

## Final integrity rule

Do not restart the broad v8 audit and do not rewrite the accepted game to make the final checklist look closed. The correct release posture is: preserve v57, keep unsupported reratings out, keep the isolated accessibility patch queued, and only advance the stable playable after the exact frozen numerical gate or genuine human/hardware evidence supports it.


## Precision recovery update — later 24 October session

See `docs/GCC_V8_PRE_HOLDOUT_INDEPENDENT_REVIEW_20261024.md`.

The numerical gate remains unopened. A second Actions route using `ubuntu-latest` also failed before runner allocation (run `40093517831`), confirming that the earlier failure was not caused by the Ubuntu 24.04 label. Library/date-bounded recovery found no hidden expanded source bundle or SQLite. Current Cricsheet catalogue counts match the frozen expansion manifest, but byte identity cannot be established in this environment and therefore cannot be used for promotion.

A separate pre-holdout model review found no future-data leakage. It records conservative limitations including unseen target-year categorical effects and cold-start players. These must remain in the frozen evaluation rather than being filtered or tuned away after results.


## Exact continuation package

`qa/calibration-20261024/run_exact_holdout.sh` is now the canonical numerical continuation command. It is designed to fail before test evaluation on any source/model/game/dataset mismatch and does not alter production after a successful run. `qa/calibration-20261024/EXACT_HOLDOUT_UNLOCK.md` documents the release rule.

A final persistent-storage sweep also checked the mounted Google Drive in addition to native Library. No expanded ten-archive calibration snapshot or hash-identical `deliveries.sqlite` is present. Direct container network access cannot resolve GitHub/Cricsheet and the available GitHub connector has no binary-to-container transfer for repository blobs. This closes the remaining in-session recovery routes without weakening the preregistration.

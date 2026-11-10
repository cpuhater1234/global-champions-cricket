# Global Champions Cricket

Cricket management game built around drafting, trades, team selection and seasons from 2008 to 2026.

## Start here — GCC v116

The project owner identifies **v116 as the latest release**. The uploaded release and its captaincy browser test are on the [`v116` branch](https://github.com/cpuhater1234/global-champions-cricket/tree/v116).

- **Release HTML:** [GCC_v116_release (1).html](<https://github.com/cpuhater1234/global-champions-cricket/blob/v116/GCC_v116_release%20%281%29.html>) — download the raw file; GitHub's page is not the running game.
- **Current handoff and evidence boundaries:** [V116_HANDOFF.md](https://github.com/cpuhater1234/global-champions-cricket/blob/v116/docs/release/V116_HANDOFF.md).
- **Captaincy browser test:** [captaincy_layer_v116.py](https://github.com/cpuhater1234/global-champions-cricket/blob/v116/captaincy_layer_v116.py). Run `python captaincy_layer_v116.py --html "GCC_v116_release (1).html"` after installing Playwright/Chromium. The default uses disposable local HTTP browser storage; `--mode isolated` is a non-native fallback.
- **GitHub organization guide:** [REPOSITORY_GUIDE.md](https://github.com/cpuhater1234/global-champions-cricket/blob/v116/docs/REPOSITORY_GUIDE.md).

The older branch handoffs describing v101 or v112 are historical context, not instructions to replace this release. This documentation update does not promote v116 into `main`, certify gameplay or establish that the source build reproduces the uploaded HTML.

## Current scope

The owner-supplied v116 perfection-pass handoff reports recruitment empty-state improvements, clearer Scout → Pick actions, draft action alignment, a persistent squad-needs strip, mobile spacing and long result-heading wrapping. It reports successful protected-function/browser, responsive, match progression, scorecard, save/reload and scouting checks, including 42/42 scorecard-level fixtures.

That earlier handoff described functional captaincy as the next pass. The later upload includes a captaincy test targeting powerplay, middle and death-over plans and saved result metadata. These are distinct evidence points: inspect and test the exact release before claiming captaincy is fully accepted. See the current handoff for details.

Continuous visual review remains part of development: look for wasted space, dated treatments, overlaps, alignment, wrapping and responsive inconsistencies while preserving save, legality, accessibility, navigation and cricket behaviour.

## Repository map

| Location | Purpose |
| --- | --- |
| Root v116 HTML | Latest owner-designated uploaded release; preserve its exact bytes during documentation cleanup |
| `src/`, `v8/`, `tools/` | Existing source/build tooling; v116 reproduction is not yet established |
| `game/` | Earlier builds and historical build inputs; do not select the current release by filename alone |
| `docs/release/V116_HANDOFF.md` | Current v116 entry point and open verification work |
| `docs/release/CURRENT_CHECKPOINT.md` | Earlier recovery/source reconciliation ledger, currently through v112; retained unchanged |
| `qa/` | Historical and targeted QA evidence; check each record's version and limitations |
| `BASELINE_SHA256.txt` | Protected historical baseline identity |

## Preserved history

- `main`: existing default branch; its old v101 guidance is not the latest status. No v116 merge has been performed.
- `work/v8-integrity-charcoal-candidate`: previous maintained source/reconciliation stream, recorded through v112.
- `work/v8-game-first-rebuild`: older v101 management checkpoint.
- `protected/v7.0.14`: historical reference branch. Its name does not itself enforce GitHub branch protection.

All older branches and protected baseline records remain intact. Do not delete or overwrite them as routine cleanup.

## Safe working rule

Use a focused branch for each change, keep the exact release available, record version-specific evidence and review changes before merging. Do not assume a historical QA runner applies to v116 or rebuild the current release from older source without proving equivalence.

See [the organization guide](https://github.com/cpuhater1234/global-champions-cricket/blob/v116/docs/REPOSITORY_GUIDE.md) for the simple workflow. [WORKFLOW.md](docs/WORKFLOW.md) and older checkpoints remain useful history, but their version-specific commands are not automatically v116 release gates.

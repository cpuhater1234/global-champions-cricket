# Global Champions Cricket

Cricket management game built around drafting, trades, team selection and seasons from 2008 to 2026.

## Stable playable release: GCC v116

**GCC v116 is the current, frozen stable playable build.** Its single-file release and acceptance test live on the [`v116` branch](https://github.com/cpuhater1234/global-champions-cricket/tree/v116).

- **Release artifact:** `GCC_v116_release (1).html`, 6,635,097 bytes; SHA-256 `b27cf0b4c7e6e4e7a78eaa5c80154dfd0f70657ce9f774dd405505e97e82c6d0`. Do not rename or alter this recorded artifact when verifying it.
- **Acceptance:** 100/100 simulated regular seasons (1,400 valid match ledgers), one complete 2008–2026 career (266/266 league matches, isolated yearly restarts), and two real-browser save/reload/Continue scenarios in [successful GitHub Actions run #3](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/42751656106).
- **Limits:** native two-tab stale-save rejection and recovery passed in GitHub Actions run #42968272367. Other concurrency and storage-failure cases, plus exact reproduction by the maintained source pipeline, remain open. The 19-season career used isolated simulated storage, not one native-browser profile.
- **Publishing state:** the `v116` branch is the canonical playable location; this designation does **not** merge gameplay into `main` or create a GitHub Release/tag.

- **Known mobile signing layout issue:** the frozen v116 five-day strip overflows a 390px viewport by 8px. A [one-declaration review candidate](docs/release/V116_SIGNING_WIDTH_REVIEW.md) passed scoped native checks at 390px/1440px; it has **not** been promoted to the playable release.
- **Release HTML:** [GCC_v116_release (1).html](<https://github.com/cpuhater1234/global-champions-cricket/blob/v116/GCC_v116_release%20%281%29.html>) — download the raw file; GitHub's page is not the running game.
- **Current handoff and evidence boundaries:** [V116_HANDOFF.md](https://github.com/cpuhater1234/global-champions-cricket/blob/v116/docs/release/V116_HANDOFF.md).
- **Captaincy browser test:** [captaincy_layer_v116.py](https://github.com/cpuhater1234/global-champions-cricket/blob/v116/captaincy_layer_v116.py). Run `python captaincy_layer_v116.py --html "GCC_v116_release (1).html"` after installing Playwright/Chromium. The default uses disposable local HTTP browser storage; `--mode isolated` is a non-native fallback.
- **GitHub organization guide:** [REPOSITORY_GUIDE.md](https://github.com/cpuhater1234/global-champions-cricket/blob/v116/docs/REPOSITORY_GUIDE.md).

The [v116 source reconciliation audit](docs/release/V116_SOURCE_RECONCILIATION.md) records the verified 17-style/22-script frozen release inventory, an exact extraction round trip, and the unresolved maintained-builder parity.\n\nThe older v101 and v112 handoffs are historical references, not alternative release instructions. Keep the playable binary frozen and record any future gameplay or source change as a separate, explicitly tested release candidate.

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

- `main`: historical default branch with a documentation pointer to v116. Its legacy game files are not the current playable release; no v116 gameplay merge has been performed.
- `work/v8-integrity-charcoal-candidate`: previous maintained source/reconciliation stream, recorded through v112.
- `work/v8-game-first-rebuild`: older v101 management checkpoint.
- `protected/v7.0.14`: historical reference branch. Its name does not itself enforce GitHub branch protection.

All older branches and protected baseline records remain intact. Do not delete or overwrite them as routine cleanup.

## Safe working rule

Use a focused branch for each change, keep the exact release available, record version-specific evidence and review changes before merging. Do not assume a historical QA runner applies to v116 or rebuild the current release from older source without proving equivalence.

See [the organization guide](https://github.com/cpuhater1234/global-champions-cricket/blob/v116/docs/REPOSITORY_GUIDE.md) for the simple workflow. [WORKFLOW.md](docs/WORKFLOW.md) and older checkpoints remain useful history, but their version-specific commands are not automatically v116 release gates.

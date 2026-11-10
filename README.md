# Global Champions Cricket

Cricket management game built around drafting, trades, team selection and seasons from 2008 to 2026.

## Current stable playable: GCC v116

**GCC v116 is the frozen, owner-approved stable playable build.** The source-of-truth single-file game lives on the [`v116` branch](https://github.com/cpuhater1234/global-champions-cricket/tree/v116), not in the historical game files on `main`.

- [Download the v116 playable HTML](https://github.com/cpuhater1234/global-champions-cricket/blob/v116/GCC_v116_release%20%281%29.html) (use **Download raw file**).
- [Read the current release handoff and QA limitations](https://github.com/cpuhater1234/global-champions-cricket/blob/v116/docs/release/V116_HANDOFF.md).
- [See the successful native-browser acceptance](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/42751656106): two save/reload/Continue scenarios passed in Chromium.
- Release identity: 6,635,097 bytes, SHA-256 `b27cf0b4c7e6e4e7a78eaa5c80154dfd0f70657ce9f774dd405505e97e82c6d0`.

**Branch policy:** `main` remains a historical/reference code branch. This README update does not merge v116 gameplay, delete checkpoints, switch the default branch or publish a GitHub Release/tag. Concurrent-tab conflict recovery and maintained-source build parity remain open.

## Historical status on `main`

The details below describe earlier v101-era management development and the protected v7.0.14 baseline. They are retained as history, not as current download or build instructions.

## Historical v101 management layer

The historical v101 management layer included:

- persistent squad management state
- healthy omissions checks and batting-role usage
- meaningful bowling opportunities and future-match commitment validation
- player profiles with recent form, fitness, expectations and commitments
- XI selection based on the actual next venue
- finals advice and medical/selection guardrails

This section is historical context. The current playable artifact is v116.

## Repository layout

- `game/` — versioned game builds and historical protected builds
- `docs/` — project workflow and contribution guidance
- `qa/` — QA checkpoints, regression scripts and evidence files
- `BASELINE_SHA256.txt` — protected baseline hash record
- `README.md` — repo status and current development guidance

## Branch and versioning policy

- `main` preserves historical reference code and the current release pointer in this README
- `work/v8-game-first-rebuild` is an earlier v101 development checkpoint; `v116` is the current playable branch
- Do not silently overwrite protected versions
- Record and preserve baseline hashes for any frozen release candidate

## QA and workflow

The project follows a deliberate QA workflow designed to keep high-risk gameplay changes isolated and testable. See [`docs/WORKFLOW.md`](docs/WORKFLOW.md) for the repo workflow, promotion standards and regression expectations.

## Notes

This project is designed to keep the polished 2008 foundation protected while allowing experimental and active management changes to evolve separately. That ensures the game can continue to iterate without compromising the historical baseline.

The current playable source of truth is the frozen v116 HTML linked above. The `main` branch and older versions remain historical references.

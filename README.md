# Global Champions Cricket

Cricket management game built around drafting, trades, team selection and seasons from 2008 to 2026.

## Current status

This repository is intentionally split between the protected historical baseline and the current active development branch.

- Active development branch: [`work/v8-game-first-rebuild`](https://github.com/cpuhater1234/global-champions-cricket/tree/work/v8-game-first-rebuild)
- Current playable build: **GCC v101**
- Active game file: [`game/gcc_v8_product_candidate.html`](https://github.com/cpuhater1234/global-champions-cricket/blob/work/v8-game-first-rebuild/game/gcc_v8_product_candidate.html)
- QA and release notes: [`qa/team-management-20261029/README.md`](https://github.com/cpuhater1234/global-champions-cricket/blob/work/v8-game-first-rebuild/qa/team-management-20261029/README.md)
- Protected historical baseline: **v7.0.14**

Important: do not treat the historical v7.0.14 build as the source of truth for current development. The live game and current design work are on the `work/v8-game-first-rebuild` branch, while the default branch preserves the tested baseline for reference and rollback safety.

## What is active now

GCC v101 represents the current playable relationship layer for squad management. It includes:

- persistent squad management state
- healthy omissions checks and batting-role usage
- meaningful bowling opportunities and future-match commitment validation
- player profiles with recent form, fitness, expectations and commitments
- XI selection based on the actual next venue
- finals advice and medical/selection guardrails

This is the playable management layer for the current cycle, not a complete personality, training or dialogue simulation system.

## Repository layout

- `game/` — versioned game builds and historical protected builds
- `docs/` — project workflow and contribution guidance
- `qa/` — QA checkpoints, regression scripts and evidence files
- `BASELINE_SHA256.txt` — protected baseline hash record
- `README.md` — repo status and current development guidance

## Branch and versioning policy

- `main` contains the latest promoted known-good baseline and historical reference files
- `work/v8-game-first-rebuild` contains the current active build and ongoing iteration work
- Do not silently overwrite protected versions
- Record and preserve baseline hashes for any frozen release candidate

## QA and workflow

The project follows a deliberate QA workflow designed to keep high-risk gameplay changes isolated and testable. See [`docs/WORKFLOW.md`](docs/WORKFLOW.md) for the repo workflow, promotion standards and regression expectations.

## Notes

This project is designed to keep the polished 2008 foundation protected while allowing experimental and active management changes to evolve separately. That ensures the game can continue to iterate without compromising the historical baseline.

The current build is intentionally treated as the active source of truth for playtesting and release decisions, while older versions remain available as frozen references.

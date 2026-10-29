# Global Champions Cricket

## Current game — start here

- **Current active branch:** [`work/v8-game-first-rebuild`](https://github.com/cpuhater1234/global-champions-cricket/tree/work/v8-game-first-rebuild)
- **Current playable version:** **GCC v100**
- **Current playable:** [`game/gcc_v8_product_candidate.html`](https://github.com/cpuhater1234/global-champions-cricket/blob/work/v8-game-first-rebuild/game/gcc_v8_product_candidate.html)
- **Release notes and QA:** [v100 first career story](https://github.com/cpuhater1234/global-champions-cricket/blob/work/v8-game-first-rebuild/qa/career-story-20261029/README.md)
- **Protected historical baseline:** **v7.0.14 — frozen, read-only reference**

**Do not use v7.0.14 as the source of truth for current development.** Current code is on the work branch. Default-branch game files remain historical.

v100 adds the first connected selection-pressure story: real low innings, a credible bench alternative, your actual XI decision and a three-fixture aftermath saved with the career. It connects matchday, XI review, opening playback and results. Matchday now has compact opaque club colours, strong frames and a bounded ground photograph; its mobile fixture is 392px high versus 647px previously.

This is the first complete arc, not the entire proposed relationship/promise system. Form, fitness, conditions and role fit retain their existing cricket effects. No new morale performance penalties or fabricated player quotes are added. Prior v99 draft readability, coverage labels and batting-order controls remain.

Validation includes pure story tests, real match/selection/save/reload/replay checks, three-fixture closure, malformed optional data, 12 enlarged-text fixture layouts and 84 existing screen/viewport cases. All 20 scripts pass syntax checks; 17 non-presentation scripts remain byte-identical to the preceding release. See the checkpoint for review findings, exact scope and browser limitations.

## Protected historical baseline

- File: `game/global_champions_cricket_v7_0_14_mobile_interaction_hardened.html`
- Canonical local SHA-256: `04072e8bb361cf3fc7259f058ab22ced7b6da6aa9ec8bf28f457e003e6cf0ac4`
- Newline-normalised SHA-256: `147ac0db30e150a85e60332bd9b56c3e8f9edcdc2226aaed729b737dac40d54c`

The GitHub web upload removed six newline characters at transfer boundaries. The non-newline byte stream is identical to the protected local v7.0.14 file, and each join point was checked as syntactically harmless. No gameplay, simulation, UI or data content changed.

## Working rule

`main` is for promoted, tested builds only. Experimental work belongs on a `qa/...` branch and should be merged only after the relevant regression checks pass.

For every candidate:

1. reproduce the defect or design failure;
2. make the smallest viable change;
3. run targeted QA;
4. run `python qa/check_candidate.py <candidate.html>`;
5. checkpoint the result;
6. only then promote the candidate.

See `docs/WORKFLOW.md` for the operating rules and `qa/GCC_v7014_checkpoint.md` for the recovered v7.0.14 evidence.

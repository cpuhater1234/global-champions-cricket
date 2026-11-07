# Global Champions Cricket

## Current game — start here

- **Current active branch:** [`work/v8-game-first-rebuild`](https://github.com/cpuhater1234/global-champions-cricket/tree/work/v8-game-first-rebuild)
- **Current playable version:** **GCC v101**
- **Current playable:** [`game/gcc_v8_product_candidate.html`](https://github.com/cpuhater1234/global-champions-cricket/blob/work/v8-game-first-rebuild/game/gcc_v8_product_candidate.html)
- **Release notes and QA:** [v101 living squad management](https://github.com/cpuhater1234/global-champions-cricket/blob/work/v8-game-first-rebuild/qa/team-management-20261029/README.md)
- **Protected historical baseline:** **v7.0.14 — frozen, read-only reference**

**Do not use v7.0.14 as the source of truth for current development.** Current code is on the work branch. Default-branch game files remain historical.

v101 makes squad management persistent: healthy omissions, batting-role use and meaningful bowling opportunities can create concerns. Optional commitments are checked against future matches; keeping or breaking them changes trust. Unresolved concerns can become a transfer request, handled through the existing legal trade system. Medical absences pause commitments and short innings do not count as full bowling opportunities.

Player profiles show actual recent innings/spells, fitness, expectations and commitments. XI rows carry compact form/concern indicators; team selection uses the actual next venue, and finals advice uses the same weather-adjusted conditions as the simulation. Relevant changes appear after matches. The previous fixed three-fixture recap presentation is replaced.

This is the first playable relationship layer, not a complete personality, training or dialogue simulation. Trust has no hidden performance modifier; form, fitness, conditions and batting-role effects remain in the unchanged cricket model. No automatic transfers or invented player quotes.

Validation: pure management regressions, real six-match selection/save/reload tests, controlled medical and finals scenarios, replay immutability, text contrast, 36 enlarged-text management layouts and the existing 84 screen/viewport scan. Only inline scripts16,17,19 change; all20 pass syntax checks. Full evidence and limits are in the release checkpoint.

## Parallel visual composition candidate (v112)

A separate **front-door visual composition** stream exists alongside v101 management work:

- **Checkpoint:** [`qa/GCC_v112_composition_checkpoint.md`](qa/GCC_v112_composition_checkpoint.md)
- **Intended binary path:** `game/gcc_v112_composition.html` (upload when promoting the local GCC_v112 build)
- **Scope:** Home / League intro / draw-control composition (`gcc-composition-20261107`); does **not** replace v101 as current playable until an explicit product decision
- **Open before elevation:** concurrent-career cold-start lock; game-wide surfaces beyond the front door; navy-flat contrast pass still optional/roadmap

Do not confuse the composition candidate with the v101 product candidate. Test management features on v101; test front-door composition against the v112 checkpoint and binary when present.

The following section records the original protected baseline.

This repository starts from the protected **v7.0.14** GCC build and exists to make aggressive QA safer, not to redesign the game.

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

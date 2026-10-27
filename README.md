# Global Champions Cricket

The current release is GCC v83: `game/gcc_v8_product_candidate.html` (also `game/gcc_v8_quiet_arcade.html`). The start screen now offers game actions only; career backups are available through Menu. Mobile headers keep GCC and Menu aligned, with room for long club names; all five career tabs fit at normal mobile text sizes. Offseason skill changes use aligned label/change/rating rows.

The visual pass covers 21 screens at four widths, 360 header/name/text-size cases, 324 club-guide cases and 13 actual WebKit lifecycle checks. All 19 unaffected inline script bodies, including the cricket engine and v82 recovery implementation, remain byte-identical. See [the visual audit](qa/visual-20261028/README.md) and [the v82 recovery audit](qa/limits-20261027/README.md). Reproduce with `python qa/visual-20261028/build.py --promote` and validate with `python qa/visual-20261028/check_release.py`. Keep downloaded career backups and close older game copies.

The following section records the original protected baseline.

This repository starts from the protected **v7.0.14** GCC build and exists to make aggressive QA safer, not to redesign the game.

## Protected baseline

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


# Global Champions Cricket

The current release is **GCC v92**, built from published v91 (`7a5ed5a4c07cb19af85828f9e18d8742af74b7f5`). It extends the bold italic breakaway heading style across screen titles and structural panel headings, with quieter section labels. Club colours, player names and score data retain their existing identity and readability. Enlarged-text icon and expanded player-card layout issues are corrected.

Rebuild with `python qa/heading-system-20261028/build.py --promote`. All20 inline scripts remain byte-identical to v91. Native Chromium checks cover300 screen/width/font cases and432 club-guide cases. See [heading QA](qa/heading-system-20261028/README.md).

The GitHub playable aliases and saved download contain the same verified v92 build. Historical builders reproduce historical releases and must not promote the current release.

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


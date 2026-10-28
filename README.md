# Global Champions Cricket

The current release is **GCC v97**. Solid navy, cobalt, red and purple replace the pale mint/cream theme. Player cards use saturated role colours and white rating ink, with subtle cricket artwork across the textured canvas. Your draft uses compact count bars only for roles already picked, with simplified batter/all-rounder/pace/spin categories and no quotas. Own turns clearly say **YOUR PICK**. Draw rectangles and controls retain their geometry through paused and automatic reveals. The signing panel fits its content and the action reads **Skip to end**.

Rebuild with `python qa/draft-refinement-20261028/build.py`. See [v97 QA](qa/draft-refinement-20261028/README.md). Four full foundation drafts, two annual drafts,116 scroll checks,84 main-screen/viewport smoke cases,216 reveal states and36 own/CPU turn states pass.16 inline scripts including simulation and persistence remain byte-identical to v96. Historical builders reproduce historical releases and must not promote the current release.

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


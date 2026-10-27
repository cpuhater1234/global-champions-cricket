# Global Champions Cricket

The current release is GCC v82: `game/gcc_v8_product_candidate.html` (also `game/gcc_v8_quiet_arcade.html`). It preserves the 36-club pool, portable backups, offline venue photographs and cricket simulation. A transactional recovery checkpoint now protects acknowledged saves in tested browser-crash cases, coordinates updated tabs when Web Locks are absent, and offers an explicit choice when saved copies differ. Queued waits are bounded and recovery feedback reports the final save outcome.

Reproduce the tested standalone with `python qa/limits-20261027/build.py --promote`; validate recorded evidence with `python qa/limits-20261027/check_release.py`. See [the recovery audit](qa/limits-20261027/README.md). Final bytes passed10 forced crash/recovery cycles,14 no-Web-Locks writer races and13 WebKit lifecycle checks in each of two modes. Keep downloaded backups and close older game copies. This is measured browser recovery, not a guarantee against OS power loss or every device.

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


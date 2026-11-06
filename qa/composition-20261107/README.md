# v95 composition candidate

This implements the four specific user complaints recovered from the last conversation: home space, coloured tile underlines, the three-column introduction, and reveal-bar alignment.

The accepted v93 recovery anchor is the sole input. The full original bytes, including all scripts, images, and previous visual improvements, remain unchanged outside one appended stylesheet. The external v100/v100b proposal is retained separately and is not blindly applied: its broad action-bar rules would also flatten the reveal controls' overlaid pace/next cells.

Source: `v8/ui/composition.css`.
Builder: `qa/composition-20261107/build.py`.
Tests: `qa/composition-20261107/test_build.py`.
Exact output: `GCC_v95.html`, SHA-256 `0fdce9468a340681e392db75a3788f8299e7d10bfd1ada5689151c0725585fa8`.
Persistent file: `libfile_a8e2d0a6c4108191aca07044b9e1218d`, version 0.

## Reproduce

Obtain the v93 recovery anchor from `libfile_951b363fbb4481919a83abb8d7cb9ca9`, version 2. Its SHA-256 must be `3abf1f74a1ec77db5b3bd0322e3188015bca161853bdd3397bd116bcf1e5f026`.

```bash
python3 qa/composition-20261107/build.py --baseline /path/to/v93.html --output /path/to/GCC_v95.html
GCC_V93_BASELINE=/path/to/v93.html python3 qa/composition-20261107/test_build.py
python3 qa/release_identity.py /path/to/GCC_v95.html --expected-sha256 0fdce9468a340681e392db75a3788f8299e7d10bfd1ada5689151c0725585fa8
```

The maintained legacy build command `python3 v8/build.py` still generates a DIFFERENT source candidate. It must not be used to regenerate or overwrite v95. This pinned release-composition route is deliberate until the earlier source integration is reconciled.

## Evidence and limits

Four build tests pass. All 20 scripts pass Node syntax checks, all 42 unique raster images decode, and the inline data SVG parses. A second build is byte-identical. Structural validation passes. The first image-decoding attempt incorrectly treated an SVG as a raster; after separating MIME types, all assets passed. No game code or save handling changed.

Native Chrome remains on v93. v95 must be downloaded and opened using the user's existing local-file workflow, then checked at desktop, 390px, 320px and landscape for the four corrected screens. Reveal controls must keep their status and action height during pause, resume, speed, completion and keyboard focus. Do not claim visual approval until that exact file is open and observed.

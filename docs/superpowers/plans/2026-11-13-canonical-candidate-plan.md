# Reproducible candidate source plan

Goal: resolve ambiguity between the delivered review candidate, historical patch composers and legacy v8 files. This is a source/build identity correction, not a cascade rewrite or release promotion.

- [x] Extract exact17 style and22 script bodies plus a tokenised template retaining all original block positions/attributes/assets.
- [x] Build a byte-identical HTML locally and test wrong-reference, changed-CSS strict check and unacknowledged runtime-edit rejection.
- [ ] Verify the same extraction/build in GitHub Actions against the natively tested candidate hash; persist source and validation on QA branch only.
- [ ] Document canonical source as the staged candidate path; retain legacy v8 as explicitly unmapped, historical composers as reproductions, and cascade consolidation as separate work. Future canonical edits require fresh native acceptance; existing historical composer workflows do not automatically validate edits to this new tree.

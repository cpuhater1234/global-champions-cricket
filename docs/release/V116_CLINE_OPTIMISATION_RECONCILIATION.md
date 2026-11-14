# Cline optimisation reconciliation, 15 November 2026

## Verified source and scope

Read-only review of perf/optimized-assets-v116 at e9be5d4855c2a6bb55bcf432171e575a6c33f2ab. Its sole parent is frozen v116 2648c00b6f1932a690053e7cfba9ecf76ec0cac8, rather than current work/v116-candidate-acceptance. The user's opened candidate remains GCC_v116_Guide_Sections_Review.html, SHA-256 196515c5a170633c1e6abcca259798a5bb7bb7686cc4545124663651efc95f35.

Do not replace the current playable candidate with the older optimized HTML: that output predates current UI and career integration. No optimisation branch, frozen release, main, product source or user's save was modified during this review.

## Verified size accounting

Git tree object sizes:
- Frozen input HTML: 6,635,097 bytes.
- Optimized HTML: 3,285,851 bytes.
- Referenced external assets: 2,512,026 bytes (39 files: stadium, 36 venues, two CSS images).
- Complete uncompressed optimized package: 5,797,877 bytes.
- Reduction against frozen input: 837,220 bytes, 12.618%.

HTML alone is about 50.5% smaller. Complete package reduction and repeat-visit caching benefits are different measures. No startup timing, transfer compression, cache-hit result, memory result or rendering improvement has been measured here. Branch commit wording says 37 images but its listed categories and tree contain 39 external image files.

## Reproduction limitation

optimize-html.ps1 reads a hard-coded frozen input and substitutes relative image paths, then writes the optimized HTML. It does not decode/write external assets or create asset directories. Existing committed assets are therefore a prerequisite. Its size output reports only HTML bytes. CSS regex loops replace every matching WebP/SVG with one respective fixed path; this is safe only if all matching source images are identical or explicitly mapped. That assumption has not been byte-verified here.

## Integration path

Keep optimisation in its existing separate branch while UI review continues against current canonical source. Rebase the packaging transformation onto a pinned current candidate; preserve source-owned UI/runtime and current career work. Make input/output configurable; emit or validate each asset with a content hash, fail on unexpected match counts or missing files, and report full package size. Maintain the portable single-file review build alongside any multi-file package.

Before delivery of the combined optimized candidate, verify exact non-asset runtime preservation (with any lazy-loading changes isolated), every asset response and decoded image across home/club cards/guides, first-screen image priority, cold/warm load measurements and packaged delivery with its assets folder. Do not claim these checks already passed. No new build download is needed for this reconciliation.

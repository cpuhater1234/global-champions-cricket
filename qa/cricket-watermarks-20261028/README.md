# GCC v93 cricket watermarks

Base: v92 commit `6012ce17d1f183d2fa702f7e5866f4841d185472`, SHA256 `8a48c09ac1e5552227c2382f3444c2dd33f8ea8f04273696a421e75ecf85a2cd`.

Uses the supplied four-figure PNG unchanged as a CSS sprite. One quadrant per selected narrative panel: introduction (top left), squad update (top right), signings (bottom left), season review (bottom right). Most surfaces remain plain. Screen blending removes the white sprite background; low opacity and a left-edge fade keep it quiet. Smaller phone treatment, pointer-events:none, no animation, no layout footprint; forced-colours mode hides the decoration. Art is embedded in the standalone build for offline use.

`check.cjs` validates21 screen/dialog states at320/390/768/1440 pixels and16/24/32px root fonts:252 cases. Heading/button geometry is identical with watermarks enabled and disabled; all four positions render, no document overflow or page errors. Representative phone and desktop screenshots were inspected. All20 script bodies are identical to v92. No fresh physical-device or cross-browser certification is claimed.

Rebuild: `python qa/cricket-watermarks-20261028/build.py --promote`. Builder uses pinned git show when its local baseline cache is absent. Run checks from repo root with Playwright available through NODE_PATH and the native Chromium executable path configured in the script.

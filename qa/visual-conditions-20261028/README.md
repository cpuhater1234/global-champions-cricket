# GCC v85 — Club guide ground conditions

**Result:** Tested standalone v85 HTML produced and supplied to the user. The corrected standalone binary has **not** been promoted into the GitHub game/ HTML files because the 8 MB upload failed at the connector transport layer. Keep identifying those two GitHub paths as v84 until they are synchronised.

**v85 SHA-256:** `878fa040e4adf0b32eae7479c3c19b582b7bfb79cef8c3b0afa9f9f08a4a09f7` (8,068,644 bytes). Base v84 SHA-256: `9a253947041974e26a91729e06a9a93e1812d518b04519a6f533e9793a7cc5ca`.

A CSS-only fix restores a clear three-column conditions summary on wider club guides and compact horizontal readings when the ground card becomes narrow. No numeric/ground rules, gameplay, save, script or controller modifications. All 20 inline script bodies unchanged.

Native Chromium inspected actual club-guide modal via the full home → reveal → club selection flow. Geometry was checked at 1440,1024,768,390,320 widths with 16px root font, 390/768 at 24px and 320/390/768/1440 at 32px; zero page errors, document horizontal overflow, condition-card overflow or label/value bounding-box collision. Screen captures visually inspected for desktop, phone and enlarged type. Not a rerun of v84's independent full audit.

## Publish from repository checkout

Run `python qa/visual-conditions-20261028/build.py --promote`, then verify both HTML outputs have the exact v85 SHA-256 above and the workspace source CSS is byte-matched. This file reconstructs the frozen v84 base from its exact commit; it never picks up newer simulation changes implicitly.

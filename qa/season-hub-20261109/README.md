# Season Hub isolated visual review, 9 November 2026

## Release identity
Canonical source remains GCC_v112.html, SHA-256 `e7e2c5fc4013cfd43f556145b0b35243130268a7329cb9dfba7011d2f727b2d3`.

A **local review-only**, unpromoted candidate `GCC_v112_Season_Hub_Review.html` was generated with SHA-256 `007e0dd077b41bc36ea3f7ef3fdf8fd16caede53f16a97f3e82dd0479c78ce36`, size 6,591,653 bytes. It modifies two existing embedded stylesheet bodies and leaves all 20 scripts, assets, non-style markup, 14 style IDs and order unchanged. No new style block was added. Product source on GitHub is **not updated** by this review.

## What was exercised
- A disposable 2008 career progressed in isolated Chromium through club reveal, signing, draft order, 15 actual user draft picks, selection of a legal XI including a recognised keeper, then `Lodge XI`.
- Season Hub was rendered at widths 1280, 768 and 390 CSS px. Document scroll widths exactly matched viewport widths, with no sideways overflow.
- Match preview opened and closed, Watch match entered the reveal, Show result reached the result, and Matchday returned to the second-round Season Hub. Standing, record, NRR and form populated correctly (one tested run: 3rd, 1-0, NRR 2.13, W).
- No captured JavaScript page errors on the tested path.

## Prototype hierarchy
On desktop, the upcoming fixture is primary in the leading column; standings/record/NRR/form form an adjacent, subordinate rail with league standing most prominent. On tablet and phone, the fixture leads, followed by the campaign ribbon and secondary detail. Dressing-room status fits its contents instead of stretching beside the full fixture.

CSS was edited **inside existing owners**, not in another trailing style element: `v8/ui/decision-ui.css` owns matchday layout; `v8/ui/broadcast.css` owns the high-specificity ribbon presentation. Local HTML's corresponding style blocks are `gcc-decision-ui-20261030` and `gcc-floodlit-visual`.

## Verification boundary and integration blocker
Chromium could not navigate to a normal localhost origin, so QA loaded the exact HTML with `page.set_content` and a disposable in-memory storage shim. This is genuine renderer interaction but **not native localhost storage**, no two-tab save-arrival certification and no real user's Chrome acceptance.

The other composition stream reports four style IDs that **do not exist** in the available canonical v112 HTML: `gcc-contrast-v112`, `gcc-draft-milestone-v112`, `gcc-signing-manage-v112`, `gcc-xi-team-v112`. Do not mistake this review file for Grok's integrated Draft/Signing/XI candidate. Reconcile the actual edited source before promotion or a new version number.

External local artifacts: the review HTML, owner diff, QA report and desktop/tablet/390px/post-result screenshots are available in the originating chat. These binaries were not uploaded to GitHub.

## Next gates
Acquire Grok's actual edited HTML or source diff, merge changes in the owning source files, rebuild canonical HTML, verify Home/Intro/draft/signing/XI/season as a whole, then native browser acceptance. Existing clean-storage x10 and true two-tab save recovery remain open.

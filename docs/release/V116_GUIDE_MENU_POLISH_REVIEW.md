# Club guide, menu and management introduction review

16 November 2026. Branch: work/v116-candidate-acceptance. Review only, unpromoted. Frozen v116, main and the separate perf branch are untouched.

## Identity

Opened rollback: GCC_v116_Squad_Rhythm_Review.html, SHA-256 a196081b22960520c4c8f23c7053828198c2a2a3b693bba8dde3a6999dc6c13a, 6,683,580 bytes. User confirmed downloading and opening it. Live browser inspection showed Home with an existing Lucknow Super Giants 2010 career. Only opened/closed its utility menu; no career reset or new game on user storage.

New candidate: GCC_v116_Club_Menu_Review.html, SHA-256 f10014e8f7572185bbc033932c6f1ee249d0e41ebe42d1023ce90c3bb74d60cf, 6,687,615 bytes. Canonical build command is qa/v116_canonical_source.py build --source v116/canonical --allow-runtime-changes. Do not use v8/build.py.

## Reproduced visual problems and ownership

The live menu remained a stack of three strongly framed secondary buttons. Existing group labels helped functionally, but did not remove this competing visual weight.

Native baseline run 43841138217 captured MI/SRH/LSG/PBKS at 1440/768/390/320. Club guide still mixed condensed display titles and tiny orange section labels with body-font ground/recruitment headings. The split condition readings made labels, values and scales fight for space.

Management retained a framed broadcast heading and separate boxed allowance above the improved rows. At 320px the first player began at y600.92 in the 900px-high genuine offseason fixture.

Only existing CSS owners09/10/31 change relative to the opened rollback. No new style block. All22 script bodies and HTML outside those three style bodies are identical;17 style blocks remain. Exact scope guard and critical engine/controller pin self-tests pass.

- Owner09: body-font club title and section labels; consistent ground/recruitment typography; full-width neutral condition scales with the existing pointer positions and accessible readings. Label/value share a line. Endpoints and midpoint remain readable even at320px. Descriptions, priorities and Select club remain intact.
- Owner10: quiet utility-menu list rows, aligned20px icons,14px labels,44px targets, purpose labels/separator and contained focus treatment. Compact plain management heading, factual allowance and rules disclosure. Small-phone allowance stacks to avoid compressing counts into a narrow side column. Career navigation focus rings inset at normal heights as well as the already-checked short heights.
- Owner31: general button skins defer to menu rows. General dialog display typography and generic narrow condition-header rules defer to the club guide. Broadcast heading paint/type/size and allowance paint defer to the scoped management owner. Other components retain their rules.

## Iteration evidence

First revision2f7056e passed club copy/actions but the expanded menu matrix exposed pre-existing full-height career-nav focus clipping. Captures also showed the generic narrow condition header still forcing label/value onto separate lines. Revision35fb83f passed menu and management tests but correctly failed the new guide line-alignment assertion. The remaining generic condition-header declarations were excluded from the club guide. Revisione816be2 then passed the complete native workflow43843182708.

Image review of the management captures caught two further visual weaknesses despite those functional passes: a generic stage h1 rule still inflated the intended compact title, and320px counts wrapped beside a large rules disclosure. Revision7ae6150 corrected both; strict native title-size verification then caught an additional mobile-only broadcast-size override (31.2px instead of24px). Finalf10014e excludes that last rule. Final acceptance must identify that hash, not reuse a prior PASS.

## Final acceptance

Exact finalf10014e native run43844160463 PASS:32 paired club-guide states (MI/SRH/LSG/PBKS at1440/768/390/320),10 active-career menu viewport states plus3 Home menus, and16 paired real-offseason management states with Departure rules closed/open. Zero failures/browser errors. Existing club descriptions, three accessible conditions, three recruitment priorities and all guide text match baseline; Escape closes guides and keyboard Select club reaches signings. Menu Tab/Enter/Escape,30 actual guide-opening journeys, focus-ring containment, topmost targets and complete compared-career preservation pass. Both menu contexts use14px/44px quiet rows.

Management heading is28px desktop/tablet and24px phones, in Inter. Names/roles/figures/statuses/action arguments/ARIA/disabled flags and every row height match the opened build. Rules disclosure leaves the complete compared career unchanged. First player y:557.11→457.09at1440;606.14→520.45at768;600.92→563.80at390/320. This is37px earlier on phones and100px earlier on desktop, not a claim that all career screens are compact.

Artifact14215070694 ZIP SHA-25677fa1764fdb2113c51452f89555b164c183a5dda34a9f8f3ead699307511d07c verified before extraction. Desktop club guide,390px Home menu,320px management closed/open and long-ground320px captures inspected. Supplemental exact run43844773611 also PASS. Earlier bottom captures scrolled the body while the actual dialog owns scrolling; QA now scrolls the real port. All8 before/after bottom checks confirm the last recruitment priority is visible above the sticky footer, including SRH320px. The corrected bottom capture was inspected. Game bytes remainf10014e. Artifact14213864773 ZIP SHA-256ae4d6b166b32be2a2ffae42a34a223bbe23e7a852018aaf47694dbb43064b9ff verified before extraction. Both other suites also passed again on that exact hash. Compact durable evidence: V116_GUIDE_MENU_ACCEPTANCE.json. No all-browser, storage-failure, screen-reader-speech or full-career certification. Gameplay authenticity helper status remains separate from this CSS-only work.

## Delivered review copy

GCC_v116_Club_Menu_Review.html, exactf10014e hash and6,687,615bytes above. Saved copy libfile_a3022a02e4b881918f8b5c67b183f77c. Source work is on work/v116-candidate-acceptance. User has not yet confirmed this new download/open; Squad Rhythm a196081 remains their opened rollback. No stable promotion.

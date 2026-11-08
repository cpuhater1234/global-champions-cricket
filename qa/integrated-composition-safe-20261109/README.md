# v112 recovered composition integration: isolated QA, 9 November 2026

## Exact artifacts
- Canonical delivered v112 SHA-256: `e7e2c5fc4013cfd43f556145b0b35243130268a7329cb9dfba7011d2f727b2d3`.
- Grok uploaded composition SHA-256: `09634afc58ebf592b3b28f0dc32c058eab6f533935ef55ef2c4e1f9e6e422cf3`; **not a valid promotion candidate** because it inserted a style boundary into a CSS comment.
- Recovered-but-unsafe integration SHA-256: `0b3fa5c386bebd164f85ba987b52d3b986da5a79b35c4fad7b055d1f3b17e329`; **do not promote**. It included an early `ui.newCareer=true` in the `play` handler and bypassed save-arrival recovery.
- **Safe local review**: `GCC_v112_Integrated_Composition_Safe_Review.html`, SHA-256 `942c357419e39970d8e5b55271c8a5952dbb001944d57eaeb5a8b0348eda931a`, 6,601,234 bytes. **Review only; not v113 and not yet source committed.**

## Recovered composition
Four visual snippets for Draft, Signing/Manage, XI and contrast are preserved inside three existing CSS owners; the previously reviewed Season Hub CSS edits are included. There are exactly 14 original style IDs in original order and no additional style blocks. Twenty scripts are byte-identical to canonical v112, with all 20 passing `node --check`; CSS parses without errors and original markup/media remain unchanged.

## Controller regression and repair
The unsafe review changed the no-save `play` command to `else{ui.newCareer=true;setView('story');}`. A save arriving during intro was then implicitly authorised for replacement, skipping the `Open saved career / Start again` choice. Three simulated recovery routes all failed on that candidate. Restoring canonical v112's `else setView('story');` preserves the fresh/explicit confirmation distinction. On the safe review, **3/3** simulated arrival routes passed: open saved, confirmed restart, and cancel/back/continue. **10/10** independent simulated cold starts passed.

## Browser QA
Isolated Chromium clicked real game flow through 15 picks, 11 XI selections, Lodge XI, Season Hub, match preview, Show result and return to next round. No page errors. On Home, Intro, Signing, Draft, XI, Season, 1280/700/390/375px viewport checks had no horizontal overflow or visible stage interaction target below 36px. At 375px an actual XI move and swap dialog replacement worked, retained 11/11, preserved prior batting-order change, and did not overflow. The Season Hub has match primary, standings/ribbon secondary and reflects match results.

## Specificity boundary
The currently visible game uses `.gccuiDraft .gccuiPlayer`, `.gccuiSelection .gccuiXI`, `.g8windowpanel`, `.gccuiMatchday` and `.gccuiCampaignRibbon`. The historical v7 `#draft .player-card`, `#team .batting-slot`, `#recruit .recruit-feed .feed-item`, `#season .fixtures-panel` and `#draftFlow` selectors did not match visible nodes. Chrome matched-rule inspection shows some existing Floodlit gradients and rated borders intentionally win over Grok generic solid fills; do not add blanket specificity overrides. The 14-style count is a preservation guard for this review, not an eternal design constraint.

## Open release gates
QA uses isolated browser `page.set_content` with in-memory storage; real localhost navigation was blocked. Genuine cleared-origin cold starts, real two-tab storage race, native downloaded-build acceptance, full source-owner reconciliation and complete source build remain **open**. No user's existing saved career was touched. Trade footer and knockout-specific acceptance, broader season longevity and whole-game craft review remain open.

The full QA report and exact review HTML live in the originating ChatGPT conversation. This GitHub commit records evidence only, not product source or a release promotion.

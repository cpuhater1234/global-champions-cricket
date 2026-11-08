# GCC v112 isolated Chromium review, 9 November 2026

This is an evidence checkpoint, not a new game version or full release acceptance.

- Branch: `work/v8-integrity-charcoal-candidate`
- Candidate: `GCC_v112.html`, 6,589,191 bytes
- SHA-256: `e7e2c5fc4013cfd43f556145b0b35243130268a7329cb9dfba7011d2f727b2d3`
- Product source and HTML: **unchanged** by this review.

## What was actually exercised

An isolated headless Chromium rendered the **exact uploaded v112 HTML** and performed real clicks through Home, intro, eight-club reveal, club chooser, signing-window skip, draft-order reveal and entry to the draft room. A draft-order draw containing **Brisbane Heat** was verified at **1280px desktop** and **390px phone**.

Computed Brisbane Heat order-name/rank text: `rgb(238,245,250)`. Card gradient endpoints: `rgb(19,40,64)` and `rgb(12,26,40)`. Calculated text contrast: **13.58:1 to 15.98:1**. Badge retains original `rgb(0,166,178)` fill / `rgb(16,43,52)` club ink (calculated **5.01:1**). Eight cards visible. At 390px cards measured 366px wide at x=12; document scroll width was 390px. No captured page errors in tested journeys. Draft room also had no horizontal overflow at 1280 or 390.

Static verification: 20 embedded scripts passed `node --check`; 14 styles, one html/head/body; byte/hash identity verified. The existing two `workspace.css` owner rules use shared light text and preserve the badge.

## Important limitations

Normal URL navigation from isolated Chromium was blocked by `ERR_BLOCKED_BY_ADMINISTRATOR`. The game was therefore loaded using `page.set_content` with an **in-memory localStorage substitute**. The resulting `Progress not saved` warning is a harness artefact, not proven a bug in normal localhost storage. No real-origin persistence, page reload, storage event or two-tab race was verified.

The Browser connector in regular ChatGPT chat was read-only; the user's actual Chrome session did not have v112 open at time of inspection. **Native v112 acceptance is still pending**. This is not equivalent to the prior Work Mode browser tests.

Open: ten truly clean-origin browser starts; real two-tab save-arrival, confirmation and cancellation; trade impact-row/phone footer; knockout transition; v109 squad-update club colours; broad draft, signing, Manage squad, season, live and result visual review. No full-project rebuild performed.

## Source guard

Continue to edit the owning CSS rule in the maintained branch, one surface family at a time. Preserve Home/Intro and gameplay. Do not append another global override or silently promote v112.

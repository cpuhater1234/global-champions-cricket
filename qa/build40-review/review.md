# GCC Build40 browser review and Build41 candidate

## Actual Chrome evidence

Build40 was reviewed at 1150x666 and 390x844. Fresh story no longer displayed the previous club or year, and Back/Continue preserved the test career. Desktop launch controls fitted the first viewport; phone launch remained below the initial viewport. Fresh league reveal completed with focus on gccuiRevealNext. Mobile chooser hid league/country and used a 40px-wide guide control. Punjab guide showed one ground description and a club-red Select club button. Recruitment Start was visible at y494 with a 44px target. Foundation order completed and draft room opened.

Fresh Punjab 2008 test draft used pick2 in an eight-club snake. Five manual picks completed: McCullum, Hussey, Bond, Tendulkar, Flintoff. The browser is left at round6 pick47, with five of fifteen players selected. This is not a completed draft or season. Selecting a card lower down the phone list left the next decision at about y1621 with its turn banner off-screen. Viewport override was reset to1150x666 at the end.

## Build41 implementation

Successful draft picks now reset presentation scroll to top. Rejected picks, filters and scouting retain their existing position rules; focus restoration has precedence and the temporary flag clears after dispatch. A red test reproduced1600 rather than0 on Build40; candidate passes and also verifies rejection preserves1600.

Compact club chooser rows now retain league and country context. Guide controls use44x44 targets and explicit Open club guide labels. Hover uses the club accent border without a blue shadow or translation. Story launch actions precede secondary format metadata. Recruitment drops its duplicated League recruitment eyebrow and excess header framing while preserving status semantics.

## Verification and limits

Fresh builder parses20 scripts. CSS audit reports0 parser errors in both maintained stylesheets. Setup contracts, draft-position regression, draft room preservation, annual archive/reveal return, parsed dossier DOM, eight accessibility contracts, seven XI swap guards and result navigation pass against candidate. An initial accessibility invocation targeted the old default Build33 and failed three pressed-state checks; corrected GCC_FILE candidate invocation passes8/8. Old-build failures are not candidate failures.

Parity against40: only scripts17 and19 differ; engine scripts2/9/10 and embedded data-image bytes are unchanged. Ratings, statistics and save-schema behavior have not been changed by this pass.

Build41 has not rendered in Chrome. Mobile44px geometry, new metadata wrapping, story action placement and recruitment hierarchy need native verification. Further open coverage includes the remaining ten draft choices, full XI and match cycle, finals/spectator states, dense offseason screens, long mobile records and end-career. No whole-game or premium-final certification is asserted. Browser screen-reader announcements remain unverified.

## External design input

Official EA FC26 Career Deep Dive and Football Manager26 reimagined UI materials were consulted for contextual information hierarchy, predictable navigation and access to primary decisions. These informed prioritisation, not claims of visual equivalence or a feature-copy checklist.

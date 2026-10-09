# GCC v7.8.7 Brutal Playtest Checkpoint

## Candidate

- Branch: `work/v7.8-player-experience`
- Parent: `global_champions_cricket_v7_8_6_home_rebuild.html`
- Parent SHA-256: `c56e3a639d2411e4669aaffea5bbf20f021fc5730fdd4d120167c1ca28e6db3b`
- Candidate: `global_champions_cricket_v7_8_7_brutal_qa.html`
- Candidate SHA-256: `8dfda284f00ca7f693f96b734ae9a95edb9ad0b133165dcaef9024eae74478c2`

## Test posture

This pass deliberately stopped treating zero page overflow as proof that a screen looked good.

The game was rendered as an actual player would see it and reviewed for:
- physical overlap;
- crushed columns and cards;
- unreadably pale or over-bright text;
- misleading disabled states;
- line wrapping and clipping;
- hierarchy and attention;
- mobile task order;
- dead space;
- transient feed states;
- later-season parity with the 2008 experience.

No GitHub Actions workflow was added or intentionally triggered.

## Visual sweep

A broad rendered sweep covered 20 major states:
- Home
- club selection
- Signing Week
- Draft Draw
- Foundation Draft
- Team Room empty
- Team Room complete
- Season start
- Matchday
- played result
- Analysis
- Finals ready
- Finals after semi-final
- Season Review
- off-season market
- Trade Centre
- annual Draft Draw
- Annual Draft
- full annual Draft board
- Final 15 path

The main matrix used 1440, 1180, 1000, 768 and 390 px widths: 100 rendered views.

After the final mobile Team Room fix, a second regression pass rerendered the major states at 1080, 900 and 390 px. It reported:
- zero document-level horizontal overflow;
- zero detected clipped text;
- zero narrow-card failures;
- zero runtime exceptions.

## Reproduced defects and fixes

### Draft Draw was still too washed out

The waiting envelopes technically existed but were so pale they read as missing content.

Fix:
- darker waiting copy;
- stronger number contrast;
- more visible paper surface and border;
- no opacity dependence.

### Mobile Team Room started with the wrong task

With no XI selected, the phone layout showed eleven empty batting-order slots before the selectable squad.

That is backwards from the player's job: pick eleven first, then refine the order.

Fix:
- `renderTeam()` now toggles a `team-needs-picks` state;
- at tablet/phone widths the squad appears first while the XI is incomplete;
- once the XI is complete, normal batting-order priority can resume;
- player role descriptions may use two lines on small screens instead of being cut to a single fragment.

### Small decision copy

The pass raised the floor for small but decision-relevant text across:
- Team Room selection reads;
- season navigation and result rows;
- off-season list/status rows;
- Trade Centre scouting;
- Annual Draft filters/cards;
- Final 15 locked-state reads.

Shield abbreviations and purely decorative micro-labels were not inflated simply to satisfy a numeric font-size rule.

### Signing feed

The populated Signing Week feed was explicitly tested after all five days, rather than only testing an empty feed.

The old coloured-dot/name collision is not reproduced. Signed/declined dots sit in their own gutter and the latest decision rows remain readable on desktop and phone.

### Annual Draft board

Mobile and intermediate widths now advertise horizontal exploration with `SWIPE ACROSS ALL 8 CLUBS`, and the eight-club board owns its internal horizontal scroll rather than crushing columns.

## Functional dynasty test

A complete 2008 path was run through:
- club selection;
- Signing Week completion;
- all 120 Foundation Draft selections;
- XI selection;
- 14-match season;
- Finals;
- Season Review;
- 2009 off-season;
- annual Draft;
- Final 15;
- 2009 Team Room.

No runtime exception was reproduced.

### Dynamic retirement / Draft snake stress test

A controlled off-season created different vacancy totals across clubs and then compared the game's actual Draft sequence against an independently calculated expected snake.

Example tested needs included clubs requiring 4, 3, 2, 1 and 0 selections.

Verified:
- odd rounds follow lottery order;
- even rounds reverse it;
- clubs with zero selections never enter the order;
- clubs disappear as soon as their required selections are exhausted;
- actual owner/round sequence exactly matched the independently calculated sequence;
- all 120 rostered player IDs remained unique after the Draft;
- the user's list returned to 15.

A separate forced-retirement stress case produced seven user retirements. All seven players retired, the club received seven replacement selections, no retirement was deferred, and the final list returned to 15.

The only console noise in the local harness was the expected `localStorage` SecurityError caused by Chromium's opaque `Page.setDocumentContent` origin. It did not produce a runtime exception and is a limitation of that harness rather than the game logic.

## Current judgement

The severe visual failures that previously survived QA are now specifically covered:
- front-page boxed logo and stat collision;
- Signing Week name/dot collision;
- crushed Draft layouts;
- pale Draft Draw placeholders;
- mobile Team Room task inversion;
- Annual Draft board discoverability;
- unreadably tiny decision copy;
- win/loss semantic feedback;
- Final 15 state clarity.

The remaining density is intentional on information-rich screens such as Team Room and the Draft. The current pass does not hide cricket information merely to make screenshots emptier.

## GitHub / billing rule

GitHub remains the source of truth for version history and rollback.

Routine browser/visual QA stays local. No GitHub Actions workflow was added or intentionally triggered in this pass.

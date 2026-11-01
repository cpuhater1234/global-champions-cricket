# Build 25 page audit and Build 26 corrections

Inspected in Chrome at 1150 × 666 and 390 × 844 using the Gloucestershire career. No game-state injection.

## Verified in the open game

- Home: approved crest, stadium photograph, Start and Continue controls visible on desktop. The header has a substantial unused span; further mobile home checks remain.
- Player report: Build 25 record contrast is corrected. Container background rgb(40,40,40), cells rgb(51,51,51), text rgb(241,241,241).
- Offseason: 2012 retained fifteen players, showed development, and opened Manage players. The main action was below the first screen. The retained heading wrapped unnecessarily, and the tall development column left a large empty area beside it.
- XI: initially 0/11. Retain available XI produced 11/11 and rating 79. Lodge XI entered Round 1.
- Ladder: blue-grey fills conflict with the charcoal direction. Centred club names start at different horizontal positions. On mobile, the 576px table scrolls within its 348px container; page scroll width is 375px against a 390px viewport.
- Stats: the same colour inconsistency. Two tables contain thirty zero-value player rows before any matches; this remains a candidate for a better initial state.
- League leaders: both tables had blank bodies before play, with no explanation.
- Fixtures: fourteen aligned cards, home/away labels, Up next state and team-colour rails. Long ground names and historical ground accuracy need further review.
- Match preview: club colours, venue, actions and disclosures visible. The centred venue icon/label is disconnected from the left-aligned ground title; recorded for a later alignment pass.
- Toss: winner and choice only, as requested. Animation timing and reduced-motion behaviour were not checked in this pass.
- Result and scorebook: Rajasthan 242/9 beat Gloucestershire 235/5 by seven runs. Awards, worm, both innings, extras, fall of wickets and bowling records displayed. Deep mobile scorebook review remains.
- Round 2: Mohammad Yousuf ankle injury correctly blocks play and prompts replacement.
- Menu: Club archive has an icon; guide actions do not. Guide routing opened How to play correctly. Menu, guide, archive and all disclosure states require further visual review.

## Build 26 changes

Neutral charcoal table fills. Left-aligned ladder club names with a separate centred position column. An explanatory row in each empty leader table, removed automatically when performances exist.

Offseason uses a full-width compact squad decision panel with a club-colour top border and primary action. The development summary follows in three columns on desktop and one at widths of 900px or less. Existing management, retirement, release and draft rules are unchanged.

## Validation

Twenty inline scripts parse. Only script 18, the presentation module, differs from Build 25. Cricket, persistence and data scripts are byte-identical. The targeted empty-leader test failed before the change and passed afterwards, including replacement with real records after a match. Coordinated UI contracts pass. Independent review found no actionable regression and separately reran the empty-leader test successfully.

Build 26 rendered layout remains to be checked. Signing, club selection, draft, archives, finals and every help/menu state have not yet been revisited in this Build 25 pass. This is an ongoing audit, not a claim of complete coverage or finished quality.

# GCC v7.2.14 Year Shell Continuity Checkpoint

## Status

Accepted year-to-year product-shell continuity fix on top of authoritative v7.2.13.

## Source of truth

- Input: `game/global_champions_cricket_v7_2_13_midseason_trade_window.html`
- Output: `game/global_champions_cricket_v7_2_14_year_shell_continuity.html`
- v7.2.13 SHA-256: `21788e247134133ea2aaa998d864b82384526f27dac2ef8cc72c4ed33c00ea99`
- v7.2.14 SHA-256: `70810a1d6771c283f9f143d7707a0df90fd5594dfe321677f6f7fe51e6f48e8d`
- Passing year-transition QA run: `37415236750`

## Problem fixed

Post-foundation seasons were visually falling back into the original 2008 setup shell at Season Review.

The confirmed failure at the end of 2009 was:

- 2009 Review nav: `World · Club · Signing · Draft · XI · Season`
- 2010 offseason nav: `Season · XI · Archive`

That made the dynasty look and feel like a different product between seasons and exposed old foundation navigation that no longer belonged in an established career.

## Surgical change

For years after 2008, `openSeasonReview()` now explicitly restores the permanent dynasty navigation:

`Season · XI · Archive`

No Review content, offseason logic, Team Room rendering or Season Hub layout was redesigned.

## Acceptance journey

The browser regression completed:

- full 2009 regular season
- 2009 postseason
- 2009 Season Review
- 2010 offseason
- 2010 annual Draft
- 2010 Final 15
- 2010 preseason
- 2010 Team Room
- 2010 Round 1

## Visual continuity acceptance

### 2009 Review

- permanent dynasty nav retained
- no foundation `World / Club / Signing / Draft` navigation
- existing premium Review hierarchy retained

### 2010 offseason

- same `Season / XI / Archive` shell
- five-stage offseason timeline remains intact
- no broad visual redesign

### 2010 Team Room

- exactly one active screen
- `Name your 2010 XI`
- same focused `Use Recommended XI / Build Manually` gateway
- permanent dynasty nav retained
- no page-level horizontal overflow

### 2010 Round 1

- exactly one active Season screen
- same permanent nav as 2009
- same five Season views
- same Season KPI structure
- same dynasty-season context strip
- same Season section structure
- 14 fixtures / 14 rounds
- no page-level horizontal overflow

## Product rule established

Once the dynasty has begun, a new year changes the cricket state, not the product shell.

Team Room, Season, scorecards, Finals and Review should retain the same visual language across seasons unless a future feature has a real structural reason to change it.

## Scope protection

The guardrail confirms:

- core scripts 0–6 unchanged
- presentation block changed only by the v7.2.14 marker
- dynasty logic changed only by post-foundation Review navigation continuity

No simulation, player, Draft, trade, injury, save, fixture or ratings logic changed.

## Acceptance decision

v7.2.14 Year Shell Continuity is accepted at:

`70810a1d6771c283f9f143d7707a0df90fd5594dfe321677f6f7fe51e6f48e8d`

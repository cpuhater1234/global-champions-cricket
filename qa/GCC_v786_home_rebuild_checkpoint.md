# GCC v7.8.6 Home Rebuild Checkpoint

## Candidate

- Branch: `work/v7.8-player-experience`
- Parent: `global_champions_cricket_v7_8_5_visual_hardening.html`
- Parent SHA-256: `d7ae7d1f1799cb4aedde7cbb90f4d9557c5c93214dfb4cab39a52947f55a6f45`
- Candidate: `global_champions_cricket_v7_8_6_home_rebuild.html`
- Candidate SHA-256: `c56e3a639d2411e4669aaffea5bbf20f021fc5730fdd4d120167c1ca28e6db3b`

## Why v7.8.5 was not good enough

A real-user screenshot exposed two front-page failures that the previous audit should have caught:

1. the hero PNG carried its own baked green rectangle, producing a visible green box/border inside the surrounding green hero treatment;
2. the four one-line foundation stats could collide at realistic card widths, producing copy such as `SIGNING WINDOW120 DRAFT PICKS`.

This pass treats the screenshot as the ground truth rather than accepting a zero-overflow metric.

## Home rebuild

- The baked-background hero image is no longer used visually.
- The foundation identity is rendered as an unboxed GCC wordmark directly on the warm paper surface.
- The cricket ball and stumps become restrained gold accents inside the green GCC mark.
- No inner green rectangle, ellipse or decorative frame remains around the logo.
- The four foundation facts are always a stable 2 x 2 grid.
- Stat labels can wrap safely and have explicit separators.
- Critical foundation copy no longer uses the delayed opacity animation that could make the card temporarily look washed out or unreadable.
- Supporting copy has explicit opaque text colour.

## Human visual checks

The home card was rendered and visually inspected at:
- 1440 x 900
- 1180 x 900
- 1080 x 900
- 900 x 800
- 842 x 692, matching the supplied screenshot dimensions
- 768 x 800
- 390 x 844

At 842 x 692:
- the logo is unboxed;
- no internal green border exists;
- each stat occupies its own 364.5 px x 48 px cell;
- no stat text overlaps;
- document horizontal overflow is zero.

The wider v7.8.5 visual regression set was also rerun on the v7.8.6 styling through Home, clubs, Signing Week, Draft Draw, Foundation Draft, Team Room, season, Matchday, Finals, Review, off-season, Trade Centre and annual Draft states. Annual Draft and Final 15 were separately re-rendered.

## Verification

- All ten inline JavaScript blocks pass `node --check`.
- v7.8.5 -> v7.8.6 patch is reconstructable and hash-guarded.
- No gameplay, simulation, Draft, retirement, cut or trade rule changed.
- No GitHub Actions workflow was added or intentionally triggered.

GitHub remains version control and rollback storage; visual/browser QA stays local.

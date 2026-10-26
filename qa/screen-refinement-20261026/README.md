# Recruitment, XI, preview and conditions refinement

- Equal-width and equal-height desktop signing/wire panels; aligned wire header and entries. Responsive stack on phones.
- Shared heading dividers and vertical rule; compact mobile headers. Recruitment eyebrow now carries year/context instead of repeating the title.
- Plain summary/scout/candidate hover no longer paints an unframed rectangle. Text/border cues remain; boxed controls retain bounded states.
- Draft help renamed Before your first pick and separated from the clock.
- Team role dropdown removed; bench list includes every remaining squad member even if an old UI filter was set. Framed counts and mobile tabs.
- Complete XI selected players have Swap controls. The choice uses the existing engine swap operations and preserves batting position. Incomplete XI uses normal selection/removal; Swap is hidden and command-guarded there.
- Preview paired full-colour club cards, framed venue/weather, aligned action grid and ordered XI tiles. Conditions use three aligned cards plus separate ground/weather interpretation.

Verification on final SHA:
- 135 rendered Chromium journey cases:15 surfaces ×1280/390/320 widths ×16/24/32 root text, including swap choices and expanded preview/conditions. Sampled contrast/hover; page overflow/heading clipping; heading blank-space regression; recruitment panel equality; draft-help gap.
- Actual complete fresh draft/manual XI logic test: selected swap/cancel, batting position, bench reverse swap, injury rejection, stale hidden filter and incomplete-XI guard.
- Independent review found mobile flex-height and partial-XI swap issues; both corrected and regression-checked before publication.
- Engine scripts unchanged. UI scripts12/17/19 only. Player ratings unchanged.
- Screenshots inspected for desktop signings/preview and mobile XI/conditions. Emulated Chromium evidence; no new physical-device or novice playtest claims.

Ratings audit:412 profiles ×19 attributes =7,828 finite in-range values. 270 eligible2008 profiles;95 high peripheral attribute values flagged for evidence review. All profile provenance and confidence retained. These are review candidates, not95 proven mistakes. Generated career templates and peripheral priors are not independently validated player skills. Full individual evidence validation remains open; frozen calibration challenger was not promoted or retuned.

SHA256: e28ccd173f92069cb690d27f6b64224c072f4b56bb061d00428edadc5a5e7af0

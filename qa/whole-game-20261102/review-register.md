# GCC whole-game review register

Baseline: Build37. Candidate: Build38. 2 November 2026.

Four independent read-only reviewers mapped setup, squad/management, match experience and career/records. Separate macro and micro inspectors reviewed compositions and craft. Root owned Chrome and integration. Specialists did not independently play browser sessions. This register is coverage, not certification of every state.

## Browser evidence

Actual Chrome37: home/Continue, annual draft13-15 selected, player report at1150x666, empty XI, retained10-player XI, fullXI, matchday, toss, running then paused live play, completed result, mobile result at390x844, ladder and My players. Test career advanced from2013 offseason to Round2 by drafting Bumrah and Head, retaining ten prior players, adding Razzaq and playing Round1. Result134/6 versus138/2. Browser left on Matchday; viewport reset.

Build37 improvements confirmed: first-row draft Pick controls visible; GLO single-line desktop; player identity aligned with body atx52; record first stat row visible at666px; report root overflow hidden. Exact new draft y-position not measured at fixed666px; initial draft capture used natural viewport and must not be used for pixel comparison.

Actual defects: XI empty first row begins near bottom of666px viewport; large ground/status preamble. Matchday matchup partly below fold. Mobile result Next cardy1667, Scorebooky1839. Worm text box4.8px high at322px chart width. Mobile badge creates extra header row because forced display defeats legacy hide. Ladder repeats its screen title as a large visible caption. Captures in captures/ are Build37 only; xi-full and live-paused are intentionally scrolled views.

## Complete screen/state register

| Area | States to inspect | Current evidence / next gate |
|---|---|---|
| Launcher | fresh/saved/resume/reset confirmation | Saved home observed37; fresh/reset await Chrome |
| Global menu/guides | pre/post club, enabled archive, three guides and expanded rules | Source mapped; full keyboard/phone inspection pending |
| Club introduction | story/three steps/launch/back | Source mapped; Chrome pending |
| Club invitations |0/partial/8, paused/running/skip/speed | Source mapped; transition capture pending |
| Club chooser/guide | all8 names/grounds/colours, dismissed guide, confirm | Source mapped; all8 Chrome variants pending |
| Signings | unopened/playing/paused/complete, empty/long wire, signed/declined | Source mapped; dynamic capture pending |
| Foundation/annual draws |0/partial/8, own club1/8, skip/pause/speed | Source mapped; fresh baseline capture pending |
| Foundation/annual draft | CPU/user, empty/10/11/15, supplementary, role/sort/search/no match | Annual13-15 observed37; other states source/offline only |
| Draft dialogs | squad empty/full, selected scout/back, analysis/picks/guide | Mobile squad observed36;37 full return and keyboard pending |
| XI | empty/partial/full/invalid, previousXI available, panes, keeper/injury block | Empty/10/full observed37;38 density pending |
| XI order/swap | boundary arrows, incoming/outgoing, cancel, tool guard, scout/back | Source and offline reproduction;38 native inspection pending |
| Player report | own/bench/rival/draft, 3 roles/views, long identities, no/old records | Draft bowler overview37 observed; full responsive/state coverage pending |
| Management | medical, concerns, transfer, promises active/kept/broken, rotation | Source mapped and existing contracts; crowded Chrome states pending |
| Injury cover | none/eligible/signed/OUT/returned | Missing OUT status reproduced offline;38 native inspection pending |
| Trade | empty/valid/invalid/picks/keeper/budgets, review/decline/accept/scoutback | Source mapped; browser decision flow pending |
| Matchday | ready/blocked/settled/many decisions, preview/conditions | Ready+many decisions observed37;38 layout pending |
| Toss | won/lost, bat/bowl, legacy fallback, reducedmotion | Won/bat observed37; remaining variants pending |
| Live | playing/paused,1/2/4/8x, innings/chase/wickets/extras/surge/superover | Firstinnings running/paused observed37; exhaustive playback/focus pending |
| Result | win/loss, next/wrap/finals, Scorebook/replay | Loss observed37;38 header routes offline pass, render pending |
| Worm/awards | long names, all clublines, wickets, unavailable olddata, phone labels | Actual tiny labels37;38 scale/margin render pending |
| Scorebook | both innings/DNB/extras/FOW/bowling/superover/old records | Existing routes tested; fresh37 browser layout pending |
| Season navigation | ladder/fixtures/Myplayers/leaders, zero/populated | Ladder/Myplayers observed37; phone and fixtures/leaders pending |
| Finals | ready/semis/GFready/done, participant/spectator, returnXI | Source mapped; full Chrome flow pending |
| Season review | champion/finalist/nonfinalist/2026 | Source mapped; fresh Chrome pending |
| Offseason | quiet/retirements/vacancies/issues, manage/release/listreview | Source mapped and existing offline contracts; fresh37 Chrome pending |
| Final list | overfull/ready, legacycuts, confirm | Source mapped; browser pending |
| Archive | empty/1/19 years, archivedstats/no legacydetail/records/legends | Source mapped; phone/long career Chrome pending |
| Legacy | final2026 summary/history/home | Source mapped; Chrome pending |

## Build38 coordinated changes

XI heading/status/ground/return bands and rows are compact; confirmation controls remain44px and status has explicit responsive tracks, including one-column top band761-1000px. Career logo/header and matchday venue use less vertical space. No roster content hidden. Removed forced badge display that introduced a mobile row in37.

Results have a shared heading/action row with one continuation and one Scorebook action before scores; winner/margin precede team scores. Upcoming opponent context remains below scores; analysis/awards/worm follow. Worm plot shifts right to reserve y-label room, has larger mobile SVG type, and Overs is HTML text outside scaledSVG. Desktop table captions are quieter; duplicate ladder caption visually hidden but retained for accessible table name; ladder rows/padding tighter.

Pending swap disables and rejects ClearXI/Naturalorder without changing selected IDs/order/candidate. Temporary cover remains excluded from persistent morale descriptors but now displays medical status independently. These are verified functional corrections, not rating or engine-model changes.

## Validation and remaining systemic work

Seven new swap/cover contracts failed on37 and pass oncandidate. Result navigation/uniqueness/order/immutability pass. Management units pass, including medical pauses, cooldown and rotation. Dossier, draft return, parsedDOM and accessibility regressions run separately. CSS parser0 errors;20 scripts parse; core2/9/10 identical to37. Candidate38 not rendered; no assertion that viewport targets already pass.

Priorities after38 render: full role-rich management composition; scorebook mobile table strategy; all8 clubcolour variants; initial recruitment/reveal continuity; long-career archive/offseason; fast playback focus/status and reducedmotion. Do not add decorative metrics or online infrastructure to address these visual problems.

## External standards used as review references

Xbox UI navigation: https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/112
Xbox text display: https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/101
Xbox contrast: https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/102
These inform consistency, readable/scalable text and contrast checks. No Xbox compliance claim; device/resolution guidance is not blindly transplanted into CSS pixels.

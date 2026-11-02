# Build33 visual coverage ledger — 2 November 2026

Owner: visual QA lead. Read-only source review of `v8/ui/controller.js`, `screens.js`, `career.js`, `decision-ui.js` and historical QA records. Candidate: `deliver/GCC_v8_Playtest_33.html`. This ledger is a coverage plan and evidence inventory, not visual certification.

## Evidence rules and present limits

- **Current** means an actual Build33 capture inspected by the reviewer, with viewport and state identified. Five supplied captures have now been inspected; their limited coverage is recorded below. They predate the new integrated candidate and do not certify its rendering.
- **Archived** means an actual older browser observation documented in QA. Source parity or passing contracts do not upgrade it to current pixel evidence.
- **Source risk** means a plausible problem requiring rendering; it is not a confirmed defect. Tests establish structure/behavior only.
- Historical references: `qa/page-audit-20261101/review.md` (Build25), `qa/guides-20261101/review.md` (Build26), `qa/archive-20261101/review.md` (Build28), `qa/review-20261101/review.md` (Build29 physical / Build30 candidate), `qa/management-20261101/review-build33.md` (Build32 physical / Build33 candidate).

## Coverage matrix

All rows require desktop 1150×666 and 1440×900, tablet 768×1024, mobile 390×844 and 320×568, and desktop 200% zoom. Check 760/761 and 999/1000/1001px boundaries where layout changes. At zoom, record actual CSS viewport and check all controls remain reachable. Desktop/browser zoom is a separate check from narrow emulation. Current evidence is absent except for the five partial captures listed below; the matrix remains the comprehensive gap list.

## Actual Build33 captures inspected

Screenshot raster dimensions are not proof of CSS viewport or browser zoom; those capture metadata remain to be supplied. Desktop images are1135×657 and mobile image375×812.

| Capture in `captures/` | Proven visible evidence | Limit / finding |
| --- | --- | --- |
| `home-desktop.png` | Saved Gloucestershire2013, stadium, crest, Start new career and Continue visible | New-career action has orange primary emphasis while Continue is neutral. Candidate reverses emphasis but is not rendered here. Mobile/no-save/zoom still open. |
| `offseason-desktop.png` |2013 overview,13 staying,2 retired,2 draft vacancies, steps and retained-player copy | Summary occupies left portion of broad panel with unused space to its right; actions and decisions below visible crop. Candidate columns are unverified. |
| `offseason-decisions-desktop.png` | Sidebottom/Haddin/Mahmood transfer requests; individual review buttons; collapsed two-more disclosure | Decision text readable at this size; no continuation control visible in crop. Does not prove action-after-both candidate structure. |
| `player-desktop.png` | Ryan Sidebottom Management selected; role/age/form/rating76; transfer request; trust/fitness/form; beginning of commitment area | Identity split across header and separate role panel; full commitment actions below crop. Candidate consolidated header unverified. |
| `player-mobile.png` | Same Management content wraps within dialog; three view buttons and close visible; form/fitness/trust labels readable | Both background-page and modal scrollbars visible; static image cannot establish scroll trap or keyboard behavior. Deep commitments, other tabs and mobile long names remain open. |

These five images establish no newly observed release-blocking defect. They establish concrete hierarchy and consistency issues addressed by the candidate, but no before/after acceptance can be issued without candidate captures.

## Independent candidate source acceptance

Source confirms explicit offseason summary/issues siblings followed by an actions row; player identity and title are moved together into the report header; team-pane buttons receive `aria-pressed` from the common button helper. These are source checks, not rendered acceptance. Check candidate at the five matching states and all required narrow/zoom boundaries before closing their findings.

The source mismatch identified in team-pane pressed state is now corrected: the common helper applies the pending-swap XI override before the stored pane. Root reports the targeted regression was observed RED before correction. This is source/test acceptance only; no pending-swap browser image has been supplied.

### Scene-scroll correction review

Root physically observed annual draft entry retaining page scrollY1338 with title y−1097. That is a confirmed current navigation defect, separate from the five original capture observations. The candidate adds `sceneKey()` for dynasty phase/market pane and season tab, resets the stage/top on changed scenes, and restores window position only for unchanged scenes. `scene-red.log` independently shows the previous command fixture failed720→0 expectation. Root reports passing corrected command checks; no corrected physical draft entry is certified here.

Read-only control-flow review found no new modal/focus regression: opening/replacing dialogs bypasses background render; unchanged-scene closing retains normal opener/window restoration; dialog scroll remains independent; pendingFocus applies only to team remove/swap/clear and does not override dynasty resets. Source acceptance is conditional on physical checks of scrolled dialog close/Escape, trade→player→trade scroll restoration, and keyboard season-tab transitions. No new defect was established by this review.

Continue now explicitly applies saved-club ink through `--gcc-accent-ink:var(--resumetext)` according to root integration; check its actual current background/text contrast in the next candidate screenshot.

Highest remaining current gaps: candidate before/after on these five states; mobile offseason and issue actions; fresh draft and XI at761/1000px; trade actions at200%; live scoreboard; deep scorebook/archive; finals/legacy. All tablet and browser-zoom coverage remains absent.

| View / surface | Essential state coverage | Archived physical evidence | Largest present gap / source risk |
| --- | --- | --- | --- |
| Home | No save; saved career metadata; new-career confirmation; Continue | Build25 desktop crest/stadium/Start/Continue | Mobile hero, all-club saved identity, long metadata, 200% zoom |
| Story | Introduction, all steps, back/launch | Earlier passes referenced, no fresh sized evidence | Responsive reading order and reachable launch |
| League reveal | Sealed, partial, complete, paused/skipped; reduced motion | Earlier passes only | Reserved card heights, reveal stability and controls |
| Clubs | Eight identities, longest name/ground, selected card and club guide/confirm | Earlier passes only | Every club ink/accent pair, narrow confirm dialog |
| Recruit | Empty wire, running, paused, speed, five days, skip/completed | Earlier passes only | Wire scroll position, live updates, long names, nested scroll |
| Draft draw | Foundation and annual; sealed/partial/final; own club marker | Earlier passes only | Reveal controls, long identities, step indicator at narrow widths |
| Draft | Own/CPU turn; search/filter/sort; zero results; load more; selected/scout; completed; annual supplementary picks | Earlier passes only | Dense cards, sticky/primary action visibility, long role/name combinations |
| Team | Empty/partial/legal XI; retain previous XI; XI/squad tabs; reorder; swap pending/cancel; no keeper; OUT/MANAGING; all-role filters | Build25 empty→retained XI; Build29 mobile and 761px midword defect | Build30 single-pane fix needs current render; long names and disabled reasons |
| Season matchday | Ready; illegal/injured XI; concerns/commitments; trades open/closed; end of league | Build25 ready/injury gate; Build32 round8–14 | Club identity on narrow score panel, stacked concerns and controls |
| Season ladder | Empty/early/full; all eight clubs; tie/NRR; user marker | Build25 desktop and 390px internal table scroll | Current charcoal/alignment correction; populated tablet/zoom |
| Season player stats | Zero, populated, missing bowling/batting data | Build25 zero and populated tables | Small numeric text, headers, narrow scroll affordance |
| Season league leaders | Empty and populated batting/bowling | Build25 blank empty bodies; later contract correction | Current empty explanation and complete record density |
| Season fixtures | Upcoming, mixed, all complete; scorebook route; long grounds | Build25 14-card layout | Narrow wrapping and all result statuses |
| Match preview | Both teams/grounds; XI and comparison disclosures; blocked/ready actions | Build25; Build26 observed venue alignment issue | Build28 alignment needs current pixels; expanded mobile content |
| Match reveal | Toss; first ball; both innings; pause/speed/skip; resumed replay; reduced motion | Build32 toss/result flow; earlier live passes | Current full playback, scoreboard density, controls during updates |
| Result / scorebook | Win/loss/tie/super-over; awards; worm; both innings; extras/FOW/bowling; long names | Build25 242/9 vs235/5 scorebook; Build32 results | Deep mobile/zoom scorebook, chart labels, all boundary outcomes |
| Finals | Ready, semis complete, GF ready, done; participating/eliminated; injured XI | Build32 offscreen champion only | All actual current knockout layouts and action variants |
| Review | Qualifying/nonqualifying; champion; leading players; retirements; 2026 final-season continuation | Build32 completed2012 review | Full desktop/mobile density and final-season action |
| Dynasty overview | Full15; vacancies; retirements; development; concerns/no concerns; arrivals | Build32 thirteen retained/two vacancies; key issues below action | **Build33 relocated decisions panel and action hierarchy need first current capture** |
| Dynasty manage | Role filters/empty; long name; concerns/medical tags; exhausted release allowance | Build32 manage rows lacked concerns | Build33 added management tags need current wrapping/density check |
| Dynasty decisions | Release review/cancel; final cut; list confirmation; cuts/ready; kept full squad | Build32 release review/cancel | Destructive action distinction, modal action visibility at 200% |
| Trade dialogs | No partner assets, valid/invalid, picks before/after draw; budget disabled; review/accept/reject; midseason | Report trade return referenced in older ledger | Sticky actions, select widths and long package descriptions at zoom |
| Archive | Empty unavailable; history; season detail; missing player ledger; return context | Build28 mobile table clipping/names/navy; Escape return | Build29 table correction needs current mobile image and deep scroll |
| Legacy | 2026 closure; sparse/full tenure; records and final actions | No fresh documented physical pass | Entire view, all sizes |
| Player dossier | Overview/Record/Management; batter/bowler/keeper; zero/long history; every medical/concern/promise; active tab in all club colours | Build28 career record; Build29 mobile Overview/Management and Escape; Build32 kept promise | Current record alignment, all-club tab contrast, long commitment/action layouts |
| Other dialogs | Rating explanations; squad analysis; recent picks empty/full; team analysis; swap replacements | Earlier individual checks | Dialog nesting/replacement, long bodies, close button and footer reachability |
| Menu / three guides | Closed/open; each guide and all disclosures; cross-navigation/current marker; Escape/focus return | Build26 all guides desktop/mobile; Build28 successful Menu focus return | Current 200% zoom, menu collision with HUD and all expanded content |
| Global persistence / feedback | Saving/slow/error/conflict/recovery, toast/notice within and outside modal | Autosave exercised; offline contracts | Actual browser error presentation remains unobserved; no forced save mutation authorized here |

## First integration slice and release gates

There are **zero newly confirmed Build33 visual defects** in this review so far. Do not manufacture six defects from source risks. Admit at most six release-blocking/high findings once team reports or current captures demonstrate them. Rank actual blocked progression or unreadable essential information above cosmetic consistency.

First capture order: (1) Build33 offseason overview and manage rows, (2) 761px and mobile XI with long names, (3) mobile matchday/live club identity, (4) trade review/actions at 200%, (5) deep mobile scorebook/archive, (6) fresh-start draft and guide/menu states. This prioritizes changed pixels and already-observed historical failure modes.

| Gate | Requirement before accepting a high finding / claiming correction |
| --- | --- |
| Evidence | Current build, screenshot path, viewport/zoom, exact reachable state, expected vs actual |
| Severity | Show obscured/clipped/illegible essential content, blocked action, or materially misleading hierarchy; source suspicion alone is insufficient |
| Integration | Root selects no more than six demonstrated high issues; changes remain scoped to those issues |
| Verification | Inspect before/after at failing size plus one neighboring breakpoint and desktop; verify modal scroll/focus when relevant |
| Remaining gaps | Keep unobserved states explicitly open even if targeted fixes pass |

Historical retractions remain closed: guide Escape focus was verified fixed in Build28; dossier movement arrows already have accessible labels. Neither should reappear as a new source-only defect. The Build32 offseason hierarchy defect prompted Build33, but its correction is currently unverified, not a proven remaining failure.

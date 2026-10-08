# GCC v7.8.1 Player Experience Checkpoint

## Parent

- Canonical parent: `release/v7.6-rc1`
- Parent commit: `f0826aba1e9a88885f3631112007601fc9514d60`
- Parent game: `global_champions_cricket_v7_6_0_matchday_immersion.html`
- Parent SHA-256: `3a8b8bb9b9d67558ea19bda4b595b0ab083209f3ccb0607d209aaad04155b55f`

## Candidate

- Working branch: `work/v7.8-player-experience`
- Rebuilt game: `global_champions_cricket_v7_8_1_player_experience.html`
- Candidate SHA-256: `6be011326dc44b67f113a9a9c2e242285c3fe7e2dfe490bde507701027342596`

The generated HTML remains a build artefact. The branch stores the reconstructable patch as small Base64 payload chunks plus rebuild and verification scripts, rather than committing another large binary snapshot.

## Player feedback addressed

### Home / dynasty start

- The normal 2008 home screen is the landing page.
- A saved career adds `CONTINUE` beside `NEW DYNASTY` rather than replacing the home with a separate launcher.
- `NEW DYNASTY` can actually replace an in-memory/save-backed career after confirmation.

### Match result feedback

- Matchday result surfaces carry explicit win/loss state.
- A loss uses red rather than the same green treatment as a win.
- Recent-results rows inherit win/loss state.
- `Fine Margins` is neutral/gold unless the underlying item is a genuine weakness.

### Finals

- Finals now retain sport-event hierarchy rather than collapsing to a plain bracket.
- The user's live/elimination match receives the strongest visual treatment.
- Win/loss treatment, scorecard access, result margin and standout player are kept in the finals experience.

### Off-season continuity

- Newcomers and the off-season squad rail no longer lead with exact OVR numbers.
- New arrivals are expressed through scouting language such as `READY NOW`, `FIRST-XI UPSIDE` and `DEVELOPMENT BET`.
- A club cannot lose more than five players to retirement in one off-season. If more than five rostered players are due to retire together, the excess player(s) are deferred for one final season.
- Voluntary out-of-contract releases remain capped at two, reduced when retirements/mandatory annual turnover have already consumed the five-player continuity allowance.
- Each voluntary release creates one supplementary Draft pick.
- Final-list delistings are tracked against the same five-player off-season continuity cap.

### Annual Draft

The annual Draft is no longer presented inside the generic dynasty administration shell.

- Draft Draw uses the same cinematic presentation language as the 2008 foundation draw.
- The annual Draft hides the generic off-season header, timeline and side rail while the cricket event is live.
- The annual Draft reuses the foundation Draft's large on-clock headline, stage note, dark-green user-turn bar, three-column player cards, squad side panel and premium full-board view.
- The annual full-board view uses the same dark room/scoreboard treatment as the foundation board.

This is deliberate product parity: later-season drafts should feel like the same competition event, not a cheaper sub-screen.

### Trade Centre

- No exact trade-value meter is exposed.
- Trade scouting now includes current standing, career outlook, list fit, market interest, recent GCC production, form/fitness and scout confidence.
- The deal room provides qualitative negotiation feedback (`A LIVE CRICKET TRADE`, `THEY WILL WANT MORE`, etc.) rather than a numeric fairness score.
- The screen is framed as a club-to-club trade room rather than two bare dropdowns.

### Final 15

- The long spreadsheet-like release table is replaced by two-column player decision cards.
- Likely decision candidates are visually separated from the rest of the contracted list.
- The screen shows current contracted count and off-season departures used out of the five-player continuity cap.

## Local QA performed

All QA below was run locally with headless Chromium / Playwright. No GitHub Actions workflow was triggered or added for v7.8.1.

- v7.8.1 loaded with `GCC` and `Dynasty` present and no runtime exception.
- Foundation flow completed through 120 Draft picks.
- 2009 off-season market rendered with qualitative newcomer/list reads.
- Trade Centre rendered two scouting dossiers with no `OVR` text and no page errors.
- Annual Draft Draw rendered in event mode with the generic dynasty header hidden.
- Annual Draft rendered 24 player cards, full squad panel and foundation-style interaction surface.
- Annual full Draft board rendered eight club columns with no page errors.
- Annual Draft was completed into Final 15 without runtime errors.
- Final 15 rendered as decision cards.
- Forced-retirement test: seven user-club players were made retirement-eligible; exactly five retired and two were deferred one season, confirming the continuity cap.
- New Dynasty flow: saved career showed `CONTINUE` + `NEW DYNASTY`; replacement confirmation returned to a fresh 2008 league draw with no club selected.
- Season result smoke completed 14 rounds; latest loss used the red match-result surface.
- Forced Finals smoke entered the finals screen, produced event cards and red elimination feedback with no page errors.

## Billing / GitHub rule

GitHub remains the source of truth for branches, commits and rollback points. Heavy browser QA is local. Do not add or trigger GitHub Actions for routine GCC iteration; reserve Actions for a deliberate release-verification decision.

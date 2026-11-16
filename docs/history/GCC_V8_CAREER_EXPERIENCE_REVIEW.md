# Career experience implementation

21 October 2026. Continues the structural-risk investigation. Final playable SHA-256: `2a8fc0e8ab1a19b7cbc8f1f13dd33c13d4d60fe6a05f724d13700eebffda50ba`.

## Changes that affect the player

A full fifteen-player squad can now proceed directly from annual review to team selection. The button explicitly says that this confirms the squad, and adjacent copy explains that trading and releasing close for the preseason. Rival clubs still trade and draft through their existing guarded engine functions. The player is not required to reveal a draft order or dismiss a draft-completion prompt when they have no recruitment decision. The ordinary vacancy/draft route remains available when needed, and optional management remains accessible before confirmation.

At team selection the player can explicitly retain the available members of last season's XI in their previous batting order. This does not choose a new XI: departed, retired or OUT players are excluded; missing places must be selected manually. An incomplete side cannot be lodged. A populated XI cannot be overwritten by the retain command. Final confirmation remains compulsory. The prior selection is saved before the annual reset, so the choice survives reload. Older saves with no stored prior selection simply use normal manual selection.

Development now records actual per-skill before/after values at the annual boundary. The annual panel highlights material changes relevant to the player's role, including flat-overall changes. It displays the three largest relevant changes per highlighted player, with remaining changes and the full returning squad available through disclosures. It separates permanent ability from form and fitness and does not invent a training cause. Scout screens also expose the recorded skill changes. Historical overall-only records remain readable and explicitly say that skill changes were not recorded.

Visual inspection also found a pale development badge with pale text in the scout screen. The badge now has a dark, contrasting background. Long club names in the compact header no longer drop a final letter onto a separate line at enlarged text sizes; they truncate within the available width. Normal club identification remains available throughout the squad and career screens.

## Evidence

- The actual completed-2010 full-squad path now takes five native visible clicks: Continue, Offseason, Keep squad, Retain available XI, Lodge XI. The earlier measured route took nineteen. This is a tested route, not a universal minimum or timed human task.
- Four native paths cover 320px, 390px, enlarged-text 390px and 1280px. They assert manual selection, explicit lodging, correct next year and fixture creation, no horizontal stage overflow and no page errors.
- Twelve scout-development width/text cases cover 320/390/760/1280px and 16/24/32px root text, including opened skill changes, geometry and contrast scans. The real contrast failure was reproduced and repaired before the final passing run.
- Eighty-four annual management/release/trade/review layout and contrast cases and sixty fresh-entry/draft cases are retained separately. Automated contrast uses the nearest opaque CSS background; gradients/images still require visual inspection.
- Behaviour checks cover the empty annual draw bypass, CPU final-list integrity, explicit XI retention and order, unavailable players, incomplete lodging, repeated commands, selection reload, vacancy guards and legacy development records.
- Ten existing gameplay/management/selection suites pass against the final artifact. Match calculations, CPU selection weights, career outcomes, retirement schedules and trade valuation are unchanged.
- Two new full-flow careers exercise the changed annual logic on seeds 202 and 303. They started before final scout-only markup and contrast refinements; they are not relabelled exact-final-artifact visual tests. A separate final-artifact continuation from the actual completed-2020 save exercises 2021–2026, verifies the nineteen-season archive and 2026 ending/reload, and records exactly how many seasons it exercised. Read the result files for their scope.

Generated saves and screenshots are local QA inputs, not a new user-facing export/import feature. There are no human enjoyment sessions in this evidence.

## Rating calibration and remaining structural risks

A new twelve-world realised-career probe confirms the population shift: mean active eligible ability rises from approximately 76.5–77.4 in 2008 to 86.3–87.7 in 2026. This probe includes signed foundation players and eligible arrivals, but no roster selection, matches or administration. It is not twelve full-flow careers. The separate complete careers measure the selected league rosters.

A foundation-only diagnostic gave a different result: the small surviving foundation group was in the low seventies by 2026. The broad increase therefore must not be described as every player gaining indefinitely. Incoming cohorts, their peak estimates, young-player development and recruitment selection need to be assessed together. The previous adjacent-year league decomposition remains valid, but 'incumbent improvement' includes young arrivals developing after joining a roster, not just the original 2008 players.

No blanket rating nerf or arbitrary CPU buff was applied. That would change saved outcomes and strategy balance without a validated calibration target. The original finding that overall-only narrowly edged balanced recruitment with mixed paired results still does not establish a dominant strategy. Common elite opening targets also do not establish identical CPU squads; actual roster compositions and champions varied. These remain bounded findings, not universal balance guarantees.

The experience has concrete friction and feedback repairs. Rating-scale calibration, broader exploit searches and genuine sustained enjoyment remain open. Do not call the product perfected or release-ready on the strength of automated counts.

## Reproduction

`python qa/completion/build_candidate.py` builds from the verified engine base, replaces the maintained UI modules and the new `v8/core/development.js` module, and inserts the persisted previous-XI snapshot at the annual boundary. Existing saved ability/outcomes are not migrated or rerolled.

Focused commands and retained reports are under `qa/career-experience`. `resume.mjs` requires an actual completed-season checkpoint and labels the resumed years separately from the full archive total. Historical structural-risk result files describe their original artifact; do not overwrite or relabel them with these results.

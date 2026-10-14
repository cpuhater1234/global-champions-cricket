# Global Champions Cricket: fresh game rebuild handoff

## User decision, authoritative

Tom rejected continued v7 UI repair. His latest instruction is a complete fresh slate with a game-centred approach. The ideology and progression are close to what he wants, but the presentation and interactivity are not. He explicitly said all screens need work, that it looks like any other website, and that repeated rehashing has not produced meaningful change. Do not resume v7 CSS patching or treat its screen structure as the desired design.

Preserve the cricket concept and sound domain work: alternate-history global T20, 2008–2026, eight real clubs, five-day signing window, fifteen-player snake draft, manual XI and batting order, fourteen-match season, finals, annual retirements/trades/draft, injuries/replacements, save/load and career legacy. Preserve the cream and muted-green identity as a starting preference, but the latest explicit fresh-slate instruction supersedes earlier constraints against broad UI changes. No neon, generic corporate dashboard, crowded KPI cards or AI copy.

## Repository checkpoint

Repository: `cpuhater1234/global-champions-cricket`.
Last committed recovery branch: `work/v7.9-presentation-recovery`.
Last recovery commit: `bc841d5df58726c840512d5c1d64cd523681f1b8`.
Tree: `28416f921fb2ae7d2b37054aff8387d6a375882b`.

The separate v8 branch stores this handoff and the initial source scaffold. The frozen engine files are reproducibly generated from the committed v7.9.3 source, not required as separate duplicated repository content.

Workspace at handoff: `/workspace/scratch/fbabdb6c3d39/gcc`.
Original protected v7.8.7 checkpoint: `game/gcc_recovery_architecture_checkpoint.html`. SHA256 `8dfda284f00ca7f693f96b734ae9a95edb9ad0b133165dcaef9024eae74478c2`.

v7.9.3 playable reference: `game/global_champions_cricket_v7_9_3_layout_rebuild.html`, SHA256 `eddec7bc6d92eb494bef26384e0618ea63d5244c63c8a1c9d84b1f5e16e98926`. It is not visually approved. The assembled HTML was supplied locally; the full source is committed.

## Exact v8 status

Only a scaffold exists. It has not produced a playable v8 game, been visually reviewed, or passed gameplay tests. Do not imply otherwise.

- `v8/build.py`: freezes the known v7.9.3 script blocks and a hidden DOM host; assembles a future standalone HTML when all UI files exist.
- `v8/ui/shell.html`: fresh visible app roots, HUD, stage, native dialog and feedback.
- `v8/ui/components.js`: initial components/helpers including an SVG cricket ground, shirt/order icons, club marks, player cards, pool/roster access and result cards.
- `v8/ui/game.css`, `screens.js` and `controller.js` DO NOT EXIST YET.
- `v8/engine/*` exists locally from extraction, but can be regenerated. The builder adds private read-only getters for eligible contract candidates, annual pick slots and cut budget inside the dynasty closure. These are not yet tested.

The proposed adapter reuses the domain through an inert, hidden DOM host while the visible UI is written entirely afresh. No old CSS is to be shipped in that new UI. This is a transitional implementation proposal, not a completed domain extraction or an approved design. Do not present hidden old rendering as a permanent ideal architecture. Further separation may be needed.

Local `src/` also contains UNCOMMITTED v7.9.4 selection/signing edits made before Tom ordered the reset. They were abandoned. A local `game/global_champions_cricket_v7_9_4_selection_signing.html` is an unapproved, superseded artifact. Do not build the v8 reference from those modified source files, and do not push them over the recovery branch. Use the committed v7.9.3 source/ref.

## Reconstruct in a new workspace

Start from the v8 branch, which is based on the exact recovery commit above. Build the reference from its unchanged `src/`:

```sh
python tools/source_workspace.py build game/global_champions_cricket_v7_9_3_layout_rebuild.html
python v8/build.py --freeze
```

The reference digest must equal the value above. The scaffold prints that no playable v8 build was produced until the missing UI files exist. If continuing in the old scratch directory, its modified v7.9.4 `src/` is not the baseline; the already compiled and digest-verified v7.9.3 reference is available there. Preserve checkpoints rather than destructively overwriting unrelated files.

## Design objective

Make the player feel they are taking over a cricket club and living a season. Each stage needs an identifiable place/event, anticipation, one dominant decision and feedback with cricket consequences. Build from the player’s decisions instead of arranging existing reports into cards.

Fresh flow should cover: title/continue, the breakaway and club reveal, franchise choice, live signing week, draft draw, on-the-clock player choice, manual match XI/batting order, match preparation/result, finals, season closure, offseason negotiations/list decisions/annual draft, archive and 2026 ending. The entire visible UI needs a coherent design and control language.

Keep supporting ratings and statistics accessible, but do not let them replace the experience. Names must be legible in every state. Buttons must act like buttons. Preserve focus and scroll during updates, use one timer runner, avoid unnecessary full-screen rerenders and respect reduced motion. No untested claims of smoothness or perfection.

Suggested next implementation: complete a substantially different playable foundation flow (club choice through signing/draft/manual XI/match result), with clean screen rendering and guarded commands. Then carry that design through the career stages. Write actual new views and components, not more selectors overriding the previous screens. Verify the new visible action bindings against the real model.

## User evidence and issues

Latest JSONs:
- `/workspace/scratch/fbabdb6c3d39/upload/gcc-layout-report.json`, Library ID `libfile_4516cab74b98819185c45ddcfcd65738`: v7.9.3 opening `#world`, 1920×945. Possible SVG text bounds intersection between GCC and subtitle. Not proof that ink overlaps.
- `/workspace/scratch/fbabdb6c3d39/upload/gcc-layout-report (1).json`, Library ID `libfile_1b294bc118b08191b74a749026f38c53`: v7.9.3 `#team`, 1920×945, focused summary, no geometric overlap. This does NOT validate the design, click behavior or game feel.

Tom reports that the right-side Fielding read does not work and signing names are too bright to read. Source showed the fielding read was noninteractive text while phase metrics were buttons. A legacy signed-state selector made names nearly white over the previously changed pale card. These are examples of why another patch pass was rejected. Fresh controls and fresh state colour ownership should resolve the causes.

No screenshots were supplied with these two JSONs. Do not claim to have seen current pixels. Earlier `gcc-visual-capture.zip` has 90 historical screenshots, Library ID `libfile_7f9ac4ef6bac8191952ffc96c69e1954`; version was unverified and it is a reference of what to avoid.

## Verification and access limitations

Recovery tests executed real game scripts using a render-only VM host, not a browser. Two v7.9.2 careers completed 2008–2026: 3,412 assertions, 532 regular-season scorecards. v7.9.3 targeted results: 29 controls/timer, 10 signing, 21 mocked interaction, 23 source/curated CSS tests; parsed markup across 18 states and 3,145 handler bindings. These do not test the v8 scaffold and never certified rendering, native focus/clicks, frame rate or input latency.

Earlier cloud-browser localhost/file and Opera local screenshot/read actions were explicitly blocked. Do not bypass those restrictions using another browser, CDP, hosting or execution path. User-operated screen capture and uploaded screenshots/JSONs are the permitted review path established here. Do not repeat connector setup loops or pretend static/VM checks are native browser QA.

Do not deploy, use GitHub Actions, create a release or send messages to other people. No subagents unless explicitly authorized by user or applicable instructions. Save repository-backed work through GitHub and verify branch head. Use expected-head leases. Keep commentary useful and frequent; Tom is frustrated by lengthy vague status and test counts being substituted for a real answer.


## Continuation checkpoint: new v8 foundation implemented

The scaffold status above describes the original `308a60e` checkpoint. The current branch now includes new `game.css`, `screens.js`, `controller.js` and `clock.js`. All visible career stages have new views and commands. The cricket engine remains a transitional inert-host adapter. The old home-motion, overlay and identity scripts are omitted; old CSS is not shipped. The builder creates its engine directory on a fresh checkout and produces a standalone HTML.

Read `docs/GCC_V8_IMPLEMENTATION.md`, `qa/v8_validation_scope.json` and `qa/V8_VISUAL_REVIEW.md` before continuing. Full VM career testing completed 2008–2026, 266 regular-season matches and 3,158 assertions on the preceding candidate. The subsequent downloadable candidate passed a two-season smoke/reload and targeted trade, supplementary-pick, replacement and restart tests. Exact tested digests and limits are recorded in the scope JSON. Do not conflate that with native-browser or visual approval.

No v8 screenshots have been rendered or seen. Browser restrictions remain unchanged. The next decisive step is permitted user-operated rendered review and actual play feedback, followed by meaningful design/interaction iteration. Do not claim perfected visuals, smoothness, native focus or performance. Do not fall back to v7 CSS patching. Preserve the new decision-led screens and move the domain toward a headless adapter when appropriate.

The assembled file is `game/global_champions_cricket_v8_fresh_game.html`, reproducible from the committed source. It is a candidate foundation, not a polished release. No deployment, Actions run or release was made. No subagents were used.

## Latest steering: arcade design candidate

Tom said he does not mind the new foundation and explicitly asked to go further with a crazier, more arcade-like design and colours. That supersedes the restrained visual treatment in the initial v8 foundation. The visible stylesheet now uses navy, lime, cyan and orange; bold sports typography; chunky controls; club and role accents; a striped, floodlit cricket arena; score panels and short decision-triggered motion. Names retain a fixed dark foreground on pale player cards and signing rows. Reduced motion remains supported.

The latest downloadable artifact is `game/global_champions_cricket_v8_arcade.html`. Build it with `python v8/build.py --output game/global_champions_cricket_v8_arcade.html`. The earlier foundation artifact remains a comparison checkpoint. The cricket model, controller, clock and save rules were not changed in the arcade pass. Spectator finals results now have neutral score labels rather than declaring a user loss.

Source/syntax and VM markup/binding checks passed for the arcade candidate, recorded in `qa/v8_arcade_scope.json` and `qa/v8_arcade_markup_results.json`. There is still no rendered v8 evidence. Do not say the arcade visuals or animations have been visually approved or verified smooth. The permitted user-operated screenshot path remains the next step.

## Latest steering: longer flow, stable live layout and complete cricket reads

Tom liked the arcade candidate. He asked for more length/detail, alignment that does not bounce while entries arrive, automatic order reveals with speed controls, no save import, hard checking and translation of the advanced cricket data.

Current candidate: `game/global_champions_cricket_v8_arcade_flow.html`. Build with `python v8/build.py --freeze --output game/global_champions_cricket_v8_arcade_flow.html`. New UI modules `data.js` and `dom.js` provide cricket reads and keyed live updates. Read `docs/GCC_V8_DATA_COVERAGE.md` and `qa/v8_flow_scope.json` for coverage, exact test digests and outstanding rendered review.

Automatic club/foundation/annual reveals use the existing single runner. Progress and pace resume from the save. The public import entry point and visible import workflow are removed. The optional-release cap was corrected to the user's maximum of two, further limited by four total controllable departures. No subagents, deployments, Actions or releases were used.

The approved direction is the arcade aesthetic. The user has seen and liked the preceding candidate; that is not a rendered audit of this latest candidate. Native visual alignment, focus, scroll, performance and animation remain unverified under the existing browser restrictions. Passive layout-shift diagnostics and user-operated capture can supply the next evidence. Do not claim smoothness or perfection from VM/DOM-model checks.

## Latest steering: real cricket imagery and published icons

Tom asked for an actual cricket-stadium photo because the drawing did not feel enough like cricket, then requested good real cricket icons throughout. The new artifact is `game/global_champions_cricket_v8_stadium.html`.

The builder embeds a public-domain photograph of a real cricket match at the MCG under floodlights, by Pattav2 via Wikimedia Commons. The source asset was downloaded and inspected; the pitch, players and floodlights are visible. It appears in the title, matchday, final and ending imagery. The caption always identifies it as the MCG rather than claiming it depicts another club's home ground. The image preserves its full aspect ratio and reserves intrinsic dimensions before decoding.

Sixteen Tabler SVG icons are stored in `v8/assets/tabler` and embedded as a symbol sprite: cricket bat-and-ball, trophy, scorecard, kit, team, stadium, calendar, stats, scouting, archive and navigation. Original paths and the full MIT notice are retained. `v8/assets/credits.json` records sources, licence and transformations. No baseball or ten-pin icons are reused as cricket equipment.

No gameplay changes. Build with `python v8/build.py --freeze --output game/global_champions_cricket_v8_stadium.html`. Check scope is in `qa/v8_stadium_scope.json`. Source-photo inspection is not native rendered UI review; existing browser restrictions and no-smoothness-without-evidence rule remain in force.

## Latest steering: remove export and audit the whole game

Tom praised the current appearance and requested no JSON export, followed by a hard front-end and backend pass. Product import/export buttons, public APIs, download/file-picker functions and hidden-host export/import buttons are removed. Autosave and Continue remain. Current candidate: `game/global_champions_cricket_v8_reviewed.html`, SHA256 `61c4da1ff92f001087364ce868f5c6318b82628d03ee4cc66fdb41cd64a76bcd`. Build with `python v8/build.py --freeze --output game/global_champions_cricket_v8_reviewed.html`.

Read `docs/GCC_V8_HARD_AUDIT.md` and `qa/v8_audit_scope.json` for fixes and evidence. Corrected storage-denied title reads, falsely successful restore when old state was already in memory, weak saved-state validation, missing Continue context, paused-timer delay, stale draft commands, injury-cover/swap guards, component-rating cache invalidation and old league-result return routing. Browser-exit saving is wired. Failed storage leaves the current session playable, with a visible save warning.

The exact candidate completed 2008–2026: 19 seasons, 266 regular-season matches, 14,729 assertions with zero unexpected errors. A different seed completed two seasons/28 matches/1,683 assertions. Additional checks cover save corruption and denied storage, reveal pacing/resume, real accepted trades/pick transfer, injury-cover fixture, scheduler and 24 keyed DOM reorder/removal permutations. Parsed markup covered the final full-career states. Intentional bad-save/storage errors are reported separately. A clean freeze/rebuild was byte-identical.

This single HTML has no server: domain/persistence run locally. This is code, VM and DOM-model audit evidence. Native rendered alignment, focus, scrolling, storage semantics and smoothness remain unverified under the unchanged browser restrictions. User liking the visuals is not our rendered audit. Preserve the accepted arcade design and real stadium/icons. No subagents, hosting/deployment, Actions, releases or external messages were used.

## Latest steering: extensive testing

Tom asked for extensive testing to ensure quality. Current candidate: `game/global_champions_cricket_v8_quality_tested.html`, SHA256 `d615ddfe4dc376c53aa49e31425842add7ad72a572940880b140b3fe527a497e`. Read `docs/GCC_V8_EXTENSIVE_TESTING.md` and `qa/v8_extensive_scope.json`.

Two further defects were caught and fixed: accepted midseason XI-changing trades now route the visible UI into the team room; malformed or unexpectedly failing restores validate deeper structure and roll back live state/screen without overwriting the original stored payload. The validator is source-owned in `v8/domain/save_validation.js` and embedded in the dynasty closure by the freeze builder. It permits the genuine empty team map before the foundation draft creates rosters.

The exact final candidate passed three complete 2008–2026 careers with seeds 101/202/303, choosing NOT/HUR/HAM respectively, plus all eight club choices in separate full 2008 seasons. That is 65 seasons and 910 regular-season matches in the main matrix, with 213 midcareer cold checkpoints and 52477 career/club assertions. Additional targeted tests passed actual-round injury-cover return, an accepted midseason trade through Round 8, offseason pick transfer, nine malformed-state cases plus a post-validation render exception, denied storage, migration, reveals and DOM/scheduler checks. Parsed markup covered 229 screen states and 4108 action bindings. No unexpected errors or failed final regressions. Exploratory runs on older digests are excluded from the final scope.

No rendered native-browser verification was performed; the original restriction remains. Keep visual/focus/scroll/performance limits explicit. No deployment, Actions, release, subagents or external messages. Build with `python v8/build.py --freeze --output game/global_champions_cricket_v8_quality_tested.html`; sources, test scripts and result summaries are repository-backed. Scratch fixture saves/snapshots are generated, not source deliverables.

## Latest steering: refine the accepted design and game experience

Tom accepted the source review and asked to get the identified refinements perfected. Current artifact: `game/global_champions_cricket_v8_refined.html`, SHA256 `dcee3405ff8f6f27dd026e44d060e901eb808390053373a0a825d5b7f5797fe7`. Read `docs/GCC_V8_REFINEMENT.md` and `qa/v8_refinement_scope.json`.

Reveal controls now precede the cards and stay sticky; narrow phones use one club column; player cards can expand; draft feedback/heading space is reduced; table rank columns are compact; long names/stat values wrap; trade dossiers are expandable behind core comparison facts. Arcade colours, stadium and icons remain.

Regular matches and finals now have six actual-score highlights, with pause, 1×/2×/4× and instant result. They reveal real innings phase runs, final wickets/overs and chase target. They do not invent deliveries/intermediate wickets or simulate twice. Existing regular results can replay highlights. Progress/pace/match reference/return destination save in `dynasty.v8Match`. Continue and archive returns support regular matches, semi-finals and the Grand Final. The established single scheduler handles the presentation.

Two complete career regressions passed: 38 seasons, 532 regular-season matches and 125 midcareer cold checkpoints, with no unexpected errors; a two-season smoke and dedicated pacing/resume/trade/storage/migration/DOM checks also passed. Dedicated match tests verify unchanged cricket truth. Full-career tests explicitly skip highlights; dedicated tests exercise their timing. A final mobile-disclosure CSS-only correction followed the regression start, with every script byte verified identical. Exact digest separation is recorded in the scope. Native rendered alignment/focus/scroll/performance remains unverified. Do not call the build visually perfected or smooth from source/VM evidence.

Build: `python v8/build.py --freeze --output game/global_champions_cricket_v8_refined.html`. No subagents, hosting/deployment, Actions, releases or external messages. Test snapshots and fixture saves remain generated scratch outputs, not source deliverables.

## Latest navigation adjustment

Tom requested logo-based home navigation instead of the “Title screen” button. The GCC mark is now a native keyboard-accessible button bound to the existing home/pause/save command. The separate HUD button is removed. Repeated home activation preserves the prior Continue destination. Current artifact: `game/global_champions_cricket_v8_logo_home.html`, SHA256 `8209cf0ef9668c6e73f17a47a063861d2b50f556dde4e0e3d9a9f7d8d181d496`. Targeted VM checks passed for the binding, pause and repeat-home/Continue behaviour. No native rendered review or new full-career claim.

## Save wording adjustment

Tom asked to avoid “new save” wording when none exists. Fresh Play is verified to enter the story directly without a prompt. The existing-career replacement prompt now says “Start again?” and its button “Start again”; no new-dynasty wording. Current artifact: `game/global_champions_cricket_v8_play.html`, SHA256 `b68ca333275e2dfdcf4d0ae16db74f4dd337b0c862422237e84cd7de8daaef81`. Targeted no-save/existing-career VM checks passed; no new rendered quality claim.

## Club and ground guides

Tom requested slightly richer club/ground descriptions aligned with the arcade visual standard, then changed the card action to “Select club”. All 20 eligible clubs now have a short in-world identity and practical selection read. Selecting one opens a focused guide with location/league, home-ground story and pace/spin/boundary labels from the existing model, plus takeover confirmation. Full stories stay out of fixed reveal cards to avoid crowding and asynchronous geometry changes. The selected-club footer can reopen the guide. Portrait guides stack and condition bands remain readable in source.

Current artifact: `game/global_champions_cricket_v8_club_guides.html`, SHA256 `7cdfb55e306f5c46fb2a404f72e004c6101cd2457afc01636abb3f8d451e8b28`. All 20 guides were checked read-only against the model ground stories; eight selection dialogs and takeover passed in VM, and their guide markup parsed without missing-data errors. These are not rendered visual checks. Native alignment remains unverified. No real-world historical honours or extra cricket rules were invented.

## Front-page arena bar

Tom reported the “Fifteen in the squad…” line only filling half its bar and requested no visible photo credit. The arena paragraph now explicitly uses 100% width and removes the inherited hero-prose 47ch maximum. Visible photo-credit links are removed; venue caption, alt text, intrinsic image dimensions and project asset credits remain. Current artifact: `game/global_champions_cricket_v8_front_page.html`, SHA256 `c51db3c629645436e4d68f298aa81711b46f568cd44e5fb6cfc91c12afe41883`. Scoped CSS/markup checks passed; no native rendered claim.

## Stadium caption alignment

Tom requested the caption centred under the photograph. The shared figcaption now centres its icon/text group and wrapped text. Current artifact: `game/global_champions_cricket_v8_caption.html`, SHA256 `4f4e51121c417188bf3fdb6c0d33138c9666d57e890f58e82f40fb3cbe53d311`. Scoped CSS check passed; native rendering remains unverified.

## Saudi breakaway story and compact prompts

Tom cancelled removal of the restart confirmation and confirmed that it was fine. Keep the existing Start again confirmation. He requested less empty space in prompts and restoration of the Saudi-backed breakaway story. The home/intro now explicitly describe the fictional Saudi-funded alternate-2008 league, eight clubs leaving domestic competitions and the five-day player commitment window. Short restart/release prompts use a narrower width; modal Close shares an existing final action row; dossier headers/cards remove screen-only height reservations; club-guide columns fit their content.

The centred photo caption, full-width arena strapline, logo navigation and club guides remain. Current artifact: `game/global_champions_cricket_v8_breakaway.html`, SHA256 `c436c0373c6e1af74f9fb8813212a6dc03da6aaa4ea4ae0ec9e3ba27a11d9ee5`. Targeted modal/story tests plus existing trade/restart and highlight/resume VM suites are the verification scope; no native rendered alignment claim.

## Franchise card presentation

Tom liked the detailed team guides but found the actual club squares basic. Cards now use a dark club-livery cover, crest, competition ticket and decorative club monogram, with readable club/location text and a stadium-icon ground panel below. Club colours stay in the livery/crest/borders; names retain fixed dark text. Select club remains a native control with a club-specific accessible name, pressed state and explicit selected text, plus card-level focus highlighting. Detailed guides and confirmation are unchanged.

Sealed league invitations reserve their own full intrinsic card layout, hidden/inert to assistive interaction, before opening. Equal minimum frames preserve the reveal arrangement while allowing enlarged text to grow instead of clipping behind a fixed height. Small-phone and reduced-motion rules remain. Source layout is not rendered evidence.

Current artifact: `game/global_champions_cricket_v8_club_cards.html`, SHA256 `c835d09d744d3d2dedfe5c04aff812b9400ca837c96b1f0584f8714239ac7dc7`. See `qa/v8_card_scope.json`: all twenty variants, eight guide/selection routes, a full 2008 foundation season, reveal/resume and parsed action checks passed in VM/source. Earlier highlight tests also passed with unchanged scripts. No native appearance, keyboard, geometry or smoothness certification. No deployment/Actions/release or subagents.

## Latest checkpoint: cricket feedback and tie-break polish

Tom authorised implementation of the brutal assessment findings. Current candidate is `game/global_champions_cricket_v8_cricket_polish.html`; read `docs/GCC_V8_CRICKET_POLISH.md` and `qa/v8_cricket_polish_scope.json` for its exact rules and verification. Fitness-adjusted matchup/XI reads, phase balls/rates with early-chase explanations, spectator finals controls, draft capability sorting/role/phase/workload reads, and batting/bowling season contributors/planning are implemented.

New tied games now use a simplified Super Over, with visible scores and delivery ledger. This is an intentional domain change injected from `v8/domain/super_over.js`, not a modification of the immutable reference. Existing tied results retain their original winner. New tie-break figures do not enter regulation scores, NRR or player season statistics. Subsequent RNG outcomes change after a new tied match.

Three full 2008–2026 VM careers and all eight foundation club paths passed on the exact artifact. No rendered geometry, native mouse/keyboard or smoothness certification exists. Preserve the current arcade club-card design and restart behaviour. No deployment, Actions or release was performed. Browser restrictions and the user-operated rendered-review path still apply.

## Latest checkpoint: final inclusive assessment

Current candidate is `game/global_champions_cricket_v8_final_pass.html`. Read `docs/GCC_V8_FINAL_PASS.md` and `qa/v8_final_pass_scope.json` for its exact digest, corrections and completed verification. The assessment found an unfinished XI swap surviving lodging, unavailable free agents being signed as injury cover, and forced departures beyond four being filled as ordinary rather than supplementary selections. Those are corrected. Stored statistics, self-fixtures and impossible Super Over sequences are also rejected.

The extended career helper now signs manual cover when natural injuries leave fewer than eleven fit players; this does not change manual selection in the product. Zero-through-six retirement boundaries explicitly check optional-cut budgets, supplementary ordering, refills, stale controls and resumes. Count only completed final-artifact runs in the scope, not interrupted assessment candidates. The permitted rendered review remains outstanding, and no visual or native interaction perfection is claimed.

Final artifact SHA-256: `f4aa6622f621ce14d16ffcd4725562d186522e633d49a8f05ca3a9932aac811f`. Two completed final-artifact careers (seeds 404/505, Chennai/Sydney Sixers) cover 38 seasons, 532 regular matches and the 2026 ending. All eight foundation paths and the dedicated 604-assertion retirement/cover/swap/stale-command boundary test passed. Exact cold checkpoints, tie-break and natural injury-cover counts are in `qa/v8_final_pass_scope.json`. No native rendered evidence exists.

## Latest checkpoint: whole-game overlap source assessment

Tom requested checking the entire game for overlapping elements. Current candidate: `game/global_champions_cricket_v8_layout_pass.html`, SHA-256 `4ec644d12140f17eba9331376f2eb256b0a763b91e96c9cc937adef7031f74ae`. Read `docs/GCC_V8_LAYOUT_PASS.md` and `qa/v8_layout_scope.json`.

The team-room grid now stacks at narrow widths; signing titles, club cover headers and order cards grow; sealed foundation/annual order slots use intrinsic content reservations. Shrinkable grid/flex children, text wrapping, HUD/search layout, stacked narrow score/stat/archive rows and explicit dialog scrolling address source-level overlap risks. Thirty-nine screen/dialog markup states, all twenty club identities, a two-season smoke and reveal/highlight checks passed. Only order-card markup in screens.js changed among scripts; domain/controller/scheduler/save scripts are byte-identical to the preceding final-pass candidate.

No screenshots or native rendering were produced or inspected. Actual overlap, focus, mobile/zoom layout and smoothness remain unverified. Intentional overlays must be distinguished from collisions in user-operated screenshots. Preserve the browser restrictions; do not claim the entire game is overlap-free.

## Latest checkpoint: cricket-fan functionality pass

Current candidate: `game/global_champions_cricket_v8_fan_pass.html`. Read `docs/GCC_V8_FAN_PASS.md` and `qa/v8_fan_scope.json` for exact digest and completed verification. Injury replacements now remain attached to the original injury, including CPU cover changes and recovery from older saved nested chains. Club season figures derive from actual own-club scorecards, retaining departed/temporary contributions and excluding incoming players’ rival-club figures. Selection blockers have a clear primary matchday action; supplementary picks and active season tabs are explicit; modal errors appear inside the dialog.

Manual selection, arcade design, stadium/icons and the established cricket depth remain. Highlights are still presentations of precomputed matches, not live tactical simulation. No native rendered or smoothness certification; browser restrictions remain. No deployment, Actions, release, external messages or subagents.

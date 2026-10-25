## Current checkpoint · aligned analysis and team-selection polish · 25 October 2026

Candidate SHA256 `2010a5e1868a13138644d2d33d922ceba839889888e391ea78cbd048f122a661`. Three equal desktop analysis columns/tiles. Draft pool and picked list show batting jobs. Removed numbered XI role guide at user request: strategy remains contextual to squad/ground. Team page has unclipped title, framed bench/order, rating badges and actual home-ground context. Compact final-XI popup from version64 retained. QA: qa/selection-polish-20261025 (27 cases each Chromium/Firefox/WebKit). No rating/model/save changes. Prior notes below historical.

## Current checkpoint · compact final-XI prompt · 25 October 2026

Only draftComplete CSS changed: 32rem maximum, content-sized header/body, no tall header gap, responsive wrapping actions and 44px controls. QA: qa/compact-xi-prompt-20261025. Candidate SHA256 8e9ee1612466304c087776bcf97c22c3db581dec0aff870bba9759e9b5e7720d. Prior notes below historical.

## Current checkpoint · analysis tiles and selected-XI coverage · 25 October 2026

Current candidate SHA256: `22960c8b1ac875d7e905177072fd7319cbf5d2bd1093e453af682a2bb2d625b7`.
Source: roles.js, screens.js, components.js, workspace.css. QA: qa/analysis-coverage-20261025. Analysis is now compact grouped tiles. XI role counts use fitness-adjusted players: keeper, opening batters, bowling options, new-ball options, death options. Guide targets, no added penalties. User rejected bowling cover: removed that metric and overs capacity from selection UI. Suggestions remain removed. Prior notes below historical.

# Current release: simplified squad analysis — 25 October 2026

Stable playable v62, file_000000006ccc81fa923562d5aaaf6c98, existing Library identity libfile_ebabb63004ac81919b41b246675c703d. HTML SHA256 8ba0fc8ba43e944efdf8de025f251aa59be073d21ff67ca590cd4c59f013301d; Git blob 6e2b7ff597fb17eccd964c007a4c58ae429eb3c5.

User explicitly removed ALL draft pick suggestions/guidance and visible rating denominators. Draft keeps boxed rating, balance and open selected roster. Squad/XI analysis now centres source label, overall box and completeness status, with twelve static label-number rows under plain Batting, Bowling and Team balance headings. No expandable details, role lists, phase breakdowns, strength bars or verbose explanations. All values still use existing profile fields. Model, simulation, RNG and saves unchanged.

Authoritative changes: v8/ui/roles.js and workspace.css. qa/simple-analysis-20261025/build.py rebuilds from versioned39ec baseline and module copies; only script13 plusCSS changes. Fresh54 browser cases (18each Chromium,Firefox,WebKit) verify empty/partial squads, all12values, centring, desktop/mobile/enlarged text, no suggestions/details/denominators and read-only state. Screenshots inspected internally, not uploaded. Independent review found no blockers. Prior v61 suggestion/target tests describe a feature intentionally removed; run against that versioned candidate rather than treating them as requirements for current UI.

Everything below is historical where superseded.

---

# Current release: open draft companion — 25 October 2026

Stable playable version61, file_00000000b284820bb546fa903c8697d9, sameLibrary identity libfile_ebabb63004ac81919b41b246675c703d. HTML SHA25639ec4a2e9fafcfc15e4ac11f9fbc59bbc9756cde40b22f3d28873071a15ee2df; Gitblob149afa09a489cc1822738462647ae0760f954e78. Both canonical HTML aliases match.

Draft sidebar now has a boxed projectedXI rating, provisional label before11players, balance verdict and compact coverage, next-needed role plus two legal available scouting suggestions, and everypicked player always visible in compact two-column rows. Detailed analysis/history are optional secondary dialogs. Removed duplicated latest-signing and roster accordion; mobilepanel precedes playerpool. No nested panel scroll. Full foundation draft still automatically enters teamroom. Existing two-ability playercards retained.

Guidance uses currentpublic ratings/rolebands and existingguard/freeagent rules, not hiddencareer truth. No new numerical draftgrade. UI-only changes: v8/ui/roles.js, screens.js, workspace.css. Engine/RNG/ratings/save code unchanged. Builder qa/draft-companion-20261025/build.py replaces script13,17andCSS from versioned756baseline/modulecopies.

Fresh finalhash evidence:64browser stage/viewport/text cases (Chromium48,Firefox8,WebKit8);30logic+actual saved-career annualdraft checks. Suggestions legal, matchingneed andcurrentavailability; advisory read-only; empty/partial/full andnormal completion covered. Desktop/mobile screenshots inspected internally andnot uploaded. Independent review no blockers. See qa/draft-companion-20261025. Earlier test reports below retain their original hashes and are historical, not newly rerun by this UI patch.

---

# CURRENT draft-card release — two headline abilities,25October2026

PlayableLibraryversion60, filefile_000000006d2481fabcb3258eeb85276e; SHA2567568403962160d660198867d75f6de487512817de0a339220264e7cf783eae45, Gitblob8f98f4dca5b2f70401fb03a572dc78af6343a958. All roles use TWO headline abilities:BAT Batting/Fielding;BOWL Bowling/Fielding;AR Batting/Bowling;WK-BAT Batting/Keeping. Equal columns and central divider remain at narrow widths. User rejected rushed keeperPower placeholder; that v59 file is superseded and was never pushed toGit. Overall, best phase, scouting details, simulation and saves unchanged.

Authoritative sources: v8/ui/components.js andv8/ui/workspace.css. Builder qa/card-clarity-20261025/build.py uses immutable728baseline qa/calibration-20261024/candidate.html, replacing only components script11 andworkspace stylesheet. Fresh36 actual Chromium role×viewport×text cases at1280/390/320px and16/24/32px root text; all8sort phasealignment/contrast checks passed. Desktop/mobile screenshots visually inspected internally, NOT uploaded. Independentreview no blockers. Earlier broad regression evidence below retains its original tested hash; do not claim it freshly reran for this presentation-only patch.

Everything below is historical where superseded.

---

# Latest UI patch — wicketkeeper draft cards,25October2026

Current playableLibraryversion59; HTML SHA25669fae33c5fde2c984acd110eb3e72fb964f5b30a25d36429e492ec5301844060, Gitblobf4ab2a64469c1a5d1635bce445513308185907ee. WK-BAT draft cards now show Batting,Power,Keeping. Underlying fielding data,overall formula,match simulation andsave format unchanged. Sourcechange is one cardStats branch in v8/ui/components.js, embedded byte-for-byte in both canonical HTML files. Tested12keeper cards at1280/390/320px andall8draftsort phasealignment/contrast checks. See qa/keeper-card-20261025. Earlier broad verification below belongs to its original728build; do not relabel that evidence as freshly rerun for69faUIpatch. Execution briefly disconnected before mutation, then recovered andbrowserchecks completed. The calibration builder produces728baseline; to reproduce latestUIpatch additionally replace its embedded components module with current v8/ui/components.js.

---

# CURRENT RELEASE — 25 October 2026

Read `docs/GCC_V8_CALIBRATION_RELEASE_20261025.md` and `qa/calibration-20261024/release-verification.json` first. All outside-session commits through05cbc0b are preserved; continuation reconciliation committed5f95258 on top. Current branch remains `work/v8-game-first-rebuild` (query its latest head before writing; never use old head leases).

Released HTML SHA256 **728f4afac83aa6290a5c9241d2f0ee8885b6b363f1af6dd78736986a12ee9fc4**, Git blob **d18cda795beee7eb63e3065d5c087840801a3c03**. Canonical two game paths and stable playable are byte-identical. Library playable **libfile_ebabb63004ac81919b41b246675c703d version58**, filefile_00000000832481f6bab4a6ec2eb6bdd8.

Changes:412 verified distinct identity metadata records;410 undisputed full DOBs;74 birth-year corrections for NEW careers only, AFTER stored templates. Same absolute alternate-history career windows and numeric skill futures. Existing saves retain saved DOB/ages and full state. Corrected new ages intentionally change age-sensitive scouting/recruitment, outlook, trade and injury behaviour. Do not assert identical new-world outcomes. Country/role/style rules unchanged. Umar Gul and Angkrish Raghuvanshi are source-conflicted; retain original years and no invented full date. Twelve ESPN API errors were resolved using official board/league/club fallback review; distinguish manual profile matching from exact ESPN response-ID matching.

Live status now exposes cumulative score, overs and same visible chase/terminal context, atomic region. Accepted visible palette/layout unchanged. Only script blocks2and15 changed from3ddbaseline; authoritative modules/candidate builder in release report.

Fresh final-hash evidence:18,099 compatibility,2,478 biography,600 CPU draft/eight club positions,845 persistence/fairness,162 browser cases/all three engines;292 recorded match frames plusfour named landmarks andsix synthetic terminal/Super Over render cases. Final8802 three-season career:2,804checks/42managed league matches, zero runtime/quota errors. Pre-fallbackd647 full19season8801:15,284checks/266managed league matches,43reload checkpoints,30injury selections,four actual Super Overs; its original hash is retained, NOT silently attributed to728final. Independent review acceptable/no blocking issue after scope resolution.

Frozen statistical evaluation completed and reproduced with unchanged preregistered inputs. BOTH promotion gates FAIL. No empirical rerating. Priors are not certified just because challenger failed. Do not retune on observed2023–2026 tests. Immutable preregistration heldOutMetricsObserved=false describes registration time; heldout-report is actual result. Recovery scripts now use pinned3973116baseline, not current released HTML.

Durable recovery: exact DB+14source archives **libfile_44cbb9e6ef248191925722dc20472cc2 version0**, ZIP SHAe45153104241086da60901125adebba8c0705a2006d7688d833aaf7e60193097. New synthetic QA saves/observations **libfile_303e62aac70c8191bc008a0eae1abb0e version0**, ZIP SHA54522142a685e48176fed918d854f2f8d2765a859fb2e415a620f8ebfd6d77f1.

OPEN, cannot fabricate: actual novice/returning-player playtests, physical phone behaviour and regular screen-reader-user speech pacing. Recorder/session kit is ready, no actual human/device sessions observed. Some precise technique/mental/leadership/keeping/fielding numbers remain unidentifiable model priors. Extreme320px+400%root-text overflow remains separately documented; ordinary reflow cases pass. Do not say all six priorities fully proven or every rating perfected.

Everything below is historical and superseded where inconsistent.

---

# Active continuation — 25 October 2026

Read `docs/GCC_V8_CONTINUATION_RECONCILIATION_20261025.md` first. Outside-session commits through05cbc0b preserved. Exact frozen database recovered from this original environment and preregistered evaluation re-executed with unchanged hashes: BOTH promotion gates FALSE. `heldout-report.json` now contains actual results; older unopened/blocked statements below are historical. No empirical bulk rerating. Recovery archive now durable: Library libfile_44cbb9e6ef248191925722dc20472cc2 version0. Candidate1d9b284 remains staged, canonical3dd348d unchanged pending release verification. Biography audit and browser review continue. Do not overwrite outside work or repeat model tuning against observed test years.

---

# Precision continuation checkpoint — 24 October 2026, current session

Authoritative playable is still v57 / SHA-256 `3dd348dd956017563dc006d64a2364a15a0b2d7a3d97bb9d92e3fae3399fcbdf`. No production playable or player rating was changed.

Numerical calibration remains scientifically unopened. Exact frozen dataset SHA is `60d38fb30ff38f72a7d344437ed881b2ba93731a739dd35fdd556a82386c3ce9`; 412/412 identities remain verified; preregistered 2023–2026 holdout has not been observed. Recovery surfaces checked in this session: native Library, conversation files, mounted Drive from prior checkpoint, Git history, current Cricsheet URLs, public release mirrors and local outbound transport. No exact ten-archive bundle or SQLite was recovered. Do not substitute a mirror/current dataset unless the rebuilt SQLite hashes exactly to the frozen SHA.

Two fail-closed numerical launchers now exist:
- `qa/calibration-20261024/run_exact_holdout.sh`: recover/verify all 14 frozen archives, rebuild and verify the exact SQLite, reproduce the v57 numeric baseline, then open the frozen holdout.
- `qa/calibration-20261024/run_exact_holdout_from_db.sh`: accept a recovered `deliveries.sqlite` only if SHA-256 is exactly `60d38fb...`, SQLite integrity/schema and 9,422-match count pass, then reproduce the v57 numeric baseline and open the same frozen holdout.
Neither launcher promotes production automatically.

Accessibility work is isolated on branch `work/v8-a11y-live-score-candidate`, based on the protected checkpoint. Source patch commit `da03259d600d61875986b199651b1354f679fddd` changes only `v8/ui/match_story.js` to add cumulative score/overs/chase context to the existing live status region and `aria-atomic=true`. Fresh actual Chromium execution against the exact v57 and retained foundation save reproduced the omission in the original and passed ordinary-ball, wicket, chase and innings-end assertions in the isolated candidate. Evidence commits: `99bd8166f25c4b19a2dc5c5f2b8e8d9e47da83bd` (semantic live-region evidence) and `feb7d37aba967dcf32533ffe823958d4ae8f9ae3` (four-state pixel comparison). The four tested `.g8ballarena` screenshots were pixel-identical original vs candidate. Canonical v57 remains untouched; do not merge/promote until an authoritative source rebuild and affected exact-build regression are available. Human screen-reader timing/comprehension remains an external gate.

---

# Exact-holdout continuation package — latest checkpoint

Branch head now includes `qa/calibration-20261024/run_exact_holdout.sh` and `EXACT_HOLDOUT_UNLOCK.md`. In an environment with outbound Cricsheet access, run the launcher from repository root. It verifies model, identity, all fourteen archive hashes, exact dataset hash, v57 hash and numeric baseline before it is permitted to open 2023–2026. It never promotes production automatically.

Persistent recovery surfaces were exhausted: native Library and mounted Google Drive were both checked and contain no expanded ten-archive calibration bundle or `deliveries.sqlite`. GitHub Actions failed before runner allocation on both `ubuntu-24.04` and `ubuntu-latest`. The current container cannot resolve GitHub/Cricsheet directly and no connector-to-container binary bridge is exposed. Therefore do not reinterpret the infrastructure block as a model failure, and do not substitute reduced/stale data.

Authoritative playable remains v57 / SHA-256 `3dd348dd956017563dc006d64a2364a15a0b2d7a3d97bb9d92e3fae3399fcbdf` with no production changes.

---

# Precision recovery checkpoint — later 24 October

Read `docs/GCC_V8_PRE_HOLDOUT_INDEPENDENT_REVIEW_20261024.md` with the final completion checkpoint. The accepted playable is still untouched. GitHub Actions also fails before runner allocation on `ubuntu-latest` (run `40093517831`), Library contains no hidden expanded dataset, and no substitute data has been accepted. The 2023–2026 holdout remains unopened. A separate model review found no future leakage and documented conservative cold-start/year-context limitations that must not be tuned away.

---

# Final completion checkpoint — 24 October, later session

Read `docs/GCC_V8_FINAL_COMPLETION_CHECKPOINT_20261024.md` before doing any more finishing work. Stable v57 / SHA `3dd348dd956017563dc006d64a2364a15a0b2d7a3d97bb9d92e3fae3399fcbdf` remains authoritative and was re-materialised from Library byte-identically. No rating or production-UI change was promoted.

A hash-gated preregistered calibration workflow was added at `3508d981f24a8160348ba30c7accf1a36c3a306e`; Actions run `40092717453` failed twice before any step received a runner (runner_id 0), so no held-out metric was opened. The retained Cricsheet Library snapshot contains the original four archives only; the later ten frozen expansion archives are not retained in Git/Library and current binary retrieval cannot restore them. Do not substitute stale/reduced data: promotion remains NO CHANGE until the exact 14-source dataset or hash-identical SQLite dataset can be executed.

The tested live-score accessibility patch remains isolated and must not be hand-edited into v57. Apply through `v8/ui/match_story.js` only when an exact rebuild and affected regressions are available. Human/device gates remain genuinely external.

---

# Active24October calibration work — read first

User asked to complete remaining areas. Published playable remains3973116/SHA3dd348dd, stableversion57; no new ratings promoted yet. Main work now lives in docs/superpowers/plans/2026-10-24-calibration-completion.md and qa/calibration-20261024/progress.md. All412 identities verified, zero unresolved; five earlier mappings corrected. Fourteen official source archives,9,422 clean eligible matches; two source roster-ID collisions quarantined rather than repaired by guessing. Independent raw/SQLite reconciliation passes. DatasetSHA60d38fb30ff38f72a7d344437ed881b2ba93731a739dd35fdd556a82386c3ce9. No held-out metrics observed before preregistration checkpoint.

Next execute model.py with OPENBLAS_NUM_THREADS=1 OMP_NUM_THREADS=1, verify hash against preregistration.json. Validation2020–22 selects fixed regularisation; walk-forward forecasts2023–26 and a separate locked2022 whole-block test govern promotion. Do not tune on results. If family gates fail, do not ship unsupported reratings. Existing mental/keeping/technique attributes are not magically measured by delivery archives.

qa/accessibility-20261024 contains actual Chromium checks, anonymous local participant recorder, direct-normal-build session kit and proposed live-score source patch. Production patch not applied. Recorder is offline/fallback artwork and must not be labelled normal full visual testing. No actual humans or physical devices were observed; these remain genuine external gates. Current Chromium restored by decompressing bundled chromium.br to /tmp/accessibility-chromium, with LD_LIBRARY_PATH=browser-runtime. No .git directory; use connector expected-head leases. User alreadyauthorised repository actions and execution without repeated permission.

---

# GCC current handoff — verified finishing build

## Authoritative state

Repository: `cpuhater1234/global-champions-cricket`; work branch: `work/v8-game-first-rebuild`. The latest finishing commit promotes both canonical playables to SHA-256 `3dd348dd956017563dc006d64a2364a15a0b2d7a3d97bb9d92e3fae3399fcbdf`, Git blob `f5059bb1890951b9816c8cdf57670d6b21e0d0f2`, 1,922,930 bytes:

- `game/gcc_v8_product_candidate.html`
- `game/gcc_v8_quiet_arcade.html`

The source baseline is commit `2b604dc15ebf1242730728d12123c896cb23aab0`, accepted SHA-256 `5088df01d3355c7a71a090e951bfe42f1e2976c0879ace591414205ad315d2b9`. It remains at `qa/finish-pass/baseline.html`. In-progress checkpoint commit `211391a34a7e0f9ec316f980d2fdcdbb2d7c503e` preceded promotion; do not treat that checkpoint's pending status as current.

Delivered HTML: `GCC_v8_Career_Clarity.html`, stable Library item `libfile_ebabb63004ac81919b41b246675c703d`, **version 57**, file `file_00000000f83481f585198c5910a42ded`. Future replacements must preserve this identity and use the actual retained version guard. Local deliverable: `/workspace/scratch/bed56f4334a5/deliver/GCC_v8_Career_Clarity.html`. All three final local files were byte-compared. No Site deployment is involved.

## What changed

Only three production modules changed: `v8/domain/career_outcomes.js`, `career_state.js`, `scouting.js`. The exact-build adapter replaces their embedded modules and the build marker; established data, UI and match engine remain intact.

New careers use `overallMethod=skill-overall-v1`: rounded role-based ability, with AR overall at least equal to an identical BAT or BOWL specialist (maximum of those three role composites). The first proposed direct AR composite penalised Maxwell despite strong batting; that test candidate was rejected before promotion. New expected baselines and realised years share the helper. This is strongest specialist-equivalent AR ability, not complete utility or historical certification.

Global `GCC_RATINGS.roleFit` is frozen. Existing absent/null legacy delta arithmetic and preceding `role-fit-v1` records retain their own evaluators and stored anchors/futures. Unknown metadata is atomically rejected. An actual preceding private saved career was cold-compared as well as the older public schemas.

Scouting confidence now follows numerical evidence metadata. Identity/biography URLs cannot confer numeric confidence; provisional profiles remain LOW. Future realised outcomes remain private and do not consume recruitment/cricket RNG during scouting.

## Completed evidence — do not repeat without a relevant change

See `qa/finish-pass/verification.json`, `regression-triage.json`, and `docs/GCC_V8_FINISH_ASSESSMENT_20261024.md`.

- 75 VM suites green after explicit rechecks. The initial runner exited 1 because it retained 180-second timeouts and a fixture-dependent wording failure. Final compiler merges only actual successful reruns; no failure was silently converted.
- 54 newly exercised full-flow seasons and 756 managed league matches: fresh HAM career seed 8602 through 2008–2026, plus 18/17 newly played years from completed 2008/2009 saves. Earlier loaded history is excluded.
- Fresh career:15,868 checks,49 cold restores,32 injury-selection recoveries,3 natural Super Overs, max save 2,671,886 UTF-16 bytes under 4 MiB; no unexpected errors/quota failure.
- 72 older checkpoints across 4 worlds;30,168 baseline/current restore comparisons.836 additional actual private role-fit-v1 save comparisons;11,129 frozen-evaluator comparisons.
- 5,165 rating checks,10,001 AR/skill monotonicity checks,845 persistence/privacy checks and 10,000 distribution draws. Distribution draws are not complete careers.
- Eight real foundation drafts/64 squads;600 CPU checks.141 chaotic-choice checks.647 annual-draft stress checks and 665 retirement/cut boundary checks.
- Chromium/Firefox/WebKit:162 actual-engine viewport/text-size cases, including draft/scout, team analysis, focus, interrupted playback and result. Images blocked for repeatability. Not physical hardware or screen-reader-user evidence.
- 20,000 controlled innings. Keeping and new-ball intervals cross zero; do not claim their effects were established. Batting/bowling interventions change families, not individual attributes.
- Eight paired strategy worlds,32 controlled cohorts,8,512 managed matches. Win rates: balanced-current 50.00%, youth 45.86%, overall-only 52.82%, AR-heavy 52.77%. All paired world-level contrast intervals cross zero. These cohorts simplify annual administration and omit optional trades/releases/injuries/form updates; they are not 32 full UI careers or proof of universal balance.

Long-suite output directories begin `qa/finish-pass/final-v8_`; fresh career is `career-final-8602`. The earlier 8032645 candidate has separately labelled evidence. Do not aggregate it into exact-final totals. Full source/runner commands and fixture requirements are in `qa/finish-pass/REPRODUCING.md`. The current VM runner allows 3600 seconds per suite, configurable by GCC8_SUITE_TIMEOUT.

## Remaining work — all six finished-product gates are not closed

The numerical work established consistency, provenance and a diagnostic, not historical perfection. 7,102 genuine Cricsheet IPL/BBL/Blast/T20I records were downloaded.339 of 412 names mapped,325 have delivery evidence,73 identities remain unresolved;143 arrival profiles remain provisional. Pooled expected bowling phase rank associations are weak (opening .035, middle .182, death .072). Repeated overlapping windows are correlated; these are not held-out significance tests. Historical 6/9/5 phases differ from GCC 4-over opening plus 2-over surge.

Next internal priority: resolve identities and T20 role classifications, especially low-batting bowling-family AR labels; reproduce attribute-level rating generation with measured/proxy/estimated provenance and sparse-sample rules; validate on held-out periods/competitions. Do not convert raw phase proxies or a biography into invented precision for keeping, fielding, technique, leadership or temperament. Do not automatically rewrite existing saved futures.

Human/physical gates remain: uncoached novices, returning-player enjoyment/attachment, physical iPhone/Android and regular screen-reader users. `PLAYTEST_PROTOCOL.md` is a protocol, not evidence of actual participants. These cannot be marked passed by automated buttons or emulated viewports.

## Reproducibility data saved

- `GCC_Cricsheet_Source_Snapshot_20261024.zip`: Library `libfile_82fe227b1c8c819189e6125c6cbf6df3`, file `file_00000000b27881f5be7e0eb6966f1741`. Four original archives, player register and URL/hash manifest; original archive licences retained. Upstream downloads can change.
- `GCC_QA_Save_Fixtures_20261024.tar.xz`: Library `libfile_de250924348c8191b09edb448dec8d3f`, file `file_00000000989481f5973e0da9c6fd1278`.80 genuine synthetic saves/metadata, no product code; extract at repository root. Archive SHA-256 `7fc52b95252b8bdfdbc6f5672ebff9368888e30a69f454f36fc364574bb05835`.

`source-snapshot-manifest.json`, `save-fixture-manifest.json` and `delivery-receipt.json` preserve identities/hashes. Raw archives, huge source aggregates, saves and browser screenshots are intentionally outside Git. Scripts, compact evidence, per-player ledger and manifests are in Git. Do not save browser screenshots to Library.

## User constraints to preserve

2008–2026 alternate-history global T20; eight drawn clubs, fifteen-player squads, foundation snake, annual arrivals/retirements, fourteen league games plus finals. Manual XI only. No salary cap. Preserve the accepted solid charcoal/neutral presentation, cream headings, muted green controls, actual club colours, neutral discipline text, red/yellow/green ability scales and stadium photography/random home venue.

Natural retirements are uncapped. Shared four-departure allowance limits further voluntary exits: three retirements allow one cut; four or more allow none. Maximum two cuts and two completed trades per club/season. Maximum two players and two owned R1/R2 picks per side in a deal. Trade window closes after completed round 3. Supplementary picks cover additional vacancies in snake order; transferred rights freeze at draw; existing exposed orders remain stable. Preserve accepted temporary-cover trade capacity, atomic malformed-draft-save rejection and stale CPU-XI traded-player recovery.

## Environment continuity

Scratch repo is a partial checkout without `.git`; use the GitHub connector and expected-head lease for writes. Fetch current branch head before advancing it. Browser runtimes persist under `/workspace/scratch/bed56f4334a5/browser-runtime/playwright`; recreate `/root/.cache/ms-playwright` and `/tmp/gcc-chromium` symlinks if a runtime reset removed them. Local WebKit libraries link inside minibrowser sys/lib. The managed browser harness uses PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1 and MOZ_DISABLE_CONTENT_SANDBOX=1; these are test-environment settings, not product instructions.

No long final-verification job remains pending. Do not restart the broad finishing audit from old chat history. Start from the open numerical/human gates above, or the user's new concrete direction.


## Current-session precision addendum

Main work branch source isolation is restored at commit `30c483d33732f76ec05a699f89f11f7f10df9b55`: `v8/ui/match_story.js` is back to its protected unpatched blob, and canonical v57 remains Git blob `f5059bb1890951b9816c8cdf57670d6b21e0d0f2` / SHA-256 `3dd348dd956017563dc006d64a2364a15a0b2d7a3d97bb9d92e3fae3399fcbdf`.

Accessibility candidate branch `work/v8-a11y-live-score-candidate` now has an additional full-playback regression at commit `ee7caf81a869f1d3196b4c3d2361e4aec3568e14`. Actual Chromium rendered all 292 delivery frames from the retained foundation fixture with deterministic time/RNG. Original and candidate had identical delivery-frame data, identical pre/post game state, no render-time state mutation, and identical visible per-frame score/overs/phase/commentary/trail/fixture/control output. This supplements the existing four-state pixel-identical and accessibility-tree evidence. Canonical v57 is still not promoted; human screen-reader timing/comprehension remains external.

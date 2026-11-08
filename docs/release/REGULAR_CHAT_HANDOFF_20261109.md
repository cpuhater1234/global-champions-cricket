# GCC continuation handoff for regular ChatGPT chat

Prepared 9 November 2026, Australia/Sydney. This handoff records the state after v112. Verify the current branch head before edits.

## 1. Task and working relationship
Tom wants Global Champions Cricket to feel like one sleek, modern cricket management game throughout. Continue the approved visual craft roadmap while preserving gameplay and existing improvements. He is frustrated by version drift, competing styles, repeated confirmations, false completion claims and maximum-length failures. Work autonomously within the existing scope, communicate plainly, and do not restart the design discussion. No em dashes in user-facing deliverables.

The next chat will NOT be Work Mode. Inspect actual available capabilities before promising edits, browser control, tests or GitHub writes. A regular chat Browser connection may only read tabs. Never pretend a DOM read is a click, screenshot, playtest or live verification. If interactive work is unavailable, perform supported source analysis and identify the concrete capability needed for execution. Do not assume this workspace, browser handles, saved tool variables or local files carry into a new chat.

## 2. Canonical source and exact current build
Repository: cpuhater1234/global-champions-cricket
Maintained branch: work/v8-integrity-charcoal-candidate
Verified head at handoff preparation: f2c282204af4b9243c84d7535f25b95730522ba1 (v112 source).
A later documentation-only commit may add this handoff.

Read these repository files on the maintained branch:
- docs/release/CURRENT_CHECKPOINT.md (newest entries first)
- docs/visual/STYLE_OWNERSHIP.md
- docs/release/REGULAR_CHAT_HANDOFF_20261109.md (this file)

Do not use the historical work/v8-game-first-rebuild branch or v7/early-v8 handoffs as the current source. The large game/gcc_v8_product_candidate.html is historical build input, NOT the latest download.

Latest candidate: GCC_v112.html
SHA256: e7e2c5fc4013cfd43f556145b0b35243130268a7329cb9dfba7011d2f727b2d3
Size: 6,589,191 bytes
Library ID: libfile_3eac8af43b20819187967241a79457c3
Library link: https://chatgpt.com/library?file_id=libfile_3eac8af43b20819187967241a79457c3&account_id=d8576568-bce6-4c2f-af1f-9a9f85a7bae7

v112 was delivered. Tom has NOT yet confirmed downloading or opening it. Latest browser-tested build is v111. Do not confuse candidate source checks with native acceptance.
Download workflow: deliver one HTML; Tom says downloaded; provide http://127.0.0.1:8000/GCC_v112.html; he opens it; then inspect that exact build when interactive tools exist. Do not require a new download for unchanged code.

## 3. Visual law and roadmap
Home and League Intro are the approved reference. Preserve centred Home identity, one format line, full-width career CTA with metadata, stadium split, vertical numbered intro sequence, grouped primary/Back actions and secondary metadata.

Keep floodlit night atmosphere, club identity, approved icons, readable strong typography and modern rectangular controls. Avoid generic equal three-box compositions, floating labels/actions, tiny thin type, arbitrary tile heights, unexplained gaps, green/grey hover overlays and unreadable bright text.
Navy stays the night canvas. Address flatness using restrained club accents and clear raised-primary/inset-secondary surfaces. No full-game recolour, new base theme or global hierarchy spray.
One screen/surface family per pass. Inspect real DOM, find the winning CSS declaration and edit its existing owner. Remove obsolete declarations in the touched scope. Never append another global style layer as the default fix.
The PDF's instruction to add a new removable style block every pass was explicitly qualified: use reversible tracked owner edits instead, because accumulating blocks conflicts with Tom's priority to avoid competing layers.
Home must regress cleanly after changes. Do not change colour, type and structure across the game at once.

Design references:
- GCC_Full_Visual_Vision_Roadmap.pdf: libfile_662e01e8b930819186662dc43f282bf9
- GCC_BULLETPROOF_HANDOFF.pdf: libfile_3e027bbb0d988191b0827c1e2c2883e7
Use PDFs for design intent. Some style-stack/version details are stale; actual source/checkpoints establish history.
Roadmap sequence: club identity/altitude, reveal, draft decision hierarchy, signing, Manage squad, season hub, live/result, side-by-side continuity audit, meaningful-motion audit, promotion only after acceptance.
Draft: pool and current pick primary; needs/latest picks secondary; advice tertiary. Calm scanning matters more than adding decoration.
Out of scope for this stream: simulation overhaul, named save slots, broad engine features, audio. No backup/import/load-file UI added to start.

## 4. Recent releases and preservation requirements
v100: removed completed-match Replay button/binding. Initial live Watch match and Scorebook remain. Do not restore Replay.
v101: shared main/dialog button geometry and readable typography; chooser/guide spacing and equal rows.
v102: full-width Manage list, two columns >=1100px and one below; matched hub panels; intro CTA; centred 960px toss; bounded desktop draft sidebar with measured header clearance (ResizeObserver/fallback). XI bench intentionally not sticky.
v103: standard sports record 1-1; ordinal league position 4th; meaningful season context (Early days, In the hunt, On the edge, Finals clinched, Eliminated etc.). Recent form aligned. Qualification math tested against600 exhaustive fixture sets including NRR uncertainty.
v104: consistent league wrap/review/archive records; semi-finalists distinguished from runners-up; duplicate knockout headline removed.
v105: phone archive table headings compact with full accessible names; career totals three equal columns.
v106: season-to-season comparison anchored once inside existing review summary.
v107: trade impact rows aligned, adjacent modal footer actions stretch equally when text wraps.
v108: retains107, removes44 redundant/obsolete declarations across14 scoped source sections, no new style block. All20 scripts unchanged. Ownership contract documented.
v109: primary squad-update annualhero gets16% club-tinted raised gradient/signal edge; supporting annualdevelopment/departureguide inset. No layout/type changes. This is a narrow scope, not a full-game contrast pass.
v110: intro save-arrival guard becomes recoverable choice: Open saved career or Start again. Keeps old save protection; no reset until confirmation. Story saves suppressed. Fresh command works from recovery dialog in story.
v111: follow-up save boundary: suppress controller save while new-career intent remains pending, including Back/Home/page lifecycle; Continue clears abandoned intent. Prevents old career presentation being rewritten as intro.
v112: current candidate, CSS-only draft-order contrast fix described below.

## 5. v112 defect, fix and evidence
During actual390px v111 play, Brisbane Heat's name was almost invisible on navy draft-order card. Computed text rgb(16,43,52) came from --order-ink originally selected for the turquoise club fill. Floodlit later changed card background to navy gradient rgb(19,40,64) -> rgb(12,26,40), but the text retained dark club ink.
Owning rules: v8/ui/workspace.css around1322/1323:
- .g8ordergrid .g8club.g8ordercard
- grouped descendant rank / .g8orderidentity h3 / .g8orderstatus
Changed their color values from var(--order-ink) to var(--gcc-text,#eef5fa). Badge still uses its own club fill and contrast ink.
Two existing rules changed. No new stylesheet, global colour change, layout change or game logic.
Regression test failed before at approximately1.00849:1 against raised navy; passes after >=4.5:1 across light/dark club-ink cases.
All20 scripts byte-identical and syntax checked. Non-style markup and assets identical, same stylesheet IDs. Native v112 visual acceptance PENDING.

Evidence:
qa/order-contrast-20261108/test.py
qa/order-contrast-20261108/changes.json
qa/order-contrast-20261108/build.py
qa/order-contrast-20261108/verification.json
qa/order-contrast-20261108/native-v111.md

Next native acceptance must actually return to a draft-order draw containing a dark-ink club (e.g. Brisbane Heat), not merely view an already-entered draft board. Test desktop and390px; verify name/rank/status readable and badge colours unchanged. Existing QA is already past the order screen, so do not assume it can be revisited without normal game navigation/new disposable career.

## 6. Browser/save state and accepted native checks
Last audited tab: http://localhost:8000/GCC_v111.html
Latest known test career: Kolkata Knight Riders2008 foundation draft. Picked Nathan Bracken at Round1Pick5. Squad1/15; Pace1. Last left squad dialog open, pausing CPU flow. Viewport reset after audit. Browser tab IDs/handles may change.
localhost is disposable QA. 127.0.0.1 is separate storage with Tom's main Lucknow Super Giants2010 Round3 career: 2played,1-1,4th,NRR0.53. Do not accidentally replace main career while testing cold starts.

Native v111:
- Existing Sydney Thunder test draft Round5Pick33,142 available,four selected survived intro -> Back -> reload -> Continue.
- Confirmed new career -> Reveal opened eight sealed slots and live controls; completed8/8 with Choose your club usable; feedback empty, no captured errors.
- Current new KKR run: chooser eight equal356x183.875px cards at390px; page scroll380, no sideways overflow.
- Signing primary320.8x44px; secondaries156.4x44px sharing a row. Skip closed160 committed/110 declined.
- Phone draw Pause/Speed155.6x44px; Reveal all320.8x44px below, no overflow.
- Draft phone readable, Pick44px. Bracken pick correctly updated squad and roles.
- Squad dialog client365=scroll365; name/rating/role counts readable.
Earlier v110: MENU opened Home and in-season; main career resumed unchanged. Three draft picks advanced correctly in disposable Sydney career.
Earlier native full2008/2009 QA seasons completed. NOT19-season certification.

Raw hidden legacy DOM counts were misleading in external review: engineHost was hidden=true, aria-hidden=true, computed display:none. Its engine buttons/nav are not evidence of exposed focus targets. Actual career nav excludes intro/reveal. Recheck real focusability if new evidence warrants.

## 7. Outstanding tests and honest boundaries
Still open:
1. Native v112 order contrast desktop/phone.
2. Ten truly cleared-storage browser cold starts.
3. True two-tab save-arrival during intro: open saved career / confirm restart / cancel recovery, without erasing usable controls.
4. Native v108 trade impact rows and equal phone footer actions (carried into112).
5. Native own-knockout result transition after v104 duplicate-headline removal.
6. Broader draft/signing/manage/season/live/result composition and hierarchy audit.
7. v109 squad-altitude acceptance across relevant club colours.

Sixteen isolated controller tests pass, including10 clean handler iterations and recovery/save-boundary cases. These are NOT ten clean browser launches or real multi-tab certification.
Normal clean handler already passed before110. The failure was the save appearing during intro and exception-based recovery; do not claim all cold launches were inherently broken.
Browser viewport overrides once failed to affect intended tab (measured1536 instead of390); later claimed/selected QA tab measured390 correctly. Only count measured widths. Always reset temporary viewport.
An attempted127.0.0.2 test origin refused connection. No storage was cleared.
No screenshot-only or syntax-only evidence proves all gameplay works.

## 8. Source/build limitations and practical safeguards
Prior environment was a partial checkout at /workspace/scratch/6b3978a4a133. Recent candidates were exact owned CSS/JS substitutions into hash-verified previous HTML, with explicit occurrence checks,20script syntax checks, markup/assets equality and stylesheet identity checks.
NO fresh full-project v8/build.py rebuild ran for these recent releases. Do not say the complete source pipeline passed. The canonical regression expected hash was updated remotely but could not run in partial checkout.
Source backed by GitHub is synced; downloading the HTML does not itself sync source. Reconcile exact content, not version names.
Read current branch files instead of trusting old local copies. One local test_canonical.py was stale atv96 while remote was current.
Large outputs caused truncation; use bounded chunks. Do not send entire6.6MB HTML or image manifest as a tool argument. Oversized payloads were a plausible maximum-length cause, not proven diagnosis.
Never replace every literal </body>: oldv94 did that inside a CSS comment, corrupting style boundaries. Use parsed/anchored unique boundaries.
Validate code changes before delivering. Keep changes reversible and preserve known-good bytes.
If GitHub or file edits are unavailable in regular chat, say what is blocked and retain precise proposed changes. Do not invent a synced commit or finished download.

## 9. Useful source/test locations
v8/ui/workspace.css
v8/ui/floodlit.css
v8/ui/floodlit-compat.css
v8/ui/composition.css
v8/ui/decision-ui.css
v8/ui/decision-ui.js
v8/ui/screens.js
v8/ui/controller.js
v8/ui/dom.js

qa/cold-start-20261108/controller.test.cjs (16cases after111)
qa/intro-save-boundary-20261108/
qa/cascade-cleanup-20261107/
qa/trade-alignment-20261107/
qa/campaign-status-20261107/race.test.cjs
qa/review-comparison-20261107/render.test.cjs
qa/layout-integration-20261107/header-clearance.cjs

Commands when an execution environment exists:
python3 qa/order-contrast-20261108/test.py (paths in current test assume source/ prefix from previous scratch; adapt cwd/path deliberately)
node qa/cold-start-20261108/controller.test.cjs v8/ui/controller.js
node qa/campaign-status-20261107/race.test.cjs v8/ui/decision-ui.js
node qa/review-comparison-20261107/render.test.cjs v8/ui/screens.js v8/ui/decision-ui.js
node qa/layout-integration-20261107/header-clearance.cjs v8/ui/dom.js

## 10. First action in the next chat
Read this handoff plus CURRENT_CHECKPOINT and STYLE_OWNERSHIP on work/v8-integrity-charcoal-candidate. Resolve/download exact GCC_v112.html if needed. State which capabilities are actually available in this regular chat. Confirm whether112 has since been downloaded/opened before treating browser content as112. Verify the scoped order-text fix if interactive tools permit; otherwise perform source review and give Tom a precise acceptance route. Then continue one visual family at a time without losing Home's composition or adding competing layers.

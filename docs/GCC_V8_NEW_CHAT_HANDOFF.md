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

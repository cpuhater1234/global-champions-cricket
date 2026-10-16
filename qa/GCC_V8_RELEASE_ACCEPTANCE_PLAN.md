# GCC v8 — release acceptance and execution plan (16 October 2026)

## Source integrity

Working branch: `work/v8-game-first-rebuild`. Do not modify protected baseline or promote to main during investigation. Existing preplay green results are for SHA-256 `ff3b637d3af692e361b0c96b452c4384dacd218c035ac38a1b6f50171843f485` and **not** for the new fixes. Last continuation QA checkpoint `9260c8a990ac8b87c44499db79f4f290840c0eb6`.

## G0: clean build and regression baseline

- Clean checkout; record branch head and working tree.
- Run `python3 v8/build.py --freeze --output game/global_champions_cricket_v8_career_variation.html`.
- Record SHA-256 and reproducibility from a second clean assembly.
- Run `node qa/v8_clock_pause_regression.mjs` and `node qa/v8_delivery_boundary_regression.mjs`; fix only reproduced source defects.
- Run all 30 existing preplay focused suites in `qa/preplay-20261016/suites.json` with GCC8_TEST_BUILD set to this exact artifact. Capture exit codes and failures, do not borrow previous build results.
- Retest all earlier lifecycle, player-first management, drafting, migration, corrupt-save, pause/reveal and scorebook validations.

**Gate:** no syntax/build failures, zero focused regression failures, digest recorded, no unexplained state discrepancies.

## G1: cricket-domain adversarial battery

- New innings: wides/no-balls/batters faced/strike rate/bowler figures; legal-ball maximum and overs formatting.
- Chase completion after any scoring event, final wicket, 120 legal balls, and free-hit/crossing at the boundary.
- Bowler restrictions: consecutive overs, 24-ball ceiling, role fallback, strike state, phase and Power Surge boundaries.
- Super Over tie and second-round transitions, no invalid player/delivery state, replay and reload.
- Property-based or seeded cross-checks of inning ledger, batting sums, extras, dismissals, bowling figures, target resolution, phases, notices, and displayed views.
- Old save with historical no-ball undercount accepted without mutating original statistics; malformed saves rejected transactionally.

**Gate:** zero impossible scorebooks, ledger/scorecard mismatches, invalid chase continuations or false historical-save corruption.

## G2: nineteen-season career campaign

- Fresh full career 2008–2026 under multiple different seeds and clubs; separately old-save continuation from 2008 through 2026.
- For each year: roster=15 after draft, recognized keeper in each CPU squad, legal XI and order, 14 regular games, plausible finals, durable results and archive, no 2027 progression.
- Visit and navigate season, player records, scouting, finals, archive and planning throughout, not just at the endpoints.
- Force 0, 1, 2, 3, 4, 5, 6 departures, with voluntary cut limits, supplementary picks and a full/no-picks club; exercise keeper scarcity and injury-cover chains.
- Check prior records unchanged after trades, retirements, saves and cold resumes.

**Gate:** all careers end at 2026 with complete, consistent archive and no stuck career transition.

## G3: state machine / hostile player actions

- Double-click every high-impact action; repeated confirmation and stale target attempts; request review then change underlying roster/ownership/window and confirm.
- Pause/skip/speed/reload around club reveal, signing, snake rounds, match playback and terminal innings; schedule collisions must not advance paused game.
- Back/forward navigation, dismiss dialogs, cancel swap, leave an unfinished trade or cut review, change draft filter mid-selection, and return.
- Reject invalid actions without changing state or consuming picks/releases/trades; correct feedback must name outcome.
- Autosave and storage quota/blocked failures preserve playable state. Corrupted or old saves must be safely rejected/migrated.

**Gate:** no duplicate effects, stale UI command execution, irreversible unnoticed changes or unrecoverable state.

## G4: sports-game experience / rendered visual approval

- Human-operated evidence for 1920x1080 desktop; 1366x768 laptop; 390x844 mobile; 200% browser zoom; keyboard-only and reduced motion. Prior environment restrictions prohibit bypassing blocks through browser automation or CDP.
- Capture home, club choice, signing, draft clock, scout, XI, scorecards, season tabs, finals, offseason departures, trading review/response, annual draft, legacy ending; repeat at early/middle/late careers.
- Check contrast, typography floor, truncation, names on light cards, text overlap, button discoverability, focus, scroll continuity, feedback, hierarchy and stable layout during reveal.
- New player comprehension: What should I do now? What changes if I click? What did the action achieve? Can I undo/cancel?
- Preserve same familiar interaction language across later years; no surprise text-heavy dashboards or fake financial mechanics.

**Gate:** zero blocking visual/interaction defects and no outstanding critical comprehension failures; unresolved aesthetic judgements must be explicitly reviewed rather than inferred from code.

## G5: frozen candidate and release decision

- Freeze artifact SHA, run ALL prior suites and long careers on *that exact digest*, save command manifests, logs, test seeds and exceptions.
- Classify defects P0: data corruption / cannot progress; P1: illegal cricket / misleading consequential actions / serious usability; P2: material visual/readability issue; P3: minor polish.
- P0 and P1 must be zero. P2 require explicit disposition and no accessibility/readability blockers. No quiet waivers.
- Inspect real screenshots and execute manual end-to-end actions before calling visual quality verified.
- Only then consider promotion; never infer release readiness from number of assertions.

## Current execution truth

This document is an execution contract, not proof tests were run. The new delivery and timer regression scripts have been committed, but the full rebuilt game and suite still require execution in a clean checkout. Prior VM testing cannot certify native browser layout, focus, pointer hit targets or motion. No release, deployment or main promotion authorized.

## Execution checkpoint: 16 October 2026, current runtime

**G0 BLOCKED, not passed.** Attempted `git ls-remote https://github.com/cpuhater1234/global-champions-cricket.git HEAD` in the execution container. It failed: `Could not resolve host: github.com`. Consequently, a clean checkout, artifact rebuild, precise digest, full 30-suite execution, nineteen-season VM runs and rendered UI approval cannot be claimed in this runtime.

**One narrow executed check:** reconstructed the exact functional body of the connected-source `v8/ui/clock.js` into a local Node VM harness with deterministic fake timers. The pause/same-time/resume/cancel test completed with `PASS timer boundaries`. This is independent narrow evidence using a manually transferred module body, **not** an execution of the repository checkout or the shipped HTML. GitHub source was re-read during this checkpoint.

G0 stays blocked pending an environment with authenticated repository checkout plus Python/Node. Do not elevate reconstructed-module smoke results to release certification. Existing source changes and unexecuted regression scripts remain preserved on the working branch.

## Additional source hardening, current turn

- Container checkout probe repeated: `git ls-remote` remains blocked by `Could not resolve host: github.com`. Full clean checkout/build cannot run here.
- Local previously preserved timer harness rerun with Node: `PASS: same-time pause, resume, cancellation, and retained pending job`; separate `qa/clock_test.cjs` also reported `PASS timer boundaries`. These are narrow module tests, not the full game.
- GitHub source inspection identified NaN / Infinity bypass in numeric scorecard comparisons (`Math.abs(NaN - expected) > tolerance` evaluates false). Source fix `c107fa78` requires `Number.isFinite` for batting strike rates and bowling economy when balls > 0.
- Regression script updated at `4d4d918` with explicit NaN, positive/negative Infinity, null strike-rate tampering and nonfinite bowling economy rejection. These newly committed tests have **not** been run in a full checkout; they remain outstanding in G0.
- No promotion, full career certification, or native visual approval.

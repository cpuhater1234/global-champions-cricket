# v99 — match presentation and quiet career resume

The current playable is `game/gcc_v8_product_candidate.html` on `work/v8-game-first-rebuild`. v7.0.14 remains a frozen historical reference.

## Changes

- Continue quietly chooses the valid newer checkpoint; removes the saved-progress review popup (earlier v99 checkpoint).
- Removes the undrafted-player modal and enters team selection directly after the draft.
- Integrates the breakaway opening into its introduction and normalizes XI/bench Swap buttons.
- Matchday uses framed opaque surfaces and removes the repeated weekly no-trades reminder.
- Live playback uses a compact scorebug, chase equation, latest delivery, current over, two batters and bowler, then earlier overs. No stadium photo behind stretched panels. Current-over balls are not duplicated in history. Wickets, fours and sixes have distinct solid colours. Motion respects reduced-motion settings.
- Results replace innings comparison with three awards and a both-team cumulative worm. Scorecards include batting/dismissals, extras, did-not-bat, fall of wickets and bowling figures. Bowling changes are removed.

## Validation

`python qa/match-experience-20261029/build.py` checks all 20 inline scripts. Only presentation scripts 15, 17 and 19 differ from the saved popup-only v99 input; the other 17 remain byte-identical.

`NODE_PATH="$CODEX_PRIMARY_RUNTIME_NODE_MODULES" node qa/match-experience-20261029/check.cjs` checks all 165 frames of an actual match against cumulative delivery scores, render purity, best figures, worm endpoints, wicket sequence, 12 live layouts (320/390/768/1440px with 16/24/32px root text), and result/scorecard content.

`flows.cjs` checks a full foundation draft, direct team-room entry, identical bench/XI Swap styles, quiet reload/Continue and reduced motion. The existing visual scanner additionally exercised 84 screen/viewport combinations with no browser errors or document overflow. SVG axis-label bounds are not document overflow.

Validation uses native Chromium 153. Other browser engines have not been revalidated for this presentation pass. This is focused regression evidence, not a claim that every possible career or device is covered.

## Awards and legacy records

Best batting is ranked by runs, strike rate, then player ID. Best bowling is ranked by wickets, runs conceded, balls bowled, then player ID. Man of the Match uses runs plus 25 per wicket, capped strike-rate/economy bonuses and a five-point winning-side bonus. It uses recorded batting/bowling only; fielding awards are not fabricated. The award is a deterministic presentation assessment, not a simulation change.

The worm and fall of wickets use actual version-1 delivery ledgers, including extras and repeated legal-ball counts. Older records without ledgers show an unavailable message. The two worm lines use solid/dashed styles as well as club colours. Super Over summaries remain separate from regulation innings.

## Rebuild

The builder reads `base.html` when supplied, otherwise extracts the input from commit `2a59cca38ac9b4b9dc09164dbd83c1fc9864b2be` using git. Its input SHA-256 is `40e2cf7eb0065f2a29e312b6dc89897c105dc8a87c44c21b007edd3ada799bbc`. The canonical aliases must be promoted together only after validation.

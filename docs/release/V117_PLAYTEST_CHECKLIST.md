# Playtest checklist — v117 gameplay-calibrated candidate

Manual smoke test before promoting v117 over v116 as the stable playable build.
Focus: does it *feel* right? The audit proves distributions; only play proves feel.

Time required: ~20 minutes. Build: `qa/candidates/v116-authenticity-candidate.html`
(works in any browser; no server needed).

## 1. Fresh career draft (~5 min)

- [ ] Start a new career; complete club selection and the draft
- [ ] Draft pacing feels unchanged vs v116 (no sudden starvation/surplus of players)
- [ ] Squad needs strip (keeper/openers/pace/spin) still guides sensibly

## 2. Play 3–4 league matches (~10 min)

Watch for the calibrated behaviors:

- [ ] **Collapses happen but aren't constant.** An all-out innings should be a
      notable event (roughly 1 in 7 innings), not routine and not rare.
- [ ] **Chases feel competitive but not automatic.** Roughly half of chases
      should succeed; a team 40/4 halfway should usually lose but not always.
- [ ] **Big totals still happen** — a 190+ first-innings total should still
      occur across a few matches.
- [ ] Death overs still accelerate (wickets in the shed → big finish).

## 3. One "funny result" probe (~3 min)

- [ ] Deliberately pick your weakest XI vs the strongest opponent. You *should*
      lose, but check: does the mismatch still express (big margin), or does the
      game feel flat/random? Mismatch margins should be visibly larger than
      even-matchups.
- [ ] Reverse it: strongest XI vs weakest opponent. Comfortable win expected —
      verify the game doesn't hand the weak side miracle wins either.

## 4. Captaincy & saves (~2 min)

- [ ] Set captaincy plans (powerplay/middle/death); confirm they persist to the
      result screen and survive save → reload → continue
- [ ] Save mid-season, reload, confirm career state intact

## 5. Feel checkpoint

- [ ] Nothing feels "too uniform" — results across matches vary in margin and
      pattern (the seed-variance audit already showed ±0.9 AO spread across
      drafts, but confirm it feels right in play)
- [ ] No UI/visual differences vs v116 outside match outcomes (visual pixel-diff
      already confirmed layout unchanged)

## Verdict

Record: pass/concern per section, plus one sentence on overall feel.
If all sections pass → promote v117 (update V117_HANDOFF.md status line,
create GitHub Release/tag per owner decision). Any concern → file it against
v118 with the specific match scenario.

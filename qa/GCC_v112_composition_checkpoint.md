# GCC v112 — Visual composition candidate

**Date:** 2026-11-08  
**Branch:** `work/v8-game-first-rebuild`  
**Local / intended binary name:** `game/gcc_v112_composition.html`  
**Relationship to v101:** Parallel candidate. Does **not** replace `game/gcc_v8_product_candidate.html` (GCC v101 management layer) until explicitly promoted.

## What this is

Local visual craft stream (v106→v112) with scoped composition on the front door:

- Style stack ends with `gcc-floodlit-v93` + **`gcc-composition-20261107`**
- **Home:** centred identity, one format line (no cyan-underline stat tiles), full-width career CTA
- **League intro:** vertical numbered sequence (not equal thirds), clear primary + Back
- **Draw controls:** centred status/control group CSS (pace/next overlap preserved)
- No broad v94–v99 hierarchy overlay relapse

## What this is not

- Not a claim that game-wide visual perfection is done
- Not a replacement for v101 squad-management / relationship work in the product candidate
- Not a navy-flat contrast pass yet (club identity + altitude still open on the roadmap)

## Known issues (playtest lineage v109)

1. **Critical — concurrent-career / multi-session lock:** clean Start New Career can still surface “Another open game has started…” and block club reveal; interactive controls can collapse. Fix before calling cold-start reliable.
2. **Draw controls:** CSS present; live reveal bar not fully re-verified while issue (1) blocks the path.
3. **Draft / signing / manage / season / live:** not brought to Home/Intro composition standard yet.

## Promotion rules

- Do not overwrite `gcc_v8_product_candidate.html` with this file without a deliberate product decision.
- README “current playable” remains **GCC v101** until a release owner promotes a successor.
- Further visual work: additive CSS only; Home as reference; one surface family at a time.

## Verification checklist before elevating past “candidate”

- [ ] Clean storage cold start ×10 with zero concurrent notices
- [ ] Home → intro → reveal → choose club without dead UI
- [ ] MENU on home and mid-flow
- [ ] Home/Intro screenshots still match composition intent
- [ ] `python qa/check_candidate.py game/gcc_v112_composition.html` if applicable

## Binary landing

If `game/gcc_v112_composition.html` is not yet on the branch, upload the local `GCC_v112.html` build under that path in a follow-up commit (large single-file HTML). Until then this checkpoint documents the candidate contract.

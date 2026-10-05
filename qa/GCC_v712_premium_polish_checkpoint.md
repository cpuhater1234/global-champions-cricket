# GCC v7.1.2 Premium Polish Checkpoint

Candidate: `game/global_champions_cricket_v7_1_2_premium_polish_candidate.html`

SHA-256: `6c07526259b85723eedd216fca513f6e57b59ce98de23b2e7575af849a73c74b`

Protected mechanics baseline: v7.0.23
Baseline SHA-256: `47861e9c0328ae2f57c9f3cc0c05184c7c48e3ec7bd8b1c642f5f3e01e0f42ce`

## Scope

Final language cleanup on top of v7.1.1:
- recruitment states use call/sign/pass language
- HOW TO PLAY removes development-system wording
- keeper warning is expressed as a cricket selection consequence
- continuous season copy is less technical
- 2026 ending uses Legacy rating rather than Manager score

## QA

PASS:
- script blocks: 9
- duplicate DOM IDs: 0
- protected simulation functions unchanged: 12/12
- candidate SHA verified

Visual Chromium QA was not executed because managed browser policy blocks local and localhost navigation in this environment.

Continue from branch `work/v7.1.2-premium-polish`.

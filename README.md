# Global Champions Cricket

## Current game — start here

- **Current active branch:** [`work/v8-game-first-rebuild`](https://github.com/cpuhater1234/global-champions-cricket/tree/work/v8-game-first-rebuild)
- **Current playable version:** **GCC v101**
- **Current playable:** [`game/gcc_v8_product_candidate.html`](https://github.com/cpuhater1234/global-champions-cricket/blob/work/v8-game-first-rebuild/game/gcc_v8_product_candidate.html)
- **Release notes and QA:** [v101 living squad management](https://github.com/cpuhater1234/global-champions-cricket/blob/work/v8-game-first-rebuild/qa/team-management-20261029/README.md)
- **Protected historical baseline:** **v7.0.14 — frozen, read-only reference**

**Do not use v7.0.14 as the source of truth for current development.** Current code is on the work branch. Default-branch game files remain historical.

v101 makes squad management persistent: healthy omissions, batting-role use and meaningful bowling opportunities can create concerns. Optional commitments are checked against future matches; keeping or breaking them changes trust. Unresolved concerns can become a transfer request, handled through the existing legal trade system. Medical absences pause commitments and short innings do not count as full bowling opportunities.

Player profiles show actual recent innings/spells, fitness, expectations and commitments. XI rows carry compact form/concern indicators; team selection uses the actual next venue, and finals advice uses the same weather-adjusted conditions as the simulation. Relevant changes appear after matches. The previous fixed three-fixture recap presentation is replaced.

This is the first playable relationship layer, not a complete personality, training or dialogue simulation. Trust has no hidden performance modifier; form, fitness, conditions and batting-role effects remain in the unchanged cricket model. No automatic transfers or invented player quotes.

Validation: pure management regressions, real six-match selection/save/reload tests, controlled medical and finals scenarios, replay immutability, text contrast, 36 enlarged-text management layouts and the existing 84 screen/viewport scan. Only inline scripts16,17,19 change; all20 pass syntax checks. Full evidence and limits are in the release checkpoint.



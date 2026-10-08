# GCC v7.8.4 Hardening Checkpoint

## Candidate

- Branch: `work/v7.8-player-experience`
- Parent: `global_champions_cricket_v7_8_3_hard_playtest_visual.html`
- Parent SHA-256: `a178e2fc9f4881d22b107b8e69d91e8db377f8c196f46c42d164ba8e3078168c`
- Candidate: `global_champions_cricket_v7_8_4_hardening.html`
- Candidate SHA-256: `591c41f9f2282919e56e8ccb7c4f4d0a1790f83471fa180ed0249c8cb6bd6531`

## Scope

v7.8.4 is a deliberately small hardening patch on top of the completed v7.8.3 hard-playtest and visual-hierarchy pass.

The broad visual system from v7.8.3 remains unchanged:
- warm cream canvas;
- lighter live gameplay / decision surfaces;
- pale sage squad/context rails;
- restrained gold secondary information;
- deep green for competition/event focus;
- green/red semantic sporting result feedback;
- event-weight Annual Draft and Finals presentation;
- scouting-led Trade Centre rather than exposed master ratings.

## Final 15 semantic fix

Hard playtesting found one remaining UX contradiction.

After the Annual Draft had already filled every list vacancy, Final 15 still displayed unused cut entitlement as if it were an actionable option, for example `1 RET · 0/3 CUTS` with copy saying three cuts remained.

That was technically derived from the turnover allowance but wrong for the player's current decision state: the contract window and Draft were already over.

v7.8.4 now:
- shows completed turnover as history, e.g. `1 RET · 0 CUTS`;
- explicitly says the contract window is closed;
- explains that retirements/cuts shaped the vacancies already filled in the Draft;
- keeps all 15 contracted players labelled `LOCKED IN`;
- uses correction-oriented copy only in the rare case the post-Draft list is actually over 15.

No retirement, cut, Draft, trade or simulation rule was changed.

## Hard audit

The rebuilt candidate was locally exercised through 24 major states:
- Home
- club reveal/selection
- Signing Week
- Draft Draw
- Foundation Draft
- Team Room empty/full
- Season start
- Matchday preview
- Season result
- Analysis
- Fixtures
- Ladder
- regular-season completion
- Finals ready
- Finals after semifinal
- Season Review
- off-season market
- Trade Centre
- annual Draft Draw
- Annual Draft
- full annual Draft board
- Final 15 desktop
- Final 15 mobile

Results:
- zero horizontal overflow on every audited screen;
- zero page errors;
- zero runtime exceptions;
- zero heuristic overlaps on all normal screens;
- the Trade Centre overlap detector reported one nested-element false positive; visual inspection showed no actual collision;
- all inline JavaScript blocks pass `node --check`.

The headless audit uses an opaque document origin, so expected `localStorage` SecurityError console messages occur in the harness. They are not app runtime exceptions and do not reproduce when the file has a normal browser origin.

## GitHub / billing rule

No GitHub Actions workflow was added or intentionally triggered for this iteration.

GitHub remains the source of truth for version history and rollback. Routine GCC playtesting remains local.

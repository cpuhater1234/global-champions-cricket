# GCC v7.7 Release Hardening Acceptance

## Status

**Accepted with no game-code change.**

v7.7 was deliberately defined as a release-hardening phase, not another feature phase.

The hardening run found no reproduced BLOCKER, MAJOR or justified game MINOR that warrants changing the accepted binary.

The release candidate therefore remains the frozen v7.6 game:

`global_champions_cricket_v7_6_0_matchday_immersion.html`

Release-candidate branch:

`release/v7.6-rc1` at commit `f0826aba1e9a88885f3631112007601fc9514d60`

SHA-256:

`3a8b8bb9b9d67558ea19bda4b595b0ab083209f3ccb0607d209aaad04155b55f`

## Full-career evidence

Three complete careers were run through 2008-2026:

- audit 101: 19 seasons;
- audit 202: 19 seasons;
- audit 303: 19 seasons.

Total hardening exposure: **57 seasons**.

Every career reached the completed 2026 Archive.

Across all three careers the test route used:

- the real foundation flow;
- the real Foundation Draft;
- legal XI selection;
- read-only Matchday preview checks at Round 1, Round 7 and Round 14;
- the accepted match simulation;
- injury / replacement handling where required;
- Finals;
- Season Review;
- offseason progression;
- annual Drafts;
- Final 15 cuts;
- GCC autosave / Continue boundaries in fresh JavaScript realms.

The careers were not reconstructed by directly injecting dynasty history.

## Final integrity

Each 2026 end state had:

- 19 archived seasons;
- 120 contracted players;
- 120 unique contracted players;
- eight legal 15-player club lists;
- zero retired players still rostered;
- zero stale temporary-replacement mappings;
- 19 Archive season rows;
- eight League Honours rows;
- eight Record Book categories;
- zero page errors;
- zero runtime errors;
- zero console errors.

The three careers included both strong and poor user seasons. Best finishes reached 1st and worst finishes reached 8th, so the hardening route did not test only successful/title-contending states.

## Static release gate

The exact accepted binary also passes:

- nine script blocks syntax-clean;
- 174 static DOM IDs;
- 174 unique static DOM IDs;
- zero duplicate IDs;
- no TODO;
- no FIXME;
- no DEBUG marker;
- no lorem placeholder;
- no `temp copy`;
- no `dev only`.

No player-facing copy defect found in this sweep justified a patch.

## QA harness findings

Two defects were found in the new v7.7 QA harness itself:

1. the seed output path referenced `AUDIT_SEED` before declaration;
2. this execution environment blocks Chromium navigation to `127.0.0.1`.

Both were treated as QA infrastructure issues, not GCC defects.

The local hardening driver therefore used the exact SHA-verified HTML through direct document injection. Save / Continue testing used a fresh JavaScript realm with the game's persisted storage copied across the reload boundary before the exact HTML was reinjected. GCC then resumed through its own `Continue` path.

## CI note

Hosted GitHub Actions is still failing before checkout with runner id 0 and zero executed steps. The configured repository workflow remains available for when hosted runner allocation returns.

This acceptance does not claim a green hosted CI run.

## Product judgement

The post-v7.6 audit found no missing major product pillar.

v7.7 then found no reproduced defect that supports reopening:

- simulation;
- balance;
- Drafts;
- trades;
- injuries / replacements;
- XI logic;
- Matchday;
- Finals;
- Season Review;
- Archive / Legacy;
- visual identity;
- save schema.

The correct release-hardening decision is therefore **no change**.


## Rejected cosmetic candidate

A late Archive-only experiment produced SHA `57051db6a677b3721e4d19bb414e9098144116c64f7e78e0a9ab38dac26fcdfc` by removing a redundant season tail, simplifying its grid and replacing the exposed Club Legends weighting formula with cricket-language copy.

That experiment did not fix a reproduced BLOCKER, MAJOR or justified MINOR. It is therefore **not an accepted v7.7 game build** and must not be used as a new baseline.

The corresponding experimental rebuild/check/evidence files were removed from this branch. The only accepted release-candidate binary remains the frozen v7.6 SHA below.

## Freeze rule

Do not create a cosmetic v7.7 binary merely to advance the version number.

Treat SHA `3a8b8bb9b9d67558ea19bda4b595b0ab083209f3ccb0607d209aaad04155b55f` as the release candidate proven by v7.7 hardening.

Future game-code work requires new evidence from actual player use or a reproduced defect.

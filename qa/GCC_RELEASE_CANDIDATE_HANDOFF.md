# GCC Release Candidate Handoff

## Canonical release candidate

Release branch:

`release/v7.6-rc1`

Commit:

`f0826aba1e9a88885f3631112007601fc9514d60`

Game file:

`global_champions_cricket_v7_6_0_matchday_immersion.html`

Game SHA-256:

`3a8b8bb9b9d67558ea19bda4b595b0ab083209f3ccb0607d209aaad04155b55f`

The release branch is identical to the accepted `work/v7.6-matchday-immersion` branch.

## Release-hardening result

v7.7 was a QA phase, not a new gameplay version.

The hardening matrix completed:

- seed 101: 2008-2026;
- seed 202: 2008-2026;
- seed 303: 2008-2026;
- 57 total seasons.

At every completed career:

- 19 archived seasons;
- 120 contracted players;
- 120 unique contracted players;
- eight legal 15-player lists;
- no retired player rostered;
- no stale replacement mapping;
- Archive / Honours / Record Book complete;
- zero page errors;
- zero runtime errors;
- zero console errors.

The matrix also exercised Matchday, injuries / replacements, Finals, Season Review, annual Draft, Final 15, autosave and Continue boundaries.

## Product decision

No reproduced BLOCKER, MAJOR or justified MINOR required a game-code patch.

Therefore:

**v7.7 acceptance = no game-code change.**

The release candidate remains the accepted v7.6 binary above.

## Rejected cosmetic experiment

SHA:

`57051db6a677b3721e4d19bb414e9098144116c64f7e78e0a9ab38dac26fcdfc`

This was an Archive-only cosmetic experiment.

It is **not** an accepted build, not a new baseline and must not replace the canonical release candidate.

The experimental rebuild/check/evidence files were removed from `work/v7.7-release-hardening`.

## Repository state

Evidence branch:

`work/v7.7-release-hardening`

Release branch:

`release/v7.6-rc1`

Default branch:

`main`

At release-candidate creation, `main` was 412 commits behind the RC lineage and the RC was 0 commits behind `main`.

This is expected because GCC development has largely occurred on versioned work branches.

Do not merge or rewrite `main` merely as housekeeping. Treat promotion to `main` as an explicit release-management decision.

## What is frozen

Do not reopen without new evidence:

- ratings / career curves;
- arrivals / retirements;
- match simulation;
- scoring environment;
- two-sided form;
- Drafts;
- trades;
- injuries / temporary replacements;
- XI logic;
- Finals;
- Season Review;
- visual identity;
- Dynasty Archive / Legacy;
- Matchday;
- save / resume schema and behaviour.

## Next legitimate paths

### Release

Promote `release/v7.6-rc1` only after an explicit decision to update `main` or publish a packaged build.

### Real-player QA

Play the RC normally rather than through a scripted QA route. Record only reproducible friction or defects.

### Future development

Any new feature phase must start from the canonical RC and justify itself with actual player evidence. Do not resume feature accumulation by default.

## Governing rule

**No evidence, no game-code change.**

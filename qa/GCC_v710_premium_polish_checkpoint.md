# GCC v7.1.0 Premium Polish Candidate Checkpoint

## Candidate

`game/global_champions_cricket_v7_1_0_premium_polish_candidate.html`

SHA-256:
`233821a47c876c4a847a67b3d421bc002b03efa8e128ea1292958445f60fc3a0`

Authoritative logic baseline:
`global_champions_cricket_v7_0_23_release_candidate.html`

Baseline SHA-256:
`47861e9c0328ae2f57c9f3cc0c05184c7c48e3ec7bd8b1c642f5f3e01e0f42ce`

## Scope

This candidate is a presentation and cricket-language pass. The hostile-tested simulation, ratings, roster, transaction, injury, save, Finals and dynasty mechanics remain protected.

The main target is the Season screen, which previously read too much like a status dashboard and had too many competing surfaces.

## Season hierarchy now

1. Latest match/result
2. Next fixture
3. W-L / ladder position / round / NRR
4. Full schedule and GCC ladder
5. Cricket evidence from innings phases, scorebook and league leaders

The result is intended to read as a cricket campaign rather than a business dashboard.

## Main polish changes

- `SIMULATE SEASON` -> `RUN SEASON`
- `PLAY ONE ROUND` -> `PLAY NEXT ROUND`
- clearer live season headings for early, middle and late season
- next-opponent panel becomes the explicit second read after the latest result
- fixtures and ladder use restrained contained surfaces instead of loose divider-heavy presentation
- innings-phase analysis rewritten in cricket language
- scorebook and GCC leader sections rewritten and visually contained
- match-result narrative uses innings/passages rather than abstract analytical phrasing
- later-year dynasty strip uses `Last five`, `Fitness watch`, `Mid-season window`, `Sign cover`, etc.
- Finals qualification wording is year-aware
- post-2008 season-header overwrite fixed at its source so `renderSeason()` remains authoritative

## Source audit

Named functions in v7.0.23: 381
Named functions in v7.1.0: 381
Changed named functions: 9

Only:

- `showFinalsQualification`
- `renderSeason`
- `seasonEvidenceStage`
- `renderSeasonInsights`
- `renderMatchStory`
- `freshDynasty`
- `updateYearCopy`
- `renderSeasonLayer`
- `serialisable`

The version-bearing functions plus `freshDynasty` change provenance only. No protected simulation function changed.

## Static regression gate

PASS:

- protected simulation functions unchanged: 12/12
- script blocks parse: 9/9
- duplicate DOM IDs: 0
- candidate version metadata: 7.1.0
- candidate SHA verified
- old Season dashboard phrases targeted by this pass removed from Season surfaces

## Browser QA limitation

The current execution environment has a centrally managed Chromium policy with `URLBlocklist: ["*"]`. It blocks both local files and localhost, so a visual browser run cannot be performed here without bypassing an environment security policy. That policy was not modified.

This checkpoint therefore records static/source regression as passed and visual browser QA as not executed in this environment. It must not be represented as a visual-browser pass.

## GitHub reconstruction

The repository stores six compressed base64 unified-patch parts plus `qa/rebuild_v710.py`:

- v7.0.14 protected repo baseline -> exact v7.0.23 release candidate
- exact v7.0.23 -> exact v7.1.0 premium-polish candidate

`qa/rebuild_v710.py` applies both and verifies both expected SHA-256 hashes. The reconstruction was tested in a clean temporary directory and produced a byte-identical v7.1.0 candidate.

## Status

Strong first v7.1.0 premium-polish candidate. Mechanics remain protected. Continue with wording/visual scrutiny outside the Season surface only after this checkpoint is committed, and keep each subsequent pass similarly bounded.

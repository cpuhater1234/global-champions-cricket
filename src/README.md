# GCC source workspace

The source workspace now builds the v7.9.0 recovery candidate. The original
byte-identical v7.8.7 extraction remains in `game/gcc_recovery_architecture_checkpoint.html`.
The extraction notes below describe that protected checkpoint. Candidate changes
and verification are recorded in `docs/GCC_V790_RECOVERY_CANDIDATE.md`.

## Build

From the repository root:

```sh
python3 tools/source_workspace.py build game/gcc_recovery_candidate.html
python3 tools/source_workspace.py check
python3 -m unittest discover -s qa -p test_source_workspace.py
python3 tools/audit_presentation.py
```

The build has no package dependencies. `check` requires Node for JavaScript syntax
validation. The output remains a self-contained HTML game that works offline.

The phase-one round-trip test deliberately pins the v7.8.7 digest. When actual
presentation changes begin, retain the round-trip evidence below as the extraction
checkpoint and replace that one test with the new candidate's acceptance tests.
Do not change the expected digest merely to make a failure disappear.

## Sources and boundaries

| Source | Responsibility |
| --- | --- |
| `shell.html` | Original screen markup, script tags and stylesheet placement |
| `styles/legacy-foundation.css` | Original first stylesheet, with embedded bitmap URLs extracted |
| `styles/legacy-feedback.css` | Original second stylesheet, including accumulated v7.8 corrections |
| `views/season/` | Fixtures, ladder, overview, tabs, analysis and match result |
| `views/matchday/` | Pre-match programme |
| `views/draft/` | Foundation Draft room, pool and on-clock presentation |
| `views/annual-draft/` | Annual Draft room and pool presentation |
| `views/offseason/` | Contract window, Draft draw, Final 15 and preseason presentation |
| `views/trade/` | Trade room and scout read |
| `views/team/` | First XI selection presentation |
| `views/finals/` | Finals bracket and event presentation |
| `views/review/` | End-of-season review |
| `scripts/` | Data, ratings, CPU decisions, game closures, saves and presentation choreography |
| `assets/` | Exact original embedded bitmap data URLs; these are preserved, not approved identity assets |
| `manifest.json` | Baseline digest, original block order and extraction ownership |

`@@GCC_INCLUDE:path@@` is a build-time marker. It is never shipped to the browser.
Includes replace the original declarations in place. Presentation functions still
share the original closure and its private helpers; this step introduces no runtime
overrides, globals, fetches, timing changes or asset changes.

Both legacy stylesheets intentionally remain intact for this checkpoint. Moving
them into files does not resolve their cascade debt. The next phase replaces a
screen's legacy rules with its authoritative component/layout definitions, removes
the obsolete rules, and compares real rendered states before claiming completion.

## Verified extraction identity

```text
8dfda284f00ca7f693f96b734ae9a95edb9ad0b133165dcaef9024eae74478c2
```

The assembled source matches the entire protected v7.8.7 file byte for byte,
including assets, markup, script order, simulation, player data and save logic.

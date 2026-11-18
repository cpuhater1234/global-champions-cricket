# GCC Repository Map

## Layout (post-restructure, v116)

| Path | Purpose |
|------|---------|
| `GCC_v116_release (1).html` | Canonical release build (frozen, SHA-256 pinned) |
| `captaincy_layer_v116.py` | Native save/reload acceptance runner (CI-referenced, stays at root) |
| `README.md` | Project overview and release pointers |
| `BASELINE_SHA256.txt` | Baseline integrity fingerprint |
| `.gitignore` | Git ignore rules |

### `.github/workflows/`
- `v116-native-acceptance.yml` — Active: native candidate acceptance (Playwright + captaincy_layer_v116.py)
- `v116-source-identity.yml` — Active: source identity/hash verification
- `archive/` — Inactive legacy workflows (v7.x/v8.x builds, preserved, not executed)

### `archive/legacy-builds/`
- Frozen legacy HTML builds (v7.x, v8.x) moved from `game/` and repo root
- `root_duplicate_*.html` — root-level v7.0.14 duplicate

### `qa/`
- QA scripts, fixtures, and review results (dated subdirectories)
- `check_candidate.py` — static candidate guardrail (legacy; see RELEASE notes)
- `native_two_tab_v116.py`, `native_v116_signing_css.py` — CI-referenced native drivers

### `v116/canonical/`
- Canonical v116 source tree

### `docs/`
- `release/` — Current v116 release handoff and review docs; **V117_HANDOFF.md** — gameplay-calibrated successor candidate
- `qa/` — QA review documentation
- `archive/` — Historical archive docs (GCC_V8_HANDOFF_HISTORY.md)
- `history/` — Non-release v7.x/v8.x docs moved from `docs/` root
- `research/`, `superpowers/`, `visual/` — Topic-specific doc areas
- `REPO_MAP.md` — This file
- `REPOSITORY_GUIDE.md` — Contributor guide
- `WORKFLOW.md` — Workflow documentation
- `GCC_CAPTURE_VISUAL_REVIEW_2026_10_09.md` — Visual review capture

### `src/`, `tools/`
- Source and tooling directories

## CI-Referenced Files (do not move)
- `captaincy_layer_v116.py` — referenced by `v116-native-acceptance.yml` and `v116-current-candidate-safety.yml`
- `qa/native_two_tab_v116.py` — referenced by `v116-native-acceptance.yml`
- `qa/native_v116_signing_css.py` — referenced by `v116-native-acceptance.yml`
- `.github/workflows/v116-native-acceptance.yml` — self-referenced in `paths`
- `.github/workflows/v116-source-identity.yml` — self-referenced in `paths`

## Active CI Workflows
1. `v116-native-acceptance.yml`
2. `v116-source-identity.yml`

All other workflows are archived under `.github/workflows/archive/` and are inert.
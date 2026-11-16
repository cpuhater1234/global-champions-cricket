# Contributing to GCC

## Repository layout

The repository is organised around one canonical game build:

- `GCC_v116_release (1).html` — the frozen release artifact
- `captaincy_layer_v116.py` — native save/reload acceptance runner (stays at root)
- `qa/` — QA scripts and review fixtures
- `archive/legacy-builds/` — legacy HTML builds (v7.x, v8.x), moved from `game/`
- `docs/release/` — current release documentation
- `docs/history/` — historical v7.x/v8.x documentation

## CI-referenced files (do not relocate)

The following paths are referenced by active CI workflows and must remain at their current locations:

- `captaincy_layer_v116.py`
- `qa/native_two_tab_v116.py`
- `qa/native_v116_signing_css.py`
- `.github/workflows/v116-native-acceptance.yml`
- `.github/workflows/v116-source-identity.yml`
- `GCC_v116_release (1).html`

## Making changes

1. Do not modify `GCC_v116_release (1).html` directly — it is the frozen canonical build.
2. Do not move CI-referenced files (listed above) without updating the corresponding workflow `paths` and `run` commands.
3. Legacy workflows under `.github/workflows/archive/` are inert and preserved for reference only.
4. New QA checks should target the current candidate, not the legacy `qa/check_candidate.py` guardrail (which pins an older 9-script baseline).
# Global Champions Cricket — source of truth

> **Status checked 4 November 2026.** This document is the current branch and file-of-record pointer for development. It supersedes older branch pointers in the README and historical handoff notes where they disagree.

## Current development state

- **Repository:** [`cpuhater1234/global-champions-cricket`](https://github.com/cpuhater1234/global-champions-cricket)
- **Default branch:** `main` (the repository's default branch; not the active development branch)
- **Active development branch:** [`work/v8-integrity-charcoal-candidate`](https://github.com/cpuhater1234/global-champions-cricket/tree/work/v8-integrity-charcoal-candidate)
- **Branch head when this pointer was recorded:** `983fc6241d1349751ec8d0c2619cd5842baf6ecc`
- **Current playable candidate:** [`game/gcc_v8_product_candidate.html`](https://github.com/cpuhater1234/global-champions-cricket/blob/work/v8-integrity-charcoal-candidate/game/gcc_v8_product_candidate.html)
- **Quiet/alternate candidate:** [`game/gcc_v8_quiet_arcade.html`](https://github.com/cpuhater1234/global-champions-cricket/blob/work/v8-integrity-charcoal-candidate/game/gcc_v8_quiet_arcade.html)
- **V8 source and build system:** [`v8/`](https://github.com/cpuhater1234/global-champions-cricket/tree/work/v8-integrity-charcoal-candidate/v8), including [`v8/build.py`](https://github.com/cpuhater1234/global-champions-cricket/blob/work/v8-integrity-charcoal-candidate/v8/build.py)

The HTML candidate is the artifact to launch for playtesting. For changes to the V8 implementation, treat the modular source under `v8/` and its build process as the editable source; do not make an untracked change only to a generated HTML candidate and assume it is durable. Verify candidate/build correspondence and run the relevant QA before claiming a change is validated or promoted.

## Branch-reference reconciliation

Older repository documentation names `work/v8-game-first-rebuild` as the active branch and may describe an earlier playable/version checkpoint. That branch reference is **historical and superseded** for current work. Do not use it as the base for continuation or treat its candidate, version labels, or QA links as current without rechecking them against this branch.

`main` remains the repository default branch, but its README and historical baseline material may lag active development. For current development, use this document and the actual head of `work/v8-integrity-charcoal-candidate`. Keep historical baseline files and old handoffs as archival evidence; they do not override the active branch pointer above.

## Working rules

1. Start new continuation work from `work/v8-integrity-charcoal-candidate`, after fetching its latest head.
2. Edit the appropriate source under `v8/`; rebuild the playable candidate using the repository's build workflow, then verify the generated artifact.
3. Run targeted regression checks and record the exact artifact/hash and evidence for any checkpoint. Do not infer validation or release status from a filename or an old handoff.
4. Do not silently overwrite protected historical builds. Promotion to `main` is a separate action and should only be described as complete once it has actually happened.
5. If branch names or artifacts change, update this document and the README's current-status pointer together so there is one consistent entry point.

## What this document does not claim

This pointer identifies the active branch and candidate artifact. It does not certify that the candidate is released, fully tested, or the latest promoted build. Check the current branch contents and QA evidence for those claims.

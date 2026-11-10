# Keeping Global Champions Cricket organized on GitHub

## Where to start now

Choose the `v116` branch and read its [README](../README.md) and [current handoff](release/V116_HANDOFF.md). The uploaded v116 release is the owner-designated latest artifact. GitHub may still initially show `main`, whose older status text has not been promoted to v116.

A branch is a separate line of work, not another game installation. A commit is a recorded change. A pull request is a reviewable proposal to merge one branch into another. A GitHub Release is a named distribution checkpoint, normally attached to a tag.

## Safe routine

1. Start new work from the agreed current branch, presently `v116`.
2. Use one focused branch per task, such as `fix/v116-draft-spacing` or `docs/v116-test-instructions`.
3. Keep gameplay changes separate from visual/documentation-only changes where practical.
4. Record what changed, the exact artifact tested, checks actually run and known limits. Do not copy an old PASS into a new version's report.
5. Review the full difference before merging. Use a pull request for changes going into `main`.
6. Promote only a tested, agreed artifact. Update the default-branch README and current handoff as part of that promotion.

No promotion, default-branch switch, branch deletion or GitHub Release is performed by the documentation cleanup.

## Suggested layout for future work

- `README.md`: concise, current start-here instructions.
- `docs/release/`: release handoffs and evidence boundaries.
- `qa/`: version-specific tests, reports and required fixtures.
- `src/`, `v8/`, `tools/`: maintained source and build helpers, with reproduction status documented.
- `game/`: intentionally retained builds/build inputs; avoid duplicate uploads with ambiguous names.
- GitHub Releases: a possible future home for downloadable, verified HTML artifacts once release identity and testing are settled.

Existing content has not been moved merely to match this suggested layout. Moving a standalone release or its embedded dependencies requires checking links and preserving its bytes; it is not required to make the repository understandable.

## History and safety

Keep older branches for now. Many represent recovery anchors or past experiments, and similar names or shared commits do not establish that they are safe to delete. A later archival pass should check unique work, references and rollback needs before proposing deletion.

The branch named `protected/v7.0.14` is historical. A branch name does not enforce protection; the inspected branch listing reported `protected: false`. GitHub rulesets/branch protection are a separate optional setup and were not changed here. Consider requiring reviewed pull requests and verified checks for `main` when an appropriate current test workflow is available.

## Verification before v116 promotion

- Test the exact uploaded release rather than a similarly named local copy.
- Reconcile current source with the release; do not assume the historical default build recreates v116.
- Make the captaincy browser test paths configurable and document its dependencies.
- Preserve real player saves; exercise destructive flows only in disposable test careers/origins.
- Distinguish reported prior results, checks rerun on the exact artifact and unresolved acceptance work.
- Record a standalone checksum, build identity and known limitations before publishing a release asset.

The [v116 handoff](release/V116_HANDOFF.md) records the current evidence and next steps. Older checkpoints are retained for history, not automatically authoritative over it.

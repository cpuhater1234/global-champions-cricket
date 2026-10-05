# GCC development and QA workflow

## Purpose

Git is a safety layer around GCC. It must make testing more aggressive while making regressions easier to isolate and reverse.

## Branch discipline

- `main`: latest promoted known-good build only.
- `qa/<topic>`: hostile testing and experiments.
- Keep each behavioural fix isolated where practical.
- Do not stack unrelated visual, simulation and dynasty changes in one commit.

## Promotion standard

A candidate is not promoted because it "looks better" or completes one career. It should have:

- a reproducible reason for the change;
- a surgical diff;
- no unexpected change to protected cricket/simulation functions;
- syntax and DOM integrity checks;
- targeted regression for the affected system;
- first-time-player and visual review when UI is affected;
- full 2008-2026 regression only once the candidate is otherwise frozen.

## Protected 2008 rule

The polished 2008 foundation experience remains protected. Broad redesigns, simulation rewrites and speculative balancing changes should not be mixed into dynasty defect fixes.

## Versioning

- Keep promoted builds as versioned HTML files.
- Never silently overwrite a protected version.
- Record both the canonical SHA-256 and the repository newline-normalised SHA-256 for protected builds.

## QA artefacts

Do not commit high-volume browser screenshots, temporary instrumented HTML or raw stress-test output to `main`. Store concise evidence/checkpoints instead. Add a test harness to the repository only when it is stable and reproducible.

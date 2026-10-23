# Reproducing the finishing pass

Use the work/v8-game-first-rebuild branch and Node/Python. The exact accepted baseline is retained at qa/finish-pass/baseline.html; the adapter only replaces three source-owned modules. Run python3 qa/finish-pass/build.py and check the recorded candidate SHA256 before comparing results.

The Cricsheet source snapshot preserves four original archives, people.csv and a URL/hash manifest. Restore those inputs under qa/finish-pass before running source-assessment.py, source-reconciliation.py and statistical-summary.py. Live upstream downloads can change; the snapshot is the reproducibility input.

The separate QA save fixture archive contains 79 genuine synthetic saves/metadata at their repo-relative paths. Extract at the repository root. It contains no product code. save-fixture-manifest.json records every input hash. The 72-checkpoint comparison uses four preceding worlds; fixture paths used by older suites deliberately preserve their recorded schemas. Do not replace them with newly generated saves and call that old-save compatibility.

To regenerate the numeric inputs, run numeric-audit.mjs first with GCC8_TEST_BUILD=qa/finish-pass/baseline.html and preserve its output as numeric-baseline.json, then rerun with GCC8_TEST_BUILD=qa/finish-pass/candidate.html. The eight seeds are fixed in the script. Generate source-assessment.json, statistics.json and the per-player ledger only after both numeric passes are complete.

Run the targeted rating checks, overall-version-compatibility, CPU/chaos/save checks, and the VM regression runner with GCC8_TEST_BUILD=qa/finish-pass/candidate.html. Some historical suites are full career runs and need more than180 seconds. recheck-long-suites.py runs the three longest suites in isolated directories; annual-draft stress can also exceed180 seconds under concurrent load. Keep their isolated report directories and retain failures/timeouts before rechecking.

For browser checks use Playwright with Chromium/Firefox/WebKit. browser.cjs expects Chromium at /tmp/gcc-chromium; other engines use Playwright paths. In the managed environment, browser binaries and local WebKit libraries are preserved under /workspace/scratch/bed56f4334a5/browser-runtime. Restore /tmp/gcc-chromium and /root/.cache/ms-playwright symlinks if a fresh runtime cleared them. The local WebKit library links belong inside each minibrowser sys/lib because the browser launcher resets LD_LIBRARY_PATH. Use PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1 and MOZ_DISABLE_CONTENT_SANDBOX=1 only in this managed test environment. This affects the browser harness, not the game or browser-user security settings.

Run the fresh full-flow career via qa/structural-risk/career-run.mjs with isolated GCC8_TEST_REPORT_DIR and a4MiB storage budget. Strategy policy cohorts are a separate controlled experiment, not full UI careers. Four policies across8 worlds can take many minutes; keep hash-tagged outputs from every seed. The source assessment and all QA reports distinguish model consistency from historical validation.

The finalise.py compiler rejects mixed candidate hashes or missing required results. Never overwrite the final candidate while any cold-restore career harness is still reading it. Earlier private candidate evidence is under preceding-8032645 and must be labelled as such.

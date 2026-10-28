# Firefox / WebKit coverage — 2026-10-27

WebKit 26.5 (official Playwright revision2336) completed all11 actual game checks on protected v81 over local HTTP. Firefox remains blocked by this host's sandbox restrictions.

## Achieved WebKit coverage

Evidence: `lifecycle-webkit-prefix-v81.json`, `webkit-prefix-v81.log`.

All passed: native-modal reveal pause; resume on Escape; real navigation/pagehide; reveal restore after navigation; modal background-focus containment; nested modal label; opener focus return; paused-match navigation persistence; match remains paused; resume progresses match; live status populated. No page errors recorded. The protected product SHA256 remains `0f643bb049f277dd57550ad9fb8d6134c51ed102d3ffa00a53d20f68e10876e4`.

## Local runtime provisioning

Both official Playwright runtimes downloaded: Firefox153.0/rev1538 and WebKit26.5/rev2336. Initial WebKit launch lacked host libraries. Official `playwright install-deps webkit` failed with setgroups/seteuid permission errors (exit100). A follow-up approved unprivileged provisioning fetched official Ubuntu Noble main/universe package indexes over HTTPS from archive.ubuntu.com, selected30 absent packages (13.7MB), verified each package SHA256 against its official index and extracted with `dpkg-deb -x` into `/tmp/gcc-webkit-deps/prefix`. No system packages were installed. `packages-manifest.json` retains official filenames, versions and hashes; `prefix-provision.log` records extraction.

Playwright's optional-dlopen host preflight consults global ldconfig and ignores scoped LD_LIBRARY_PATH. An explicit executablePath uses `webkit-prefix-launcher.sh`, which mirrors the official WPE launcher environment and execs the unmodified official MiniBrowser binary. The official wrapper otherwise overwrites LD_LIBRARY_PATH. The scoped launcher adds extracted library paths to the official bundled paths. No browser sandbox flags, security environment overrides or global settings changed; no privilege escalation.

Run from repository root:

```sh
GCC_BROWSER_EXECUTABLE="$PWD/qa/limits-20261027/browsers/webkit-prefix-launcher.sh" GCC_ENGINE=webkit GCC_PHASE=prefix-v81 GCC8_TEST_BUILD=game/gcc_v8_product_candidate.html timeout 65s node qa/limits-20261027/browsers/lifecycle.cjs
```

`GCC8_TEST_BUILD` is relative to repository root; `GCC_PHASE` suffixes result JSON. The harness embeds its own same-process HTTP server and omits Chromium-only CDP accessibility-tree checks. Syntax validation passed.

## Remaining gaps

Firefox default headless launch starts its parent process, but content processes crash after `Sandbox: writing /proc/self/uid_map: EPERM`. A minimal launch/page smoke test could not complete (`firefox-launch.log`). No Firefox sandbox disabling or escalation was attempted. No Firefox game assertions completed.

WebKit evidence covers automated headless Linux WPE, not physical Apple hardware, iOS Safari or human screen-reader certification. It uses a fresh local HTTP origin; this is not evidence of file-origin storage portability, browser-restart persistence or installed-device storage durability. No product edits, Git or Library mutations.

## Atomic persistence candidate

Candidate `qa/limits-20261027/candidate.html`, SHA256 `c3d1693bd008571eae71c6cfdad4ba6807fe16756ac1606a0569ca4c924cfd60`, passed11/11 WebKit lifecycle checks with native Web Locks present (`lifecycle-webkit-candidate-atomic-ui-restore.json`). The harness awaits `read.checkpointReady()` after navigation/reload. Fixture setup now uses the real Career backup file chooser and confirmation flow so localStorage and IndexedDB stay consistent. Earlier direct localStorage fixture-seeding runs hit the expected recovery review; they are retained as harness-adaptation evidence, not regressions.

The same candidate passed13/13 checks with navigator.locks hidden before startup to simulate a Web Locks-absent compatibility environment (`lifecycle-webkit-candidate-no-weblocks.json`). This is a simulated API absence on actual WebKit, not a claim that this WebKit build natively lacks Web Locks. IndexedDB remained present; `read.saveCoordinated()` returnedtrue after readiness; `read.checkpointMode()` returnedstrict; a separate native IndexedDB transaction requested with strict durability reported `tx.durability === 'strict'`. Both runs recorded zero page errors.

```sh
GCC_NO_WEBLOCKS=1 GCC_BROWSER_EXECUTABLE="$PWD/qa/limits-20261027/browsers/webkit-prefix-launcher.sh" GCC_ENGINE=webkit GCC_PHASE=candidate-no-weblocks GCC8_TEST_BUILD=qa/limits-20261027/candidate.html timeout 75s node qa/limits-20261027/browsers/lifecycle.cjs
```

## Final candidate verification

Final candidate SHA256 `4a3d4d919d2fdd35d490f5e2f57359bb5fe65d209873a2f89353ee9735aa2453` passed13/13 checks with native Web Locks and13/13 with Web Locks suppressed for compatibility. Both actual WebKit26.5 runs recorded zero page errors and no harness failure. Evidence: `lifecycle-webkit-final-native.json`, `lifecycle-webkit-final-no-weblocks.json`, and corresponding `webkit-final-*.log` files. Both reported checkpointMode strict, native strict transaction durability strict and saveCoordinated true. The native run observed Web Locks true; the compatibility run observed false.

After a transient runtime reset, the official WebKit payload was downloaded again and all30 dependency packages restored from retained official filenames and SHA256 hashes using `provision-prefix-manifest.py`; see `provision-webkit-final.log` and `prefix-provision-final.log`. No system installation, privilege escalation, sandbox disabling or product edit.

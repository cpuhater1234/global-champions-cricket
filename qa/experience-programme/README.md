# Experience testing operations

Read `docs/GCC_V8_EXPERIENCE_TEST_PROGRAMME.md` and `protocol.json` before assigning an actor. The actor must receive only its neutral goal, budget and permitted transport instructions; keep product code, prior cold reports and assessor findings away from it.

Example assessor launch from repository root (Playwright and Chromium required):

```
node qa/experience-programme/native_actor.cjs game/gcc_v8_understanding_review.html NEW_UNIQUE_OUTPUT session-1
```

The process prints the viewport screenshot path; open that image before acting and accepts one JSON command per line. A native action requires `role`, accessible `name` (exact by default, `exact:false` permits partial matching), `intended_outcome`, `prediction`, `episode_id` and preferably `visible_evidence`. When a visible control cannot be targeted by accessible name, use `{"command":"click","x":100,"y":200,"prediction":"...","intended_outcome":"...","episode_id":"..."}` based on the screenshot. This native pointer route avoids confusing locator support with product usability. Optional `action` is `fill` or `select` with `value`; otherwise click. `index` disambiguates repeated visible controls. Use a predicted `scroll` command with `delta_y` (limited to800px per action) to explore below the viewport. Predictions are logged before control lookup/click. Use `{"command":"snapshot"}` to inspect a changed screen and `{"command":"note","record":{...}}` for a recap. Do not use this for bulk scripted play and call it understanding.

Close with `{"command":"close","record":{...boundary fields...}}`. The assessor passes the resulting `opaque-save.json` as the fourth CLI argument for a new session/output directory. It must use the same origin/port (default8766) to preserve the browser save. The actor may not open the opaque file. Verify the previous session ID, save reference and build in the assessment; record any migration separately. Do not run two sessions on the same port concurrently. Paths are never overwritten. On a crash, retain outputs and mark the session interrupted rather than silently restart the same trial.

The transport logs browser errors separately. A failed action may be a locator, product or timing problem; the assessor must classify it using evidence. Current snapshots are screenshot-only (no DOM text, avoiding clipped/occluded text exposure) and controls outside the viewport require explicit scrolling. The original pilot and early continuity attempts used full-page text/screens, so their discovery evidence is broader than a human viewport and must be labelled accordingly. Do not infer touch ergonomics or human search times.

For the first human batch, aim for six unfamiliar people split between cricket followers and management-game players; this is qualitative issue discovery, not a statistical success-rate study. Suggest budgets of25minutes for first entry and35minutes for the next session, permitting early stops. Offer a return to the same career after a real break, with no requirement to finish a season or praise the game. Use `human-session-record.json`, one copied record per session, with pseudonymous identifiers. No recruitment messages are sent by this tooling. Do not put identifiable participant recordings or raw saves into the repository.

Assessor output must link findings to ordered prediction/action/screen events, grade the explanation, note assistance, and report unobserved areas. Track technical correctness, understanding and human experience separately. Complete the second cold task, annual-rebuild fixture and genuine multi-session career before calling the initial operating batch complete.

Focused product regression:

```
GCC8_TEST_BUILD=game/gcc_v8_understanding_review.html node qa/v8_signing_understanding_test.mjs
```

Using the preserved `game/gcc_v8_mobile_clarity.html` baseline should fail the stored closing-summary assertion. The current candidate must pass. `node qa/experience-programme/transport_test.cjs` tests only the synthetic screenshot/action transport; it is not a GCC usability test.

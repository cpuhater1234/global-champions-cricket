# Product completion contract

21 October 2026. Scope is the existing standalone 2008–2026 cricket management game, not a new feature programme. The accepted league format, arcade direction, real venue imagery, manual XI and existing career systems remain. No wages, salary cap, online accounts or product JSON import/export are added.

Completion requires the gates below. A passing automated batch cannot close a player-observation gate. A final release candidate must have a fixed artifact digest; later changes reopen the affected gates. Historical evidence remains attached to its original build and scope.

| Gate | Acceptance criteria | Present evidence and remaining work |
| --- | --- | --- |
| Core interaction | A fresh native journey reaches the first match; draft, Scout, comparison, XI, swap, order, preview, playback, result and next-match routes work without hidden-state setup. Critical keyboard paths work. | Core-loop native journey and regressions exist. Extend with cancellations, less common routes and independent cold-player discovery. |
| Annual interaction | Actual season transition through named development/retirements, optional trades/releases, draw, annual draft and manual opening XI; cancellation does not change ownership; accepted/refused trades recover clearly; zero vacancies and supplementary/transferred picks remain valid. | Runtime coverage exists; current work makes management actions/development/effects visible and adds native yearly-transition evidence. Remaining rare paths must retain their own scope. |
| Visual system | Shared typography, spacing, action states and colour meanings; each primary screen has a focal point and clear next action. No unresolved text clipping, overlap, accidental word splitting or low contrast in tested normal/enlarged states. | Component and rendering passes exist. The whole-game design review remains open; scoped CSS changes are not full consolidation. |
| Decision understanding | A new player can explain signing versus drafting, player versus XI ratings, coverage versus quality, projected versus selected XI, and the consequences of a trade/release. A loss has factual evidence without fabricated causal claims. | Informed tests and some AI proxy evidence exist. Independent uncoached observations remain required. |
| Career experience | Returning players recover their goal after a real break; observe decline/development and rebuild deliberately; annual work stays manageable; later seasons retain meaningful decisions. | Long technical careers exist. Human pacing, attachment and voluntary return remain unestablished. |
| Cricket model | Accounting and delivery properties pass; ratings/composites/chemistry are documented; observed scoring and strategy distributions are compared against an explicit empirical reference or clearly identified as game calibration. | Strong internal consistency and scoped policy evidence. Empirical calibration, chemistry and composite interpretation remain open. Do not retune from a single match. |
| Player data | Facts, role windows, estimated skills and simulated outcomes remain distinct; priority identities have sourced facts; the remaining legacy provenance backlog is explicit. | Career variation and targeted profile corrections exist. The earlier audit left 371 legacy identities independently uncertified. UI work does not close this. |
| Persistence | Current/legacy saves, failed writes/restores, stale instances, annual boundaries, finals and career ending preserve truth. Known simultaneous-write limits are documented. | Extensive runtime and some native evidence. Final target-browser checks still required. |
| Platform/accessibility | Supported browser/device matrix declared and exercised; real keyboard/touch comfort, focus, table scrolling, enlarged text, reduced motion and spoken screen-reader output reviewed. | Linux Chromium strongest. Windows Chrome/Edge, Safari, physical touch and speech remain open. |
| Venue delivery | Correct venue and fallback, stable home randomisation, real successful downloads, slow/failing network behavior and licence metadata checked on supported browsers. | Routing/fallback checks exist. Deterministic image-blocked sweeps do not close actual delivery. |
| Packaging/reproducibility | One current playable and documented source/build; clean reconstruction, reproducible QA setup, pinned dependencies and clear save/update guidance. Only verified release branch/artifact promoted. | Connector-backed working branch and exact-build evidence exist. Complete clean-checkout release rehearsal remains open. |

## Observation batch

Use the existing first-player playtest protocol. Start with five independent human participants spanning cricket knowledge and management-game familiarity. This is an initial discovery batch, not a statistically representative approval rate. Do not coach navigation or select their XI. Record wrong turns, questions, predictions, recovery, task completion and assistance separately.

Session one covers club selection, signing, drafting, a manual XI and a match. A later session resumes the same career after a genuine break. Include a season transition and later-career checkpoint, explicitly distinguishing checkpoint comprehension from a genuinely played long career. Ask whether they wish to continue before assigning more tasks. Voluntary continuation is not established by obeying the next instruction.

Critical product blockers found in the batch must be repaired and independently retested. Record comprehension, frustration, pace and attachment in participants' own words. Do not describe an AI actor's completion as human enjoyment.

## Order of work

1. Complete annual-flow presentation and native transition/cancellation tests.
2. Carry the interaction standard through remaining critical dialogs and later-career screens; consolidate affected component styling where safe.
3. Run the independent comprehension/return batch and repair its findings.
4. Close model/provenance work against explicit evidence rather than silently calling estimates historical facts.
5. Run the declared platform, venue and clean-build release rehearsal on one fixed candidate.

A checkpoint may be delivered while gates remain open, but it must name the open gates and must not be labelled completed, elite, perfected or release-ready on the strength of automated counts alone.

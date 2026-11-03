# Build46 independent flow re-review

**Build46 materially improves decision order. Its first candidate had a real dead-end consequence review route; the corrected candidate now passes the focused interaction regression. Native46 layout remains unreviewed.** I would provisionally assess the source-level flow at **7/10**, subject to native verification and deliverable refresh; this is a subjective assessment, not a release certificate.

## Evidence and scope

I reviewed current `decision-ui.js`, the canonical management and controller guards, all three panel46 contracts, the management/consequence transforms, compiled `deliver/GCC_v8_Playtest_46.html`, and the root hierarchy edit script. I ran hierarchy, management and consequence contracts; all passed. I also independently reproduced a missing route and created a focused regression test. No product code was edited by this review. I have not seen Build46 in a native browser and cannot infer fold position, readable density or focus visibility from generated HTML strings. The existing45 native captures remain45 evidence. No46 match was played natively and no dense offseason was operated here.

## Assessment against my five Build45 criticisms

| Build45 concern | Build46 assessment |
| --- | --- |
| Continuation outruns consequences | Structural improvement: outcome headline precedes complete consequence counts, disclosure and continuation; consequence list no longer truncates to three. Initial candidate review buttons opened a dossier without Management; see regression below. Native fold/readability unverified. |
| Generic promises bury contextual response | Strong structural improvement: medical state, active promise and transfer/rotation response lead; supporting context and optional promises have native disclosures. Terms and pending-swap/team-only-rest guards survive the tested cases. There is a tradeoff: Why this matters is now inside context, so native review should confirm the player still understands the reason before choosing a response. |
| Season diagnosis fails to travel into recruitment | Still open. No reviewed46 change carries the previous season's specific phase weakness into Prepare your squad / annual draft. No offseason/native evidence closes this. This is a continuity gap, not a newly introduced bug. |
| Deadline-bearing trade route is below supporting material | Source ordering fixed: trade entry is after campaign overview and before fixture. Native2009 first-viewport visibility and crowded-state behavior remain unverified. |
| Targeted next fixture lacks onward route | Source fixed using existing guarded seasonTab to Matchday, retaining normal XI readiness checks. Contract confirms the command and no cricket-state change. Native focus/scroll transition needs verification;45's successful jump alone cannot certify46. |

## Concrete regression found independently

**Consequence “Review [player]” initially opened an incomplete report from the result screen.**

The generated consequence item called `inspect`. That command is globally permitted, but `managementPlayer` accepted only team/season/dynasty/finals. From `ui.view='result'`, it returned an empty string, so the dossier rendered Overview and Attributes with no Management tab. The new consequence route let a manager scout ability but not inspect the commitment/trust context that caused the alert.

Offline reproduction against compiled46 after one generated fixture returned:

- `managementFromResult: ''`
- `dossierHasManagementTab: false`
- `inspectDispatch: true`
- `playerTab: 'overview'`
- No host errors

`qa/panel46/result-management.mjs` fails on the missing Management tab in that first compiled46 candidate. Existing consequence contracts only checked that action markup existed; they did not exercise the actual report route. This is why their passing status did not close the interaction.

The coordinated correction should permit result management review and guarded relationship decisions, preserve team-only XI edits/rest, and handle the trade follow-on route as well. Merely exposing Management would otherwise reveal an Explore a trade button that `manageTrade` rejects from result. Root implemented the correction. I reran the focused test against rebuilt `qa/perfection-20261030/candidate.html`: PASS. It exercises regular inspect then Management, direct manageInspect, commitment creation, team-only rest rejection, closed2008 trade rejection retaining result, pending-swap rejection, and unchanged XI/order/results/stats. Host errors were empty. At that verification moment `deliver/GCC_v8_Playtest_46.html` still carried the old guard, so the corrected candidate must be copied/reverified before delivery. Open-window trade transition was source-reviewed but not exercised in this focused test.

## Remaining verification before stronger sign-off

1. Copy the verified candidate into the deliverable and run the focused regression against that exact file: inspect/direct-management route, commitment action, rest rejection, closed-window rejection and pending-swap rejection must all pass without changing match/selection facts.
2. In native46 at 390×844, verify a result with mixed consequences: read outcome, recognize urgent consequence count, open complete list, review an affected player's management and return to the same result with the continuation reachable.
3. Verify fixture Prepare match returns to a sensible Matchday position with no unintended simulation; verify deadline notice in2009 with populated squad decisions.
4. Inspect management report with medical state plus active promise and request. The actionable sequence is better in source, but long promise terms and the existing batting-position editor could still push important actions down on a phone.
5. Play a real offseason before making an accumulated-career claim. The current phase-to-recruitment handoff is still thin.

The46 direction addresses four specific criticisms using existing systems. It does not establish10/10 polish, exhaustive play coverage, career balance, or a completed long-career flow.

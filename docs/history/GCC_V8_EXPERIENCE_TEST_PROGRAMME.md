# Experience testing programme

## Purpose

Treat player understanding and sustained experience as separate acceptance work alongside front-end and simulation correctness. A career that completes, a plausible AI explanation or a large assertion count cannot establish human enjoyment.

The existing `GCC_V8_FIRST_PLAYER_PLAYTEST.md` remains the human observation script. This programme adds a source-blind AI lane that can run now, a returning-career lane, and an independent evidence assessor. No player recruitment, external messages or telemetry collection is authorized by this document.

## Three complementary lanes

| Lane | Method | Valid conclusion |
| --- | --- | --- |
| Cold understanding | Fresh AI evaluator, new save, rendered UI only, neutral task, predictions before actions | Discoverability and comprehension failures encountered by this AI evaluator |
| Returning career | Same save and only the evaluator’s own notes across bounded sessions; inspect real setbacks and annual transitions | Administrative repetition, visible tradeoffs, unclear consequences and missing reasons to make another decision |
| Technical integrity | Informed deterministic tests, save/clock/ledger checks and appropriate native layout/interaction checks | Whether the system behaves correctly and survives its tested boundaries |

Human sessions use the same task and observation format. Their actual misunderstanding, willingness to continue and later voluntary return provide evidence the AI lanes cannot supply.

## Keep the actor and assessor separate

The cold actor receives only the playable build and a task such as “Take over a club and build a squad you would want to manage.” Give no button names, optimal XI, walkthrough, bug list, source files, engine APIs, hidden state or developer explanation. Do not ask an AI to impersonate a demographic or claim human emotions.

The actor may inspect screenshots and visible text, use accessible controls, scroll and make normal UI actions. It may not dispatch commands directly, query product objects or inspect hidden DOM data. Offscreen information requires deliberate navigation or scrolling. If accessible automation encounters hidden duplicates, classify that as a harness problem until a visible-interface failure is demonstrated.

An informed assessor separately checks predictions against the visible result and, when necessary, source-owned state/scorebook evidence. The assessor never coaches the actor during an unassisted run. If a hint is given, timestamp the intervention and mark the remainder assisted. Do not count the same agent’s later run as an independent first-time encounter.

Store a build digest, tool configuration, viewport, ordered actions, predictions, screenshots and stop reason. Browser storage may be captured opaquely by the harness for replay; the actor must not inspect it. Separate restarted random worlds into different trials. Controlled build comparisons need the same starting world and task; varying worlds are robustness samples, not clean A/B evidence.

## Initial operating batch

1. Run two independent cold-entry trials. One explores club selection, signing interpretation and drafting. Another completes manual XI selection and reaches a first match. Use neutral goals rather than instructions naming the controls to exercise.
2. Run a distinct season-two comprehension trial with a legitimate completed-season fixture. Explicitly label the fixture: it tests rebuilding comprehension, not attachment to a team the actor built.
3. Run one returning career through actual play. Predeclare action/time budgets for each session. Aim to establish a squad and play opening matches, then resume the same save and observe setbacks and annual rebuilding when actually reached. Record unreached milestones; do not extend sessions until a preferred narrative appears. Before replaying prior notes, record an unaided recap of the club, stage and intended next action. Then allow the actor’s own notes. A prepared season-twelve screen is a navigation sample, not a longitudinal enjoyment test.
4. Have the independent assessor validate the named findings. Reproduce a confirmed issue, repair its cause, add the appropriate regression, and use a fresh cold actor to check whether the cue now works.
5. Add more worlds, clubs and strategies after the small batch is reliable. Do not multiply an unreliable harness into a large pseudo-sample.

## What to record

**Comprehension:** before a consequential click, record intended outcome, expected consequence, visible evidence and uncertainty. Afterwards record the actual consequence and whether the expectation changed. Important concepts include league commitments versus club recruitment; roster versus XI; hard selection requirements versus advisory balance; what ratings estimate; optional retention/trading/releases; pick costs; and uncertain future development.

**Friction episodes:** group attempts toward one intended outcome. Record wrong turns, failed attempts, lost context, required assistance and important below-fold or disclosed information that was missed. Keep browser-selector errors, infrastructure delays, app defects and actor misunderstanding distinct. AI task times are diagnostic and must not be presented as human completion times.

**Decision consequence:** record the visible alternatives, the stated tradeoff, what changed and whether the actor could locate the evidence. Grade explanations as supported, partly supported, unsupported, incorrect or unassessed. A convincing claim that a selection caused a defeat is not established by a scorebook correlation alone.

**Repetition and agency:** identify meaningful decision episodes versus administration. Stable navigation and retaining a successful XI are not boredom by themselves. Look for stretches with no discernible new tradeoff, the same strategy winning regardless of conditions, excessive steps to apply an understood change, and feedback that never reveals whether a plan mattered. Validate dominance with multi-world policy tests; do not infer it from one career or rating sum.

**Visible continuation hooks:** at a session boundary, ask what unresolved management goal is actually supported by the game, and what evidence would change the next decision. Record when no such goal can be identified. Distinguish spontaneous goals from goals elicited by a prompt. Use the neutral boundary prompt “Stop here or continue? What would you do next?” rather than requiring the actor to invent a reason to continue. AI willingness to continue is goal-directed model behavior, not a player-retention or enjoyment measurement.

## Human evidence for enjoyment

Use a small initial mix of cricket followers and management-game players unfamiliar with GCC. Observe uncoached tasks, allow stopping, then invite an optional return to the same career. Record stops, actual returns and reasons. Do not require nineteen seasons and then call completion voluntary retention. A convenience sample finds problems; it cannot estimate population retention.

Ask concrete questions after observed moments: “What did you expect?”, “What would you change?”, “What are you looking forward to managing next?” Keep enjoyment self-report alongside behavior and specific reasons. Reward neither action volume nor praise. No participant observations or subjective scores may be fabricated by AI.

## Cadence and acceptance

For each change, run relevant deterministic front-end/domain checks and the affected native task. For a reviewable candidate, include a fresh cold task and a returning-save task. Changes to career, simulation or persistence require the corresponding long-run boundary tests; presentation changes require actual final-layout checks and explicit code-identity/scope records where previous engine evidence is reused. Existing broad suites remain a separate gate.

Track three statuses independently: technical integrity, understanding findings, and human experience evidence. Never average them into a “fun score.” Block promotion for unrecoverable progress, unreadable essential information, unexpected confirmed transactions, or a reproducible inability to complete a core task. Repeated independent misunderstandings receive priority. Compare named failures before and after a change, rather than inventing percentage thresholds without a baseline.

## Current pilot

A first source-blind AI entry probe was run on mobile-clarity build `4e3e50ca51c1759f1a410494a4a8cc473dfd671cef1450eeca81397bf4737afa`. It reached two draft picks across two fresh trial attempts and found a literal signing-count contradiction: future debutants were included as declined invitations in the closing wire. The assessor reproduced the defect independently; the regression failed on the baseline. The source fix corrects new event text and displays corrected counts for old completed signing saves without rewriting player state. The original journal is retained at `qa/experience-programme/blind-entry/observations.md`. The actor’s later continuity probe is not an independent retest. Full-page text/screens exposed below-fold content in the original pilot; it cannot establish viewport discovery. The revised harness uses viewport screenshots only and explicit scrolling. An intermediate viewport-text extractor still leaked text clipped inside scroll panels; independent review reproduced this, so DOM text output was removed entirely. Harness failures and overwritten first-trial screenshots limit the entry evidence; no novice pass rate is reported.

The new `qa/experience-programme/native_actor.cjs` transport records predictions before native actions, ordered event IDs, screenshots and session metadata. It refuses existing output directories and captures browser storage opaquely at close for the next session. It exposes no product evaluator or debug API. Raw saves/screens stay local; only selected reports belong in Git. `protocol.json` defines boundary fields and `human-session-record.json` provides an observation template. These tools operationalise the programme; they do not establish sustained human enjoyment.

The same career was resumed again and reached a15-player squad after39 successful native actions. The actor consulted projected XI analysis and used a weak death-batting estimate to inform finishing recruitment. It stopped at XI0/11 with role-locator limitations near the40-action budget; no match was played. `session3-assessment.md` and `continuity-evidence.json` preserve the exact scope. The intermediate viewport-text transport still allowed clipped-text leakage; current screenshot-only transport adds native coordinate clicks so future actors can target visible controls without guessing accessible names. That corrected transport is verified on a synthetic page, not yet credited with a GCC trial. The second cold actor, annual fixture, longer returning career and human sessions remain pending.

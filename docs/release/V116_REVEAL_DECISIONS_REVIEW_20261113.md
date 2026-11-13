# GCC reveal and squad decisions review

13 November 2026. Bounded continuation of the whole-interface audit.

## Candidate

GCC_v116_Reveal_Decisions_Review.html, 6,654,888 bytes.

SHA-256:381b5bb20f17273abe1e0c547fd253356349ed91224482a95567c7509273fab2.

Baseline:GCC_v116_Roster_Analysis_Review.html, SHA-25694a4d771548cbba76798461bf73bd2f888c12e9fed4bda6e6b7b2bd99a7faf41.

## Scope and ownership

Decision panels retain every player name, status, reason and Review action. Three initially visible decisions and the existing disclosure remain. Padding, row gaps and heading spacing are reduced in existing charcoal and decision owners. Review controls have a44px minimum.

Club invitation floors reduce410→320px and mobile390→300px. These are minimums, not forced heights: cards expand for long club and ground names. Sealed invitations retain their hidden complete card reserve. The scoped invitation header rule leaves club selection untouched.

Draw controls reduce outer padding and gaps. The pace and Next cells keep their overlapping grid position, disabled states, inert and ARIA gates. Mobile pace controls use icons above complete labels; an earlier horizontal layout was rejected after its320px screenshot broke labels into fragments. Snake-draft explanation text remains in full, with tighter padding.

All22 script blocks are byte-identical to baseline.17 existing style blocks remain. Four existing owners change; no stylesheet is added. This pass does not import whole maintained CSS, which contains unrelated undelivered layout changes.

## Native verification

Run43285041894 passed170 native before/after states with no action/page errors or recorded containment failures. That run failed while publishing evidence due to conflicting binary screenshots from a cancelled run; it is not cited as a fully successful workflow. Evidence paths now include each run ID.

[Final run43285856307](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/43285856307) passed all steps, including evidence publication:200 paired native states, no reported failures or page/action errors.

- Widths1440,1150,768,390and320px.
- Fresh club reveal: sealed, actual timer-driven partial, completed.
- Foundation and annual order: sealed and completed.
- Legal annual-XI, selected-XI and Matchday decisions: collapsed, expanded and actual management Review dialogs.
- Historical finals-ready decisions: collapsed, expanded and management dialog, explicitly reconstructed from completed real finalists/results.
- Eight-card count, within-build sealed/revealed geometry, all revealed club/ground text and decision/dialog text/action parity preserved.
- Pace/Next disabled, inert and ARIA states and actual keyboard Tab gating verified. Candidate control text fit,44px minima, equal heights, card-content and decision-row child bounds passed. No document horizontal overflow.
- The actual offseason surface had no visible decision panel; this is a recorded omission, not fabricated coverage.

| Measured area | Before | After |
|---|---:|---:|
| Desktop invitation card,1440/1150px |410px|378.3px|
| Invitation card,390px |390px|349.5px|
| Invitation card,320px |390px|371.9px|
| Draw controls,320px |275.0px|169.2px|
| First order card vertical position,320px |768.0px|626.6px|
| Selected-XI decision panel,1150px |499.2px|443.2px|
| Selected-XI decision panel,320px |703.3px|623.2px|
| Matchday decision panel,390px |411.3px|360.0px|
| Historical finals decision panel,320px |738.3px|615.5px|

Measurements describe this pinned test world; variable content can require taller cards. Order-card minimums are unchanged. Some desktop Matchday panel height is determined by the adjacent fixture, so tighter decision content does not always reduce the entire grid row equally.

The primary reviewer inspected final desktop and320px renders of club reveal, draft order, XI decisions, Matchday and historical finals. Mobile reveal labels are now readable without fragmented words; decision text and Review actions remain contained. This is suitable for a bounded review candidate.

The independent reviewer completed a static risk review and found no code-level blocker, but their final visual turn was interrupted by workspace credits. No independent final visual approval is claimed. The200-state native run and primary visual inspection are complete. Full-page XI captures retain the existing long mobile scrolling; this pass does not claim to solve that separately tracked issue.

Tests use private disposable contexts, a pinned fresh-game seed and an actual generated2009 career progressed legally through annual drafting, manual XI selection and Matchday. Historical finals-ready presentation is explicitly reconstructed from completed finalists/results, not presented as a live finals transition. No user career, match, XI or trade action is performed.

## Limits

This remains a review candidate, not whole-game aesthetic approval. The prior71/100 portfolio assessment is not rescored by this bounded pass. Mobile XI length, trade/player spacing, some match-specific surfaces and long-club-name live alignment remain in the audit backlog. Full maintained-source/build parity remains unverified. Main and the frozen release remain unpromoted.

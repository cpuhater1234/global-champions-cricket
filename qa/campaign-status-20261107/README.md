# Campaign status and sports presentation

User direction: 4th with useful season context; sports record 1-1; recent form aligned. See checkpoint for logic, tests and pending browser acceptance.

Run: node qa/campaign-status-20261107/race.test.cjs v8/ui/decision-ui.js

The flow solver is checked against every win/loss assignment for 600 seeded fixture sets; equal points permit both NRR orderings while matches remain. Clinched/eliminated are definitive only when those possibilities support the call. Narrative labels are stage descriptions.

After download verify 4th / 1-1, meaningful context, common label/value/footer baselines and five form chips without overflow on desktop/phone. Continue remaining v102 audit. No full source rebuild ran in the partial checkout.

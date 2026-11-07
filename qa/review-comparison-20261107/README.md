# Anchored season comparison

Native v105 tests accepted phone archive fixes, live2009 wrap and updated review metrics. native-v105.md records evidence and remaining scope.

v106 moves the existing comparison into the summary footer with a divider. It is computed once and omitted when empty. Current localhost test save is on2009 review; check candidate by Continue career, without replaying a season.

Run: node qa/review-comparison-20261107/render.test.cjs v8/ui/screens.js v8/ui/decision-ui.js

Visual acceptance pending download. Check desktop/phone footer placement, single comparison text and overflow. No full source rebuild in partial checkout. Exact substitutions and syntax/asset verification are recorded in changes.json and verification.json.

# GCC Decision UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Coordinate draft, XI and matchday around clear decisions and authentic club identity.

**Architecture:** New presentation-only module delegates all actions to the existing controller. Scoped component stylesheet owns new structural classes; legacy secondary screens remain covered by the existing semantic stylesheet.

**Tech Stack:** Self-contained HTML, JavaScript, CSS, existing VM test host.

**Spec:** docs/superpowers/specs/2026-10-30-gcc-decision-ui.md

## Global Constraints

- Preserve gameplay, RNG, save schema, player values and manual XI rules.
- Preserve action names, argument shapes, focus IDs and pending-swap locks.
- Charcoal structural surfaces, authentic club colours and readable functional cricket icons.
- Do not claim new-build rendered signoff until browser inspection.

## Review Focus

- Pending swap must not allow selection or match launch through new controls.
- Long names and narrow viewports must retain useful text widths.
- Empty/partial XI must show a disabled continuation action.
- CPU draft turns must disable all player pick actions.
- Venue/club text uses contrast-correct ink; colours do not communicate state alone.

## Task 1: Presentation contracts and module

Files: create v8/ui/decision-ui.js, qa/decision-ui-20261030/contracts.mjs; modify builder injection.

- [ ] Add renderer contract checks, run before new module to demonstrate missing implementation.
- [ ] Implement draft and XI views, shared heading/icons and fixture composition using existing data/action interfaces.
- [ ] Run contracts and all-script syntax checks.

## Task 2: Coordinated layout

Files: create v8/ui/decision-ui.css.

- [ ] Define explicit grid, typography, card and club identity component rules.
- [ ] Implement mobile stacking/tabs and stable focus/disabled/hover states.
- [ ] Check source specificity, narrow-container rules and semantic contrasts.

## Task 3: Review and delivery

- [ ] Run integrity/rating regression and engine hash comparison.
- [ ] Independent source review; resolve important findings.
- [ ] Save reproducible source to candidate branch and updated playable to same file identity.
- [ ] Report completed checks separately from rendered checks still pending download.

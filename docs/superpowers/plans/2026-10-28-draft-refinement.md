# Draft refinement Implementation Plan
> **For agentic workers:** Use superpowers:executing-plans for inline implementation.
**Goal:** Deliver the requested solid-colour visual direction and stable drafting UI.
**Architecture:** Patch presentation scripts11/12/13/17 and stylesheet from pinned v96; preserve other16 scripts byte-for-byte.
**Tech Stack:** Standalone HTML/CSS/JS, Python build, Chromium/Playwright.
**Spec:** docs/superpowers/specs/2026-10-28-draft-refinement-design.md

## Global Constraints
No simulation/save changes. No role quotas. No cream/mint theme. Existing cricket artwork only.
## Review Focus
Long club names; enlarged text; automatic reveal completion; zero/full squads; native controls and reduced motion.

- [x] Reproduce signing gap, reveal movement, unclear own-pick and old tracker against v96 (RED.json).
- [x] Implement stable tickets/actions, compact bars, palette and feedback in isolated QA candidate.
- [x] Run focused geometry matrix, four foundation drafts, two annual drafts,84 screen cases and visual colour checks.
- [x] Independent review; correct dark-field placeholder and cover paused plus running reveals.
- [ ] Publish branch and update saved playable; verify exact hashes and alias consistency.

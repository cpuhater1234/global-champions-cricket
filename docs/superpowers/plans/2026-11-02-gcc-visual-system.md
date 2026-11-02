# GCC Visual System Implementation Plan

> For agentic workers: execute bounded tasks with the assigned specialist owners; root integrates and verifies.

**Goal:** Replace inconsistent visual treatment with a coherent first visual-system pass across app, career overview and player reports.
**Architecture:** Keep the pinned single-file builder and existing handlers. Consolidate existing final CSS in place; root owns generated markup changes. Preserve authored club and rating colours, approved assets, engine and save behaviour.
**Tech Stack:** Offline HTML/CSS/JavaScript, Python builder, command-host contracts, connected Chrome captures.
**Spec:** qa/visual-team-20261102/art-direction.md and engineering.md, with current screenshot evidence in captures/.

## Global Constraints

No cream, highlighter neon, replacement crest/icons, auto XI, backup UI or engine/ratings changes. Club theme remains strong. Browser findings must name the actual build; source risks are not rendered defects. No perfection claim.

## Review Focus

- Very dark/bright club colours: use contrast-aware ink and neutral outlines.
- Long player names/roles: identity must wrap without separating rating or close control.
- Mobile/200%: source reading order and action availability remain correct.
- Saved and unsaved launcher: primary action follows career availability.
- Offseason without concerns: no empty column or duplicate actions.

## Tasks

- [ ] Shared materials/type/accent: engineering edits only arcade-charcoal.css. Root maps final decision CSS tokens to the same roots and removes superseded component rules. Verify CSS parse, contrast and unchanged core script hashes.
- [ ] Offseason composition: root wraps summary, issues and actions in named grid regions in builder; layout specialist supplies scoped responsive block. Contracts require issues before continuation, quiet state and immutable rendering.
- [ ] Player identity: root moves role/bio/rating into the sticky identity header with name and close button, preserving dialog title ID and pressed report views. Existing dossier contracts verify navigation/context; new contracts require grouped identity.
- [ ] Launcher/pane controls: root prioritises Continue when a career exists, preserves fresh-start action, adds teamPane pressed state in central button helper. New contracts test both states.
- [ ] Verification/review: rebuild20 scripts, inspect changed scripts and relevant unit/contract suites, reviewers check integrated source. Save numbered candidate, require actual new-build captures before visual sign-off. Retain uncovered route/device matrix for next passes.

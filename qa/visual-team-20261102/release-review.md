# GCC visual-system pass, Build34, 2 November 2026

## Specialist team

Six isolated specialists covered art direction, screen layout, UX/motion, frontend engineering, typography/accessibility and visual QA. Root owned Chrome, current captures, shared decisions, markup integration and release. Read-only reports distinguish source risks from actual Build33 captures. Specialists did not perform browser playthroughs.

## Agreed first-pass direction

One neutral charcoal material family across app/dialog; authored club colour and contrast-aware ink own career primary controls, selection and chrome; orange fallback before club selection. Approved crest, supplied cricket icons, club data and rating scales stay unchanged. Consistent body/metadata hierarchy, fewer decorative gradients/shadows, coherent panel framing. Existing legacy bridge rules remain and require further consolidation; this is not a complete stylesheet rewrite.

## Integrated changes

- Shared neutral surface/text/rule tokens in the existing final stylesheets; typography uses real400/700 weights; dialog titles are normal case and nonitalic. Small10/11px final-layer metadata raised to12px; report-view actions14px.
- Saved-career Continue appears first and primary, with explicit saved club background/ink aliases; fresh start remains primary only without a career. Crest remains clickable; a clear game wordmark anchors the launcher composition.
- Offseason uses named summary, issues and action regions. Desktop summary/decisions share two purposeful columns; actions follow both. Mobile stacks them in reading order. Metrics fill three equal tracks. No issues leaves no blank right column. Development remains below.
- Player name, role, bio and rating become one sticky report identity. The original dialog-title ID is moved rather than duplicated; close button and report-view controls remain intact. Body actions and content retain their existing commands.
- XI pane buttons expose pressed state, including the forced XI pane during a pending swap. Club-coloured coverage bars gain a neutral inset edge without changing counts/fills.
- Actual Chrome audit found annual draft entry retained scrollY1338 and put its heading above the viewport. Controller now distinguishes dynasty phase/pane and season tab changes from in-place refreshes; new scenes reset top, while same-scene filtering/dialog flows preserve context.

## Evidence and tests

Current Build33 captures: home, offseason top/decisions, Ryan Sidebottom Management desktop/mobile and draft. They are BEFORE evidence, not render evidence for Build34. Offseason panel is verified ahead of continuation in Build33; integrated composition differs and requires new browser captures.

Expected RED observed for saved Continue priority, absent XI pane semantics, pending-swap mismatch and phase-scroll preservation. New launcher/identity contracts pass; eight pane/guard checks pass; offseason checks include issue ordering, status rows, immutable rendering, quiet state, phase/pane reset and same-scene position retention. Existing management units, commitment contracts, dossier routes/view return/focus-target contracts, guides and archive contracts pass.

The old offline DOM stub lacked native prepend, causing the first dossier run to fail with reportHead.prepend is not a function. Added prepend to the test host, not production. Separately executed the actual production identity relocation code in a parsed DOM: one preserved title, grouped identity, bio/rating, one view group and close control all pass. Neither test host establishes real browser focus/layout.

CSS parsed with css-tree3.1.0: no parse errors in both final CSS sources. Parsed DOM check uses linkedom0.18.12. These are QA-only tools, not game dependencies. All20 scripts parse. Only scripts11,16,17,18,19 differ from Build33; delivery/foundation/medical2,9,10 are byte-identical. No ratings, RNG, cricket rules, save format or approved asset bytes changed.

## Independent integration review

Engineering caught and root fixed saved Continue ink alias inheritance. QA caught and root fixed pending-swap pressed-state mismatch. An initial suspected grid-importance conflict was withdrawn after exact-source review. Root did not implement that false positive. QA source-reviewed scene reset without finding a new modal/focus conflict.

## Open gates and next work

Build34 still needs actual desktop/mobile/zoom captures and computed contrast checks. In particular check long player identity, sticky head height, offseason quiet/concern states, saved dark-club Continue, scrolled Escape and trade→player→trade return. Current source checks are not visual sign-off.

Draft1100/1101px transition, mobile filters/companion placement, large XI density, routine-vs-decisive live event emphasis, deep scorebook/archive, finals and legacy still need focused review. The full route/device matrix remains in coverage.md. Source hypotheses are not automatically confirmed defects. Historical real-life rating calibration remains unpromoted; observed extreme scores require a larger measured realism study.

Browser career left at2013 annual draft, Gloucestershire13/15, first actual selection pending. No player was picked/released/traded in the visual-team pass. Annual list was confirmed and the draw completed.

## Reproduce QA tooling

Install QA-only packages outside the game: npm install --prefix /tmp/gcc-qa --ignore-scripts css-tree@3.1.0 linkedom@0.18.12. Set GCC_CSS_MODULE=/tmp/gcc-qa/node_modules/css-tree/lib/index.js for css-audit.mjs and GCC_DOM_MODULE=/tmp/gcc-qa/node_modules/linkedom/esm/index.js for dom-contracts.mjs. Other contracts use the existing offline host. For accessibility-contracts.mjs set GCC_FILE=qa/perfection-20261030/candidate.html.

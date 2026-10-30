# GCC visual hierarchy pass

Tom asked to proceed with the visual improvements already discussed: fewer competing boxes, consistent spacing and buttons, stronger player cards, match atmosphere and purposeful club colour. Continue the existing self-contained HTML and its established gameplay. This is a presentation pass; no engine, player ratings, RNG or save-schema changes.

Use charcoal for structural surfaces, authentic club colour for the career identity, orange for the main action, restrained role colours for player-card edges, and existing value-driven rating colours. Keep substantial outer borders; use lighter internal dividers instead of framing every child equally. Preserve visible keyboard focus and reduced-motion support.

The current browser evidence shows pale departure/pick guides, navy draft summaries, unreadable sidebar headings, excessive draft header height and inconsistent offseason panels. Move secondary offseason rules below the squad decision into a disclosure. Tighten shared headers, enlarge card names, standardise action heights, organise sidebar coverage as compact rows and use club accents on career headers/hero panels. Keep native controls and all existing action names.

Alternatives considered: additional isolated colour patches would leave the hierarchy problem; a complete replacement frontend would put working flows at unnecessary risk. Chosen implementation is a scoped shared visual layer plus a small offseason presentation reorder, within the existing renderer. This is the implementer's choice under Tom's instruction to get to it.

Verify all scripts parse, existing integrity and rating checks pass, and engine scripts remain byte-identical. Browser observations of the old downloaded file diagnose issues only. The new deliverable requires a rendered recheck after download; do not claim that source inspection proves visual perfection.

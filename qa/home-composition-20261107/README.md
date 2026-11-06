# Home composition and cascade corrections

Scope: address Tom's assessment that the home page is left-heavy, the career actions look unrelated and repeated three-card summaries feel templated. Continue the v97 alignment review without changing game behaviour.

- screens.js: change only the home renderer. Replace the three statistic cards with one compact format line. Use two-span career actions in both saved and new-career states; preserve the continue/play actions and saved-career metadata.
- composition.css: centre the home identity and introductory copy; give both actions matching shape, type and spacing, retaining their existing colour hierarchy.
- floodlit.css, broadcast.css and decision-ui.css: remove obsolete home-card and conflicting spacing rules.
- floodlit-compat.css: correct the actual high-priority mobile control rule that overrode v97's left alignment.
- decision-ui.css: stack analysis disciplines at every width, remove inherited empty tile rows and 100% tile height; use four metrics per discipline on wider screens and two on phones. Present guides as continuous reading rows, and remove card boxes from selection guidance.

Verification: all 20 script syntax checks pass; only script 17 changes and only its home renderer changes. Actual home rendering passes with and without a save; continue/play action order and two-span button structure are checked. Assets and style IDs are unchanged; CSS delimiters are balanced. No new stylesheet layer is added.

Native observations on v97: selection metrics align, selection details occupy the bench sidebar and grouped Matchday controls match. Remaining defects were traced through matching CSS rules: the max-width 480px compatibility rule still forced controls right; analysis retained two explicit tile rows and height 100%, creating blank space at tablet width.

Native acceptance of v98 remains pending download and inspection at desktop, tablet and phone widths. This environment produced the candidate from exact source-body replacements in saved v97; no new full-project build was run because the complete checkout is absent. The default pipeline consumes the same changed source files, and its canonical regression records the expected v98 hash.

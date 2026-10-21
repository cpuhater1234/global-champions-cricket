# Career clarity checkpoint

21 October 2026. Continues the verified core-loop build, SHA-256 `a9ea493eebb4ddaa6146eaaf6ece06a3e4d1e0eb85cfd00edda99b11c21f0189`. The product-completion contract is `docs/GCC_V8_PRODUCT_COMPLETION.md`; open evidence gates remain open.

## Player-facing changes

- Squad status and observed returning-player development have separate overview surfaces. The main action and vacancy/retirement counts remain together. Development is visible without opening a generic disclosure, with the complete retained-player list still expandable.
- Management rows expose Trade and Review release directly. Clicking the named player opens Scout. Age, cricket job and current ability stay together; neutral form is no longer repeated on every row. Forms and injuries remain available in Scout and non-neutral row feedback.
- Management itself has the normal Continue-to-draw route, with the existing list confirmation. Going back to the overview first is no longer necessary.
- Trade effects show estimated projected-XI batting, bowling and keeping changes before confirmation. They reuse the existing phase/profile calculations; they are not win predictions. Critical keeper/bowling/pick warnings precede benefits and remain on the final review screen before sending the offer.
- Enlarged-text review exposed overflow in step labels, management headings/names, trade labels and the new overview's minimum-width behavior. Explicit wrapping, bounded padding and responsive row layout repair these paths. No clipping/hidden-overflow workaround is used to conceal text.

No new finances, management rules, player skills, development curves, AI valuation, retirement/release policy or simulation changes. Trade acceptance and release execution retain their original guards and separate confirmation commands.

## Exact artifact and evidence

Playable: `game/gcc_v8_product_candidate.html`.

SHA-256: `fbdf332daf353070410815461ba62a112be14a4354ad82f912229cba4c679291`.

- Ten focused suites pass on a stable artifact. These include annual policy, accepted/refused trade and cancellation behavior, cold restore, critical review warnings, comparison, XI recovery and the preceding core-loop expectations.
- Eighty-four offseason browser cases cover overview, management, empty/complete trade packages, final trade review, release review and list confirmation at widths 320/390/760/1280 and root sizes 16/24/32. The specified page overflow, text escape and opaque-background text-contrast checks pass.
- The preceding core-loop expanded and result/draft sweeps rerun on this artifact: another 120 cases pass. Total final rendering cases are 204, not a count of unique user scenarios or all possible states.
- A native 390px journey begins from a genuine completed-2008 save, advances to 2009, cancels/confirms a release, reviews/edits/sends a controlled accepted same-role trade, cold-restores the changed roster, cancels list confirmation, completes the order draw and annual draft, manually selects eleven and plays the first 2009 match. No dispatch calls or state writes advance the journey. Read-only market calculations deliberately choose a generous offer to exercise acceptance, so this is not a blind strategy test.
- The final two-season runtime run completes 2008 and 2009, 28 managed league games, finals, injury reselection, six cold checkpoints and 1,735 assertions. This is one seed/club. It is not a new full-career, difficulty or enjoyment certification.
- Normal screenshots were inspected for overview, management, trade package/effects and confirmations. Deterministic browser checks block external photos and do not certify real photo delivery, touch or other browsers.

Only the offseason and controller executable script blocks change from the preceding build. The other eighteen scripts remain byte-identical. Workspace CSS changes are explicitly scoped, except wrapping of the shared offseason step guide. `qa/completion/build_candidate.py` reconstructs the exact checkpoint on the hash-verified base; matching standard-builder source modules are updated.

## Reproduction and boundaries

Generate standard foundation and completed-2009 fixtures using the existing runtime/fixture tools. Use `GCC8_TEST_BUILD=game/gcc_v8_product_candidate.html` for VM suites. `qa/completion/focused.mjs` runs the focused manifest. Browser helpers require Playwright and Chromium at `/tmp/gcc-chromium`:

- `qa/completion/offseason-browser.cjs`
- `qa/completion/native-offseason.cjs`
- `qa/core-loop/expanded.cjs` and `qa/core-loop/results.cjs` with the current build variable

Final report digests are recorded in `qa/GCC_V8_CAREER_CLARITY_EVIDENCE.json`. Core browser reports are copied into the completion evidence directory rather than overwriting the historical core-loop records on GitHub. Intermediate failed candidates are not counted as final passes.

These are informed tests. Human sessions remain zero. Model calibration, legacy player provenance, independent comprehension/return, broader visual consolidation, supported-platform and clean-release rehearsal gates are not closed by this checkpoint. Completion means satisfying those explicit criteria, not accumulating another unspecified round of polish.

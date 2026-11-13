# Live score header alignment review

User-opened reference: GCC_v116_Mobile_Draft_Review.html, SHA-256d9f497f1c58c2637f686b8e0a2bb9dff6a6ed75846142b0aa466cbd9bef54af4. Staged header candidate:9e1fec325f6d5dc08e16b79ce4cf2019e2c4aa0872d076a283cf1b1a70a01601 (6,657,151bytes). Source remains v116/canonical on the QA branch. No overwrite of the delivered file, main or frozen rollback.

## Reproduction and bounded fix

[Diagnostic43405733421](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/43405733421) pins the exact opened review hash. It invokes the existing liveScoreboard renderer using actual drawn club objects: three long/short pairings, Home/Away batting states, waiting/completed opposing innings and320/360/390/768/1440px.60 baseline fixtures plus60 injected-CSS trials,0 runner errors.54baseline states have misaligned header/score/note geometry; all60 trials align without clipping. These are labelled renderer fixtures, not claims about a played match or simulation accuracy.

Root causes: independent club headers size themselves to different wrapped-name heights, and vertically centred score boxes with differently sized waiting/score text produce unequal note positions. The existing owner10 now shares two intrinsic grid rows across both side cards with CSS subgrid, top-aligns score content, and reserves one numeric-score line for both score formats. Club titles may break long words when necessary rather than overflow. Headers use intrinsic shared height. The narrow title restores the16px size already intended by owner10 and removes added letter spacing in owner31, preventing a split Worcestershire word at320px. No new stylesheet or runtime-body change.

The exact staged candidate is being checked without CSS injection using the same renderer scenarios. Fixtures use representative233/9 at19.4overs, a240/8 opposing innings or Yet to bat, appropriate toss choice, and Death overs. The initial diagnostic phase label was a generic Opening powerplay fixture; it is not a simulation observation and is corrected in the verification fixture. Full match playback, scoring logic, screen-reader speech and persistence acceptance are outside this isolated CSS pass.

Status: exact-candidate native and bounded raster verification passed; see final result below. Current delivered/opened Mobile Draft Review remains unchanged. This new source candidate is unpromoted and will be bundled for a later review delivery.


## Exact-candidate verification and final raster review

The first exact candidate1260a9eb passed60 geometry cases in run43406299091. Raster review then identified an awkward break within Worcestershire at320px. The final correction restores the narrow title to16px with zero extra tracking in the existing owner31 media rule; owner10 already intended16px but the later owner had enlarged it to1.1rem and added tracking. Added word-range checks so a split club-name word is now a verification finding, rather than counting it only as contained text.

[Final run43406907121](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/43406907121) passed60 exact-candidate renderer cases: no alignment findings, name clipping, broken club-name words or runner/page errors. [Compact summary](live-header-probe/43406907121/summary.json); [raster evidence and raw report](live-header-probe/43406907121/). All states are candidate mode with no injected CSS. Hash9e1fec325f6d5dc08e16b79ce4cf2019e2c4aa0872d076a283cf1b1a70a01601,6,657,151bytes.17existing style owners retained; only owners10/31 differ from the delivered d9f497f1 reference; all22runtime bodies unchanged.

Five initial exact renders were inspected at320/390/768/1440, followed by the final corrected320px Royal Challengers Bengaluru/Worcestershire waiting state and Royal Challengers Bengaluru/Mumbai completed-innings state. Full Worcestershire now fits on one line within its title; both side-card header boundaries, score boxes and notes align. The other long name wraps at spaces across full words. Title weight, team colours, home-first ordering and score emphasis remain intact. No header height was fixed to a guessed line count.

This is bounded Chromium renderer evidence using three actual drawn club names, not a played-match or all-clubs/browser certification. No simulation, save/reload acceptance or speech testing was run. User-opened Mobile Draft Review remains d9f497f1…bef54af4 and is not overwritten. Header source candidate is accepted for the next review bundle, still unpromoted; main and frozen release untouched.

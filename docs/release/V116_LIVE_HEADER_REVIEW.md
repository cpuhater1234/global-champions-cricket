# Live score header alignment review

User-opened reference: GCC_v116_Mobile_Draft_Review.html, SHA-256d9f497f1c58c2637f686b8e0a2bb9dff6a6ed75846142b0aa466cbd9bef54af4. Staged header candidate:1260a9eb4e7ee2d39e60180c307d9ed73b5190396b5e0bbdb4b98421f765b66a (6,657,136bytes). Source remains v116/canonical on the QA branch. No overwrite of the delivered file, main or frozen rollback.

## Reproduction and bounded fix

[Diagnostic43405733421](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/43405733421) pins the exact opened review hash. It invokes the existing liveScoreboard renderer using actual drawn club objects: three long/short pairings, Home/Away batting states, waiting/completed opposing innings and320/360/390/768/1440px.60 baseline fixtures plus60 injected-CSS trials,0 runner errors.54baseline states have misaligned header/score/note geometry; all60 trials align without clipping. These are labelled renderer fixtures, not claims about a played match or simulation accuracy.

Root causes: independent club headers size themselves to different wrapped-name heights, and vertically centred score boxes with differently sized waiting/score text produce unequal note positions. The existing owner10 now shares two intrinsic grid rows across both side cards with CSS subgrid, top-aligns score content, and reserves one numeric-score line for both score formats. Club titles may break long words when necessary rather than overflow. No fixed header height, font-size reduction, new stylesheet or runtime-body change.

The exact staged candidate is being checked without CSS injection using the same renderer scenarios. Fixtures use representative233/9 at19.4overs, a240/8 opposing innings or Yet to bat, appropriate toss choice, and Death overs. The initial diagnostic phase label was a generic Opening powerplay fixture; it is not a simulation observation and is corrected in the verification fixture. Full match playback, scoring logic, screen-reader speech and persistence acceptance are outside this isolated CSS pass.

Status: exact-candidate native and raster verification pending. Current delivered/opened Mobile Draft Review remains unchanged. This new source candidate is unpromoted and will be bundled for a later review delivery.

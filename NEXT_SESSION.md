# V117 UI POLISH SESSION — HANDOFF STATE (2026-11-19)
# Read this first. Working dir: c:\Users\tomis\Documents\gcc-v116-ui, branch v117.
# Goal: apply the owner's visual/UI feedback game-wide ("principles, not just
# one-off fixes"), rebuild the candidate, verify, ship to PLAY_v117.html.
#
# THE OWNER'S FEEDBACK (verbatim themes to fix):
#  1. Club reveal/choose cards: big navy empty space between the stadium/crest
#     band and the COMMITTED text. Name stays left-aligned while card is centered.
#  2. Draft screen liked, but there is a GOLD BOX behind picks — remove it.
#  3. Scout dialog: "weird blue background" with sharp corners behind ratings.
#     Outlines/colors for ratings are liked — keep colors, soften prominence.
#  4. Profile: Career outlook = tiny text with too much space around it.
#     Attributes tab: 3 cards leave an empty 4th slot (grid expects 4).
#  5. Team/draft ANALYSIS screen "looks awful" — needs a real layout pass.
#  6. Selecting-a-side screen: player rectangles too big, scroll starts too early.
#  7. Essentials: big gap below the heading.
#  8. "Order and selection tools" header floats weirdly relative to its buttons.
#  9. Live match: "balls" too close to the heading above it.
# 10. Cricket wording: keep it cricket; add variance to repeated descriptions
#     (same phrases used for many players/moments).
# PRINCIPLE: apply fixes through the shared CSS/templates so every screen
# benefits — don't patch one instance.
#
# WHERE THINGS LIVE (verified this session):
# - Builder: qa/scratch_build_final.mjs — builds candidate from frozen release.
#   All patch anchors are now plain-LF matching (release was normalized to LF in
#   the work tree; git .gitattributes NOT yet pinned — see risk note below).
#   Run: node qa/scratch_build_final.mjs  → writes qa/results/... AND
#   qa/candidates/v116-authenticity-candidate.html + CANDIDATE_SHA256.txt
# - The candidate ALREADY contains all gameplay + toss + UI patches from the
#   Grok iterations (baseline 6.10, gate 0.13, dampen -0.55, pressureMult 0.00,
#   thin-margin chase rewrite REMOVED, cardGround short names, conditions
#   wording, draftNeeds stub, list density CSS, club identity CSS, outlook CSS,
#   copyFixes[], commitment/selection-line/toss patches, final #gcc-standard
#   style block). Appending more CSS patches goes at the END of the builder,
#   before fs.writeFileSync(OUT_HTML,...)  (see lines ~300-317).
# - Frozen release: 'GCC_v116_release (1).html' (root). NOTE: a stale work-tree
#   copy with LF endings (SHA A8AA0B65...) may exist; canonical is CRLF upload
#   SHA B27CF0B4... If the builder anchors fail, run: git checkout HEAD -- 'GCC_v116_release (1).html'
# - Team-screen classes (in candidate): .profile-panel .profile-head .xi-essentials
#   .selection-team-rating .profile-note .team-order-head .team-command-bar
#   .team-layout .xi-list .team-sheet-grid .team-column-head .team-detail-read
#   .swap-status .team-order-note  (each defined once; find with src.find('.class{'))
# - Club cards: .g8club .g8clubcover .g8clubbody h3{min-height:2.4em!important}
#   .g8clublocation{min-height:1.4em} .g8clubcardaction{margin-top:auto}
#   .g8clubcommit — the navy band = body flex:1 + cardaction margin-top:auto
#   stretching with dead min-heights. Fix: min-height:0 on h3/location, and
#   .g8clubcardaction{margin-top:.65rem!important} + center body text
#   (text-align:center on .g8clubbody in reveal/invitation grids).
# - Gold box behind draft picks: .gccuiPlayer::before radial gold glow
#   (role gold at ~32% opacity, inset 0) + gold border-top. Fix: display:none
#   the ::before in the draft lists, keep colored rating accents.
# - Scout dialog blue sharp boxes: .g8analysissection{background:#1d2641;
#   border:1px solid #5970b5;border-radius:8px} and .g8scoutability
#   (#212b4a bg / #5068b0 border). The dialog forces gcc-panel bg on some
#   children only; rating cells keep the blue. Fix: soften to translucent
#   slate + border-radius 10px + 1px var(--gcc-line) border, keep rating colors.
# - Profile: Career outlook is .g8scoutoutlook (already flattened to transparent
#   in builder); give it padding + max-width + font-size 15-16px. Attributes:
#   .g8skillgrid uses repeat(auto-fit,minmax(...)) producing a 4th empty slot —
#   switch to grid-template-columns:repeat(3,1fr) (or auto columns = count/3).
# - Team analysis: .g8analysistiles/.g8analysissection/.g8analysisrow +
#   .g8roleboardhead (the header that floats oddly vs buttons).
# - Essentials gap: .xi-essentials first-child margin/padding below heading.
# - Live match: heading vs balls spacing = .gcc-currentover margin-top (20px
#   found earlier) or the live-order paragraph; check .gccuiLive* rules.
# - Copy variance: commentary/description strings live in copyFixes[] in the
#   builder + engine text fns (battingJob, roleLine, commentary phrases).
#   Vary by player role/context instead of one fixed sentence.
#
# VERIFICATION TOOLS (all exist):
# - Gameplay: node qa/v116_gameplay_authenticity.mjs "qa/candidates/..." --seed=8301 --matches=300
#   (all 11 benchmarks in band on the goal build — re-run after CSS-only edits too)
# - Native save/reload: python captaincy_layer_v116.py --html <candidate> --no-hash-check
#   (already toss-aware: clicks Bat/Field if the chooser appears)
# - Static: python qa/check_candidate.py <candidate>
# - Visual: qa/run_capture.ps1 (env vars set for signing-width candidate — update
#   GCC8_EXPECT_SHA256 to the new candidate SHA) then pixel-diff env:
#   GCC8_BASELINE_DIR=qa/visual/baselines GCC8_CURRENT_DIR=qa/visual/current-candidate
#   python qa/visual/pixel-diff.py   (diffs land in qa/visual/diffs/report.json)
# - Screenshots for eyeballing: read qa/visual/current-candidate/<screen>-<w>x<h>.png
#   (read tool renders images — USE THIS to visually confirm each fix)
# - Hash helpers: qa/scratch_final_check.py
#
# SHIP STEP: Copy candidate → PLAY_v117.html (root), commit, push origin v117.
# Last shipped playable SHA: 3B1F153C91D0BEFB9EF22681797D66507587F554C0A429933D98239B162557D5
# (user has already downloaded this; new fixes will need a fresh download.)
#
# KNOWN GOTCHAS (from this session's dead ends — do NOT repeat):
# - git autocrlf=true: tracked .mjs/.py may be CRLF in work tree; use
#   python qa/restore_audit.py pattern (git show HEAD:file) if a file looks
#   corrupted mid-edit. NEVER normalize the release HTML in the work tree and
#   commit it — the canonical artifact must stay byte-identical (CRLF).
# - PowerShell eats "$env:X='...';" inside -Command strings when quoted oddly —
#   always write a .ps1 file and run it with -File.
# - Long single-line HTML: use src.find(...) + window slices, not regex over
#   the whole file (catastrophic backtracking risk).
# - The toss chooser: dispatch('playMatch') may stop at the Bat/Field modal.
#   Native runner handles it; any new probe must too.
# - User plays from the DOWNLOADED file — after shipping, tell them to
#   re-download PLAY_v117.html from the v117 branch.

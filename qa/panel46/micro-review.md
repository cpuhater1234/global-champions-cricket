# Build46 independent visual-craft source review

**Verdict: source changes address the45 hierarchy criticisms; native layout acceptance remains open.** No confirmed blocker found in this bounded source pass. I do not upgrade the45 observed7.2/10 on source changes alone and do not assert46 geometry. No product edits made.

## Effective improvements

- Matchday emits matchup teams before conditions and the venue. Terminal CSS reduces the venue to a76px thumbnail column and14px secondary name; team names are24px desktop/20px mobile. This directly addresses the45 stadium-dominates-matchup problem.
- XI venue is a closed native details disclosure. The terminal mobile heading removes the icon/kicker and reduces title/status framing. Order controls survive.
- Management removes the batting-order editor only on the Management tab, removes the redundant YOUR RELATIONSHIP label, and puts medical/active commitment/action state before closed supporting context. Optional promises remain explicitly discoverable; active promises suppress that catalogue. This addresses the actual45 Kemp capture’s buried commitment.
- Result consequence count and urgency precede the advance control, which precedes the full score panels. Quiet state is compact; detailed event rows remain accessible through a summary rather than growing the entire results page by default.
- A terminal important open-summary rule now repairs the45 Menu persistent-open polish issue.

## Remaining acceptance gaps, ranked

1. **P2  - 360-390px XI name-column compression needs native verification.** Four columns are16px / flexible name /30px rating /140px actions with18px total gaps and20px row padding. The three44px actions plus4px internal gaps fit their140px track exactly, so this is not a demonstrated action overflow. The remaining name track is nevertheless narrow after page/panel insets; `overflow-wrap:anywhere` prevents overflow by allowing unattractive mid-name breaks. The≤359px fallback moves actions to a second row, creating a sharp density change at360px. **Acceptance:** capture359,360,374,390px with long names, role warnings and selection pulses; no clipped focus rings or interleaved columns,44px targets, and no single-letter name stacks. Show the first three complete batting-order rows at390×844. If360-374px is cramped, move the second-row breakpoint upward rather than shrink targets/type.

2. **P2  -  Management’s intended first-screen win is not yet demonstrated.** Source ordering is materially better, but identity length, two-row tab layout below375px, medical notes, active commitment terms and button wrapping can still accumulate. **Acceptance:** at390×844 show Kemp’s complete active commitment count after choosing Management; at320×568 retain discoverable medical replacement/rotation actions with no horizontal overflow. Verify the editor still appears on Overview/Attributes for a selected player and remains absent on Management.

3. **P2  -  Result advance ordering needs native mixed-consequence inspection.** DOM ordering is correct, but string tests cannot establish whether the consequence count, urgency and advance button coexist in the initial viewport, or whether an expanded multi-event list makes the next action hard to find. **Acceptance:**390×844 and1150×666 quiet, positive-only and mixed urgent results; initial count/urgency plus advance action legible together; expanded list scrolls normally with readable player actions and no clipping.

4. **P3  -  Matchday compact venue and card wrapping require the long-name check.** Source puts the right content first but the mobile team name uses normal overflow wrapping and columns remain side by side. **Acceptance:**320px/390px and1150×666 with Maharaja Yadavindra Singh International Cricket Stadium and long club names; complete two-team identity and match action visible, venue secondary and no clipped badge/name. Do not infer this from45 screenshots.

## Verification scope

Read maintained decision-ui.css/js, the management/consequence transforms and contracts, and compiled46 effective style blocks. Management contracts were executed against `deliver/GCC_v8_Playtest_46.html` and passed. The hierarchy candidate-path test passed, and the isolated consequence contract test passed. Existing hierarchy test hardcodes the candidate path, so its green result alone does not prove compiled46 parity. Source checks establish order and declarations, not rendered geometry, pointer behavior or native focus.

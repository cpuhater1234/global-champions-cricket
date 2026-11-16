# v7.9.1: self-audit of the implemented presentation

The v7.9.0 functional checks did not establish that its new CSS definitions won
the browser cascade. A source audit found five concrete missed conflicts:

| Component | Winning v7.9.0 declaration | Corrected definition |
|---|---|---|
| Waiting Grand Final | Legacy championship `min-height:220px!important` and dark event treatment | Waiting state owns 76px and a light surface; championship styling excludes the waiting state |
| XI role text | Legacy 10px important declaration | Component owns 12px role text |
| Result club labels | Legacy 9px important text and gold/uppercase treatment | Component owns 13px labels and white, normal-case text |
| XI feedback note | Legacy 10.5px important declaration | Component owns 12px note text |
| Swap feedback | More-specific batting-slot arrival animation wins | Exact batting-slot component owns stable feedback without fading |

The conflicting legacy declarations were removed rather than defeated by more
important overrides. A proposed hidden-button defect was ruled out: the existing
global `[hidden]{display:none!important}` already protects that state. Its test
now includes this global rule, and no redundant hidden-button fix is shipped.

`qa/test_recovery_cascade.py` resolves importance, specificity and source order
for curated selectors known to match these actual component paths. Five genuine
failures were reproduced before correction. The final seven checks also cover
the existing hidden-state gate and narrow sheet stacking. They are not a complete
CSS selector engine, a renderer, or proof of complete responsive layout.

## Verification

- Seven cascade checks, five protected-source checks and four migration checks passed.
- All 21 controlled interaction checks passed against v7.9.1.
- All 45 targeted functional stress checks passed against v7.9.1.
- All ten runtime scripts equal the fully tested v7.9.0 scripts after normalising only the UI-version label. No simulation, trade, save or interaction logic changed in this correction. The 1,702-check full-career run belongs to v7.9.0 and was not repeated for CSS-only changes.
- v7.9.1 SHA256: `054c5cca9ce7936756a0a0e90612008d294f459179dfdf925194c2338365f0fe`.

Playable file: `game/global_champions_cricket_v7_9_1_cascade_checked.html`.
Evidence: `qa/v791_script_equivalence.json`, `qa/v791_offline_game_stress_results.json`
and `qa/v791_interaction_results.txt`.

Real browser layout, animated transitions and latency remain unverified for this
candidate. Those limits do not prevent source and control defects from being
found and corrected independently.

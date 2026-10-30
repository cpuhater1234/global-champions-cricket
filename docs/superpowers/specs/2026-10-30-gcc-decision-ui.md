# GCC coordinated decision UI

Implement the user's approved direction following the blunt UI assessment: restore club identity, align complete screens, establish decision/evidence/detail hierarchy, make cricket icons readable and remove floating controls. Draft, XI and matchday establish the reference system. Preserve all gameplay rules, RNG, player ratings, manual selection, saves and action names.

Architecture: a dedicated presentation module and stylesheet own the three reference screens. New gccui component classes avoid accidental legacy selector inheritance. Keep existing semantic styles for secondary screens. The builder injects this module before the controller and its stylesheet last; it does not change engine scripts. Existing controller action dispatch and validation remain authoritative.

Draft: compact heading, pick status/action bar, search inside the player workspace, club-themed squad companion. Help sits below the workspace. Fixed card identity locations; role icons and colour accents support numbers rather than competing with them.

XI: heading, venue and selection/action strip, two aligned roster columns; management brief below the workspace. Preserve mobile squad/XI tabs, swap state, arrows, keyboard labels and pending-swap locks. No automatic XI feature added.

Matchday: substantial venue image in the fixture header, authentic home/away colour panels, conditions/readiness/action footer. Management decisions in adjacent secondary column on desktop, stacked on mobile. Essential actions remain close to their evidence.

Shared: neutral charcoal structure, club colour for ownership/selected state, orange primary actions, semantic status colours, consistent type/spacing and 22px functional icons. Existing cricket art remains; new code-native line icons provide readable small-scale symbols. No icon-only navigation without accessible names. Reduced motion and visible focus remain.

Verification: syntax all scripts; meaningful renderer contract checks for empty/partial/full XI, pending swap, injured player, CPU/user draft turn and match readiness. Engine source hashes unchanged. Source review independently checks responsive CSS and existing-controller compatibility. Actual new-build browser rendering remains pending until user downloads it; do not describe source checks as visual signoff or claim10/10.

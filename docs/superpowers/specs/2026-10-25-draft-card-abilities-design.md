# Two-ability draft cards

Approved in conversation: every role shows two meaningful headline abilities. BAT: Batting/Fielding; BOWL: Bowling/Fielding; AR: Batting/Bowling; WK-BAT: Batting/Keeping. The number of available slots must not create arbitrary emphasis on Power or Accuracy.

Use two equally sized, centred cells with a subtle divider on desktop and mobile, including enlarged text. Preserve the accepted solid palette, Overall badge, identity, best-phase/comparison row, scout interaction and Pick control. Other abilities remain in scouting details. Simulation, numerical abilities, overall formulas and saved careers are unchanged.

Approaches considered: retain three stats with a replacement (rejected as arbitrary); let only keepers have two (rejected as inconsistent hierarchy); use two role-relevant abilities throughout (user-approved).

Implementation: change the cardStats role mapping in components.js and the base/container attribute grids in workspace.css. Rebuild both canonical game files from the frozen728 baseline with build.py. Verify actual browser labels/values, column balance/divider/bounds for four roles at1280/390/320px with16/24/32px root text; inspect desktop/mobile screenshots internally; rerun all eight draft-sort alignment/contrast checks. Record exact artifact hashes, update stable playable and commit overff5 without dropping existing work.

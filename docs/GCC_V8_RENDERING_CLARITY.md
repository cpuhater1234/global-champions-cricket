# Rendering and decision hierarchy pass

This pass follows direct player reports. Previous broad checks missed transient feedback outside the stage and expanded child panels. The new checks include those states. This is a candidate improvement, not certification of the entire front end or evidence of sustained human enjoyment.

Final playable: `game/gcc_v8_rendering_clarity.html`; canonical continuation copies the same bytes. SHA-256: `5fc59c8e40456faa9fe4571403aef45ef76da8837732b7392ba27947150cb582`.

## Reported problems and changes

| Area | Cause / change |
| --- | --- |
| Build your side | Replace the repeated fresh-squad paragraph with three ground-led scouting priorities. Compact the ground gauges and stop stretching priority cards into empty tiles. Advice derives from existing pace, spin and boundary conditions. |
| Speed notice | Dark-theme `--ink` became pale text on a fixed lime surface, giving roughly1.04:1 contrast. The notice now owns a dark foreground. |
| Draft-order draw | Remove the310px presentation minimum with compact numbered tickets, club badges and an explicit user-club highlight. Tested desktop cards are104px high; enlarged text may grow naturally. Preserve intrinsic reservations during partial reveals, including annual draws. |
| Detailed and innings skills | Fixed label widths caused Temperament to collide with gauges. Labels now occupy a full row; gauges and scores sit beneath. Section spacing is consistent. |
| Compare players | Replace generic tables with relevant role skills and named paired bars. Both players have eligible selection/draft actions. Alternative labels include roles; different-role comparisons say so. Full ratings remain disclosed. Neither option is described as a guaranteed better XI. |
| View selected players | A multi-column dressing-room layout and pale legacy group backgrounds leaked into a narrow dark sidebar. Use a single column of full-width scout rows, clear role headings, bounded padding and wrapping coverage. |
| XI picker and hierarchy | Compact squad rows, role accents, a distinct selected-XI surface, visible selection progress and XI balance. Keep manual selection, ordering and injury restrictions. Draft cards prioritise name, age, role and current overall; country remains in scouting. |
| Wider rendering scan | Found another inherited brown foreground on the finals versus marker and corrected it. Comparison button metadata styling was narrowed so primary labels retain dark text on lime. |

## Verification and scope

- The final build passed11 focused logic suites, including updated comparison guard tests: either displayed player may be drafted, an unseen third player remains rejected, and normal turn/availability checks remain.
- The final build passed48 expanded rendering cases across320/390/760/1280px and16/24/32px root text. These cover full/empty XI, opened selected-player list and comparison; no measured text escape, gauge collision, page overflow or solid-surface contrast failure remained.
- An immediately preceding CSS candidate passed68 general browser cases,104 later-career browser cases and76 club-guide/draw cases. The last change only corrects comparison bar colours; executable scripts are identical, and final comparison is included in the48-case retest.
- The broader logic candidate completed63 passes and three failures caused by exact HTML class-string matching. The selectors were updated without weakening eleven-slot and bench-count assertions; all three pass in the final focused batch. Do not describe this as66full-suite passes on the final build.
- Native opening of a selected-player scout card and explicit comparison choices were exercised. Rendering fixtures reconstruct certain draft/annual stages; they do not establish actual career progression or first-time understanding.
- CSS contrast scanning uses the nearest opaque background and now includes global feedback. It records gradients/image limitations. Screenshots were inspected separately. No new full career or unfamiliar-human session was run.

See `qa/GCC_V8_RENDERING_CLARITY_EVIDENCE.json` and the scripts/reports under `qa/rendering-20261020`. The earlier experience-testing programme remains active; longer returning careers and voluntary human return remain unestablished.

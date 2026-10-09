# GCC v7.8.5 Human Visual Hardening Checkpoint

## Candidate

- Branch: `work/v7.8-player-experience`
- Parent: `global_champions_cricket_v7_8_4_hardening.html`
- Parent SHA-256: `591c41f9f2282919e56e8ccb7c4f4d0a1790f83471fa180ed0249c8cb6bd6531`
- Candidate: `global_champions_cricket_v7_8_5_visual_hardening.html`
- Candidate SHA-256: `d7ae7d1f1799cb4aedde7cbb90f4d9557c5c93214dfb4cab39a52947f55a6f45`

## Why this pass exists

The previous QA was too dependent on mechanical overflow checks. A screen can have zero document overflow and still look broken to a person because cards are crushed, headings collide, copy becomes unreadably bright, or a component remains technically inside its box while becoming visually unusable.

v7.8.5 was therefore tested by rendering and visually inspecting the actual screens at desktop, laptop, intermediate and mobile widths.

## Reproduced visual failures

### Signing Week

The fixed `FRANCHISE CONFIRMED` moment card could physically overlap the main page heading on laptop-sized desktop views.

Fix:
- non-ceremony moment cards now behave as bottom-centred toasts;
- the main stage and heading remain unobstructed.

### Foundation Draft

The serious failure was around 1000-1100px.

Two media rules fought each other:
- an older breakpoint collapsed the Draft to one column and moved the side rail first;
- a later rule restored a two-column grid but left the side rail reordered.

The result was a narrow player pool where names and roles wrapped almost vertically despite there being no page-level overflow.

Fix:
- <=1120px now has one explicit layout owner;
- player pool is first;
- context/squad rail sits below;
- player cards remain three columns where readable;
- <=840px becomes two columns;
- <=560px becomes one column.

### Team Room

The squad list was being squeezed too hard at normal laptop widths. Names, role descriptions, status and XI/BAT actions all competed for the same narrow column.

Fix:
- wide desktop keeps the profile rail;
- <=1240px moves the profile rail below the main selection sheet;
- the squad list and batting order receive useful minimum widths;
- <=840px stacks the two selection columns;
- role descriptions use deliberate line clamps instead of uncontrolled wrapping.

### Annual Draft

The same inherited `.side-panel{order:-1}` behaviour could leak into the later-season Draft and put context ahead of the actual Draft board.

Fix:
- annual Draft explicitly owns its order;
- at <=1120px the live player pool comes first and the context rail follows;
- the strong green on-clock state remains the primary visual anchor.

### Contrast and brightness

Several low-opacity labels and pale surfaces were technically visible but too washed out in actual rendered use.

Fix:
- stronger ink and muted-copy tokens;
- readable gold copy instead of overly faint brown/gold;
- disabled controls use explicit readable states rather than global opacity;
- dark event cards have explicit high-contrast secondary copy;
- win/loss feedback keeps semantic green/red without fluorescent brightness;
- active gameplay surfaces are clearer against the warm cream canvas.

### Final 15

The locked-state labels were too small to read comfortably.

Fix:
- `LOCKED IN` and supporting list-state copy receive a larger minimum size;
- desktop and mobile were checked separately.

## Human visual audit

The game was rendered and inspected across widths including:

- 1440px wide desktop
- 1240px / 1180px laptop
- 1080px laptop
- 1000px / 900px intermediate desktop
- 768px tablet
- 390px mobile

Screens inspected included:

- Home
- club selection
- Signing Week
- Draft Draw
- Foundation Draft
- Team Room
- Season Hub
- recent result / loss state
- season analysis
- Finals
- Season Review
- off-season market
- Trade Centre
- annual Draft Draw
- Annual Draft
- Final 15

The audit was not limited to `scrollWidth`. Screenshots were visually reviewed for:
- physical collisions;
- crushed component widths;
- line wrapping;
- illegible small copy;
- washed-out text;
- weak hierarchy;
- unintended ordering;
- dead space;
- sporting-state emphasis.

## Verification

- Final candidate SHA-256: `d7ae7d1f1799cb4aedde7cbb90f4d9557c5c93214dfb4cab39a52947f55a6f45`
- v7.8.4 -> v7.8.5 patch rebuild is byte-exact.
- All nine inline JavaScript blocks pass `node --check`.
- Audited responsive states have zero document-level horizontal overflow.
- Remaining text clipping in the Team Room is intentional line-clamping of secondary role descriptions, not accidental overlap.
- Final 15 was separately rendered and inspected on desktop and mobile.
- No gameplay, retirement, cut, Draft, trade or simulation rule was changed by this visual hardening pass.

## GitHub / billing rule

No GitHub Actions workflow was added or intentionally triggered for this iteration.

GitHub remains the source of truth for commits and rollback. Browser and visual QA remain local.

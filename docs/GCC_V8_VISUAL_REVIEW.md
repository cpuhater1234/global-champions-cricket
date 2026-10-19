# GCC v8 shared-style review

The October 19 review addresses Tom's screenshots of fragmented ground-condition labels and low-contrast squad analysis, then checks the same patterns across the existing screen families. It preserves the current game styling and cricket behaviour.

Changes in `v8/ui/game.css`:

- Condition cards size themselves to their panel instead of forcing three tiny columns. Heading and current condition stack; endpoint labels wrap as whole phrases. Narrow-screen cards retain block layout so gauges do not become flex items.
- Player, contract, innings-phase and bowling-plan grids use minimum useful card widths. Ratings and comparison tracks can shrink inside nested panels.
- Squad analysis aligns each number to the right, gives each bar a full row, and places the strength and Details labels on the same following row.
- Dark squad, scouting and development panels explicitly own their text and number colours, including when embedded in a light sheet or dialog. Expanded player options and explanatory paragraphs remain readable.
- The squad-retention action keeps its button text colour instead of inheriting pale helper text. Semi-final separators use a colour suited to their cream background.
- Expanded analysis gains consistent spacing and visible keyboard focus. Small dialogs avoid double outer padding.

Verification:

- Layout VM suite: 104 checks, 39 screen states, all 20 club variants.
- Micro-layout VM suite: 64 checks, including foundation and annual analysis dialogs.
- CSS cascade audit: 43 distinct screen/detail states at 390, 768 and 1440 CSS pixels, 10,887 solid-background text checks. The pre-fix stylesheet produces 87 distinct low-contrast text cases; the updated stylesheet produces zero under the audit's conservative 4.5:1 text threshold.
- All 20 embedded script blocks are byte-identical to the preceding photo-startup build. This change only changes presentation.

Reproduce the audit after refreshing markup with the two VM suites:

```sh
python3 -m pip install -r qa/requirements-style-audit.txt
GCC8_TEST_BUILD=game/gcc_v8_stabilised.html node qa/v8_layout_test.mjs
GCC8_TEST_BUILD=game/gcc_v8_stabilised.html node qa/v8_micro_layout_test.mjs
python3 qa/v8_style_audit.py
```

This is source/cascade and generated-markup verification. It does not measure native layout, text collisions, scrolling, browser zoom, or animation. Gradient backgrounds and opacity compositing are excluded from the contrast calculation. It is not a full accessibility certification or a claim of visual perfection. Native desktop/mobile playtesting remains open.

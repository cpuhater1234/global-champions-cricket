# Build53: approved Floodlit Night Match direction on current game

The user supplied files.zip containing GCC_v8_Playtest_50_visual_v9.html and gcc_visual_layer.css and explicitly requested its visual direction. Its20game scripts matched Build50. Build53 instead carries the presentation onto Build52 so later management, trade, statistics and phone-ladder fixes remain present.

## Presentation
Retained the approved navy floodlit palette, condensed broadcast typography, club glow, angled heading/primary shapes, layered panels, richer player cards and restrained card/home entrances. This supersedes the earlier charcoal-only visual preference.

Embedded four Barlow Condensed faces (600/700/800 and800italic) and variable Inter as valid WOFF files in the single HTML. Fonts sourced from google/fonts public OFL directories, Latin/Latin-extended subset, with both complete OFL licences embedded and tracked. No Google Fonts network request is required. Font sourceSHA256 values retained in assets/floodlit-fonts.json.

## Integration fixes
Raised reference selector specificity to overcome older important rules. Added dialog styling for player reports, trades and scorebooks, preserving semantic status colours. Restored selected/current/pressed states, danger styling, and transparent stat report links after the stronger generic button treatment. Sticky stats use opaque palette-matched cells. Small accent text uses a lighter signal colour while club fills remain authored colours. Primary gloss is concentrated at the edges, leaving core text over the existing validated club fill/ink. Focus removes clipping; entrances exclude sticky/scroll containers; reduced motion covers sibling dialogs.

## Evidence
Canonical build completed and20inline scripts parsed. Exact script-array comparison confirms every game script is byte-identical to Build52. Both new CSS sources parse cleanly. Five embedded font faces parse and contain expected Latin letters/digits. The lower-bound signal/panel contrast is4.74:1; white danger text against the brighter gradient stop is7.28:1. These calculations do not certify every rendered combination. Current phone-ladder data contracts passed during integration.

## Native verification pending
The attached reference HTML was unavailable at the user's local server path (404); it was inspected as source. No browser screenshot of Build53 has yet been captured. The next native pass must check home, club tiles, draft, XI, matchday/results, management and dialogs at desktop and320/390phone widths; inspect selected tabs, club-specific primary contrast, focus clipping, reduced motion and long names. No visual10/10 or whole-game sign-off claimed.

No cricket/rating/calibration change was introduced. The controlled scoring audit and its unresolved real-match calibration comparison remain as documented in qa/native51.

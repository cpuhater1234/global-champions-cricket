# Squad analysis and team selection polish · 25 October 2026

All three desktop analysis sections and all 12 tiles have equal dimensions. Tile labels reserve two lines; ratings remain exact existing profile values. Mobile stacks the sections. Draft pool batting positions are explicitly labelled; selected draft players also show their batting job (bowlers show bowling type).

Removed numbered XI role guide entirely. No selection targets or new penalties. Framed bench and batting-order rows, solid neutral/olive section headers, clear rating badges, unclipped content-sized heading, actual home-ground name/trait. Existing selection, scouting, swaps and manual order controls remain. Compact final-XI prompt from local version64 is preserved (not yet in prior Git head).

Current candidate SHA256 2010a5e1868a13138644d2d33d922ceba839889888e391ea78cbd048f122a661. 27 browser cases per engine: 18 draft analysis states (0/5 picks, 1280/390/320 pixels, 16/24/32 root text), nine team-selection states at same widths/text. Verifies profile equality, analysis column/tile equality at desktop, centred overall/status, picked-player job labels, no numbered XI guide, home-ground presence, no page overflow, no JS errors and read-only analysis state. Chromium, Firefox and WebKit reports record final hash. Internal screenshots visually inspected. No physical-device or human-playtest claim.

Rebuild with python3 build.py. Baseline is version63 SHA22960c…; baseline module files enable exact reconstruction. No engine or save changes.

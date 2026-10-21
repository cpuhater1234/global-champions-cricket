# Cricket detail and alignment pass

21 October 2026. Artifact SHA256 6b4f46967d347f3f23c67554dfbb3c8f19f7af732c7fb6fa2086036715e7d030.

Removed the decorative role avatars from draft player cards and the repeated icon inside Pick. Player names, role text, colour edges and numerical ratings retain the hierarchy. No picking or scouting rule changed.

Replaced the cricket icon with a long, narrow, flat-toed blade, distinct shoulder and thin handle. Removed the ball and rounded silhouette; uses one shared source SVG across the game.

Club guide grid restores stretch alignment and removes panel margins that could produce unequal bottoms. Standalone takeover action is centred below the two panels. Opening action group and player decision group are centred; row actions, narrow mobile guide arrows, match controls and other rectangular toolbars keep contextual alignment. No global centring rule was applied to every button.

Replaced vague guidance with cricket-specific terms, including strike rotation against spin, middle-overs bowling, batting positions and wicketkeeping recruitment. Kept repeated navigation/control terminology consistent. Signing entry now uses Start signings, Close signing window and Draft-order draw. Trade supporting facts use tighter spacing, preserving the explicit give/receive layout and final keeper/bowling/pick warnings.

Verification: qa/cricket-detail/browser.json has 60 width/text combinations, no measured overflow/text escape/opaque-background contrast failures. Asserts same top/bottom edges of guide panels at desktop widths and centred takeover at every sampled width/text size; asserts no avatar or Pick SVG in draft cards. CPU draft timer pauses only for geometry sampling. Photos blocked.

qa/cricket-detail/native/report.json: separate unpaused fresh native career, 79 clicks through fifteen picks, manual XI, two managed matches and reload, no browser script errors. qa/cricket-detail/focused.json: ten existing suites pass the exact unchanged artifact. qa/cricket-detail/offseason-browser.json: 84 annual rendering cases pass. These are engineering checks, not human enjoyment evidence.

Only UI executable blocks 11,12,13,16,17,19 differ from the preceding build. Simulation, delivery, CPU and persistence engines are unchanged. The reproducible checkpoint builder now also includes components and roles.

Independent understanding/return play, structural career-engagement analysis and remaining product-completion gates remain open. This pass does not establish that the whole game is complete or that all earlier audit findings are closed.

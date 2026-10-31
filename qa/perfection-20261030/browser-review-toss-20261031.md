# Toss reveal and backup UI follow-through

Observed local candidate (15), containing the initial pre-match reveal but older scorebook/mobile corrections:
- Continued the 2011 Gloucestershire career at Round4 result.
- Replay shows the coin/batting-order screen. At1150px desktop width and657px visible screenshot height, both actions sit below the first fold. This is a real layout defect, addressed by removing redundant cards/text and compacting the panel.
- Start match starts existing delivery playback at0/0. Skip returns to the existing result.
- Round5 fresh Watch match pauses before the first ball. Home then Continue preserves that pre-match screen without a ball starting.
- Show result returns to the Round5 result. Scorebook opens/closes correctly; dismissal and innings data visible. Current scorebook headers are still blue-grey, confirming this file predates the last visual batch.
- Temporary390px viewport reset. Browser left at2011 Round5 result.

User steering: only say which team won the toss and what they chose; opposition action is obvious. Remove all backup-download/restore-file UI and prompts.

Source changes: one toss sentence, recorded winner/decision for new matches, concise screen and48px actions, old-match fallback without fabricated toss winner. Same existing RNG sample encodes four equally likely winner/choice combinations, retaining the original batting-order threshold and all later draws. Both result paths include metadata. Validation accepts older absent metadata but rejects invalid or contradictory recorded tosses. This is neutral random captain choice, not a new tactical strategy model.

Removed optional UI backup bindings, file reader/input path and associated restore feedback. Healthy autosaving has no persistent backup suggestion. Slow/failed save messages retain truthful status without prompting a download. Internal automatic persistence and checkpoint recovery remain.

Verification:20inline scripts parse. Toss/save UI contracts pass, including both choices,14exact match-output comparisons with only toss metadata excluded, legacy fallback, save round-trip and invalid-toss rejection. Pre-match and decision UI contracts and engine regression pass. Integration rerun recorded separately. Existing38-season/532league-fixture coverage predates toss metadata; exact14-match parity protects against altering outcomes, but this is not another full-career simulation.

Latest compact layout, one-line wording and backup prompt removal await connected Chrome rendering of the updated build. No pixel-perfect or10/10 claim.

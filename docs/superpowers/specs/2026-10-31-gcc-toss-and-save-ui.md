# Toss wording and automatic saving

User explicitly requests one sentence identifying the toss winner and their choice, without explaining the opposition's action. User also rejects backup downloads, export prompts and restore-file controls in the game UI.

Final flow: existing pre-match screen shows a decorative coin and one result sentence, followed immediately by Start match and Show result. Remove the duplicated first-innings text and two club cards. Compact the coin and panel so actions do not sit below the desktop fold; reduced motion still disables animation. Existing home-first live score panels remain.

New engine metadata records toss winner abbreviation and choice bat/bowl. One existing uniform RNG sample is partitioned into four equal intervals representing the four winner/choice combinations. The original away-first threshold and every later RNG call are unchanged. This retains every existing match outcome while recording a consistent toss result. Captain choices remain neutral random choices, not a new tactical model. Both league and finals result objects store this metadata. Save validation rejects unknown winners, invalid decisions and contradictions with batting order. Old saves without toss metadata show only the known batting-first club; no retrospective winner is invented.

Remove backup action bindings, file inputs, restore handlers and backup download prompts from UI controller. Remove backup suggestions from save error text. Preserve existing automatic save, browser checkpoint recovery, save failure reporting, unsaved-exit guard and internal serialisation APIs needed by automatic persistence and tests. Successful saving produces no persistent download reminder.

Verification: failing contracts first for removed UI and missing toss records, then checks for both choices, exact14-match parity excluding the new metadata, old-save fallback, save round-trip and invalid-toss rejection. Retain pre-match navigation, general decision UI and baseline parity tests.

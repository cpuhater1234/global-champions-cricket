# Pre-match batting-order acknowledgement

User requests a clean, carefully integrated coin/toss acknowledgement. Existing engine randomises batting order with one RNG draw; it does not model a toss winner or captain's choice. Preserve all match simulation and saved careers.

Approaches: adding genuine toss strategy changes simulation and needs a separate game design; inventing a toss winner from saved batting order is misleading; a presentation-only batting-order reveal fits the user's explicit allowance for an acknowledgement. Choose the last approach under standing authorization to proceed.

Fresh watched matches stop in the same match playback screen at count zero, before delivery playback. A brief decorative CSS coin rotation accompanies the immediately readable batting-order outcome. The coin is GCC branded, not a fake heads/tails result. Existing home-first club panels remain. An explicit Start match action begins existing playback; no timed auto-advance, extra simulation, modal, or forced animation wait. Show result remains available. Reduced motion disables the rotation. Refresh preserves the pre-match flag via existing saved playback. Existing mid-match snapshots have no flag and continue normally. Replays show the acknowledgement; innings changes and Super Overs do not replay it.

Compact batting-order text remains in the live header. No claimed toss winner or election is shown. No future scores or performances are revealed. League and finals use the shared beginMatch entry. Verify fresh start, no running delivery clock, truthful order, single continuation and old-save compatibility through contracts. Render checks remain pending in connected browser after download.

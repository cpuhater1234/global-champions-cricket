# v7.3 Golden Dynasty Product QA

## Purpose

This is a product-quality harness, not only a regression harness.

Record evidence across the full dynasty loop and reject technically correct states that weaken agency, comprehension, cricket logic or continuity.

## Required evidence

For each tested state capture:
- active screen
- year / round / dynasty phase
- user squad size and XI size
- decision available to the user
- whether simulation is blocked or allowed
- desktop screenshot
- mobile screenshot where interaction differs materially
- runtime/page/console error counts

## Game-gate checklist

At each decision screen answer yes/no:

- Is the required action obvious within the first frame?
- Is there one dominant decision?
- Does the human own that decision?
- Is advice separated from automation?
- Is cricket context visible without becoming an information wall?
- Does the interaction match the same job elsewhere in GCC?
- Does anything feel like admin software?
- Would this still be tolerable in season five?
- Is there anything that should be removed rather than restyled?

Any "no" blocks acceptance until explicitly reviewed.

## v7.3.0 XI acceptance matrix

### Empty XI
- all 15 squad players visible
- no complete-XI recommendation action
- clear 0/11 count
- each available healthy player exposes PICK
- injured unavailable players remain visible and clearly unavailable
- batting order may show open slots without pretending an XI exists

### Partial XI
- selected players remain visible in the squad list
- selected state is unmistakable
- count updates correctly
- batting order derives naturally from the user's selected players
- no projected complete-XI ratings are shown prematurely

### Complete XI
- exactly 11 unique player IDs
- selected players remain visible
- four bench players remain visible
- direct bench swap is available
- batting order can be adjusted
- natural-order reset remains available
- keeper and bowling-cover warnings are advisory
- Season start / return is enabled only with a valid XI state

### Injury interruption
- if the next user match has an unavailable player in the XI, auto-run stops before that match
- the game enters Team Room
- the unavailable player is still visible
- no replacement is silently selected for the human
- user can solve internally with the bench
- replacement market is offered only when its cricket/business rules are genuinely met
- after the user repairs the XI, the season can resume normally

### CPU protection
- CPU teams may continue using automatic roster/XI repair as required
- the change to human agency must not degrade CPU season progression

## Rejection examples

Reject even if technically valid when:
- one click names the human XI
- a selected player disappears from squad context
- the game silently replaces an injured human player
- a warning becomes an arbitrary hard quota
- more UI is added to explain an interaction that should instead be simplified

# GCC v7.3.2 Cricket Language & Comprehension Plan

## Objective

Make the whole GCC journey read like one cricket game.

v7.3.2 is a language and decision-framing pass, not a visual redesign and not a gameplay-system rewrite.

A new player should understand:
- what is happening now;
- what cricket decision belongs to them;
- what matters when making it;
- what happens next.

The interface should explain itself through short cricket language rather than tutorial cards, admin terminology or meta commentary about the UI.

## Protected architecture

Do not change:
- foundation flow or screen order
- Signing Week logic
- Draft Order logic
- foundation Draft rules or CPU evaluation
- v7.3.0 XI ownership and injury interruption
- season simulation or statistical calculations
- Finals rules
- Review calculations
- trades, injury replacements or roster rules
- v7.3.1 annual Draft architecture and logic
- save/resume behaviour
- layout structure unless a text-only change proves impossible

## Language rules

1. Say what the cricket decision is before explaining the interface.
2. Prefer normal cricket words over software words.
3. Keep instructions to one useful sentence where possible.
4. Do not tell the player that the game is making a decision for them.
5. Do not explain obvious buttons.
6. Avoid corporate/admin phrases such as:
   - managed loads
   - shape the squad
   - decision gateway
   - interaction
   - complete / run / execute language when a cricket phrase exists
7. Preserve useful cricket specificity:
   - powerplay
   - middle overs
   - death overs
   - new ball
   - keeper
   - batting order
   - list
   - draft pick
   - finals line
8. Ceremony can be more expressive. Routine selection and administration should stay plain.
9. Warnings should say what is wrong and what the player must do.
10. The same cricket concept should use the same words throughout the game.

## Journey audit

### Club choice
Keep the existing ground-led decision framing. It is already clear.

### Signing Week
Clarify that Signing Week determines the foundation Draft pool.
Reduce phrases that describe UI state rather than league activity.

### Draft Order
Keep the draw ceremony. Tighten any explanation that repeats the snake-order mechanics unnecessarily.

### Foundation Draft
Keep the current architecture.
Frame the job as building a fifteen with enough ways to bat, bowl and finish innings, not merely collecting the highest ratings.

### Team Room
Remove meta language such as "the room will order them".
Explain:
- pick eleven;
- the game starts them in a natural batting order;
- move the order if the player sees the innings differently.

During a season:
- name the next-round XI;
- account for form, fitness, opposition and conditions;
- return to the season.

### Season Hub
Use cricket headings rather than dashboard/business language.
The page should read in this order:
- last result / next match;
- ladder pressure;
- where innings are being won or lost;
- batting and bowling numbers;
- league leaders.

Avoid overclaiming trends from tiny samples.

### Finals
Protect the existing ceremony. Only remove wording that sounds generic or repetitive.

### Season Review
Frame strengths as what won/held matches and weaknesses as what needs fixing next season.
Keep evidence tied to scorecards and season profile.

### Offseason
Replace generic shell copy with phase-specific cricket direction.
The player should understand the sequence:
- departures / arrivals;
- trades;
- Draft Draw;
- annual Draft;
- Final 15;
- pre-season XI.

### Trade Centre
Keep uncertainty and club-specific value.
Shorten the explanation and make acceptance/rejection reads sound like cricket list decisions rather than negotiation software.

### Annual Draft
Protect v7.3.1 architecture.
Refine labels such as LIST CHECK only where a clearer cricket phrase genuinely helps.
Do not add more panels.

### Final 15
Explain the simple list rule: get back to fifteen, then pick the XI.

### Injuries / replacement cover
Keep temporary-cover rules explicit.
Use "out", "cover", "fit again" and "back into selection" consistently.

### Dynasty season strip
Replace sports-science/admin phrases where possible:
- "Fitness watch" / "managed loads" should become natural selection language.
- retain last-five form, unavailable players, trade window and archive access.

## Product acceptance

Reject if:
- copy becomes longer overall without improving a decision;
- a tutorial card or new explanatory panel is added;
- one screen uses different words for the same cricket concept;
- wording promises a system behaviour that does not exist;
- copy implies the computer owns a human decision;
- annual Draft, Team Room or season hierarchy is structurally changed;
- simulation, ratings or roster logic changes;
- wording sounds like product documentation rather than an in-world cricket game.

## QA

The v7.3.2 browser journey must capture and inspect at minimum:

- Club choice
- Signing Week
- Draft Order
- foundation Draft on the user's pick
- empty/complete Team Room
- early-season hub
- mid-season hub
- injury interruption
- Finals
- Season Review
- offseason Trade Period
- Draft Draw
- annual Draft
- Final 15
- pre-season Team Room

Desktop evidence is required for all major states.
Mobile evidence is required for Team Room, Season Hub and annual Draft.

Static guardrails must verify that protected gameplay functions are unchanged.

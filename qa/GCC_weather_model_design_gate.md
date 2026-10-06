# GCC Match-Day Weather Model — Design Gate

## Purpose

Add weather as a restrained cricket condition that changes how a known ground plays on a specific match day.

Weather must not become a random arcade modifier and must not replace the existing ground model.

## Core rule

**Ground is the baseline. Weather is a small match-day overlay.**

Headingley remains a seam-friendly ground. Chinnaswamy remains small. The MCG remains large.

A weather state can move the effective conditions modestly for one match, but it cannot turn one venue into another.

## Determinism

Weather must be deterministic from stable match identity, for example:

- dynasty seed
- year
- round
- home venue / club

Reloading or continuing a save must reproduce the same match weather.

No rerolling weather by refreshing the page.

## Visibility

The user must know the weather before naming the XI.

Preferred surfaces:

- next-fixture line in the Season Hub
- ground / conditions read in Team Room
- scorecard / match story after the match

Do not create a large new weather panel.

The existing visual hierarchy should absorb one concise match-day condition read.

## Mechanical scope

Weather modifiers should be smaller than the existing venue modifiers.

The current ground model uses:

- pace
- spin
- boundary

Weather should add a separate match-day layer and only feed the parts of simulation it can logically affect.

### Clear / settled

Baseline.

No material modifier.

### Overcast

Possible small new-ball/seam assistance.

Do **not** implement humidity itself as a direct swing multiplier.

Any effect should be concentrated in the new-ball phase rather than reducing batting quality across all 20 overs.

### Hot / dry

Small tendency toward:

- more grip for spin
- a quicker dry outfield where venue context supports it

No blanket batting bonus.

### Cool / damp

Small tendency toward:

- early seam / new-ball assistance
- a slower outfield

Covered modern pitches mean this should not create exaggerated wet wickets.

### Rain risk / showers

First weather release should **not** invent crude abandoned matches, random five-over games or fake DLS.

Rain interruptions / reduced-overs cricket require their own proper modelling and target-reset rules before they enter the simulator.

Until then, shower risk can contribute only to a modest damp/outfield condition when appropriate.

### Dew

Do not introduce a generic second-innings dew bonus until the game has enough match-timing/toss context for the player to understand and act on it.

## CPU logic

CPU XI selection must see the same match-day condition the user sees.

Weather should adjust:

- new-ball preference
- pace/spin balance where relevant
- player-ground fit

It must not give CPU clubs hidden weather information.

## No permanent rating changes

Weather changes match execution only.

It does not alter:

- career ratings
- dynasty potential
- player development
- permanent ground ratings

## Climate priors

Weather frequencies can vary by venue region, but the model must remain conservative because GCC does not currently run on a full real-world dated calendar.

Use broad venue-climate priors rather than pretending a specific historical date is being simulated.

## QA requirements

Before acceptance:

1. weather reproducible after hard reload
2. user and CPU receive the same condition
3. ground remains the dominant condition signal
4. scoring distribution does not shift materially league-wide
5. overcast effect is concentrated early
6. dry effect does not make spin universally dominant
7. no venue receives absurd weather frequencies
8. scorecards and story text remain internally consistent
9. Team Room / Season visuals do not gain another permanent information panel
10. desktop and mobile parity preserved

## Research caution

Atmospheric humidity by itself should not be coded as a direct swing boost. Experimental work has found little or no direct humidity effect on swing; any weather implementation should therefore avoid that common shortcut and keep cloud/surface mechanisms modest.

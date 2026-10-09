# Global Champions Cricket: Expert Recovery Brief

## 1. Primary objective

Turn GCC from an increasingly complex web prototype into a **coherent premium cricket management game**.

The target experience is:

**Easy to understand immediately. Deep once you engage. Premium. Sporting. Cricket-specific. Visually calm but emotionally alive.**

It should feel closer to a combination of:

- franchise/dynasty sports mode
- broadcast cricket presentation
- premium sports editorial design
- management simulation

It should **not** feel like:

- an admin dashboard
- an analytics product
- a spreadsheet
- a collection of HTML cards
- an AI-generated interface
- a beige report
- twenty separately designed screens stitched together

---

# 2. Stop patching the existing visual problems

This is the most important instruction.

**Do not respond to the current state by adding more CSS exceptions.**

The project already has too many symptoms of accumulated patching:

- competing breakpoint rules
- components changing order unexpectedly
- duplicated presentation logic
- local typography overrides
- screen-specific colour corrections
- content containers using subtly different spacing rules
- arbitrary card styles
- text technically fitting but visually colliding
- desktop layouts being squeezed rather than redesigned
- future-season screens falling back to generic admin layouts

Before significant new features are added, establish a **single design system and reusable screen architecture**.

---

# 3. Rebuild the information hierarchy

Every screen must answer these questions instantly:

1. **Where am I?**
2. **What is happening?**
3. **What should I do next?**
4. **What information matters most?**
5. **What can I safely ignore until I want more detail?**

At the moment GCC often presents all information with similar visual weight.

That is why screens feel confusing even when individual elements technically work.

Use only a few hierarchy levels:

### Level 1 — The sporting moment

Examples:

- YOU'RE ON THE CLOCK
- MATCH DAY
- SEMI FINAL
- TRADE OFFER
- CONTRACT WINDOW
- ROUND 8 RESULT

Large, unmistakable, emotionally weighted.

### Level 2 — The primary decision

Examples:

- choose a player
- set the XI
- respond to trade
- make a contract decision
- play the match

One dominant working area.

### Level 3 — Supporting cricket information

Examples:

- form
- role
- ground fit
- batting position
- recent production
- squad balance
- opponent profile

Visible but secondary.

### Level 4 — Deep detail

Available on demand.

Do not dump it into the first visual layer.

---

# 4. Completely rethink the colour system

The current **sand-on-sand problem is systemic**.

Cream should be the **canvas**, not every surface.

Use something closer to:

### Canvas

Warm cricket-paper cream.

### Primary working surfaces

Clearly lighter or darker than the canvas.

For example:

- clean ivory
- pale warm white
- restrained sage
- deep GCC green

### Sporting-event surfaces

Deep green / dark forest.

Use for:

- Draft
- Matchday
- Finals
- major announcements
- live decision states

### Result states

**Win:** rich restrained green\
**Loss:** proper muted red\
**Draw/neutral:** slate / gold\
**Upcoming:** neutral ivory / grey-green

These states must apply consistently to:

- headline
- match card
- running results
- relevant border/accent
- major status marker

Do not colour random positive sentences red or green independently of the actual state.

### Gold

Use very sparingly.

Gold should mean:

- prestige
- championship
- secondary emphasis
- heritage

It should not be another low-contrast beige.

---

# 5. The regular-season experience needs a real redesign

This is currently one of the weakest areas.

It needs to become the game's **central sports hub**, not a table of information.

## Overview

The first screen should immediately establish:

### Next match

This should dominate.

Opponent\
Venue\
Round\
Current form\
Opponent form\
Ground conditions\
Key matchup\
Main CTA: **PLAY MATCH**

### Recent result

Visually obvious W/L.

Score\
Margin\
Standout player\
Quick scorecard access

### Form strip

Something like:

`W  W  L  W  L`

Proper coloured chips.

### Ladder position

Not an empty beige panel.

Display:

**4TH**\
`8 pts · +0.44 NRR`

Then perhaps top-four line or nearest rivals.

### Season context

Small supporting block:

`ROUND 7 OF 14`

`5–1`

`3 HOME · 5 AWAY REMAINING`

Everything else can sit underneath.

---

# 6. Every regular-season tab needs its own purpose

Currently too much of the season section feels like the same template with different content.

## Overview

**What is happening now?**

## Fixtures

**What have we played and what is coming?**

Should feel like a sports fixture list.

Strong round separation.

Visible W/L.

Scores beside completed matches.

Upcoming matches visually different.

## Ladder

**Where does the competition stand?**

Proper ladder hierarchy.

Position, club identity, P/W/L, NRR, points.

Top-four cut line should visually matter.

## Analysis

**Why are we winning or losing?**

Not generic analytics cards.

Use cricket language:

- Powerplay
- Middle overs
- Death overs
- wickets lost
- wickets taken
- boundary rate
- dot-ball pressure
- chase record
- defending record
- venue performance

## Players

**Who is performing?**

Runs\
Average\
Strike rate\
Wickets\
Economy\
Recent form

Not merely player cards.

---

# 7. Matchday needs to feel like an event

The game should visibly transition when you enter a match.

Different visual atmosphere.

Opponent.

Ground.

Conditions.

Expected pitch behaviour.

Team selection status.

Important player matchups.

Then the result should be emotionally obvious.

### Win

Strong green state.

### Loss

Strong red state.

### Close finish

The result presentation should acknowledge it.

Instead of generic analysis copy, say cricket-specific things such as:

> Needed 19 from the final two overs. Pollock conceded six.

or

> Three wickets in the Powerplay left the chase behind the rate.

The game should tell the **story of the match**.

---

# 8. Finals must become more intense, not simpler

A major product rule:

> **The closer the player gets to the championship, the stronger the experience must become.**

Currently some Finals screens become more table-like.

Invert that.

Semi Final and Final should have:

- stronger event identity
- opponent prominence
- qualification/elimination stakes
- distinct match cards
- finals bracket as supporting information
- hero treatment for the user's match

The Final should feel like the biggest screen in the game.

---

# 9. Future seasons must not degrade into admin mode

This is one of the largest current structural failures.

2008 gets bespoke onboarding and sports-event screens.

Then 2009+ often feels like another product.

That cannot happen.

The annual lifecycle must feel deliberate:

**Season ends**\
↓\
**Season Review**\
↓\
**Retirements / contracts**\
↓\
**Trade period**\
↓\
**Draft lottery**\
↓\
**Annual Draft**\
↓\
**Final 15**\
↓\
**Preseason XI**\
↓\
**Round 1**

Every transition needs:

- narrative context
- clear next action
- visual continuity
- reason for existing

Nothing should feel like a hidden developer menu.

---

# 10. Rebuild the Trade Centre conceptually

The current trading system is one of the areas most in need of product design, not styling.

Do **not** let the player simply compare ratings.

A cricket club does not know that Player A has an exact `84 trade value`.

Instead expose imperfect football/cricket-style evaluation.

## Player dossier

### Current standing

`FRONTLINE XI`

### Career outlook

`PEAK YEARS`

### Club view

`HIGHLY VALUED`

### Market interest

`MULTIPLE CLUBS`

### Recent GCC output

Runs / wickets / role-adjusted production.

### Form

`HOT`

### Fitness

`FULLY FIT`

### Scout confidence

`HIGH`

### Contract

Years remaining.

### Squad fit

What losing or acquiring that player actually changes.

Then negotiation feedback:

`THEY ARE INTERESTED`

`THEY WANT A FIRST-TEAM PLAYER`

`THE GAP IS STILL SIGNIFICANT`

`THIS IS CLOSE`

Not:

`Your side: 87`

`Their side: 85`

---

# 11. Off-season roster management needs one coherent model

Preserve the agreed logic:

### Forced retirements

They happen.

No arbitrary cap.

If six retire, six retire.

### Controlled cuts

Maximum controlled turnover target:

**4 minus forced retirements**

So:

| Retirements | Maximum cuts |
| ----------- | ------------ |
| 0           | 4            |
| 1           | 3            |
| 2           | 2            |
| 3           | 1            |
| 4+          | 0            |

If six retire, the club may lose six players, but **cannot additionally cut anyone**.

Every vacancy becomes one Annual Draft selection.

---

# 12. Annual Draft must literally inherit the Foundation Draft experience

Do not “reinterpret” it.

Build **one Draft system**.

2008 and later years should share:

- Draft room
- player pool architecture
- on-clock state
- player cards
- filters
- squad context
- Draft board
- pick animation
- CPU selection feedback
- Draft history

Annual Draft differences should come from **context and available players**, not inferior presentation.

---

# 13. Dynamic snake order

Preserve this exactly.

Lottery determines the initial snake order.

Each team has a number of selections equal to its vacancies.

The snake continues for as many rounds as necessary.

Clubs disappear from future turns once their selection requirement is exhausted.

Example:

Order:

`A → B → C → D`

Needs:

`A 4`\
`B 2`\
`C 0`\
`D 3`

Draft:

**R1:** A → B → D\
**R2:** D → B → A\
**R3:** A → D\
**R4:** A

Do not label later selections as some disconnected “supplementary Draft”.

It is one Draft.

---

# 14. Final 15 must be simple

This screen currently risks trying to explain too much.

Its job is:

> **This is the squad you are taking into the season.**

Show:

`15 / 15 CONTRACTED`

Then the squad.

Retirement/cut history can appear quietly:

`OFF-SEASON MOVEMENT`

`2 retired · 2 released · 4 drafted`

Do not imply additional decisions remain once the Draft is complete.

---

# 15. Responsive design cannot mean shrinking desktop

This has repeatedly caused GCC problems.

Use actual layout modes.

### Wide desktop

Three-column layouts can work.

### Laptop

Usually two-column.

### Tablet

Primary task first, context underneath.

### Mobile

Single column in **task order**.

For every screen ask:

> What does the player need to touch first?

That item goes first.

Never allow CSS `order` inherited from an unrelated screen to determine game flow.

---

# 16. Hard anti-overlap rules

These should be treated as engineering requirements.

No component may rely on:

- fixed widths where content is variable
- absolute positioning for core content
- arbitrary negative margins
- global opacity
- inherited flex/grid `order` across unrelated screens
- text being one line to make the layout work

Set sensible:

- `min-width`
- `minmax()`
- `overflow-wrap`
- line-height
- card-height rules
- breakpoint ownership

Every breakpoint should have **one authoritative layout definition**.

No competing media queries.

---

# 17. Typography needs a system

There are currently too many tiny uppercase labels fighting against large serif headings.

Define:

### Display

Major event title.

### H1

Page title.

### H2

Section.

### Body

Actual readable content.

### Supporting

Secondary information.

### Micro

Only truly optional information.

Anything required to make a decision **must never use micro text**.

Especially:

- player role
- opponent
- form
- squad state
- contract state
- status
- W/L
- score
- CTA

---

# 18. Rebuild the GCC identity

Do not keep trying to rescue the current logo.

Create a proper sports league mark.

Reference how real cricket and professional sporting competitions build identities.

Not by copying a specific logo, but by borrowing the principles:

- recognisable silhouette
- bold at small sizes
- correct sporting equipment
- minimal detail
- strong geometry
- works monochrome
- works on dark and light backgrounds

If using:

### Cricket ball

It must actually resemble a cricket ball:

- spherical/circular form
- central raised seam
- realistic seam geometry

### Stumps

Three vertical stumps.\
Two bails.\
Correct proportions.

Don't deform either object merely to force it inside a letter.

The GCC letters themselves could be enough, with a smaller cricket symbol beside them.

**Legibility and identity beat cleverness.**

---

# 19. Cricket wording pass

Every sentence should sound like someone involved in cricket wrote it.

Remove generic product language such as:

- opportunity
- efficiency
- performance environment
- positive trend
- roster optimisation
- strategic fit

Prefer:

- first XI
- Powerplay
- middle overs
- death overs
- new ball
- set batter
- strike rotation
- boundary rate
- defending a total
- chasing
- wicket-taking threat
- four-over spell
- batting depth
- keeper
- opening pair
- No. 3
- finisher
- frontline spinner

---

# 20. QA standard going forward

Do not declare a screen finished because:

`scrollWidth === clientWidth`

That has repeatedly failed us.

Every meaningful screen must be tested visually at:

**1440**\
**1180**\
**1080**\
**900**\
**768**\
**390**

And review:

- first viewport
- full-page scroll
- empty state
- populated state
- extreme names
- long descriptions
- win
- loss
- disabled actions
- hover/focus
- pre-decision
- post-decision

Then actually ask:

> **Would a professional game studio ship this screenshot?**

If the answer is no, it fails QA.

---

# 21. Protect the systems that work

Do not casually rewrite:

- match simulation
- player database
- statistical model
- dynamic Annual Draft
- retirement logic
- historical progression
- CPU roster logic

unless testing identifies a real defect.

This is primarily a **product architecture and interface recovery**, not another simulation rewrite.

---

# 22. Definition of done

GCC is not ready because there are “no known bugs”.

It is ready when:

- the player always knows what to do;
- every screen has obvious hierarchy;
- important areas visually separate from the background;
- no overlaps occur at realistic screen sizes;
- later seasons feel as premium as 2008;
- Annual Draft feels like the original Draft;
- trading feels like sports management rather than rating arithmetic;
- regular season feels alive;
- Finals feel bigger than regular season;
- colours communicate state;
- typography is consistently readable;
- the game's language sounds like cricket;
- the identity looks like a credible sports competition;
- screenshots from any major screen look deliberately designed.

## The key instruction I would put at the very top

> **Do not make v7.8.8 by fixing twenty visible defects in v7.8.7. Treat v7.8.7 as a functional prototype and build a coherent presentation architecture around the proven game systems. Consolidate before polishing. Every change should reduce complexity, not add another exception.**

That, I think, is the level of direction GCC needs now. The recurring issue hasn't been lack of effort or individual fixes. It's that we have been **solving symptoms faster than we're simplifying the architecture that creates them**.
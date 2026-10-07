# GCC v7.3.3 Visual Identity Plan

## Objective

Give Global Champions Cricket one deliberate visual identity without reopening the game architecture accepted in v7.3.0-v7.3.2.

The game should feel like a premium cricket publication and management game, not a polished prototype with an AI-generated badge.

This is an art-direction and visual-system pass. It is not a gameplay redesign.

## Design principle

**Cricket first. Fewer visual devices. Stronger hierarchy.**

The pass should remove more visual furniture than it adds.

If an element exists only to make the interface look designed, it must justify itself or go.

## Protected product architecture

Do not change:
- screen order or game flow;
- copy accepted in v7.3.2;
- XI interaction;
- foundation Draft interaction;
- annual Draft interaction;
- Signing Week structure;
- Season Hub structure;
- Finals / Review structure;
- trades;
- injuries;
- simulation;
- player ratings;
- save/resume;
- desktop/mobile information order unless required to fix a visual collision.

JavaScript gameplay functions must remain byte-identical.

## 1. GCC identity

### Remove the current raster badge

The current header mark is a raster image embedded inside a dark-green rounded rectangle.

It is visually separate from the rest of the game and reads as an AI-era logo treatment.

Remove:
- the raster GCC badge;
- the green capsule / inset-box treatment;
- logo-specific shadowing;
- hover animation on the mark itself.

### Canonical mark

Create one restrained vector cricket mark using simple geometry.

The mark should be:
- immediately cricket-specific;
- legible at 24-32 px;
- usable in the header and launcher;
- one-colour by default;
- free of gradients, shields, ribbons, fake heraldry and ornamental initials.

Preferred visual language:
- three stumps + two bails;
- one cricket ball / seam cue;
- balanced line weight;
- no enclosing badge shape.

The mark is a symbol, not a second logo box.

### Wordmark

Use the existing full name as the brand:

**GLOBAL CHAMPIONS CRICKET**

The wordmark and mark should read as one lockup.

Do not create another nested GCC monogram unless it genuinely improves the mark.

## 2. Header

The header should feel editorial and calm.

Keep:
- mark;
- full competition name;
- year;
- journey navigation.

Change:
- remove the boxed raster logo;
- reduce the number of competing lines/shadows;
- use one clean bottom rule;
- make the mark and wordmark vertically coherent;
- make the active navigation state clear without looking like a web-app pill system.

The header should not call more attention to itself than the current cricket decision.

## 3. Launcher

The launcher should be the clearest expression of the new identity.

Remove:
- the horizontal line above and below the launcher hero;
- nested decorative framing around the central mark;
- any visual device that can appear to cut through the year or masthead.

Keep the fast-path interaction:
- CONTINUE DYNASTY when available;
- NEW DYNASTY;
- Import save;
- 2008 story.

Desired hierarchy:
1. cricket mark;
2. title;
3. one-sentence dynasty promise;
4. saved club if present;
5. primary action;
6. secondary actions.

The launcher background should read as one coherent cream field, not a panel inside a panel.

## 4. Colour system

Core palette remains:
- deep cricket green;
- warm cream / paper;
- restrained muted gold;
- charcoal text.

Rules:
- green communicates primary action / active state;
- gold is a quiet editorial accent, not a decoration layer;
- club/country colours appear only where they carry cricket meaning;
- red remains reserved for genuine negative/error states.

Do not add neon, metallic effects or saturated esports colour.

## 5. Surface hierarchy

Reduce the number of visual surface treatments.

Canonical hierarchy:
- page background;
- primary panel;
- quiet secondary fill;
- selected/active state.

Consolidate:
- duplicate gradients;
- inner shadows;
- repeated one-off beige fills;
- decorative borders inside already bordered containers.

Keep cards where the card represents an actual object:
- club;
- player;
- fixture;
- result;
- explicit cricket decision.

Do not use cards simply to separate headings from copy.

## 6. Rules and borders

The current game has accumulated multiple line systems:
- topbar rule;
- gradient topbar accent;
- section-head gradient rule;
- panel borders;
- inner dividers;
- launcher rules;
- selected outlines.

Consolidate to:
- one normal rule;
- one strong/selected rule;
- one deliberate gold accent where needed.

Prefer spacing over another border.

## 7. Typography

Keep the serif / sans pairing.

Use serif for:
- major screen headlines;
- club/player ceremonial names where already established;
- Finals/Review moments.

Use sans for:
- controls;
- stats;
- navigation;
- labels.

Reduce:
- excessive all-caps;
- excessive tracking;
- tiny decorative labels that compete with the real heading.

Kickers remain useful, but each screen should normally need one dominant kicker, not several visual subtitles fighting for attention.

## 8. Team Room visual cleanup

Do not alter the v7.3.0 interaction.

Fix:
- faint 'SELECTION SHEET' label colliding with the 'FIRST XI / Batting order' hierarchy on mobile;
- any small-screen header overlap;
- redundant border/rule combinations around the XI sheet;
- spacing where text became denser after v7.3.2.

Preserve:
- all 15 visible;
- selected/unselected state;
- PICK / REMOVE / SWAP;
- batting-order controls;
- warnings;
- conditions context.

## 9. Draft / Annual Draft

The recruitment architecture is already strong.

Visual pass only:
- make foundation and annual Draft visibly belong to the same product;
- use the same player-card hierarchy;
- use the same filter language;
- align card radius, rule weights, rating placement and selected states;
- avoid adding more colour or badges.

The board remains secondary.

## 10. Season / Finals / Review

Default decision: KEEP.

These screens already have strong hierarchy.

Only:
- normalise shared borders/surfaces to the new visual system;
- remove inherited decorative excess;
- preserve Finals/Review ceremony.

Do not flatten ceremonial moments into routine admin styling.

## 11. Offseason

The v7.3.2 language pass made the offseason coherent.

Visual goal:
- keep the phase strip easy to scan;
- make list state and main decision read before the league wire;
- ensure the page does not become a spreadsheet of beige boxes;
- keep annual Draft and Final 15 aligned with the established visual system.

## 12. Motion

Keep motion quiet.

Allowed:
- short hover/press response;
- reveal transitions;
- Finals/ceremony moments where already meaningful.

Remove or reduce:
- hover movement on the brand mark;
- animation whose only purpose is to make a static UI feel active.

## Product acceptance

Reject if:
- the new identity is more ornate than the old one;
- the cricket mark requires explanation;
- the logo sits inside another decorative logo box;
- more gradients/cards/badges are added;
- the visual pass weakens information hierarchy;
- the launcher becomes slower or more complex;
- Team Room / Draft interactions move;
- club or country colour loses meaning;
- routine screens become as visually loud as Finals;
- mobile gains horizontal overflow;
- any protected gameplay function changes.

## Required evidence

Desktop:
- fresh launcher;
- continue launcher;
- club choice;
- Signing Week;
- Draft;
- Team Room empty XI;
- Team Room complete XI;
- Season Hub;
- Finals;
- Season Review;
- offseason;
- annual Draft;
- Final 15;
- pre-season.

Mobile:
- fresh launcher;
- continue launcher;
- Team Room complete XI;
- Season Hub;
- annual Draft.

For each evidence state judge:
- where the eye lands first;
- whether one element owns each job;
- whether any decoration competes with a cricket decision;
- whether the same visual grammar is recognisable across years;
- whether the screen feels quieter than the v7.3.2 parent without losing useful information.

## Engineering gate

- deterministic rebuild from accepted v7.3.2 SHA;
- exact v7.3.3 target SHA;
- protected JS gameplay functions byte-identical;
- all existing DOM ids used by gameplay preserved;
- launcher fast path preserved;
- page/runtime/console errors = 0;
- desktop/mobile horizontal overflow = 0;
- browser evidence generated from a real 2008 -> 2009 journey.

## Known visual targets from v7.3.2 evidence

1. Header raster badge is the clearest identity mismatch.
2. Launcher uses a good cricket symbol but unnecessary top/bottom rules and does not share a mature lockup with the header.
3. Team Room mobile has a faint 'SELECTION SHEET' label competing with 'FIRST XI'.
4. Header and section rules use several different gradient/line treatments.
5. Button/panel gradients are more numerous than the product needs.
6. The best existing screens are already restrained; the correct intervention is consolidation, not redesign.

# GCC v7.8.3 Hard Playtest & Visual Hierarchy Checkpoint

## Candidate

- Branch: `work/v7.8-player-experience`
- Parent: `global_champions_cricket_v7_8_2_draft_turnover_logic.html`
- Parent SHA-256: `75209bc8f95c7fa3fcd17481d3d8e1695e217cc376c42d4e9dc21f23c04792b1`
- Candidate: `global_champions_cricket_v7_8_3_hard_playtest_visual.html`
- Candidate SHA-256: `a178e2fc9f4881d22b107b8e69d91e8db377f8c196f46c42d164ba8e3078168c`

## Why this pass exists

The real-player feedback was consistent: GCC had accumulated strong individual features, but later-season screens repeatedly fell back into flat cream-on-cream administration. The game needed stronger sporting hierarchy, clearer active states, and later-season parity with the bespoke 2008 experience.

v7.8.3 is therefore a hard player-experience pass, not a simulation rewrite.

## Hard playtest performed locally

No GitHub Actions workflow was added or triggered.

Fresh browser targets were used so state from earlier CDP test sessions could not contaminate results.

### 2008 foundation career

A fresh career was played through:

- Home
- eight-club reveal
- franchise selection
- five-day signing window
- Draft order draw
- all 120 Foundation Draft selections
- Team Room
- all 14 regular-season rounds
- Finals
- Grand Final
- Season Review

Result: no reproduced runtime error.

### 2009 off-season and annual Draft

The next off-season was then exercised through:

- new player pool
- contract window
- trade room
- dynamic Draft draw
- Annual Draft
- full Draft board
- Final 15
- pre-season
- Team Room

The annual Draft retains the 2008 Foundation Draft's event weight rather than falling back into the generic dynasty administration shell.

### 2009 season

A second season was played through all 14 rounds and into Finals.

Win/loss result state, running recent-results feedback, later-season Team Room, Finals presentation and post-season transition were inspected again.

## Reproduced defects fixed

### Home and New Dynasty

- The normal World/Home screen is the landing page.
- An in-memory or saved career makes `CONTINUE` the primary action.
- `NEW DYNASTY` becomes secondary when a career exists.
- Opening Home now uses normal navigation so the top-nav active state cannot remain on Club/Season.
- New Dynasty confirms replacement and performs a clean restart rather than sending the player directly into a half-reset League Draw.

### Foundation Draft delayed modal

The Foundation Draft completion modal used a delayed callback. If a player entered Team Room quickly enough, that stale modal could appear over the next screen.

The callback now aborts unless the Draft screen is still active.

### Final 15

- The redundant right-hand duplicate roster rail is removed during Final 15.
- A 15/15 list no longer labels safe players as `LIST DECISION`.
- Completed lists show `LOCKED IN`.
- Actual decisions remain visually distinct only when a release is genuinely required.

### Finals

- Once both semifinal winners are known, the Grand Final pairing appears immediately.
- The interface no longer says it is waiting for semifinal winners when both are already known.
- User win state is green.
- User elimination/loss state is red.
- The championship block retains the competition's dark-green event identity.

## Visual hierarchy pass

The visual system remains premium cricket: warm cream, deep green and restrained gold. The change is hierarchy, not a neon redesign.

New hierarchy principles:

- the page canvas is the quietest cream;
- active gameplay and decision surfaces sit on lighter ivory/white paper;
- squad/context rails use pale sage;
- secondary decision/info areas use restrained gold wash;
- deep green is reserved for event headers, active Draft moments and competition identity;
- green and red are reserved for positive/negative sporting outcome feedback.

Applied to:

- Team Room
- Season hub
- Off-season market
- Trade Centre
- Annual Draft
- Final 15
- Finals

### Trade Centre

The Trade Centre now uses a deep-green event header and distinct negotiation/scouting surfaces. It reads as a club-to-club sports room rather than a beige form.

Exact trade-value numbers remain hidden. The user reads current standing, career outlook, list fit, market interest, recent GCC production, form/fitness and scout confidence.

### Annual Draft

The Annual Draft's user-turn bar returns to strong deep green and the player pool/squad rail are more clearly separated. This restores parity with the Foundation Draft rather than visually downgrading later seasons.

### Season and Finals feedback

- Match wins remain green.
- Match losses are red.
- Recent-result rows inherit the same semantic feedback.
- Fine Margins remains neutral/gold rather than red when the underlying description is not negative.
- Finals use the same result semantics instead of a generic chart treatment.

## Responsive and static verification

At a 1100 x 800 viewport:

- market: no horizontal overflow;
- Trade Centre: no horizontal overflow;
- Annual Draft: no horizontal overflow.

All inline JavaScript blocks pass `node --check`.

The final patch was reconstructed byte-for-byte from v7.8.2 and matched candidate SHA-256 `a178e2fc9f4881d22b107b8e69d91e8db377f8c196f46c42d4e9dc21f23c04792b1`.

## GitHub / billing rule

GitHub remains the source of truth for branches, commits and rollback points.

Routine GCC browser QA is local. Do not add or trigger GitHub Actions for ordinary iteration. Use Actions only if an explicit release-verification decision is made.

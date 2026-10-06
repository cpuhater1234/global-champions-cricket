# GCC v7.2.10 Season Review Hierarchy Checkpoint

## Status

Accepted Season Review copy-hierarchy hardening on top of v7.2.9.

## Source of truth

- Input: `game/global_champions_cricket_v7_2_9_finals_hierarchy.html`
- Output: `game/global_champions_cricket_v7_2_10_review_hierarchy.html`
- v7.2.9 SHA-256: `cab3b93391f1e526281ea77ac65e2088938339336db122cb997e35b06d364eb8`
- v7.2.10 SHA-256: `e6a93cf831a548c2dfd44c5c8d6af9c35166accf007c428bdde286e4b860fe70`
- Passing Review QA run: `37407423428`

Rebuild and verify:

```bash
python qa/rebuild_v7210.py
python qa/check_v7210_review.py
node --experimental-websocket qa/browser_v7210_review_journey.mjs
```

## Problem fixed

The Review header repeated the same outcome across three adjacent layers.

A championship example in v7.2.9 was:

1. outcome band: `You won the first GCC title`
2. main title: `First GCC champions`
3. intro: `You won the first Global Champions Cricket title...`

The same repetition pattern existed for runner-up, semi-final, fifth-place and other outcomes.

## New hierarchy

The Review now separates jobs clearly.

### Outcome band

States what happened.

Champion example:

`The first title is yours.`

### Main title

States what the review is explaining.

Champion example:

`How the title was won.`

Other branches use outcome-specific analytical headings such as:

- `Where the Grand Final got away.`
- `Where the semi-final got away.`
- `Where the top four got away.`
- `What the season exposed.`

### Intro

No longer restates the finishing result.

It goes directly to:

- batting leader
- bowling leader
- structural XI diagnosis

Example:

`Ricky Ponting led the batting with 664 runs at 55.3; Shane Bond led the attack with 29 wickets at 15.2. You played without a recognised keeper and paid for it behind the stumps.`

## Scope protection

Season Review rendering lives in core script block 5, so the guardrail explicitly reconstructs and verifies the exact intended copy transformation there.

The guardrail confirms:

- exact v7.2.9 source SHA
- exact v7.2.10 target SHA
- every other protected script block unchanged
- block 5 differs only by the intended review hierarchy copy delta
- block 7 differs only by the UI-version marker
- review calculations and data logic unchanged
- JavaScript syntax clean

No intentional change to:

- season results
- player statistics
- review KPI calculations
- Player of the Season selection
- batting/bowling leader selection
- strengths/weakness calculations
- match-of-the-season logic
- scorecards
- dynasty progression

## Browser acceptance

The full foundation-to-review journey passed.

Final Review evidence in the passing run:

- record: 10-4
- ladder: 1st
- finish: Champions
- NRR: +1.32
- Player of the Season: Ricky Ponting, 664 runs
- bowling leader: Shane Bond, 29 wickets
- review header had no outcome repetition
- desktop overflow: 0
- mobile overflow: 0

The Review continued to populate:

- outcome
- four KPIs
- featured players
- matches to remember
- strengths
- next-season weaknesses
- batting table
- bowling table

## Acceptance decision

v7.2.10 Season Review Hierarchy is accepted at:

`e6a93cf831a548c2dfd44c5c8d6af9c35166accf007c428bdde286e4b860fe70`

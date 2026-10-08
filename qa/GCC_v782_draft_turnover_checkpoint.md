# GCC v7.8.2 Draft & Turnover Checkpoint

## Candidate

- Branch: `work/v7.8-player-experience`
- Parent candidate: `global_champions_cricket_v7_8_1_player_experience.html`
- Parent SHA-256: `6be011326dc44b67f113a9a9c2e242285c3fe7e2dfe490bde507701027342596`
- Candidate: `global_champions_cricket_v7_8_2_draft_turnover_logic.html`
- Candidate SHA-256: `75209bc8f95c7fa3fcd17481d3d8e1695e217cc376c42d4e9dc21f23c04792b1`

## Governing turnover rule

The off-season no longer has a hard cap on retirements.

Retirements are outside club control and always happen when due.

Club-controlled cuts are limited by this rule:

`cuts available = max(0, 4 - retirements)`

Examples:

- 0 retirements -> up to 4 cuts
- 1 retirement -> up to 3 cuts
- 2 retirements -> up to 2 cuts
- 3 retirements -> up to 1 cut
- 4 retirements -> 0 cuts
- 6 retirements -> all 6 retire; 0 cuts

There is no forced retirement deferral and no "one more year" protection.

Cuts still require a valid contract decision in the contract window. A club does not receive artificial cuts merely to reach four departures.

## Draft replacement rule

Every list vacancy present when the Annual Draft begins creates one Draft selection.

There is no fixed two-round Draft followed by a separate supplementary phase.

The lottery establishes the snake order. The Draft then continues for as many rounds as required to fill club lists:

- odd rounds use the lottery order;
- even rounds reverse it;
- a club is skipped as soon as it has used all selections required to fill its list;
- clubs with no vacancies never enter the active order;
- forced retirement totals above four simply create the matching number of Draft selections.

Example:

If the lottery order is A, B, C, D and the required selections are A=4, B=2, C=0, D=3:

- Round 1: A, B, D
- Round 2: D, B, A
- Round 3: A, D
- Round 4: A

C never enters the active snake because its list is already full.

## Presentation changes

Draft Draw now tells the player how many selections each club actually needs.

Visible "supplementary pick" language has been removed from the Annual Draft. Later selections remain ordinary Draft rounds inside the same snake.

The contract-window turnover panel separates forced retirements from club cuts and explains that forced retirements may take total turnover above four without granting additional cuts.

## Local verification

No GitHub Actions workflow was used.

Local checks completed:

- all embedded JavaScript blocks pass `node --check`;
- turnover allowance cases 0, 1, 2, 3, 4 and 6 retirements produce cut limits 4, 3, 2, 1, 0 and 0;
- a forced seven-retirement test retires all seven players with no deferral;
- dynamic snake test correctly removes clubs when their pick quota is exhausted;
- old visible five-player-cap and supplementary-round copy is absent from the candidate.

GitHub remains version control and rollback storage only for this iteration.

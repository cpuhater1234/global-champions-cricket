# Mobile draft chrome and squad report review

Base98a664ca2f125a54a4f72454d685dd08dbea698eb48d206367ee1a1a7ee4b230; staged candidate3a504c7d11f542c0d8d7e11e6f93fc798f9ede4f5cb54f7c1d95fba1cc1b1898 (6,656,881bytes). Only existing owner10 changes;17style/22script inventory preserved, all runtime bodies unchanged.

## Bounded design

At320px the existing130px flex basis forces Squad and Speed onto separate full-width rows. Replace that narrow action layout with two equal grid columns, leaving an enabled Skip to my pick on its own full-width row. Retain the existing disabled-control visibility rule. Reduce draft-heading/turn/filter gaps without changing player cards, their type or pick behavior. The mobile squad report uses two role-count columns at320/360px, preserving all eight labels and counts.

Do not hide the main companion: its Analysis and League picks controls are not included in the squad modal, so hiding the companion would remove access. Keep both paths and verify them. No new control, state or simulation logic. Desktop/tablet pool and companion layout is unchanged above760px.

## Focused plan

Paired exact builds, fresh legal foundation draft and an annual draft reached from the actual2025 checkpoint. Hold sampled draft frames by pausing the QA presentation clock between legal commands. Check player-card position, readable44px draft actions, Squad modal keyboard open/close and selected-player scout/back, companion Analysis/League picks, real Pick increments and transition to manual XI. Foundation sampled with0/1/11/14 selected players and annual with12 retained.320/360/390/768/1440 layouts; squad reports at320/390. Record the automatic team-room transition rather than inventing a reachable draft-complete screen. No match simulation or persistence acceptance rerun.

Status: native checks and visual review pending. Unpromoted review candidate. Main and frozen rollback untouched. No new download in this pass.

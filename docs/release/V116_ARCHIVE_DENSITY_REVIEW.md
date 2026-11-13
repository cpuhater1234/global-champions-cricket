# Archive density review

Scope: compact archive header and season cards only. Keep existing content, result order, Open season buttons,44px targets and readable14px metadata. On phones the year and button share one row; result text uses the full row below. Edit the existing styles/10 owner; no new style layer or runtime change.

Alternatives considered: a full archive table would require markup changes and a different phone presentation; reducing font sizes would sacrifice readability. The bounded CSS layout preserves the existing game composition and controls. Offseason summary/development density is a separate pass.

Base: c8990d219359ce23f697db136d47e44673427167cec0bae83638e61ceb5909a0. Candidate: ae4b362bbd67d4d5c4ad4fea18c831508bfffddc516dc29c8801c89529ba05f1.17style/22script inventory retained; all runtime bodies identical.

Verification plan: paired baseline/candidate archive, season-detail modal and adjacent offseason/manage screens at320/390/768/1440px, using existing actual2009/2019 checkpoints. Confirm all years and text retained, archive opening leaves critical career state unchanged, controls fit, phone rows are shorter, and adjacent offseason geometry stays unchanged. No gameplay/save/career acceptance rerun. Native evidence and visual review pending. Candidate unpromoted; main and frozen rollback untouched. Spoken screen-reader output is excluded by the user's later instruction.

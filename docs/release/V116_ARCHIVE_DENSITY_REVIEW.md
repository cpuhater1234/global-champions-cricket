# Archive density review

Scope: compact archive header and season cards only. Keep existing content, result order, Open season buttons,44px targets and readable14px metadata. On phones the year and button share one row; result text uses the full row below. Edit the existing styles/10 owner; no new style layer or runtime change.

Alternatives considered: a full archive table would require markup changes and a different phone presentation; reducing font sizes would sacrifice readability. The bounded CSS layout preserves the existing game composition and controls. Offseason summary/development density is a separate pass.

Base: c8990d219359ce23f697db136d47e44673427167cec0bae83638e61ceb5909a0. Candidate: 297302580de76f464e47bf9e153646264a46a1d7fe09958ec6aabb01141b37e9.17style/22script inventory retained; all runtime bodies identical.

Verification plan: paired baseline/candidate archive, season-detail modal and adjacent offseason/manage screens at320/390/768/1440px, using existing actual2009/2019 checkpoints. Confirm all years and text retained, archive opening leaves critical career state unchanged, controls fit, phone rows are shorter, and adjacent offseason geometry stays unchanged. No gameplay/save/career acceptance rerun. Final native evidence and bounded visual review are recorded below. Candidate remains a review candidate, unpromoted; main and frozen rollback untouched. Spoken screen-reader output is excluded by the user's later instruction.


## Review history

The first native run43398144450 captured64 states but its report failed because a view field overwrote the named capture surface, causing a season-detail state to be treated as an archive with zero cards. Corrected in the harness only. The next run43398547564 passed64 paired states with no findings/errors. Its raster review exposed excessive word wrapping at768px, where two narrow desktop-style cards still left too little width for text. That observation justifies the final correction: retain the full-width second text row up to1100px, preserving two archive columns on tablets and one on phones. Added a minimum200px summary-line-width check for the tested small/tablet states. Final candidate is29730258…1b37e9; previousae4b362b candidate is superseded.

An older c899-pinned accessibility workflow also started automatically on the first CSS push and rejected the new hash before any diagnostic/career checks executed. It is not a product failure or a reason to repeat the old tests. Its broad CSS trigger has been removed; the archive-specific workflow validates this new candidate.


## Final result

[Final focused run43398872443](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/43398872443) passed. [Report and paired images](archive-density/43398872443/) pin basec8990d219359ce23f697db136d47e44673427167cec0bae83638e61ceb5909a0 and candidate297302580de76f464e47bf9e153646264a46a1d7fe09958ec6aabb01141b37e9 (6,656,214bytes).64 captured states,0 findings,0 runner/page errors. All existing season text and year counts retained; keyboard Open season and Escape worked without changing the recorded year/round/XI/order/history/manager/roster identity. Offseason overview and manage-player page heights were identical before/after at all four widths in both checkpoints. All22 script bodies unchanged; only block10 differs from c899.17 style owners retained.

At320/390px the first season row measures121.94px, down from170.56px (28.5% shorter). The twelve-season archive saves650px overall:320px page2923→2273 and390px2818→2168. At768px the twelve-season archive drops2037→1385px; summaries retain at least200px line width in the tested small/tablet states. At1440px season rows78→70px and page1103→1020px. Metadata remains14px, with44px Open season controls.

Visual review inspected the final eight archive layouts across two history lengths/four widths and the2019 scorebook at320/1440. Phone year/action alignment is consistent, result text fits below it, tablet summaries no longer fragment into narrow columns, and desktop remains a two-column archive. This is a bounded component review, not whole-game visual approval. Actual offseason density changes remain next, separate; no simulation/persistence acceptance was rerun.

Disposition: archive pass accepted for continued QA work. No stable tag, main merge, frozen-release overwrite, or new HTML download was made. Speech testing is outside user scope and does not hold this candidate. The user-opened build is not assumed to be updated by a repository-only CSS change.

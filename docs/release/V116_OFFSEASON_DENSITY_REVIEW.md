# Offseason density review

Base:297302580de76f464e47bf9e153646264a46a1d7fe09958ec6aabb01141b37e9. Staged candidate:43861f74249975c287b45bc5136d1f68d5518f42522ee69ef9341c518a5e8fc1 (6,656,470bytes).

## Design and scope

Keep the existing hierarchy: squad status, real squad decisions, primary continuation and Manage players, then supporting development and rules. Reduce repeated summary gaps and card padding, while retaining every label, rating, skill delta and disclosure. Use two development columns on tablets and one on phones. Keep existing font sizes; align phone action buttons to equal height. No player-release, retirement, trading, save or match behavior changes. No archive redesign in this pass.

Alternatives considered: hiding development details would conceal useful squad evidence; shrinking type would hurt readability. This pass uses layout/spacing within existing owners10 and31. Summary hero spacing is restricted to the hero containing gccuiOffseasonSummary so draft/order panels are not affected.17style and22script inventory retained, with all runtime bodies unchanged.

## Verification plan

Compare exact base/candidate using actual cached2009/2019/2025 completed-season checkpoints, without rerunning season or persistence acceptance. Overview at320/390/768/1440px; keyboard expansion/collapse of a featured player's additional skills at320/768; adjacent Manage players and archive at320/768 or1440. Retain all text, fit control labels, separate skill labels/deltas/ratings, preserve critical career state through read-only disclosures and Manage/back, and verify adjacent heights unchanged. Inspect the rendered overview and expanded detail before accepting the candidate.

Status: native focused results and raster review pending. Remains an unpromoted QA candidate. Frozen v116 and main untouched. Screen-reader speech is excluded by user instruction and not a gate.

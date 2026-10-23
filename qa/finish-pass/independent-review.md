# Independent production review

Candidate SHA256: `3dd348dd956017563dc006d64a2364a15a0b2d7a3d97bb9d92e3fae3399fcbdf`.

Reviewer `/root/finish_review` inspected career_outcomes.js, career_state.js, scouting.js and the rating invariant/persistence checks without editing them. No blocker found.

The new marker separates three evaluators: skill-overall-v1 uses the new all-rounder floor; role-fit-v1 retains direct roleFit; absent/null retains original delta arithmetic. Expected baselines and realised future ratings use the same new helper. Global roleFit remains unchanged.

The checks establish consistency and compatibility, not historical calibration. Public wording should say: “role-based overall, with all-rounders rated at least as highly as identical batting or bowling specialists.” Strongest specialist-equivalent ability is strictly the AR rule, not a complete measure of utility.

Earlier review cautions remain: the keeping and new-ball intervention intervals cross zero; individual intervention findings must not be described as family-isolated when multiple attributes changed. Controlled strategy cohorts omit some full career administration. Automated journeys cannot establish human comprehension or long-term enjoyment.

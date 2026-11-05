# Simulation calibration

Status: open release gate. No scoring thresholds have been approved and no model tuning is included in this document.

## Evidence so far
Native playtesting repeatedly produced totals below 80, including 48 in a Grand Final. The earlier controlled audit is recorded in qa/native51/balance-report.md. These observations justify investigation; they do not establish the correct distribution for GCC's fictional league. Career integrity tests establish different properties and cannot pass this gate.

## Reference corpus
Use official Cricsheet JSON data, filtered to men's club T20 matches in IPL, Big Bash and English domestic T20 competitions, stratified by date and competition. Preserve the downloaded archive hash, retrieval date, match IDs, data revisions and inclusion/exclusion counts. Check actual coverage before treating an era as representative. Do not use future matches to benchmark an earlier career year.

Primary references checked 5 November 2026:
- https://cricsheet.org/downloads/
- https://cricsheet.org/format/json/
- https://cricsheet.org/licensing/

Cricsheet identifies JSON data with the Open Data Commons Attribution License. Preserve attribution and original notices with any imported corpus. This is a data-source record, not clearance for unrelated names, marks or artwork.

## Comparable innings
Separate scheduled full-length first innings from chases: a successful chase is truncated by its target and cannot be pooled naively with first-innings totals. Keep all-out innings in the full-length scheduled cohort even if they ended early. Separately report rain-reduced, revised-target, abandoned and incomplete matches. Exclude Super Overs from ordinary innings and player season totals; analyse tie-breaks separately. Record six-ball-over and match-format eligibility explicitly.

Use age/era and competition cohorts with stated sample sizes, not one modern aggregate across 2008–2026. Sparse cohorts must show uncertainty; missing coverage must not be filled with invented observations. Test GCC's 6/9/5 phase summaries separately from historical powerplay rules when they differ.

## Measurements
Compare median, mean, spread and tail frequencies of first-innings totals; below-80 and below-100 totals; wickets and all-out frequency; run rates, boundary share, dot share and extras. For chases compare outcome and balls remaining conditional on target bands. Also inspect wicket clustering, bowling workloads, injury rates, rating-gap advantage, ground/toss effects and season leader distributions.

Use fixed seeds and paired squad/ground scenarios. Preserve the unmodified baseline before changing a coefficient. Report full distributions with denominators and uncertainty, not only a mean. Stratify results by club and year to expose dominant strategies or runaway age curves.

## Change discipline
Choose tolerances only after the corpus and baseline are measured. Keep tuning separate from presentation changes. A candidate must improve the targeted mismatch without violating delivery accounting, legal overs, roster ownership, keeper integrity or career progression. Run the same held-out seeds after tuning. Do not constrain every match to a plausible-looking score or remove legitimate extreme outcomes.

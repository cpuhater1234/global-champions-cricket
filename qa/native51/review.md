# Native Build51 review and Build52 phone ladder

## Native verification
Chrome restored Punjab Kings2009Round4. At390x844 stats were348px wide with608px content. Player rowheaders computed sticky with opaque backgrounds. At horizontal scroll160px, names remained visible. Opened Brendon McCullum report from the scrolled table:2009showed3matches/200runs; career showed19matches/442runs across2008–2009. Closing restored the exact named report button focus and160px horizontal position. Thus Build51's critical sticky/report-return behavior passed native verification.

Phone ladder showed onlyposition/club before horizontal scrolling, concealing points and NRR. Source and macro review agreed to prioritize these standings fields in the phone layout.

## Build52
Under600px, the ladder keeps position/club/points/NRR visible and displays exact played/won/lost underneath club names. Desktop retains all seven columns. Data and ordering are untouched. Row/column header scope added; compact record has a readable accessible name. Long clubnames can wrap, signed NRR cannot truncate. No changes to statistics, finals or archive tables.

Contracts observed failing on old ladder markup, then passed on candidate for all eight exact records, points, signedNRR, current club and read-only rendering. Stats regression passed,20inline scripts parsed and CSS parsed without errors. Engine scripts byte-identical to Build51. Native320/390ladder geometry, longestclubnames and negativeNRR remain pending download/open.

## Controlled engine audit
Separate balance audit uses the actual unchanged innings simulator exposed only in a temporary QA copy.20seeds x10fixed balanced pairings x2008/2009 x2identities=800simulations,400paired fixtures, rotating actual club/venues. Form/injuries fixed, manual and CPU batting orders identical. It does not simulate career aging/drafts or reproduce the native Punjab save.

Zero identity-dependent delivery-ledger, endingRNG or effective-profile mismatches. Final first-innings mean148.4475;42/400below80;69/400below100;117/400allout;range40–261. The completed audit supersedes earlier provisional tallies. These are descriptive model outputs, not proof of realistic calibration. See balance-report.md for strata and exact limits.

Real-match comparison remains open. Cricsheet's primary catalog provides structured ball-by-ball domesticT20data including IPL,BBL andT20Blast: https://cricsheet.org/downloads/ . No external corpus was loaded or empirical real-world rate claimed in this run. The next step is an era/strength-controlled comparison and actual CPU-selection comparison. No coefficient was adjusted from small samples.

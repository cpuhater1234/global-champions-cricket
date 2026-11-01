# Progression and career-record audit

Primary-source research and the outstanding performance-development specification are in docs/research/2026-11-01-quality-and-progression.md.

Build 27 adds season and accumulated career records to player reports, plus batting average, strike rate and economy in an optional disclosure. These are league-wide GCC records across clubs, not real-world career statistics. Latest season remains labelled separately. No hidden career forecasts are read.

The regression test played fourteen 2008 league rounds, completed finals and season review, checked current-year archival deduplication, advanced offseason through the annual draft, played a 2009 round, and restored the existing save format. Matt Prior had 236 archived runs plus 59 current runs, correctly displayed as 295 career runs. The restored read agreed. A player with no appearances returns no latest record. Dossier command contracts passed. Independent source review found no concrete defect.

Only presentation script 18 differs from Build 26; all engine and save scripts are identical. All twenty inline scripts parse. Final Build 27 rendering remains unverified.

Build 26 was checked in Chrome: ladder club alignment is left and row fills are rgb40/rgb48 neutral charcoal; current player stats include the first 2012 fixture.

Important outstanding requirement: permanent ability is not driven by performances in the save. Source tracing and independent review confirm that annual application uses stored outcome baselines/offsets, while results update temporary form. No new permanent-rating formula was shipped in this pass. Historical numeric calibration, performance model validation, complete frontend state coverage and remaining visual defects are still open.

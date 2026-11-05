# Candidate career integrity regression

Candidate SHA256: da870f1c20331d4151eaba19589078aea55eb8c74f9a6354dd215d1ef012803e. This is the staged candidate after Playtest68, including the elite-outlook wording correction; it is not the exact published Playtest68 bytes.

Command: `REPORT_PATH=qa/native68/career-smoke.json node qa/perfection-20261030/career-smoke.mjs`

Result: exit 0, seed101, all19 seasons from2008 through2026, 266 user league matches, seasonal finals progression and final career closure. Roster size, unique ownership, recognised keepers, legal replacement drafting, archived years, scorebook delivery accounting, bowling limits and consecutive-over restrictions passed the assertions exercised by the script.

Scope limits: one seed; programmatic XI selection and user draft choices; not native interaction, screenshot approval, save compatibility or real-world scoring calibration. Native browser reconnection returned HTTP401 on5 November2026, so no further native visual checks were completed during this run.

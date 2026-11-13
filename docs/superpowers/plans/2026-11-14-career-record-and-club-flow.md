# Career record and club flow implementation plan

Goal: cricket-led career record with uncapped points around a demanding1000 benchmark; automatically enter club selection when eight-club reveal completes.
Architecture: pure derived career summary exposed through existing read API, rendered by existing legacy view. No account service, network, save-key/schema or match-model changes. Club reveal completion stays in existing controller. Explicit Select club and draft-order confirmation remain.
Tech: canonical JS/CSS, Node VM, native Playwright. Separate work/v116-career-record-and-club-flow branch; deliveredf0b75473 and frozen/main untouched.

## Tasks

1. Write failing model/flow tests: no1000cap, breakdown sum, deterministic club-only figures, reveal-all/manual/eighth/restore progression and draft separation.
2. Add pure careerPoints(dynasty) and careerSummary read API in scripts/20. Calibrate with existing completed2026 data and labelled synthetic profiles; no new full-career simulation for acceptance.
3. Update scripts/27 legacy and scoped style owner10. Career points, club record, club-only player leaders, best season and earned honours using existing cricket icons. Plain cricket wording; no rating tiers, fake account or ranking controls.
4. Centralise league-reveal completion in scripts/29; omit obsolete CTA in scripts/22. Verify natural/manual/skip/restore routes; preserve actual club confirmation and draft draws.
5. Build with explicit --allow-runtime-changes. Native320/390/768/1440 checks; actual2026 restore, history/title, reload consistency, ledger unchanged. Inspect renders before delivery. Record exact runtime changes and limitations.

## Review focus

Empty/partial records, duplicate years, club-only figures after trades, tied leaders,1000+ scores, paused and completed reveals, restored reveal, keyboard focus and unchanged draft/annual draws. Do not claim rare-score frequency from one career or support for verified online scores. Accounts/rankings remain future work.

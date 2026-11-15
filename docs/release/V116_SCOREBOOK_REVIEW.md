# Archived season scorebook review, 16 November 2026

Opened rollback: GCC_v116_XI_Replacement_Review.html, SHA-256 `6ac517839dec9656bff5cbeafc979eb2cecc94a073f40c4ad51e32343c7875af`, 6,679,124 bytes. Candidate `776d6933f6dfe44ce264a0f2d9db6a9387fe3c641ecfc63e5d980137867bcae6`, 6,680,040 bytes. Candidate work only on work/v116-candidate-acceptance; main, frozen v116 and perf untouched. No stable promotion.

## Reproduced evidence and change

Read-only baseline run [43731337846](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/43731337846) passed functional containment, data, keyboard and close-preservation checks at1440/768/390/320. Native screenshots nevertheless show an oversized950px dialog, rounded filled table, heavy alternating rows, bright blue header rule and a tall caption. A functional PASS does not establish visual polish.

Existing CSS10 scorebook rules now own a720px maximum dialog, transparent table wrapper and rows, a quiet one-pixel column rule, compact caption and reduced row padding. Existing CSS31 generic wrapper/header/stripe selectors exclude only descendants of the archiveSeason prompt. No additional stylesheet, blanket reset or stronger scorebook selector. Header semantics, all16 actual2009 player records, name/order/values and modal bindings retained.

Exact guard PASS: only CSS10/31 differ from the opened build; all22 scripts and every other byte identical. Critical source/data/controller pins and negative integrity self-tests PASS. Scope is presentation only.

## Focused verification

Candidate run43731648573 compares genuine completed2009 records on the same retained2010 career fixture at four widths. It checks unchanged full text and every table cell, reduced table height, contained labels, neutral surfaces,44px close target, visible focus, Escape and unchanged full compared career after opening/closing. Final run PASS: eight before/after captures, zero failures. All16 player records are identical. Table height reduced113.48px at1440/768,73px at390 and92.59px at320. Native320/1440 screenshots inspected: neutral flat rows, quiet header, all desktop records visible. Final artifact14168826732 ZIP SHA-256 `771e25d9761a290e54e2a24dfdfc084583ba49d464b9f4287270c3445ca5f53d` verified before extraction. Baseline artifact14168970836 SHA-256 `f445c53395cbe9d44f092b7325321ff83ccf99e777f9ecc635e94303d2a594a8` verified before extraction.

Chromium and this actual archived season only. No all-browser/full-career/audible-screen-reader claim. Existing XI Replacement file remains open; no new download required for this staged pass.

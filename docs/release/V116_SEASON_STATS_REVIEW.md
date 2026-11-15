# Current-season player statistics review, 16 November 2026

Base: staged scorebook candidate `776d6933f6dfe44ce264a0f2d9db6a9387fe3c641ecfc63e5d980137867bcae6`, 6,680,040 bytes. Current candidate `4b68961147690e175921c9cbe3b84195244e0495bd161742531e3780b90d8c05`, 6,681,274 bytes. User-opened file remains XI Replacement Review `6ac51783...c7875af`. Main/frozen v116/perf remain untouched; unpromoted review.

## Reproduction

Read-only native run [43775089251](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/43775089251) passed cell/document containment at four widths. Actual2010 Round2 fixture reached through normal injured-player replacement and XI lodging, without fabricated stats or injury flags. Both summary and detailed tables contain15 player records. Phone tables correctly own horizontal scrolling (608px content in294/364px viewports).

Native right-scroll images showed figures bleeding beside the fixed name column because the scroller retained its16px inset. The fixed column remained inside that inset while moving values were visible to its left. Generic table rules also retained heavy striped fills, rounded wrappers and a bright header rule. Functional containment alone missed these visual issues.

## Isolated owner correction

Existing CSS10 gives the statistics scroll surface zero padding and a neutral opaque background; first column stays opaque and sticky. Header labels use quiet body type and a single-pixel rule; rows share a neutral surface. Detailed section heading retains its own inner spacing. Existing CSS31 wrapper/header/stripe rules exclude only these statistics tables, alongside the previously reviewed archive exclusion. Three duplicate high-specificity sticky-cell background declarations are removed so the dedicated owner controls the first column.

No runtime or statistics logic changed. Exact guard versus the user's opened XI build PASS: only CSS10/31 differ, all22 scripts and every other byte identical. Critical engine/controller pins and negative self-tests PASS.

## Gate

Run43775520585 compares every displayed cell in both tables before/after at1440/768/390/320. It checks document containment, table-owned scrolling, flush sticky-name geometry at the right edge, neutral surface/header styling, keyboard opening/closing a real player report and focus return, and full compared career preservation. Final outcome pending evidence inspection.

Read-only baseline artifact14185961740 ZIP SHA-256 `ea8ab31b7617ef0e4cf0904b01777f8f06092bb2d15481ecf78808eeef89d0b8` verified before extraction. Tests use disposable native Chromium careers. No all-browser, audible-screen-reader, storage-failure or full-career certification.

## Diagnostic gate

Run43775520585 rejected the first82439 candidate. Shared CSS10 TableView padding/stripe rules still outranked the dedicated owner, and CSS31 stage/app sheet paint still applied because a stats wrapper is both sheet and tablewrap. Existing conflicting selectors now exclude only the statistics scope; no stronger selector added. Both baseline and candidate passed keyboard report opening, Escape, focus return and career preservation. The rejected candidate is not the promoted or delivered artifact. Follow-up exact gate pending.

## Final exact acceptance

Run [43775797941](https://github.com/cpuhater1234/global-champions-cricket/actions/runs/43775797941) PASS, zero failures. Eight paired states cover both tables at1440/768/390/320, with captures at each horizontal extreme. All15 player rows in both tables match the baseline cell-for-cell. Fixed-name cells sit flush with the scroll surface at every tested width. Both tables own their overflow; content width reduced608→576px on phones after removing the shared inset. Neutral opaque rows, one-pixel headers, zero wrapper inset/radius verified. Actual player report opens with Enter, closes with Escape, returns focus to the player record, and leaves the complete compared career unchanged. Final desktop and320px right-scroll screenshots inspected.

Artifact14185429731 ZIP SHA-256 `a86772ceba3c291821626911bdf9430c2972573b8e33b73bd6ba0e64b3a6664d` verified before extraction. Final exact candidate `4b68961147690e175921c9cbe3b84195244e0495bd161742531e3780b90d8c05`, 6,681,274bytes. No new standalone download yet; stage together with the verified scorebook change. Keep current opened XI Replacement6ac517 as rollback.

# Preview, picked-player and hover clarity

Player previews use one centred identity/metadata/rating/action composition. All metadata has separated solid chips. Picked players use equal-height full-width tiles with readable complete names; footer actions align and wrap.

19 legacy grey hover/focus fills replaced at source. Shared solid forest hover for active summaries, scout rows and menu controls; existing cream/bronze guide states retain specificity. Journey test samples visible enabled button/summary hover fills and rejects grey fills.

Bowling feedback: user rejected blanket 20-over judgement. Removed workload/usage-based good/bad verdicts from team analysis, draft verdict, trade warning and release/offseason prompts. Draft shows neutral count of eligible bowling options, including part-timers. Analysis status only reports XI selection completeness. Ratings and all simulation/selection rules unchanged. Selection help acknowledges part-timers and conditions.

Validation on final hash:
- All 412 player popups rendered at390px; centred identity, metadata, rating and any available action.
- Role/long-name samples at1280/390/320px ×16/24/32 root text; picked tiles equal height at nine combinations. 493 preview/list cases total.
- 126 journey cases with sampled hover and contrast checks; no overflow/heading clipping.
- Four contrasting mocked workload profiles verify no blanket bowling verdict, including complete low-usage attacks.
- All engine script blocks unchanged; only UI blocks12/13/16/19 changed.
- Mobile screenshots inspected. Chromium emulation; no new human or physical-device claims.

SHA256: 439affc3439fa6953a2c897698ea8eceb347882d0c411c619edc9ec3caf000f9

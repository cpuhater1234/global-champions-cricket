# Player journey review, 20 October 2026

## Purpose

Follow the previous microscopic audit with concrete tasks: find an appropriate draft candidate, finish and reorder an XI, understand a defeat, and rebuild for season two. This is an expert inspection with guided native browser tasks, not a substitute for observing unfamiliar people play.

Baseline: working-branch commit `fd724bdb286c127ff12b45403bcf26126377fffb`, microscopic HTML SHA-256 `25e6ea914053a861b2db2be1582f429ccaa60132c0e495f944431a341207d6b6`.

## Findings and changes

| Finding | Concrete evidence | Repair |
| --- | --- | --- |
| Draft sorting hides its comparison value | Keeping sorts Sangakkara first for 93, but his card shows Middle batting 88 and overall89. | Card shows the selected comparison metric. Overall sorting retains the strongest-phase context; a non-bowler is explicitly identified when sorting bowling. |
| Bowling count lacks an adequacy explanation | “0 regular bowlers” gives no twenty-over context. | Draft guidance explains a keeper and enough bowling for twenty overs in the eventual XI, preserving selection freedom. |
| Full XI loses batting-order instruction | Instruction disappears at11 selections, precisely when the side is ready to order. | Retain the instruction at every selection count. Native full-XI reorder verified. |
| Defeat feedback requires opening detail | Default result shows scores and navigation, while the actual phase comparisons are collapsed. | One visible scorebook summary shows the largest absolute rate gap among phases with at least six legal balls per side, with denominators and wickets. Short innings and Super Overs have dedicated text. It describes observations without asserting causes or win probabilities. |
| Loss styling escaped prior coverage | A real 73/10 defeat displayed pale text on a cream gradient. Workspace selectors used `.loss` and `.win`, while markup uses `.g8loss` and `.g8win`; the more-specific legacy loss rule won. | Correct both selectors. Check win/loss/neutral text against every gradient stop, independently of axe’s incomplete gradient handling. Minimum tested ratios exceed4.5:1. |
| Squad report obscures projected-XI scope | Thirteen retained players have20.41 usual bowling overs, but the projected XI has17.41; report calls the squad short while a nested depth explanation claims reliable full-innings coverage. | Explicit projected-XI heading and scope note. Depth detail gives total capacity and usual workloads rather than an inconsistent generic description. Role lists explicitly cover everyone available. |
| Arrival list silently truncates | “Draft class ·14” renders only12 arrivals, with no route to the other two. | Label New arrivals, retain the first12, and disclose every remaining arrival. Explain that other free agents also enter the draft. |
| Pre-draw trade hides pick availability | Pick selection is absent before assignment, with no explanation that it appears after the draw. | Explain availability at that exact point in the editor. |
| Last-keeper release warning excludes trading | “You will need to draft another” suggests the draft is the sole replacement route. | Explain trading or the draft. |

The simulation, save schema, player ratings, valuations, CPU policy and career rules are unchanged by these repairs.

## Balance investigation

A model-assisted search through actual guarded trade confirmations and completed drafts found reproducible immediate-strength gains in two windows. This is an adversarial harness search, not evidence that an unfamiliar player discovers the same offers naturally.

| Window | Pick trades | Draft opportunity cost | Resulting projected XI |
| --- | --- | --- | --- |
| 2009 | Inzamam78 + R2 for Steyn95; McMillan78 + R1 for Gayle91 | Same Gilchrist84 and Kallis83 remain available for supplementary selections | Overall sum921 to945; profile84 to86 |
| 2010 | McMillan75 + R1 for Steyn98 | Hussey85 at the original priority becomes Maxwell79 in the supplementary round | Overall sum907 to919; profile83 to84 |

The CPU clubs retained young prospects from the donated picks, including Buttler, Hazlewood and Finch. Opportunity cost exists and future value matters. No-pick searches yielded one modest upgrade in2009 and none in2020. These samples do not establish an unlimited chain, career dominance or a reliable winning strategy. No balancing change is justified solely by these two windows.

A paired follow-through then completed2009–2011 in both2009 branches: **six actual seasons and84 managed league matches**, plus their finals, on the final candidate. Opening profile ratings were84/83/82 when keeping picks versus86/85/84 after the two star trades. The difference persisted, but regular-season wins were23/42 versus22/42 and neither branch won a title. CPU prospects developed and received regular match exposure. This is one world with naturally diverging RNG; these outcomes cannot estimate comparative win rates. The pilot used the same simple drafting and balanced-XI selection policy with no further user trades or releases.

## Verification and limits

Final verification: **64 unique suites passed after migrating one obsolete label assertion**. The stable broad batch returned63 passes and one failure (`v8_quiet_arcade_test` still expected “Draft class”); its inputs remained unchanged. That assertion now checks “New arrivals” and a scout action for every arriving player, and the suite passes on rerun. No production changes followed the broad run. Browser geometry/accessibility checks passed126 states, the five targeted native task journeys passed, and20 focused checks passed. Win/loss/neutral gradient-stop minimum contrast ratios were5.97,7.25 and7.72 respectively.

Final artifact SHA-256: `8582719b7271d39715e243a12b5e2b50718a72ea495de1d3f6b495f43afe302b`.

Machine-readable outcomes and report hashes are recorded in `qa/GCC_V8_PLAYER_JOURNEY_EVIDENCE.json`. Focused tests check selected-metric fidelity, read-only presentation, rate denominators, short innings, neutral matches, Super Overs, projected scope and arrival completeness. Browser tasks use actual controls for sorting, scouting, reordering, expanding arrivals and opening trading.

The loss and offseason browser tasks use explicit saved-state fixtures. The loss scorebook itself is real; its saved navigation was reconstructed to open that result. The market fixture comes from a deterministic real engine offseason transition. They do not count as new full careers or unfamiliar-player tests. Remote images fail deliberately in geometry checks.

An initial broad batch was stopped after discovering the loss-specific gradient failure. It is superseded by the final stable batch, not included in final pass totals. Native test-development failures included exact-text selectors not accounting for the disclosure “+” glyph; corrected selectors exercise the real disclosure and scout action.

Outstanding work remains: observed unfamiliar-player sessions, long-term strategic balance over multiple seeds and clubs, native Windows/Safari/touch behavior, genuine background visibility, screen-reader speech, and full-career enjoyment. Mobile draft guidance still follows the candidate board, and mobile result cards still occupy substantial vertical space; passing geometry checks does not settle those hierarchy questions.

## Reproduction

```sh
python3 v8/build.py --output game/gcc_v8_player_journey.html
GCC8_TEST_BUILD=game/gcc_v8_player_journey.html node qa/v8_player_journey_test.mjs
GCC8_TEST_BUILD=game/gcc_v8_player_journey.html node qa/player-journey-20261020/result-contrast.cjs
GCC8_TEST_BUILD=game/gcc_v8_player_journey.html node qa/player-journey-20261020/make-market-fixture.mjs
GCC8_TEST_BUILD=game/gcc_v8_player_journey.html node qa/player-journey-20261020/native-tasks.cjs
GCC8_TEST_BUILD=game/gcc_v8_player_journey.html GCC8_BRUTAL_DIR=qa/player-journey-20261020/verified-suites node qa/v8_brutal_runner.mjs
```

Native tasks additionally require the generated `market-fixture.json`, Playwright and a Chromium executable; the scoped scripts contain environment-specific paths. Large saves and screenshots are retained locally as execution evidence, not committed as source. Balance probes record their fixture and scope separately.

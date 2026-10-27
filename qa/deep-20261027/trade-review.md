# Independent full-roster trade guard review

Reviewed candidate SHA-256 `0f643bb049f277dd57550ad9fb8d6134c51ed102d3ffa00a53d20f68e10876e4`, the last `patches.json` entry, the live `packageProblem`/`proposePackage` path, and existing role helpers. No product files changed.

No blocking defect found in this narrow change. The guard runs after package ownership, departures, size and window validation and before acceptance or state mutation. It evaluates the permanent user roster after the exchange, excludes temporary replacement players, and only imposes keeper/20-over requirements when all 15 permanent slots are occupied. Genuine draft vacancies remain available for repairing the squad. The existing `R.isKeeper` and `R.oversCapacity` definitions are reused; no simulation, rating, valuation or cricket arithmetic changed. No six-bowler minimum was added for the user. The existing CPU package-shape rules are untouched.

Independently executed the original keeper regression with `GCC_PHASE=REVIEW`: both checks pass, including rejection without any state-field mutation and allowing a draft vacancy.

Added audit-only `regressions/trade-role-boundaries-review.mjs` and ran against both HTML files using `GCC_FILE`/`GCC_PHASE`. This loads the real 2009 checkpoint then adjusts only in-memory player roles/rosters to establish precise role boundaries; product code is unchanged. Candidate passes 6/6:

- Full permanent roster reduced to 16 overs is refused without state mutation.
- Exactly 20 overs from five bowlers passes the user guard.
- Full-roster keeper-for-keeper exchange passes the user guard.
- A bowling-deficient roster with a genuine vacancy passes the user guard.
- A temporary keeper does not repair a full permanent roster losing its only keeper.
- A temporary player does not consume a genuine draft vacancy.

Baseline SHA-256 `c7ba52edcbee16d66b8651362a61939cd6c0507382b6bea49f81b51869b1bafb` fails the two expected refusal cases by accepting the trades. All four positive boundaries pass on both versions. Results: `regressions/trade-role-boundaries-RED-REVIEW.json` and `regressions/trade-role-boundaries-GREEN-REVIEW.json`. Positive cases assert validation is not blocked by the new role guard; they do not require a CPU to accept a particular commercial offer.

Limits: this is a trade-validation review, not a proof that every possible preexisting career has a selectable XI. Injuries, temporary eligibility and future retirement are separate existing systems. Fresh full-career execution is owned by the parent task and was not independently duplicated here.

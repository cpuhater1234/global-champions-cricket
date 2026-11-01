# GCC player-conversation refinement, 1 November 2026

## Product changes

Commitment choices now explain their exact horizon and consequences beside each button, with accessible descriptions. Active promises replace unused choices. The existing commitment ledger, skill ratings and bowling allocation are preserved.

Rotation conversations require a real selection concern. They give breathing room once per omission spell and no immediate trust reward. Healthy selection resets the spell. Active promises block the action. The explicit guard is saved, migrates conservatively from older conversation records and resets in a new year. Rejected actions preserve career state.

Active commitments and squad summaries now explicitly report medical pauses for MANAGING players as well as OUT players.

## Research

See docs/research/2026-11-01-quality-and-progression.md, second pass. Sources include Sports Interactive's navigation design notes, Game Accessibility Guidelines, W3C action feedback guidance and academic motivation research. Design applications are labelled hypotheses; none establish that GCC is enjoyable or finished.

## Verification

The management unit suite now reads the canonical generated production module rather than a historical QA copy. Regressions were observed failing before implementation: irrelevant rotation action accepted; legacy conversation guard absent; active medical-pause explanation absent. Fresh unit and contract runs pass. Contracts cover pre-choice terms, described buttons, relevant actions, no free trust, repeat prevention, immutable rejection, active state and real save restoration.

Builder parses20 scripts. Compared with Build30, only script16 changes; the delivery engine, foundation and medical logic are byte-identical. Focused dossier contracts pass, including active-view preservation, normal reopen reset, trade return context and focus target. Six perfection checks pass. Fresh broader integration passes:28 unchanged baseline regular-match results across seeds101/809, two completed finals paths, twelve simultaneous promised bowlers with legal allocations, and restored management state. Results are saved in integration-green.json.

## Browser evidence: Build30

Actual Chrome check at761px: full bench names now fit without arbitrary fragments; XI injury blocker is beside the disabled confirmation. Root replaced OUT Mohammad Yousuf with Murray Goodwin through the normal player chooser, confirmed XI and played2012 Round2 Gloucestershire v Sydney Thunder. Toss said Thunder won and chose to bowl. Started playback, paused at2.5 overs, inspected390px live layout and skipped to result. Gloucestershire102/9; Thunder103/7 in13.5, win by3 wickets with37 balls remaining. Adil Rashid was MoM. Mobile scorebook fits batting numeric columns. Escape closes it. Stats show Goodwin1 match6 runs and Haddin2 matches129 runs, matching the newly viewed scorebook. User career now at2012 Round3. This is one actual playthrough, not exhaustive engine certification.

## Remaining work

Candidate conversation layout still needs physical desktop/mobile and keyboard inspection after download. Ordinary bowling priorities still need a design separate from relationship promises. Offseason overview needs unresolved relationship stories. Mobile live hierarchy gives an ordinary dot ball substantial visual weight and merits review. Wider review still needs trades, finals, retirement extremes, every club colour and zoom coverage. Historical rating prototype remains unpromoted.

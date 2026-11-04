# Midseason XI return investigation

Native report: Build53 Punjab2009Round4, injured Bond swapped for Saqlain; enabled Return to matchday clicked twice but team screen remained. Season navigation Matchday worked.

Ran `node qa/native53/lodge-repro.mjs` against delivered Build53. The documented test fixture uses the real foundation draft and season initialization, then sets calendar2009/round3 and one selected nonkeeper injury. It does not reproduce the native save.

Real controller actions editXI, swapSelected, swapSelectedWith and lodge all returned true. After swap, XI problem was empty and pending swap null. Lodge returned ui.view=season, engine screen=season, empty feedback, matchday tab, round3 and14fixture schedule preserved. No game errors.

Source path uses existing-full-schedule G.startSeason -> specialGo('season'), then controller sets matchday view. No concrete logic defect found and no product changes made.

Native follow-up should read Return button data-action/disabled/geometry, focus it and use Enter, then inspect visible screen/feedback. This can distinguish pointer/clip/hit-area timing from controller failure. Do not patch the engine from this unreproduced symptom.

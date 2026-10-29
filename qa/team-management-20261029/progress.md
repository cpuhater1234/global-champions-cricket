# SDD ledger — plan: docs/superpowers/plans/2026-10-29-living-squad.md

Recovery: workspace reverted to older snapshot after conversation handoff. Retrieved authoritative published v100 (SHA c1cf40e5e9e75a2e792b6e87d1c7068bb8a0d813c2cbcf50eca0ede5a47c9b45, Library version104). Rebuilt missing uncommitted work from the recorded design. No published work was lost.

Pre-flight: pure model feeds adapter, adapter feeds screens/controller. Match boundaries capture pre-match medical availability, then consume completed scorecards. Only scripts16,17,19 change; all other inline sources stay byte-identical.
Task1: unit test failed because management engine absent, then passed with persistent reducer. Includes medical pauses, role promises, request recovery, rotation cooldown and malformed active promise rejection.
Task2: browser test failed on v100 because management adapter absent. Integrated candidate created; browser GREEN pending.
Task2: complete — real six-match browser test passes; broken promise, subsequent transfer request, agreement and exact reload verified.
Task3: complete — medical/finals/replay edge suite, contrast/mobile click,36layouts and84view scan passed with documented scan limit.
Final review: fresh independent reviewer; no critical findings. Conditions nested data, finals weather/round and rotation grace fixes each reproduced RED then GREEN. Enlarged-text squeeze and badge fit reproduced and fixed.
Integration: existing user authorization covers saving the playable and pushing the active branch. Main remains README-only signposting. No new permission gate or baseline merge.

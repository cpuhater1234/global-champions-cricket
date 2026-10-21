# Save visibility and season review, 21 October 2026

Artifact SHA256: add512cdc4f7945924b4c3c764cc85dd93ea66909367d32663a22b32d677c525.

A real injected localStorage write failure showed that ordinary feedback could replace the only save warning. The header now retains a separate warning until an actual save succeeds. Dialog feedback still exposes the failure while a modal is open. Normal successful saves have no extra header element. The conflict warning retains its existing instruction to return home and Continue; save conflict semantics are unchanged.

Browser testing exposed an additional season-review defect: enlarged club-name text and a fixed badge could escape their boxes. Club names can now wrap, the badge accommodates its text, and summary metrics reflow to fit the available width.

Regression qa/v8_save_visibility_test.mjs failed before the fix and passes after it. Browser qa/release-20261021/save-warning.cjs checks twelve width/root-text combinations, actual injected quota failures, native menu/dialog actions and successful recovery. Images are blocked in this deterministic layout check. Ten existing focused suites pass the exact final hash. No new human or independent novice evidence was produced; agent attempts failed due workspace credits. Full career enjoyment, platform coverage and other product-completion gates remain open.

The previous filename-storage hypothesis was disproved in tested Chromium file URLs; do not report filename changes as proven save loss.

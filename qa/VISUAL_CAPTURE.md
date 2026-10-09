# User-controlled visual evidence

Open `visual_capture.html` locally in a browser supporting `getDisplayMedia`.
Open the latest GCC build in a separate browser window. Choose Start capture,
select the game window in the native sharing chooser, and visit the screens
being reviewed. Hold each screen for at least five seconds. Stop capture,
download the ZIP, and attach it to the review conversation.

The page captures PNG pixels every four seconds, capped at 90 frames. It has
no network calls, game file access, DOM inspection, save access or game controls.
Capture requires a user click and the browser's native sharing permission.
The user decides which window is shared and whether the resulting ZIP is sent.
The page cannot attest to the build version. Keep the selected build name and
hash with the evidence. Current baseline is v7.8.7, SHA256
`8dfda284f00ca7f693f96b734ae9a95edb9ad0b133165dcaef9024eae74478c2`.

If sharing is unavailable or denied, the page shows the Windows Snipping Tool
fallback. No browser settings, extensions or security overrides are required.

Verification: `node qa/test_visual_capture.mjs` exercises the script with a
mock media stream and canvas: user-click gating, capture, stop, ZIP export,
cancellation recovery and unavailable-API handling. The resulting ZIP was
independently opened with Python zipfile and passed CRC and metadata checks.
This does not test native browser permissions, actual screen capture or game
layout. Actual visual review remains pending user-supplied captured images.

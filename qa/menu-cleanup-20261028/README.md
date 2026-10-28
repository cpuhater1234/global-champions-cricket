# GCC v87 menu and stadium-caption cleanup

Remove the Career backup menu entry and the stadium icon from both caption renderers. Retain venue names and photograph credits. Automatic saving and normal Continue are unchanged. Backup engine routines remain internal; no backup controls are rendered in the game menu.

SHA256 `819ef918e74cdbc885cb76fbd59b8375706799496526e5a60bd028a1a28e8b13`, 8,072,050 bytes. Both standalone game aliases and the supplied download are identical. Reproduce with `python qa/menu-cleanup-20261028/build.py --promote` from a repository checkout; it reads the pinned v86 commit, not an older generic build.

Validation: baseline RED reproduces the unwanted menu entry and icon. Final native Chromium GREEN checks menu/caption at 320,390,768,1440px; all36 venue captions are icon-free with ground name and credit; a saved career resumes after reload and the resumed menu contains no backup entry. Zero page errors. All20 scripts pass syntax checks; exactly3 presentation scripts change through the exact substitutions recorded in build.py; the other17 scripts remain exact. Source files and both game aliases match the tested HTML. This targeted presentation edit does not claim a new full-game or cross-browser audit.

# Two-ability draft-card release

Approved role pairs: BAT Batting/Fielding; BOWL Bowling/Fielding; AR Batting/Bowling; WK-BAT Batting/Keeping. No arbitrary third slot. Equal-width cells and a subtle divider remain on phones and enlarged text. Overall, best phase, underlying abilities, simulation and save formats are unchanged.

Only component script11 and workspace CSS differ from the immutable728baseline. Build with `python qa/card-clarity-20261025/build.py`; both canonical HTML aliases are identical. The baseline file is versioned in the repository. See build.json for exact hashes.

Actual Chromium browser.json records36 role/viewport/text combinations; values match players, columns are equal and on the same row, dividers remain visible, and cells stay inside cards. qa/draft-card-polish/report.json additionally records all8sort alignment/contrast checks. Screenshots were inspected internally, not saved as deliverables. Independent review found no blocking issues. Stable playable saved asLibraryversion60.

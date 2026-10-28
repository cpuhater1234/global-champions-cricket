# GCC v89 — current Vitality Blast team identities

Use the current2026 men's competition names consistently with the game's existing current-club catalogue. This alternate-history2008–2026 game uses a fixed identity catalogue, not year-by-year historical rebrands.

| County ID | Display name |
|---|---|
|DER|Derbyshire Falcons|
|HAM|Hampshire Hawks|
|KEN|Kent Spitfires|
|LAN|Lancashire Lightning|
|LEI|Leicestershire Foxes|
|NOT|Notts Outlaws|
|NOR|Northamptonshire Steelbacks|
|SUS|Sussex Sharks|
|WAR|Warwickshire Bears|
|WOR|Worcestershire Rapids|

Durham, Essex, Glamorgan, Gloucestershire, Middlesex, Somerset, Surrey and Yorkshire retain their county names. In particular, do not revive Essex Eagles or Yorkshire Vikings from older seasons; Birmingham Bears became Warwickshire Bears for2026.

Verified28October2026 against official ECB2026 fixtures: https://www.ecb.co.uk/news/4408037/vitality-blast-mens-competition-fixtures-2026 and the club's rebrand announcement: https://www.edgbaston.com/bears/media-article/vitality-blast-teams-to-rebrand-as-warwickshire-bears-for-2026 . The authoritative display registry is v8/data/blast_names.json; this supersedes older identity annotations in the original catalogue research record.

The registry changes club names after catalogue loading. A narrowly scoped helper refreshes saved club labels in league/draft arrays, fixture/result references, scorecard innings and club-career headings before UI rendering. The saved Continue label resolves by club ID. No club IDs, membership, colours, grounds, conditions, RNG, roster ownership or scores change. Historic narrative log strings are retained as written.

Rebuild: `python qa/blast-names-20261028/build.py --promote`. Pinned v88 base570b5476d73a8371ba2b37eb77c79d9b8e415a9b. SHA256 `551ef91eac802d6b85fce962abdd7270e7ddfcb6f5e11d0e7080cf8db649cf0f`,8,075,428bytes. Both game aliases and saved download match.

Validation: baselineRED reproduces the missing Blast labels. Final catalogue checks verify all10aliases plus Essex/Yorkshire;144native Chromium guide cases cover all18counties at320/390/768/1440px and16/24px root fonts, with zero page errors or guide/document overflow. Actual saved Lancashire career, Continue label, reload and HUD use Lancashire Lightning. Thirteen paired seeded rounds preserve every non-name career value, RNG and scorebook; save roundtrip passes. All20inline scripts pass syntax checks;17scripts including simulation and persistence are byte-identical. Only catalogue setup, home Continue wording and a presentation label-refresh call change. Prior colourful cards and v87menu/caption cleanup remain.

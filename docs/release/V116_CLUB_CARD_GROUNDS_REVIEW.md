# Club card ground rows

Review candidate 4b167b19fe092c28f4183497a7522072f289812955890228e37b2a7fa550e01e (6,671,554 bytes), based on delivered Career Record Review 32d28ef2. Scope: early club reveal and club-selection cards.

Removed card trait paragraph; it remains available in the existing full club guide. Short card display names: SRH Rajiv Gandhi Stadium, LSG Ekana Stadium, PBKS Mullanpur Stadium. Canonical full ground names/data are unchanged; full names retained as row title and club guide heading.

CSS root cause: owner10 raised ground fill plus owner31 triple-ID panel/border repaint. Removed owner31 ground rule; updated existing club-card owner10 for transparent, unboxed icon/name rows, 44px minimum and normal word wrapping. Existing flex body pushes ground rows into alignment; no new stylesheet or broad override layer.

Exact source guard: only bodies10/27/31 differ from Career Record Review; 21 runtime bodies byte-identical. Runtime27 change limited to card presentation/short-name helper. Match/draft/save logic and club confirmation unchanged. Native focused visual fixture explicitly includes the three long-name clubs plus seeded clubs. Not a gameplay simulation or all-club combinatorial certification. Native run 43585943796 PASS on exact candidate: eight grid states across 1440/768/390/320px plus club-guide captures. Zero failures. All eight 320px ground rows are 44px high with equal bottom spacing (13.796875px). Transparent/unbordered ground owner, visible icon, removed card paragraph, intact ground words, no horizontal overflow, full name in guide and no automatic club confirmation verified. Mobile/desktop choice and tablet reveal rasters inspected. No promotion.

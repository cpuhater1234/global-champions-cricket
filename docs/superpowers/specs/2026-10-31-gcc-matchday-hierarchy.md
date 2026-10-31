# Matchday hierarchy and decision clarity

Intent: fulfil the standing Madden/FC/Football Manager standard through clearer managerial decisions, rather than cosmetic similarity. User asks for a rigorous review and has repeatedly instructed autonomous execution.

Observed in Build20 at1150x666: fixture starts near212px, fixture468px tall, sidebar513px. Main Watch match action sits at the lower viewport edge. Campaign record/form appear after the fixture. Conditions warning (spin advantage, no regular primary spin options, fit Ray Price on bench) follows three transfer requests. Multiple loose rows and disclosures follow. The same Wants a move text masks different causes and active promises.

Approaches considered: reskin existing panels (does not fix order); replace the entire UI (high regression cost, discards established assets); restructure the matchday screen around existing actions and truthful data (chosen implementation call). Keep the single HTML architecture and cricket engine unchanged.

Changes:
- Campaign overview above the fixture: actual ladder rank after matches, wins/losses, NRR and recent form. Fresh season shows no league matches played; no misleading tied rank claim.
- Existing Review XI/Choose XI/Watch match controls at the top of the fixture panel, before venue artwork. Preserve injury/keeper guards and command names. No extra play confirmation.
- Existing venue, photo, home-first club cards and weather retained. Conditions/selection guidance attached to the fixture, before the manager proceeds; no invented tactical ratings.
- Sidebar remains for injury/role/transfer/commitment issues. Active promise progress and concise cause shown beneath status, so a request does not hide a promise. Existing priority ordering and all rows remain accessible.
- Latest result gets a bounded panel. Match preview, ground detail, league format and season analysis grouped into a consistent information panel. Trade window remains available only under existing rules.
- Normal navigation continues in the header; metrics are informational rather than deceptive clickable tiles. Existing icons/crest only. Charcoal with club accents, robust text and consistent borders.

Acceptance checks: one primary heading; truthful pre-season and midseason values; actions before artwork in DOM; conditions and selection visible in main fixture; no floating legacy rows; active promise not hidden by request; no state mutation; all medical/keeper gates preserved. Browser targets1150x666,390x844 and320px width: primary action visible near the top, no page overflow, controls >=44px, long names retained. These layout targets require rendered verification, not just source contracts.

Research: EA Madden26 Franchise Deep Dive (Coach Central overview, clearly contextualised weekly stories); FC26 Career Deep Dive (stable hub navigation); Sports Interactive FM27 interface deep dive (clear primary/secondary navigation, upper action panel, reduced clicks). These are design references, not proof GCC is usable or equivalent in quality. URLs recorded in review evidence.

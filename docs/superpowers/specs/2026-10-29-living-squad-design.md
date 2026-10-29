# Living squad management

The team-management decisions must generate the career story. Replace the narrow v100 three-innings recap presentation with persistent, actionable squad expectations. Preserve the existing form, fitness, conditions, batting-role and match simulation effects. Trust must not become an undisclosed performance modifier.

Implement in the existing standalone browser build, on the active work branch. The frozen v7.0.14 reference remains untouched. Keep the solid saturated colours, strong boundaries and compact visual hierarchy established in current releases.

Players remember repeated healthy omissions, batting outside their preferred role, and full-length innings without a meaningful bowling opportunity. Managers can make optional concrete commitments, explain rotation, rest injured players using the existing XI tools, and respond to unresolved transfer requests through the existing legal trade market. Do not fabricate quotes or force disruptive weekly conversations. Display actual recent scorecard evidence, fitness, role expectations and actual next-match conditions where selections happen.

Medical absences and managed injuries pause commitments. Short opposition innings do not count as a full bowling opportunity. Match processing must be idempotent; replays and rendering cannot alter state or consume RNG. Career identity prevents cross-career leakage. Old saves initialise safely; retained players keep trust while seasonal streaks reset and unfinished seasonal commitments expire without penalty. Departed and temporary players are excluded.

Builder decision: use a pure versioned management reducer plus thin adapter, rather than rewriting the cricket engine or inventing a dialogue system. Repeated unresolved concerns can become a transfer request, but no automatic transfer occurs. This is the first playable management layer, not a complete personality or training simulation.

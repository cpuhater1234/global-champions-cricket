# Career understanding implementation plan

Goal: explain consequential rules where players use them, without prescribing tactics or adding permanent walls of text.

Scope: UI only. Preserve engine, rating, RNG, save and exposed draft-slot behaviour.

1. Audit engine rules and existing help. Add a concise annual draw explanation, contextual selection help, season/trade status and personalised offseason departure information.
2. Show exact owned draft selections from engine pickSlots after the draw; distinguish ordinary and supplementary picks and preserve legacy schedules.
3. Split optional offseason help into readable cards; align guide and trade-dialog copy with actual rules.
4. Test retirement counts 0/3/4/5/7, outgoing trades/releases/incoming players, ordinary and supplementary snake order, full squads and legacy schedules. Verify rendering is state-neutral and engine scripts unchanged.
5. Render desktop/mobile and enlarged-text cases, inspect screenshots, independent review, publish same playable and Git branch.

Human first-time understanding remains unobserved; automated tests cannot establish it.

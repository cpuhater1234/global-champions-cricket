# Player dossier navigation

Observed in connected Chrome Build22: Symonds modal is840px wide; body1782px tall. Identity118px, batting order82px, abilities172px, management728px, player detail516px, phases52px. The management concern begins below the ability bars near the bottom of the first desktop viewport. This is repeated vertical scanning, not a clear report workflow.

Choose three explicit report views in the existing dialog: Overview, Attributes and Management for an owned player in a management context. Overview keeps core ability, outlook/development and GCC record. Attributes presents all existing detailed skills and phases without requiring an extra Detailed skills expansion. Management presents current concern, explanation, form/fitness/trust, recent performances, commitment progress and existing decisions.

Normal inspect opens Overview. Review player in a squad-issue list opens Management directly. Making a management decision stays on that view. Closing and ordinary reopening resets to Overview. Draft/non-owned scouting has no management view. Common identity and existing Pick/Select/Swap actions remain visible; selected batting order controls remain available. No new commitment, selection or match rules. Existing scout return routing preserved.

Use pressed view buttons in a labelled group rather than claiming a composite ARIA tab widget without arrow-key support. All remain keyboard buttons. Maintain close/focus handling in existing dialog controller. Data source remains existing read helpers, with an optional section argument preserving default playerRead output. Do not introduce portrait placeholders or new icons.

Desktop overview can place ability and outlook/record panels side by side within the existing report width; narrow view stacks them. Management and attributes use their available width with readable font sizes and44px controls. These layout goals require rendered verification. Do not infer a10/10 score from passing source tests.

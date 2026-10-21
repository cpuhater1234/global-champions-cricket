# Player-facing visual and wording review

21 October 2026. Reviewed artifact: 20106af30b6002b05f3e05ce7a1ac7f4ecc7eee363e0001c8eaef23a5952c3c3. This is an inspection and prioritised design assessment, not another product change or a human enjoyment study.

## Verdict

The game is more legible than it was, but visual appeal remains uneven. Its best panels communicate through relationships: comparison pairs two players, release review shows before/after squad counts, club cards carry recognisable colours, and result cards expose scores and outcome. Weaker screens still communicate through a stack of similarly styled containers and sentences. The result is a competent management interface with some attractive sports-game elements, rather than a consistently finished sports game.

Eye enjoyment is not established by screenshots. The following findings are informed design judgments with concrete visible examples. They should guide the next implementation pass and then be tested with unfamiliar players.

## Reviewed evidence

Fresh native desktop (1280×900) and narrow (390×900) journeys: home, intro, club reveal, club choice, club guide, signing entry, partial draft draw, draft entry, first user pick. Full-page screenshots and visible text captured by qa/player-facing-review/capture.cjs; capture.json records the text. External photographs were deliberately blocked, so fallback composition is visible but real photography quality/loading is excluded.

Also inspected exact-build native screenshots for empty/full XI, matchday, live match opening and match result; exact-build scout, comparison/reference styling and projected-XI screenshots; and current 2009 offseason overview, management, trade and release screenshots. Finals, long archive and career-ending views were read in source but not visually replayed in this review. Motion was not systematically assessed.

## Findings, ordered by player impact

| Priority | Surface | What the player sees | Required outcome |
| --- | --- | --- | --- |
| High | Global hierarchy | Many navy panels with almost identical outlines, body text colour and heading weight. Club colour is often limited to a badge or thin edge. | Preserve the dark arcade base but give each task a distinct composition. Use lime for the main action, cyan for inspection/comparison, amber for genuine cautions and club colours for identity. Avoid turning every panel into a bright card. |
| High | Intro | Four substantial paragraphs; on 390px the opening narrative occupies almost the entire tall page before the next action. | A short premise and a compact visual career structure. Put extended fiction behind an optional disclosure. Keep essential signing-versus-drafting distinction. |
| High | Mobile club selection | Eight full-height franchise cards in a single long column. Every club repeats competition, city, ground, trait and action chrome. | Compact selectable list on narrow screens, richer focused preview for the selected club. Choosing a club should be quick to scan without flattening club identity. Desktop grid can remain. |
| High | Draft rhythm | A successful-pick message inserts a block above the heading, moving the clock, filters and player board down. Latest signing, squad count, selected list and helper copy compete with the current pick. | Stable board position while picking. Latest signing should carry acknowledgement without a second layout-shifting success banner. Keep the clock/current picker and selection controls visually dominant. Preserve accessible announcement. |
| High | Result context | A completed Round 1 result has a global header reading Round 2, while the page eyebrow reads Round 1. | Distinguish the result being viewed from the next fixture. A result's header should identify its own round; the next-opponent panel should identify the forthcoming round. |
| High | Scouting | The new grouped panels are clearer, but two batting groups, bowling, mentality, outlook, status and phase details still make a long dialog. | Prioritise the player's primary role and the decision the user is making. Show principal abilities first, group secondary detail cleanly and retain complete inspection on demand. The Compare layout remains the reference for spacing and number emphasis. |
| Medium | Signing entry | “These players join the league. Your club drafts afterwards.” is repeated as “These are league commitments. Your club chooses its players in the draft.” Large empty feed and oversized day strip dilute the focal player. | One short explanation, one focal current signing, compact five-day progress, active wire as supporting content. State clearly when the user is watching rather than recruiting personally. |
| Medium | Draft sidebar | The latest-signing panel improves identity, but empty selected-player disclosure leaves a conspicuous blank separator. Squad count repeats in the pulse and sidebar. | No empty disclosure before a first pick; one compact squad count/coverage summary and an informative selected-player surface. |
| Medium | XI selection | Player identity/role and selection are clearer, but the full mobile eleven extends below the viewport. Lodge XI is encountered before the list and support instructions occupy separate blocks. | Keep selection progress and next action available while reviewing a long list. Order, keeping and bowling capacity should read as one cohesive XI task. Do not add automatic selection. |
| Medium | Matchday | Fixture and readiness are understandable, but round/club/matchday headings consume vertical space; stadium/conditions need further scrolling on narrow screens. | Prioritise opponents, venue, XI readiness and Watch match in one composition; make supporting preview and conditions clearly secondary. |
| Medium | Match playback | Pause/speed/skip occupy the first large panel; the actual score arrives further down, followed by a large uppercase team label. | Score and match state should lead. Playback controls should be compact and subordinate, with batter/bowler and recent deliveries easy to locate. Use a broadcast scoreboard composition, not another management form. |
| Medium | Offseason overview | Helpful development and vacancies are visible, but repeated prose explains retention, core continuity, vacancies and optional changes. The phrase “cricket jobs” sounds like design language. | Lead with retained/retired/vacancies and development changes; one brief retention rule. Use squad roles, batting order and bowling attack rather than abstract jobs. |
| Medium | Manage squad | Thirteen rows repeat Scout player, Trade and Review release, with much of the name-to-action span empty on desktop. | Keep explicit actions and safe confirmations, but reduce repeated prompts, group role information and make row rating/action alignment deliberate. Avoid retreating to hidden generic menus. |
| Medium | Trade | Give/receive colours and review warning are useful. Dropdown, player identity and rating repeat, while effects/review controls sit below the first viewport. | A compact exchange header with readable selected players, visible consequences and a reachable review action. Preserve keeper, bowling and included-pick warnings at final confirmation. |
| Medium | Wording | Draft order, On the clock, Bowling accuracy and Shot control improved. Remaining phrases include “The core jobs are covered”, “The returning core”, “A tougher year ahead” and “The model’s over-by-over bowling allocation”. | Concrete cricket labels: Squad balance, Retained players, ability change and Bowling spells. Preserve distinctions between estimated ability, observed performance and uncertain development without repeating disclaimers on every panel. |
| Low | Presentation details | Punctuation and voice vary between label-style titles and full-sentence titles; several all-caps eyebrows repeat information in the heading. | Consistent labels without unnecessary terminal periods, short cricket-specific action verbs, restrained uppercase and no redundant eyebrow/heading pairs. |

## What to retain

- Compare's two clear player identities, metric grouping and readable paired bars.
- Club colours and badges as recognisable identity cues.
- Direct Pick/Scout actions, manual XI and explicit trade/release confirmation.
- Result scores and outcome as dominant content; the factual loss summary must not invent causation.
- Before/after release counts and the important last-wicketkeeper warning.
- Latest signing and visible annual development; refine their density instead of removing useful information.

## Proposed implementation order

1. Stable draft board/feedback and correct result-round context. Repair these concrete issues first.
2. Opening and club-choice pacing: shorter intro, compact narrow-screen club selection, less repeated signing text.
3. Shared hierarchy and wording pass across XI, matchday, playback and annual management, using each screen's real task to determine layout.
4. Reinspect the entire visible journey including scrolled content, keyboard focus, active/disabled states, successful and refused transactions, finals, archive and 2026 ending. Review real photograph delivery and motion separately.
5. Observe unfamiliar players' first impressions, wrong turns and willingness to continue. Technical completion and design judgment cannot establish enjoyment.

No release-ready claim follows from this review. The current published build is unchanged.

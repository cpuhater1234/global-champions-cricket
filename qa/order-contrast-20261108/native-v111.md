# Native v111 decision-screen audit, 8 November 2026

Claimed existing localhost QA tab, continued from club reveal. Actual390px viewport now confirmed.

Chooser: eight cards each356x183.875px, document scroll380 <viewport390. Kolkata guide/select successful. Signing: primary320.8x44px, secondary156.4x44px each, secondaries sharey487.6. Skip closes160 committed/110 declined.

Draft-order live phone: Pause/Speed155.6x44px in one row, Reveal all320.8x44px below. Document scroll380. Found Brisbane Heat name color rgb(16,43,52) on floodlit navy gradient rgb(19,40,64)->rgb(12,26,40): legacy --order-ink used outside badge. Rule owner workspace.css1322/1323. v112 changes parent and explicit rank/name/status ink to shared --gcc-text; no new style block. Badge markup/club ink untouched. Regression fails before at1.00849 contrast against lightest navy stop, passes after at>=4.5.

Draft: KKR Round1Pick5, player cards and turn readable; phone Pick controls44px, no page overflow. Picked Nathan Bracken; squad count1/15, Pace1. Squad dialog365client=365scroll; close control/role grid/player name and rating readable. Screenshot reviewed. Current QA paused via squad dialog.

v112 exact source substitutions into111. All20 scripts byte-identical/syntax checked. Non-style markup/assets identical. Candidate visual acceptance pending download; verify order names for dark-ink clubs on desktop/phone before acceptance. Native two-tab race and10clean launches remain open; no full-game certification.

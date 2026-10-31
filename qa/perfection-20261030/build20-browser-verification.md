# Build 20 connected Chrome verification

Observed URL: local GCC_v8_Playtest_20.html. Continued Gloucestershire 2011 Round5 result. Corrected Ladder position copy and club-coloured scorebook headers establish this is the intended build.

Verified rendering and interaction:
- Perth scorebook header orange rgb(243,108,33), dark ink rgb(27,20,16); Gloucestershire yellow rgb(242,206,34), dark ink rgb(17,17,17). Charcoal table rows retain clear numeric alignment.
- Fresh Round6 toss: Gloucestershire won the toss and chose to bowl. Only this sentence is shown, with no redundant opponent action. Desktop controls end at495px in a666px viewport; both are48px tall and above the fold.
- At390x844, both toss controls remain above the fold (bottom542px),48px tall. No horizontal page overflow. Long club-name live panel Worcestershire Rapids wraps legibly within155.6px; score tokens remain intact.
- Start match reveals0/0, while opposition is Yet to bat. Home club remains first. Pause/Skip work; persistent toss sentence matches the selected batting order.
- No visible backup/export/restore-file controls or prompts in the inspected home, result, toss, live, squad or statistics screens. Source contracts separately cover removed controller actions and download reminders; no save-failure condition was forced in the browser.
- Mobile league leaders show all4 columns including SR/economy. At390px,348px wrapper and scroll width; at320px,278px wrapper and scroll width. No table overflow. Navigation remains horizontally scrollable at320px, with Matchday partly outside the current scroll position after selecting Stats; this is accessible scrolling, not full navigation visibility.
- Compact mobile XI summary now has both actions side by side and the first player begins near the bottom of the initial viewport even with the very long Punjab venue name.
- Symonds management dialog explains his transfer request with5 full innings without bowling opportunities. Recorded a two-over role commitment through UI. Round7 scorebook confirms0/21 in2.0 overs. Punjab chased in14.2overs, so the counter remains2 full opportunities under its documented full-innings threshold. No broken promise was inferred.
- Fresh Round7 toss: Punjab Kings won the toss and chose to bowl. Both home-winner and away-winner cases now observed in Chrome; both selected bowl. Bat-choice coverage remains automated, not newly browser-observed.

Browser left at2011 Round8 matchday. Viewport override reset. No new source fixes were made in this verification pass, so no further game download is required.

Limits: screenshots were inspected after the brief coin motion had settled; animation timing was not measured. Reduced-motion behaviour is specified in CSS but was not toggled on the user's device. Latest keyboard loop, new-career/draft browser review, physical phone testing and historical data audit remain outstanding. This verifies named behaviour and layout, not a10/10 product claim.

Follow-up clarity point, not a confirmed engine defect: Round8 guidance counts0spin options although Symonds' profile says pace & spin. Source counts regular bowlers by their primary R.bowlingStyle, so this needs review of wording and secondary-style support before changing model data or selection logic.

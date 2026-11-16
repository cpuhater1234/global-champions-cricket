# Player clarity, roles and dynasty challenge

Current build: `game/global_champions_cricket_v8_player_clarity.html`, SHA256 `a9857c9c5a480deaa87c7c976b37a452ec35310b45c9481287dc0fd9611c682f`. See `qa/v8_player_clarity_scope.json` for exact completed verification and digest separation.

## What changed for the player

Player ratings now appear in team-room order/squad rows and dressing-room rows, as well as player cards. The role board shows an XI rating or projected squad preview. Player numbers describe current ability out of 99; the XI read combines the existing phase skills, resources, keeping, fielding, role fit and cohesion. It is not an average of player overalls or a win probability. Squad preview uses the existing projected best-XI helper. Form/fitness remain separate visible reads.

The squad job board now has an explicit All-rounders group. Role lines distinguish batting all-rounders, bowling all-rounders and balanced all-rounders from their current batting/bowling skills, alongside broad bowling type and batting job. This is a cricket interpretation of model skills, not a claim that every board's official role taxonomy is identical.

All explicit sub-1rem font-size declarations were raised to 1rem, including mobile rules. Role descriptions, squad details, captions and metadata use stronger weight. The card and row layouts can grow. Role headings and filter text no longer break inside a word; role filters keep each label intact. This addresses the source risk behind the trailing S in Bowlers. No screenshot was available to prove the exact original cause or final rendered alignment.

Result headlines now distinguish a chase, a defended total, a failed chase, Super Over outcomes and spectator matches. Factual performance spotlights and full scorebooks remain. No invented ball-by-ball events or decorative tactical controls were added.

## Shared development and CPU value

`v8/domain/career_paths.js` supplies one deterministic forecast for annual progression, foundation/annual CPU career value and trade value. Foundation players keep their exact 2008 anchor. Young foundation players develop towards the existing hidden projection at their model peak window; role-specific skill growth prevents specialist bowlers gaining elite batting merely from overall growth. Post-peak decline and existing exit years remain.

The CPU's future value combines a discounted near-term window, the best future scoring window and limited longevity value. This preserves competition for known future stars without treating a distant peak as identical to immediate strength. Annual CPU drafting now uses the career-aware evaluation, club identity, roster need, conditions, scarcity and seeded variation. The previous duplicated large need bonus is reduced. Market valuation responds to individual career development as well as current ability, age, form, fitness and fit.

Warner now grows from 71 to 98 and Kohli from 72 to 99 in the isolated actual career-advance fixture. In eight fresh foundation drafts with a current-quality-only human strategy, signed Warner went at picks 29, 37, 27, 32 and 33; signed Kohli at 42, 42, 41 and 41. Neither survived into the last rounds. All eight signed pools were distinct. These are targeted exploit checks, not proof of optimal CPU play under every strategy.

The annual sensitivity fixture lowers only Bumrah's model peak, which now reduces both CPU evaluation and market value. Later arrivals use their own generated career path rather than falling back to the 2008 projection table. Older players retain decline and retirement; prime players can still be rational multi-season investments.

Existing archived scorecards retain their stored facts. Loading an older career hydrates player development using the current model, so subsequent selections/results can change; this is a gameplay calibration change. Career peaks and numeric skill paths are model inputs, not empirically calibrated historical cricket ratings.

## Role audit and corrections

The 399-player universe passed structural checks for unique IDs/names, clean text, allowed roles, position ranges, bowling-style enums and generated bowling usage. Eight broad identities were checked against primary sources:

| Player | Broad bowling identity | Source |
|---|---|---|
| Andrew Symonds | Pace and spin | https://www.cricket.com.au/news/3315880 |
| Shane Watson | Pace | https://www.cricket.com.au/players/CA:2368/shane-watson |
| Mitchell Marsh | Pace | https://www.cricket.com.au/players/CA:722 |
| Daryl Mitchell | Pace | https://archive.nzc.nz/Players/1069/1069676/1069676.html |
| Glenn Maxwell | Spin | https://www.cricket.com.au/players/CA:591/glenn-maxwell |
| Liam Livingstone | Spin (both off-spin and leg-spin, not pace/spin dual) | https://www.ecb.co.uk/news/346917 |
| Hardik Pandya | Pace | https://www.icc-cricket.com/rankings/63751/hardik-pandya |
| Saim Ayub | Spin | https://www.icc-cricket.com/rankings/70241/saim-ayub?appview=true |

The audit found wrong derived spin labels for Marsh/Mitchell and pace for Ayub. The source-owned job registry corrects those before the simulation/UI read a style. No handedness or finer bowling subtype is guessed from a skill number.

Generated bowling entrants previously carried zero expected usage, making genuine bowlers read as occasional. They now receive role-appropriate usage. Named batting all-rounder templates also stop cloning an elite batting peak into equally elite bowling: their bowling peaks/usage are capped separately. These caps are stated game calibration, not sourced historical measurements.

Smith retains his early spin-all-rounder starting identity, then moves to top-order batting with occasional bowling from the model's 2013 transition. His bowling does not grow into an elite attack merely because his batting career improves. Background: https://www.cricket.com.au/news/4193300/steve-smith-australia-test-milestone-10k-runs-batting-career-highlights . The transition year is an explicit game-model choice.

Five frontline bowling options are no longer described as short purely because each expected usage prior is slightly below four. The qualitative cover read requires legal capacity and adequate expected contribution; quality by phase remains a separate matchup read. Enough bowling options is not the same as high-quality death bowling.

This is not primary-source certification of every historical statistic/biographical field for all 399 players. Existing rating provenance, provisional arrivals and the alternate-history 2008 eligibility model remain explicit limitations.

## Grounds and photographs

Twenty club-ground photo routes are stored in `v8/assets/venue_photos.json`, with verified Commons source pages, creators and licences. League matchday uses the fixture's home club; the Grand Final uses its actual host club; the career ending uses the user's home venue. The main menu chooses a ground independently of the cricket RNG, names its home team, stays stable during rerenders and changes on a new visit.

The MCG picture is embedded. Nineteen new photographs currently load externally. Host downloads returned HTTP 403, so they could not be embedded in this environment. They need internet access in the user's browser; remote loading was not natively verified. Reserved 4:3 frames and an error handler reveal a correctly named pitch illustration if a photo fails, rather than substituting the MCG. Photographs illustrate the venue, not the simulated year, weather or ongoing match.

No foreground photo-credit caption was added. Licence/source notices are bundled in the standalone HTML source and project metadata; original images remain unmodified and retain their own licences. Non-commercial use alone does not remove licence requirements.

## Completed QA

The matrix digest `99d229af1ab957d6b1d7431bd6e2604ec793ba808ef77f1b1570ead4d96da0c9` completed one 2008–2026 career: nineteen seasons, 266 regular games, thirteen played finals and cold checkpoints. Eight foundation drafts also passed on that digest. Draft timer/skip equivalence, supplementary/transferred picks, trades, injury recovery, malformed/failed save restoration, highlights and UI/source layout regressions passed.

A two-season smoke on `f534930dd2b4caa4ea79d1b8560acdc43a736717a5b420fd269696412c7af2be` completed 28 regular matches. Final changes from matrix to delivered artifact are photo metadata and two UI read modules: cover wording and all-rounder descriptions. Engine, controller, scheduler, screens and save scripts are byte-identical across these candidates. The final artifact separately passed 1,373 focused checks, career-value sensitivity, the 121-check experience regression, parsed markup, source syntax and byte-identical frozen rebuild.

The 337 captured matches / 674 innings from career and smoke passed 14,170 scorebook assertions. Scores range 84–234, median 156; these are descriptive diagnostics, not a comparison against an empirical IPL/BBL/Blast distribution. Earlier partial candidate careers and diagnostic strategy runs are excluded.

No native rendered pixels, geometry, focus, zoom/mobile, input, remote-photo loading or smoothness evidence exists. Preserve the browser restrictions and user-operated screenshot review path. No deployment, Actions, release, external messages or subagents.

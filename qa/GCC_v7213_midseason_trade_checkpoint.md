# GCC v7.2.13 Mid-Season Trade Window Checkpoint

## Status

Accepted second-year in-season dynasty hardening on top of authoritative v7.2.12.

## Source of truth

- Input: `game/global_champions_cricket_v7_2_12_offseason_transition_isolation.html`
- Output: `game/global_champions_cricket_v7_2_13_midseason_trade_window.html`
- v7.2.12 SHA-256: `10e0ea729a0bc5d3bacfbec759b3d91f38eae26caec266913338ac38c7410283`
- v7.2.13 SHA-256: `21788e247134133ea2aaa998d864b82384526f27dac2ef8cc72c4ed33c00ea99`
- Passing corrected regression run: `37413907180`

## Problem fixed

The 2009 Round 7 trade opportunity was consumed as soon as the user opened the Trade Centre.

That meant inspecting the market and closing it without making a deal permanently removed the only mid-season trade window.

## Correct behavior

The Round 7 window now remains open until an actual mid-season trade is accepted.

Opening and cancelling the Trade Centre does not consume the opportunity.

Once an accepted mid-season trade completes, the window is marked used for that season and disappears from the Season strip.

A second trade attempt is blocked.

## Injury / replacement coverage

The same regression also verifies the existing injury-cover lifecycle:

- an unavailable XI player can open the temporary replacement market
- a replacement can be signed
- the temporary player can enter the XI
- once the injured player returns, replacement mappings clear
- the temporary replacement leaves the roster
- the recovered player returns to the XI
- XI and batting order remain 11 players

## Mid-season acceptance

At Round 7:

- Season remained the only active screen
- `OPEN TRADE WINDOW` was visible
- opening the Trade Centre did not mark the window complete
- cancelling restored the same open opportunity
- the test completed a valid accepted trade
- accepted trade changed one player-for-player roster asset
- user roster remained 15
- global roster ownership remained unique
- Season remained the active screen for a bench-player trade
- the trade-window CTA disappeared after the accepted trade
- the consumed state survived hard reload / Continue

In the accepted run the test trade was:

`Ian Bell -> STA`
`Tim Bresnan -> user club`

The specific players are seed-dependent QA evidence, not a gameplay rule.

## Scope protection

The guardrail confirms all core simulation/data blocks remain unchanged.

The only behavioral change is mid-season window consumption semantics:

1. opening the market does not consume it
2. an accepted mid-season trade consumes it
3. further mid-season trades are blocked for that season

## Acceptance decision

v7.2.13 Mid-Season Trade Window is accepted at:

`21788e247134133ea2aaa998d864b82384526f27dac2ef8cc72c4ed33c00ea99`

# QA — Visual Hierarchy & Cold-start (v93 polish stream)

**Date:** 2026-11-06  
**Branch target:** `work/v8-game-first-rebuild`  
**Local artifact:** `GCC_v93_polish.html` (hierarchy layers v94–v98)

## Context

Phase 1 stability validation confirmed core scripting and DOM are solid under a full playthrough. Parallel visual work focused on decision hierarchy and first-hour experience so the game meets the standard of an all-time cricket drafting / management title.

## What was enforced

### Draft board — sacred pick hierarchy (v9.7)
- **Primary:** available players + current pick context
- **Secondary:** team needs / latest picks (inset, quieter)
- **Tertiary:** advice / tips (supporting only)
- Clock creates pressure without owning the page
- Player cards: name + role + one rating dominate; actions demoted

### Global hierarchy unification (v9.6)
- Single type scale: kicker → title → body → meta
- Unified surface language (raised / inset / line)
- Residual arcade chrome (heavy shadows, left bars, text-shadow) demoted

### Cold-start / League Intro (v9.8)
- Primary CTAs locked to strong uppercase voice and consistent height
- League Intro decision bar given clear ownership of the next step
- Bottom meta strip demoted to tertiary
- System / concurrent notices framed so they cannot compete with content hierarchy
- MENU hit target reinforced for desktop reliability

## Cold-start review findings

| Screen | Hierarchy | First-impression risk | Notes |
|--------|-----------|----------------------|-------|
| Home | Strong | Low | Best screen; stats row still slightly under-integrated |
| League Intro | Improved | Medium | Was flat; v98 gives CTA ownership and sequential runway |
| Club Reveal | Medium | Medium | Identity strong; control/action bars still slightly bolted |
| Draft | Improved | Was highest | Sacred-pick rules now in place; needs live play validation |
| Manage / Signing | Pending | High | Next precision targets after cold-start lands |

## Concurrent-career notice
A system notice can appear during cold starts when prior session state exists. v98 frames it as secondary chrome. **Product fix still required:** clean cold starts must never show internal multi-session warnings.

## Repo hygiene

- Do **not** overwrite protected baselines on `main` or `protected/*`
- Promote this stream as a named candidate under `game/` when ready, e.g.  
  `game/gcc_v93_hierarchy_coldstart.html`
- Keep QA notes in `qa/` with date and scope
- Full automated playthrough + MENU reliability remain required before any promotion

## Next ordered steps

1. Live validation of Draft hierarchy in a real pick sequence  
2. MENU control reliability (Phase 1 open item)  
3. Manage Squad row quieting (same scanning discipline as Draft)  
4. Signing Wire decision ownership  
5. Simulation battery (300+ matches) — parallel accuracy track  

## Expert standard applied

All hierarchy decisions were made against the job of a cricket GM:
- Current decision owns the screen
- Lists must be scannable under pressure
- Secondary panels stay secondary
- One primary action per view
- Atmosphere supports focus; it does not replace it

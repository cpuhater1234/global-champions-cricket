# Sports-management UI review, 31 October 2026

## Method and evidence limits

This is a structured expert review, not a human usability study or an academic claim. Evaluate each screen for orientation, decision relevance, action clarity, information hierarchy, club identity, responsive legibility, interaction reliability and outcome feedback. Separate observed browser defects from design judgments and unverified model questions. No numerical polish score is assigned without anchored evidence.

High priority means a frequent action or important decision is obscured, misleading or needlessly difficult. Medium means repeated scanning/navigation effort. Low means a local visual inconsistency. A passing code contract is not proof of visual quality. Screenshots and DOM geometry establish the baseline; the revised build needs a second browser pass at1150x666,390x844 and320px width.

## Baseline findings and response

| Area | Observation | Effect on play | Response | Verification |
|---|---|---|---|---|
| Matchday action | Fixture top212px, height468px at1150x666; Watch match sits near bottom edge | Main action competes with artwork and needs scanning | Move existing match controls above artwork | DOM/action contracts pass; rendered position pending |
| Campaign context | Rank, wins/losses and recent form follow fixture as loose rows | Current campaign hard to read as one state | Bounded campaign overview above fixture | Fresh/midseason contracts pass; layout pending |
| Tactical preparation | Spin warning and Ray Price bench option follow3transfer requests | Immediate selection decision is buried | Conditions/selection guidance inside fixture | Read-only/action contracts pass; layout pending |
| Squad concerns | Repeated Wants a move label; active promise hidden by concern or injury | Different causes look identical; consequences unclear | Show concise cause plus active progress, including medical pause | Independent review found gaps; expanded contracts pass after correction |
| Supporting information | Loose last-result row, preview button and several full-width disclosures | Weak grouping and repetitive visual rhythm | Bounded latest-result and information panels | Content/routing contracts pass; visual balance pending |
| Rule preservation | Rearrangement initially omitted annual-draft clarification | Could imply finish controls draft order | Restore exact rule | Independent review and contract verify |
| Narrow navigation | At320px the current tab is scrolled into view and early tabs may be clipped | Extra horizontal gesture, lower discoverability | Retained for this batch; reconsider in navigation pass | Existing behaviour observed, not newly fixed |
| Player dossier | Relationship expectation says regular bowler, outlook says supporting bowler | Potential mismatch between expectations and capability | Track separately; do not change ratings from UI heuristics | Not a confirmed data/engine defect |
| Bowling guidance | Dual-style player label and primary-style count can differ | May confuse coverage interpretation | Qualify count as regular options; deeper secondary-style audit remains | Model unchanged; further review required |

## References and interpretation

- Sports Interactive FM27 interface review: https://www.footballmanager.com/fm27/features/fm27-clearer-interface-smoother-navigation . Their published direction separates navigation from information tiles, brings actions to an upper control panel and reduces unnecessary clicks. Applied here as stable existing navigation plus upper match controls, not a copy of FM's full feature set.
- EA Madden26 Franchise Deep Dive: https://www.ea.com/games/madden-nfl/madden-nfl-26/news/madden-26-gridiron-notes-franchise-deep-dive . Coach Central presents an overview, while weekly stories identify relevant context. Applied as truthful campaign state and differentiated squad issues, without inventing a story engine or approval system.
- EA FC26 Career Deep Dive: https://www.ea.com/games/ea-sports-fc/fc-26/news/pitch-notes-fc26-career-mode-deep-dive . The hub uses stable tabs for career content. GCC's existing top navigation remains the primary route rather than making every information tile clickable.

## Engineering checks

New contracts cover pre-season/midseason state, campaign placement, controls before artwork, grouped information, concern plus promise, injury plus promise, injury gate, recognised-keeper gate and state immutability. A test initially removed only one keeper from a two-keeper XI; corrected the test fixture to remove every recognised keeper, rather than changing correct game behaviour.

Delivery engine, foundation engine, dynasty engine, controller, original screen module, components and delivery presentation scripts are byte-identical to Build20. Only management presentation and the coordinated UI module/CSS changed. Matchday returns its own renderer directly, avoiding building and discarding the legacy matchday first.

Independent code review found3issues; all resolved and re-reviewed: medical status hid promise progress, active promise hid cause, annual draft guidance was omitted. No new important issues reported. This is code review, not browser sign-off.

## Next verification

Check action position and text wrapping at all3target widths; compare primary action visibility with baseline; verify conditions precede squad-transfer concerns in the player's scan; test all controls with keyboard; test long names and empty/fresh states; inspect trade entry before/after Round3. After matchday, review player dossier hierarchy, navigation at320px, current draft onboarding and remaining historical data. Do not label the game10/10 based on this batch.

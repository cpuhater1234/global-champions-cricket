# GCC Build32, 1 November 2026

## Changes

Commitment terms now precede their buttons in DOM/visual reading order. Medical-pause guidance appears before the choices. Buttons align at the bottom of their cards, preserving readable context and existing described-by associations.

Offseason overview now includes the existing squad-decision panel, linking straight to Management reports. Actual concerns, injuries and commitments are shown; no empty panel is rendered. Generic roster reassurance now asks the user to review fitness and concerns before committing to the retained group. All roster and departure logic remains unchanged.

## Red/green verification

Commitment contract failed on terms-after-button order; passes with the new order. Offseason test failed because no decision panel was rendered; now passes for transfer request, active commitment, injury, direct review action, immutable rendering and quiet empty state. The offseason fixture creates a current-year commitment after rollover to exercise presentation; it does not claim old promises survive annual expiry. Existing management units and focused dossier contracts pass. Builder parses20 inline scripts. Compared with Build31 only script16 changes; delivery/foundation/medical scripts are identical. See build32-parity.json.

Independent experience review found no new concrete defect in routes, context preservation, conditional rendering or medical copy. It was source/offline review, not browser approval of Build32.

## Actual Chrome Build31 playtest

Desktop and390px player management inspected. Mobile cards readable; header and view buttons remain visible during scroll. An ordering problem was observed at desktop: an action could enter the viewport before its terms. Build32 addresses this but needs physical recheck after download.

Made a real three-fit-match promise to OUT Mohammad Yousuf at2012 Round3. Closed with Escape and verified focus returned to the Review player opener. Round3 vMI lost205/2 to207/2; injury went2 to1, promise stayed3 and displayed medical pause. Round4 vSTA lost102 all out to243/4; injury cleared, promise remained3 and pause disappeared. Selected Yousuf for Goodwin using the normal replacement chooser. Round5 vSCO lost137/6 to139/2. AtRound6, fully available Yousuf showed2 fit matches remaining and18(18) in recent innings. This confirms one actual paused-to-active assessment sequence; not every injury/promise combination.

Built and reviewed an Azhar Mahmood-for-Ian Bell trade with Sydney Thunder, then submitted. It was declined with a clear value reason and no movement. Trade flow and keeper protections are not fully certified by this single rejection.

Career left at2012 Round6 with Yousuf selected and two fit matches remaining on the promise. No match has been played using Build32.

## Remaining priorities

Ordinary bowling tactics remain tied to promise-based prioritisation; design a separate user-controlled policy with strict legal allocations. Mobile live dot-ball prominence merits a hierarchy/density pass. Trade second-player labels are duplicated across sides; investigate clearer spoken labels. Recheck new offseason overview in an actual offseason, zoom and extreme-retirement states. Historical starting-rating calibration remains unpromoted. Broader first-time-player enjoyment testing still required. No flawless or exhaustive claim.

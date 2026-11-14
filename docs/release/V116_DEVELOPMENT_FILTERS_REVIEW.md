# Development panel and draft filter review

Candidate ad874945a2995adb59921738df7cb14403aa11fbf3ce5a38e273153baa319e39, 6,664,126 bytes. Baseline delivered Shared Analysis Review a522817b. Existing CSS09/10/31 only; all22runtime bodies byte-identical. No new stylesheet or gameplay/save changes. Review branch work/v116-candidate-acceptance; frozen v116/main untouched.

Development component now owns plain player/skill-change rows and disclosures across offseason and XI. Removed duplicate annual row paint from owner31 and two conflicting owner10 padding rules. Excluded development from owner31 generic fills/disclosure paint; owner09 generic raised .g8moredata now excludes development's returning-player disclosure. Labels, deltas, before/after values, top changes and every-returning-player disclosure are unchanged.

Draft filters use the actual .gccuiPool container width: caption-safe three-column layout when space permits, two columns below650px pool width and one below430px. Replaces viewport-only phone workaround that missed a narrow pool at768px viewport. Minimum role/sort tracks are160/210px when multi-column. Source options, labels, sort logic and44px control height unchanged.

Initial native run43610886889 captured44states. Copy/delta preservation passed, but found remaining owner09 disclosure fill and768px caption clipping. Both source causes corrected; exact-hash follow-up run43611608686 PASS:44states, zero failures. Includes24paired development views (offseason/XI collapsed/XI expanded at1440/768/390/320) and20filter states (four roles at1440/768/390/360/320). Development text, deltas and returning-player counts retained; labels/numbers contained and disclosures unboxed. Selected caption measurement includes actual computed font, padding and24px native arrow allowance. At768px Wicketkeepers needs151px and receives180px; longest sort needs196px and receives208px. At320px each control receives272px. Controls retain44px height. Final390px collapsed/320px expanded XI,1440px offseason and768px keeper-filter captures inspected.

Approval: automatic review initially blocked four-file upload; user approved. Follow-up introduced CSS09 and revised payload, blocked again; user explicitly approved CSS09/10/workflow and further test-driven CSS/QA/handoff corrections for this UI pass. Approved upload succeeded. No bypass.


Reviewed delivery GCC_v116_Development_Review.html has exact candidate identity above. Runtime guard confirms CSS09/10/31 only versus previous delivered Shared Analysis Review; all22runtime bodies unchanged. No new stylesheet. Unpromoted; previous Shared Analysis Review retained as rollback. This is a bounded development/filter pass, not whole-game visual certification.

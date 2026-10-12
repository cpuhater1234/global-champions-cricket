"""Resolve known matching selectors for critical captured components.

This checks author cascade priority against actual component selector paths.
It is not a selector engine, layout renderer, or substitute for browser QA.
"""
import importlib.util,re,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('ownership',ROOT/'tools/recovery_css_ownership.py')
css=importlib.util.module_from_spec(spec);spec.loader.exec_module(css)
def rules(text,width):
    for head,body in css.blocks(text):
        if body is None:continue
        head=re.sub(r'/\*.*?\*/','',head,flags=re.S).strip()
        if head.startswith('@media'):
            if 'prefers-reduced-motion' in head:continue
            lo=re.search(r'min-width\s*:\s*(\d+)px',head);hi=re.search(r'max-width\s*:\s*(\d+)px',head)
            if (not lo or width>=int(lo[1])) and (not hi or width<=int(hi[1])):yield from rules(body,width)
        elif not head.startswith('@'):yield head,body
def canonical(s):return re.sub(r'\s*([>+~])\s*',r'\1',re.sub(r'\s+',' ',s.strip()))
def winner(selectors,prop,width=1440):
    candidates=[];order=0;matching={canonical(s) for s in selectors}
    for name in ['legacy-foundation.css','legacy-feedback.css','recovery.css','season.css']:
        for head,body in rules((ROOT/'src/styles'/name).read_text(),width):
            for selector in css.split(head,','):
                order+=1;s=canonical(selector)
                if s not in matching:continue
                ids=len(re.findall(r'#[\w-]+',s));classes=len(re.findall(r'\.[\w-]+|\[[^]]+\]|:(?!:)[\w-]+',s));tags=len(re.findall(r'(?:^|[ >+~])([a-zA-Z][\w-]*)',s))
                for d in css.split(body,';'):
                    if ':' not in d:continue
                    key,value=d.split(':',1);key=key.strip();value=value.strip()
                    if key=='font' and prop=='font-size':
                        m=re.search(r'\b(\d+(?:\.\d+)?px)\b',value)
                        if not m:continue
                        key='font-size';value=m[1]+('!important' if '!important' in value else '')
                    if key!=prop:continue
                    priority=('!important' in value,ids,classes,tags,order)
                    candidates.append((priority,value.replace('!important','').strip(),s))
    return max(candidates)[1:] if candidates else (None,None)
class CascadeTests(unittest.TestCase):
    def test_waiting_final_is_compact(self):
        selectors=['.final-match','.finals-championship .final-match','#finals .finals-championship .final-match','#finals .final-match','#finals .finals-championship .final-awaiting','#finals .final-awaiting']
        self.assertEqual(winner(selectors,'min-height')[0],'76px')
    def test_roster_role_text_is_readable(self):
        selectors=['.xi-row-player span','#team .xi-row span','#team .xi-row-player span','#team .xi-row-player>span']
        self.assertEqual(winner(selectors,'font-size')[0],'12px')
    def test_result_club_labels_are_readable(self):
        selectors=['.story-scoreline span','#matchStory .story-scoreline span','#season .story-scoreline>div>span']
        self.assertEqual(winner(selectors,'font-size')[0],'13px')
        self.assertEqual(winner(selectors,'color')[0],'#fffdf7')
    def test_mobile_incomplete_start_stays_hidden(self):
        selectors=['[hidden]','.button','.team-quick-start','#team .team-command-actions .button','#team .team-command-actions .team-quick-start','#team .team-command-actions .team-quick-start[hidden]']
        self.assertEqual(winner(selectors,'display',390)[0],'none')
    def test_xi_feedback_note_is_readable(self):
        selectors=['.profile-note','#team .profile-note','#team #profileNote','#team .profileNote']
        self.assertEqual(winner(selectors,'font-size')[0],'12px')
    def test_swap_feedback_does_not_fade_information(self):
        self.assertEqual(winner(['#team .xi-change-land','#team .batting-slot.xi-change-land'],'animation')[0],'none')
    def test_navigation_remains_available_on_tablet(self):
        self.assertEqual(winner(['.nav'],'display',980)[0],'flex')
    def test_season_view_controls_are_readable(self):
        self.assertEqual(winner(['.season-view-button','#season .season-view-button','#season [data-season-view]'],'font-size')[0],'12px')
    def test_full_ladder_type_is_readable(self):
        self.assertEqual(winner(['td','#ladder td','#season table td','#season table :is(td,th)'],'font-size')[0],'13px')
    def test_fixture_result_is_readable(self):
        self.assertEqual(winner(['.result','#fixtures .result','#season .fixture .result','#season .fixture :is(b,small,.result)'],'font-size')[0],'13px')
    def test_overview_opponent_type_is_readable(self):
        self.assertEqual(winner(['#season .season-run-row b','#season .season-run-opponent b','#season .season-run-opponent :is(b,span)'],'font-size')[0],'13px')
    def test_overview_score_type_is_readable(self):
        self.assertEqual(winner(['#season .season-run-opponent span','#season .season-run-opponent :is(b,span)'],'font-size')[0],'13px')
    def test_draft_role_tags_are_readable(self):
        self.assertEqual(winner(['.player-chip','#draft .player-chip'],'font-size')[0],'11px')
    def test_sheet_stacks_at_narrow_width(self):
        self.assertEqual(winner(['#team .team-sheet-grid','.team-sheet-grid'],'grid-template-columns',390)[0],'1fr')
if __name__=='__main__':unittest.main()

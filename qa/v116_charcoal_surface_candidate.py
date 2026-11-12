#!/usr/bin/env python3
"""Review-only semantic charcoal surface migration at existing CSS owners.

No new selectors, stylesheets, geometry, JavaScript or club/status colours.
Native visual approval and computed guide parity are separate gates.
"""
import argparse
from hashlib import sha256
import json
from pathlib import Path
import re
from v116_core_density_candidate import patch_release as density_candidate
from v116_menu_surface_candidate import EXCLUSION
from v116_source_reconciliation import BLOCK, RELEASE

BASE_SHA256='f7283f99daa15666451836d69eda8b396fabe927002a03e1118c40442436c567'
APP=b'#g8app#g8app#g8app'; STAGE=b'#g8stage#g8stage#g8stage'
DIALOG=b'#g8dialog#g8dialog#g8dialog'+EXCLUSION
FLOOD='gcc-floodlit-visual'; CLEAN='gcc-cleanup-pass'; PERFECT='gcc-v116-perfection-pass'


def patch_surfaces(base):
    if sha256(base).hexdigest()!=BASE_SHA256:
        raise ValueError('Charcoal surface baseline identity mismatch: STOP')
    blocks=list(BLOCK.finditer(base)); owners={}
    for name in (FLOOD,CLEAN,PERFECT):
        hits=[m for m in blocks if m.group(1).lower()==b'style' and ('id="'+name+'"').encode() in m.group(2)]
        if len(hits)!=1:raise ValueError('Ambiguous surface owner: '+name)
        owners[name]=hits[0]
    css={name:m.group(3) for name,m in owners.items()}; corrections=[]

    def edit(owner,selector,prop,old,new):
        # Select an exact declaration in an existing exact rule. No selectors added.
        pattern=re.compile(re.escape(selector)+rb'\s*\{([^{}]*)\}')
        hits=[]
        decl=re.compile(rb'(?<![-\w])'+re.escape(prop)+rb'\s*:\s*([^;]*)(?:;|$)')
        for rule in pattern.finditer(css[owner]):
            ds=[d for d in decl.finditer(rule.group(1)) if d.group(1).strip()==old]
            if ds:hits.extend((rule,d) for d in ds)
        if len(hits)!=1:raise ValueError('Ambiguous surface declaration: '+owner+' '+selector.decode()+' '+prop.decode())
        rule,d=hits[0];start=rule.start(1)+d.start(1);end=rule.start(1)+d.end(1)
        css[owner]=css[owner][:start]+new+css[owner][end:]
        corrections.append(dict(owner=owner,selector=selector.decode(),property=prop.decode(),before=old.decode(),after=new.decode()))

    palette={b'--gcc-ground':(b'#050d16',b'#101419'),b'--gcc-panel':(b'#0c1a28',b'#171b20'),
             b'--gcc-raised':(b'#132840',b'#222930'),b'--gcc-inset':(b'#07131e',b'#11161b'),
             b'--gcc-line':(b'#27445f',b'#343c46'),b'--gcc-muted':(b'#a3b8c8',b'#b9c3ce'),
             b'--gcc-text':(b'#eef5fa',b'#edf1f5')}
    for prop,(old,new) in palette.items():edit(FLOOD,b':root,'+APP,prop,old,new)
    edit(CLEAN,b':root',b'--gcc-panel',b'#10263a',b'#171b20')
    edit(CLEAN,b':root',b'--gcc-rule',b'#365667',b'#343c46')

    def bg(selector,old,new=b'var(--gcc-panel)!important',owner=FLOOD):
        edit(owner,selector,b'background',old,new)

    bg(APP,b'radial-gradient(1100px 520px at 88% -8%,rgba(90,175,255,.20),transparent 62%),\n    radial-gradient(800px 460px at 4% 2%,color-mix(in srgb,var(--vx-glow) 22%,transparent),transparent 60%),\n    repeating-linear-gradient(90deg,rgba(255,255,255,.018) 0 90px,transparent 90px 180px),\n    linear-gradient(180deg,#071522 0%,#050d16 55%,#040a11 100%)!important',
       b'radial-gradient(900px 400px at 85% -10%,color-mix(in srgb,var(--vx-glow) 8%,transparent),transparent 68%),linear-gradient(180deg,var(--gcc-panel),var(--gcc-ground))!important')
    bg(b'#g8hud#g8hud#g8hud',b'linear-gradient(180deg,rgba(9,22,35,.94),rgba(7,17,28,.82))!important',b'var(--gcc-ground)!important')
    bg(STAGE+b' .g8heading,'+STAGE+b' .gccuiTurn',b'linear-gradient(105deg,var(--gcc-raised) 0%,var(--gcc-panel) 55%,rgba(12,26,40,.6) 100%)!important',b'linear-gradient(105deg,var(--gcc-raised),var(--gcc-panel))!important')
    bg(STAGE+b' .g8welcomepanel',b'linear-gradient(150deg,rgba(19,40,64,.92),rgba(7,19,30,.96))!important')
    bg(STAGE+b' .g8heroart',b'#050d16!important',b'var(--gcc-ground)!important')
    bg(STAGE+b' .g8stadium figcaption',b'#07131e!important',b'var(--gcc-inset)!important')
    bg(STAGE+b' .g8heroart>p',b'#07131e!important',b'var(--gcc-inset)!important')
    bg(STAGE+b' .gccuiPanel,'+STAGE+b' .gccuiSquad,'+STAGE+b' .g8panel,'+STAGE+b' .g8card',b'linear-gradient(180deg,rgba(19,40,64,.55),rgba(9,20,32,.9))!important')
    bg(STAGE+b' .gccuiPlayer',b'linear-gradient(180deg,#14304a 0%,#0a1826 62%)!important')
    bg(b'#g8app#g8app #g8stage .gccuiCampaignRibbon',b'linear-gradient(180deg,rgba(19,40,64,.8),rgba(9,20,32,.95))!important')
    bg(b'#g8app#g8app #g8stage .g8dressingroom,#g8app#g8app #g8stage .g8relationship',b'linear-gradient(180deg,rgba(19,40,64,.7),rgba(9,20,32,.95))!important')
    bg(b'#g8app#g8app #g8stage .gccuiSelectionStatus',b'linear-gradient(180deg,rgba(19,40,64,.85),rgba(9,20,32,.95))!important')
    bg(APP+b' .g8sheet,'+APP+b' .g8tablewrap',b'linear-gradient(180deg,rgba(19,40,64,.55),rgba(9,20,32,.92))!important')
    tables=(APP+b' .g8table thead th,'+APP+b' .gccuiTableView .g8table thead th,'+DIALOG+b' .g8table thead th,\n'+DIALOG+b' .gcc-scoreinnings .g8table thead th')
    bg(tables,b'linear-gradient(180deg,#17344f,#0f2438)!important',b'var(--gcc-raised)!important')
    bg(STAGE+b' input,'+STAGE+b' select',b'#07131e!important',b'var(--gcc-inset)!important')
    bg(DIALOG+b' summary',b'linear-gradient(180deg,#143048,#0e2236)!important',b'var(--gcc-raised)!important')
    bg(APP+b' .g8utilitymenu>div',b'linear-gradient(180deg,#143048,#0b1b2b)!important')
    bg(b'#g8dialog[data-prompt="player"] .gccuiProfileOverview .g8scoutoutlook',b'linear-gradient(145deg,rgba(20,48,63,.72),rgba(10,27,40,.72))!important',b'var(--gcc-raised)!important',PERFECT)
    bg(b'.gccuiCaptaincyLayer',b'linear-gradient(145deg,rgba(18,45,60,.92),rgba(9,24,36,.92))',b'var(--gcc-panel)',PERFECT)
    bg(b'.gccuiCaptaincyGrid select',b'#102d40',b'var(--gcc-inset)',PERFECT)

    result=base
    for name,m in sorted(owners.items(),key=lambda pair:pair[1].start(),reverse=True):
        result=result[:m.start(3)]+css[name]+result[m.end(3):]
    after=list(BLOCK.finditer(result))
    if len(after)!=len(blocks) or len(after)!=39:raise ValueError('Block inventory changed')
    for kind,count in ((b'style',17),(b'script',22)):
        if sum(m.group(1).lower()==kind for m in after)!=count:raise ValueError('Style/script count changed')
    if any(a.group(0)!=b.group(0) for a,b in zip(blocks,after) if a.group(1).lower()==b'script'):raise ValueError('JavaScript changed')
    changed=[(a,b) for a,b in zip(blocks,after) if a.group(0)!=b.group(0)]
    if [a.start() for a,_ in changed]!=sorted(m.start() for m in owners.values()):raise ValueError('Unexpected changed owner')
    restored=result
    for original,revised in sorted(changed,key=lambda pair:pair[1].start(),reverse=True):
        restored=restored[:revised.start(3)]+original.group(3)+restored[revised.end(3):]
    if restored!=base:raise ValueError('Bytes outside declared owners changed')
    return result,dict(status='CHARCOAL_SURFACE_REVIEW_ONLY',base_sha256=BASE_SHA256,candidate_sha256=sha256(result).hexdigest(),candidate_bytes=len(result),
        corrections=corrections,existing_style_blocks_changed=3,new_style_blocks=0,styles=17,scripts=22,javascript_blocks_changed=0,
        guide_owner_byte_identical=True,native_rendering='PENDING',maintained_source_parity='UNVERIFIED',
        notes=['Semantic neutral palette and existing shared hardcoded backgrounds only; no geometry or selectors changed.',
               'Club/tier/role/action/status colour declarations and championship treatments remain unchanged.',
               'Match-specific hardcoded navy live/replay/result surfaces are intentionally deferred; this is not a complete-theme claim.',
               'Native computed guide parity, contrast, club identity and actual rendered judgement remain separate gates.'])


def patch_release(data):
    base,_=density_candidate(data)
    return patch_surfaces(base)


def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--output',type=Path,required=True);p.add_argument('--report',type=Path,required=True)
    args=p.parse_args()
    if args.output.resolve()==RELEASE.resolve():raise ValueError('Frozen release cannot be overwritten')
    data,r=patch_release(RELEASE.read_bytes());args.output.parent.mkdir(parents=True,exist_ok=True);args.report.parent.mkdir(parents=True,exist_ok=True)
    args.output.write_bytes(data);args.report.write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r,indent=2))

if __name__=='__main__':main()

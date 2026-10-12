#!/usr/bin/env python3
"""Move property ownership to recovery components, removing superseded rules.

This is a one-time source migration, not part of the runtime or build. It keeps
unowned declarations and rule order. Quotes, comments and parenthesised values
are respected; no CSS package is required.
"""
import re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]/'src/styles'

def split(text, separator):
    parts=[];start=0;quote=None;escaped=False;depth=0;comment=False;i=0
    while i<len(text):
        c=text[i];pair=text[i:i+2]
        if comment:
            if pair=='*/':comment=False;i+=1
        elif escaped:escaped=False
        elif quote:
            if c=='\\':escaped=True
            elif c==quote:quote=None
        elif pair=='/*':comment=True;i+=1
        elif c in "\"'":quote=c
        elif c=='(':depth+=1
        elif c==')':depth-=1
        elif c==separator and depth==0:parts.append(text[start:i]);start=i+1
        i+=1
    parts.append(text[start:]);return parts

def blocks(text):
    start=0;quote=None;escaped=False;comment=False;level=0;opening=None;i=0
    while i<len(text):
        c=text[i];pair=text[i:i+2]
        if comment:
            if pair=='*/':comment=False;i+=1
        elif escaped:escaped=False
        elif quote:
            if c=='\\':escaped=True
            elif c==quote:quote=None
        elif pair=='/*':comment=True;i+=1
        elif c in "\"'":quote=c
        elif c=='{':
            if level==0:opening=i
            level+=1
        elif c=='}':
            level-=1
            if level==0:
                yield text[start:opening],text[opening+1:i];start=i+1
        i+=1
    if level or quote or comment:raise ValueError('Unbalanced CSS')
    if text[start:].strip():yield text[start:],None

def key(selector):
    s=re.sub(r'/\*.*?\*/','',selector,flags=re.S).strip()
    # The recovery component owns its variants too, but hidden-state gates stay.
    if '[hidden]' in s:return None
    s=re.sub(r':(?:has|not)\([^)]*\)','',s)
    s=re.sub(r'\[data-view[^]]*\]','',s)
    return re.sub(r'\s+',' ',s)

owners={}
def collect(text):
    for head,body in blocks(text):
        if body is None:continue
        clean=re.sub(r'/\*.*?\*/','',head,flags=re.S).strip()
        if clean.startswith('@media'):collect(body);continue
        if clean.startswith('@'):continue
        properties={d.split(':',1)[0].strip() for d in split(body,';') if ':' in d}
        for selector in split(clean,','):
            k=key(selector)
            if k:owners.setdefault(k,set()).update(properties)

removed=0
def migrate(text):
    global removed
    out=[]
    for head,body in blocks(text):
        if body is None:out.append(head);continue
        clean=re.sub(r'/\*.*?\*/','',head,flags=re.S).strip()
        if clean.startswith('@media'):
            out.append(head+'{'+migrate(body)+'}');continue
        if clean.startswith('@'):
            out.append(head+'{'+body+'}');continue
        selectors=split(clean,',');sets=[owners.get(key(s),set()) for s in selectors]
        if not any(sets):out.append(head+'{'+body+'}');continue
        # Split grouped selectors so unrelated siblings keep their declarations.
        for selector,owned in zip(selectors,sets):
            kept=[]
            for d in split(body,';'):
                prop=re.sub(r'/\*.*?\*/','',d.split(':',1)[0],flags=re.S).strip()
                if prop in owned:removed+=1
                elif d.strip():kept.append(d)
            if kept:out.append(selector.strip()+'{'+';'.join(kept)+';}')
    return ''.join(out)

if __name__=='__main__':
    recovery=ROOT/'recovery.css';new=recovery.read_text();collect(new)
    for name in ['legacy-foundation.css','legacy-feedback.css']:
        path=ROOT/name;path.write_text(migrate(path.read_text()))
    recovery.write_text(new.replace('!important',''))
    print(f'Removed {removed} superseded property declarations; recovery rules use no !important.')

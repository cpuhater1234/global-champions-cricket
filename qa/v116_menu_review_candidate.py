#!/usr/bin/env python3
"""Build a disposable menu-review candidate from the accepted v116 finals candidate.

The only additional edit replaces the existing guide-style owner block in the
existing decision-ui style block. It adds no stylesheet, DOM node or JavaScript.
The accepted gameplay candidate and frozen release remain independently intact.
"""
import argparse
from hashlib import sha256
import json
from pathlib import Path
import sys

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(Path(__file__).resolve().parent))
from v116_source_reconciliation import BLOCK, RELEASE
from v116_finals_layout_candidate import patch_release as finals_candidate

OLD_START=b"/* Guide review: readable headings, aligned cricket glyphs and one reading edge. */"
OLD_END=b"#g8dialog[data-prompt=prepare] .g8previewvenue>.g8eyebrow"
NEW_START=b"/* Guide review: Claude flat + dense layout, adapted to v116 markup and charcoal tokens. */"
NEW_END=OLD_END

def patch_release(data):
    base=finals_candidate(data)
    source=(ROOT/"v8/ui/decision-ui.css").read_bytes()
    assert source.count(NEW_START)==1, "Expected exactly one adapted menu owner block in decision-ui.css"
    a=source.index(NEW_START)
    b=source.index(NEW_END,a)
    new_menu=source[a:b]
    assert b>a and b"g8guideintro>h3" in new_menu, "Menu block must target v116 h3 markup"
    assert b"g8guidegrid" in new_menu and b"g8rulegrid" in new_menu, "Missing guide and rule grids"
    assert b"g8storychapters>.g8guidecard:last-child" in new_menu, "Missing story contrast correction"

    blocks=list(BLOCK.finditer(base))
    assert len(blocks)==39, "Unexpected v116 style/script inventory"
    assert sum(m.group(1).lower()==b"style" for m in blocks)==17
    assert sum(m.group(1).lower()==b"script" for m in blocks)==22
    hits=[]
    for m in blocks:
        if m.group(1).lower()!=b"style":
            continue
        css=m.group(3)
        if OLD_START in css or OLD_END in css:
            assert OLD_START in css and OLD_END in css, "Incomplete original menu owner block"
            hits.append((m,css.index(OLD_START),css.index(OLD_END)))
    assert len(hits)==1, f"Expected one original menu owner block in the frozen HTML; got {len(hits)}"
    style,start,end=hits[0]
    assert end>start
    old_menu=style.group(3)[start:end]
    assert b"g8guidegrid{display:block!important" in old_menu, "Unexpected original guide owner"
    assert b"g8guideintro>h3" in old_menu, "Expected v116 h3 heading owner"

    # Replace only the existing CSS owner bytes inside the existing style block.
    abs_start=style.start(3)+start
    abs_end=style.start(3)+end
    result=base[:abs_start]+new_menu+base[abs_end:]

    after=list(BLOCK.finditer(result))
    assert len(after)==39, "Style/script block inventory changed"
    style_changes=script_changes=0
    for previous,current in zip(blocks,after):
        assert previous.group(1).lower()==current.group(1).lower()
        if previous.group(0)!=current.group(0):
            if previous.group(1).lower()==b"style":
                style_changes+=1
            else:
                script_changes+=1
                raise AssertionError("Menu review must not alter JavaScript")
    assert style_changes==1 and script_changes==0, (style_changes,script_changes)
    assert result.count(NEW_START)==1 and result.count(OLD_START)==0
    assert b"g8guideintro>h3" in new_menu and b"g8guideintro h2" not in new_menu
    return result

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("--output",type=Path,required=True)
    p.add_argument("--report",type=Path)
    a=p.parse_args()
    assert a.output.resolve()!=RELEASE.resolve(), "Refusing to overwrite frozen v116"
    result=patch_release(RELEASE.read_bytes())
    a.output.parent.mkdir(parents=True,exist_ok=True)
    a.output.write_bytes(result)
    report={
      "status":"MENU_REVIEW_CANDIDATE_ONLY",
      "base_accepted_candidate_sha256":"5ba82e499b0b8d08706aab851449d20b6d315bf9b780a8c9674b44933d3fe094",
      "candidate_sha256":sha256(result).hexdigest(),
      "candidate_bytes":len(result),
      "existing_style_blocks_changed":1,
      "new_style_blocks":0,
      "javascript_blocks_changed":0,
      "source_owner":"v8/ui/decision-ui.css",
      "source_reproducibility":"This is a guarded review adapter, not yet full maintained-source build parity",
      "playable_release_unchanged":True,
      "main_unchanged":True
    }
    if a.report:
      a.report.parent.mkdir(parents=True,exist_ok=True)
      a.report.write_text(json.dumps(report,indent=2)+"\n")
    print(json.dumps(report,indent=2),flush=True)

if __name__=="__main__":
    main()

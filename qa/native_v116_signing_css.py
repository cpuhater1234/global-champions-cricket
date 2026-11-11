#!/usr/bin/env python3
"""GCC v116 signing-week computed-style probe in disposable native Chromium.

This captures visual facts from the frozen release at phone and desktop widths.
It does not modify the release, edit localStorage outside the fresh test origin,
infer source ownership, or certify the full game's visual design.
"""
import argparse
from hashlib import sha256
import json
from pathlib import Path
import sys
from types import SimpleNamespace
from playwright.sync_api import sync_playwright

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import captaincy_layer_v116 as native

SCRIPT = r"""() => {
  const container=document.querySelector('#g8stage .g8days');
  const nodes=[...(container?.children||[])].filter(x=>x.tagName==='SPAN');
  const visible=nodes.filter(x=>{const r=x.getBoundingClientRect();return r.width>0&&r.height>0});
  const properties=['color','background','background-color','border-color','min-width','outline-offset'];
  function declarations(el) {
    const findings=[];
    function inspect(rules, context='') {
      for(const rule of Array.from(rules||[])) {
        if(rule.type===CSSRule.MEDIA_RULE) {
          if(matchMedia(rule.conditionText).matches) inspect(rule.cssRules,context+' @media '+rule.conditionText);
        } else if(rule.type===CSSRule.SUPPORTS_RULE) {
          if(CSS.supports(rule.conditionText)) inspect(rule.cssRules,context+' @supports '+rule.conditionText);
        } else if(rule.type===CSSRule.STYLE_RULE) {
          let applies=false;
          try {applies=el.matches(rule.selectorText)}catch(e){}
          if(!applies)continue;
          const assigned=properties.filter(prop=>rule.style.getPropertyValue(prop));
          if(assigned.length) {
            findings.push({
              selector:rule.selectorText, context,
              declarations:Object.fromEntries(assigned.map(prop=>[prop,{
                value:rule.style.getPropertyValue(prop),
                important:rule.style.getPropertyPriority(prop)==='important'
              }])),
              order:findings.length
            });
          }
        } else if(rule.cssRules) {
          inspect(rule.cssRules,context+' @nested');
        }
      }
    }
    const styles=Array.from(document.querySelectorAll('style'));
    for(let i=0;i<styles.length;i++) {
      const sheet=styles[i].sheet;
      let before=findings.length;
      try{inspect(sheet?.cssRules)}catch(e){}
      for(let j=before;j<findings.length;j++){
        findings[j].style_element_index=i;
        findings[j].style_id=styles[i].id||null;
      }
    }
    return findings.slice(-36);
  }
  function snapshot(el) {
    const cs=getComputedStyle(el),rect=el.getBoundingClientRect();
    return {
      text:el.textContent.replace(/\s+/g,' ').trim().slice(0,100),
      class_name:el.className,
      rect:{x:Math.round(rect.x*10)/10,y:Math.round(rect.y*10)/10,
        width:Math.round(rect.width*10)/10,height:Math.round(rect.height*10)/10},
      computed:Object.fromEntries(properties.map(key=>[key,cs.getPropertyValue(key).trim()])),
      matching_css_rules:declarations(el)
    };
  }
  return {
    view:document.querySelector('#g8stage')?.dataset.view||null,
    viewport:{width:innerWidth,height:innerHeight},
    document_scroll_width:document.documentElement.scrollWidth,
    stage_scroll_width:document.querySelector('#g8stage')?.scrollWidth||null,
    days_found:nodes.length, days_visible:visible.length,
    active_count:visible.filter(el=>el.matches('.active')).length,
    active:visible.find(el=>el.matches('.active'))?snapshot(visible.find(el=>el.matches('.active'))):null,
    inactive:visible.find(el=>!el.matches('.active'))?snapshot(visible.find(el=>!el.matches('.active'))):null,
    all_widths:visible.map(el=>Math.round(el.getBoundingClientRect().width*10)/10),
    day_labels:visible.map(el=>el.textContent.replace(/\s+/g,' ').trim().slice(0,60)),
    day_classes:visible.map(el=>el.className),
    day_parent:container?(()=>{
      const c=getComputedStyle(container),r=container.getBoundingClientRect();
      return {
        display:c.display,grid_template_columns:c.gridTemplateColumns,
        flex_wrap:c.flexWrap, gap:c.gap,
        width:c.width,min_width:c.minWidth,
        padding_left:c.paddingLeft,padding_right:c.paddingRight,
        rect:{left:r.left,right:r.right,width:r.width},
      };
    })():null,
    span_measures:visible.map(el=>{
      const c=getComputedStyle(el),r=el.getBoundingClientRect();
      return {text:el.textContent.trim(),width:r.width,min_width:c.minWidth,
        box_sizing:c.boxSizing,padding_left:c.paddingLeft,padding_right:c.paddingRight};
    }),
    overflow_candidates:[...document.querySelectorAll('body *')]
      .map(el=>({el,rect:el.getBoundingClientRect()}))
      .filter(x=>x.rect.width>0&&x.rect.height>0&&x.rect.right>innerWidth+1)
      .sort((a,b)=>b.rect.right-a.rect.right)
      .slice(0,25).map(({el,rect})=>({
        tag:el.tagName.toLowerCase(), id:el.id||null,
        class_name:String(el.getAttribute('class')||'').slice(0,160),
        text:(el.textContent||'').replace(/\s+/g,' ').trim().slice(0,55),
        left:Math.round(rect.left*10)/10,right:Math.round(rect.right*10)/10,
        width:Math.round(rect.width*10)/10,
        overflow_x:getComputedStyle(el).overflowX,
        position:getComputedStyle(el).position
      }))
  };
}"""

def enter_signing(page):
    native.load_game(page)
    page.wait_for_timeout(450)
    for title in ("start new career", "reveal the eight clubs", "reveal all", "choose your club"):
        assert native.click_text(page,title), "Missing navigation button: " + title
        page.wait_for_timeout(650)
    assert page.evaluate("""()=>{
       const button=[...document.querySelectorAll('#g8stage [data-action=club]')]
           .find(x=>x.offsetParent!==null&&!x.disabled);
       if(!button)return false;
       button.click();return true;
    }"""), "Could not choose a club"
    page.wait_for_timeout(380)
    assert native.click_text(page,"select club"), "Select club action absent"
    page.wait_for_timeout(800)

def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--html",type=Path,default=Path(__file__).resolve().parents[1]/"GCC_v116_release (1).html")
    ap.add_argument("--out",type=Path,default=Path("qa/results/v116-signing-css.json"))
    ap.add_argument("--expect-known-overflow",action="store_true",
                    help="Inventory the frozen v116 mobile overflow without declaring the legacy release fixed")
    ap.add_argument("--experimental-candidate",action="store_true",
                    help="Accept only the exact deterministic one-declaration review candidate")
    ap.add_argument("--finals-candidate",action="store_true",
                    help="Accept only the exact in-place finals layout review candidate")
    ap.add_argument("--widths",default="390,1440",
                    help="Comma-separated viewport widths; default: 390,1440")
    args=ap.parse_args()
    widths=[int(x.strip()) for x in args.widths.split(",") if x.strip()]
    assert widths and len(widths)==len(set(widths)) and all(x>=280 for x in widths), "Invalid responsive width list"
    data=args.html.read_bytes()
    sha=sha256(data).hexdigest()
    assert not (args.experimental_candidate and args.finals_candidate), "Select only one candidate"
    candidate=bool(args.experimental_candidate or args.finals_candidate)
    if candidate:
        if args.finals_candidate:
            from v116_finals_layout_candidate import patch_release
        else:
            from v116_signing_width_candidate import patch_release
        original=Path(__file__).resolve().parents[1]/"GCC_v116_release (1).html"
        assert data==patch_release(original.read_bytes()), "Not the exact requested review candidate"
        assert not args.expect_known_overflow
    else:
        assert sha==native.OFFICIAL_SHA256, "Frozen v116 hash mismatch"
    native.SETTINGS=SimpleNamespace(mode="http")
    native.HTML_BYTES=data
    rows=[]
    overflows=[]
    with native.temporary_release_server(data) as url:
        native.GAME_URL=url
        with sync_playwright() as pw:
            browser=pw.chromium.launch(headless=True)
            try:
                for width in widths:
                    height=844 if width<=430 else 900
                    ctx=browser.new_context(viewport={"width":width,"height":height},accept_downloads=False)
                    page=ctx.new_page()
                    errors=[]
                    page.on("pageerror",lambda exc:errors.append(str(exc)))
                    try:
                        enter_signing(page)
                        observation=page.evaluate(SCRIPT)
                        observation["page_errors"]=errors
                        assert observation["days_visible"]==5, f"Expected all five signing days at {width}px: {observation}"
                        # The freshly opened signing window may have no .active day
                        # before the first scheduled signing; that is not a defect.
                        assert observation["inactive"] or observation["active"], (
                            f"No inspectable day cell at {width}px")
                        if observation["document_scroll_width"]>width+1:
                            whatif=page.evaluate("""()=>{
                              const days=[...document.querySelectorAll('#g8stage .g8days>span')];
                              const original=days.map(x=>x.getAttribute('style'));
                              const measure=()=>({
                                scroll_width:document.documentElement.scrollWidth,
                                widths:days.map(x=>Math.round(x.getBoundingClientRect().width*10)/10),
                                last_right:days.at(-1)?.getBoundingClientRect().right
                              });
                              days.forEach(x=>x.style.setProperty('min-width','0px','important'));
                              const min_width_zero=measure();
                              days.forEach((x,i)=>original[i]===null?x.removeAttribute('style'):x.setAttribute('style',original[i]));
                              return {min_width_zero,original_after_restore:measure()};
                            }""")
                            print("SIGNING OVERFLOW DIAGNOSTIC "+json.dumps({
                                "width":width,
                                "parent":observation["day_parent"],
                                "span_measures":observation["span_measures"],
                                "offending":observation["overflow_candidates"][:12],
                                "hypothesis":whatif
                            }),flush=True)
                        if observation["document_scroll_width"]>width+1:
                            overflows.append({
                                "viewport":width,
                                "document_scroll_width":observation["document_scroll_width"],
                                "offending":observation["overflow_candidates"][:12]
                            })
                            assert args.expect_known_overflow and width==390, (
                                f"Unexpected horizontal overflow at {width}px: "
                                f"{observation['document_scroll_width']}")
                        assert not (candidate and observation["document_scroll_width"]>width+1), (
                            f"Review candidate still overflows at {width}px")
                        assert not errors, f"Browser JS exceptions at {width}px: {errors}"
                        rows.append(observation)
                    finally:
                        ctx.close()
            finally:
                browser.close()
    if args.expect_known_overflow:
        assert len(overflows)==1 and overflows[0]["viewport"]==390, (
            f"Frozen release overflow boundary changed: {overflows}")
    else:
        assert not overflows, f"Unexpected viewport overflow: {overflows}"
    output={
        "status":"KNOWN_OVERFLOW" if args.expect_known_overflow else "PASS",
        "candidate":candidate,
        "known_overflows":overflows,"sha256":sha,"native_http":True,
        "widths":widths,
        "snapshots":rows,
        "note":"Computed styles and matching CSSOM declarations, not full visual sign-off or selector ownership proof"
    }
    args.out.parent.mkdir(parents=True,exist_ok=True)
    args.out.write_text(json.dumps(output,indent=2)+"\n")
    print(json.dumps({
        "status":output["status"],"sha256":sha,
        "candidate":output["candidate"],"known_overflows":output["known_overflows"],
        "widths":[r["viewport"]["width"] for r in rows],
        "signing_views":[r["view"] for r in rows],
        "visible_day_spans":[r["days_visible"] for r in rows],
        "active_count":[r["active_count"] for r in rows],
        "day_labels":[r["day_labels"] for r in rows],
        "day_classes":[r["day_classes"] for r in rows],
        "active_text":[r["active"]["text"] if r["active"] else None for r in rows],
        "active_computed":[r["active"]["computed"] if r["active"] else None for r in rows],
        "inactive_computed":[r["inactive"]["computed"] if r["inactive"] else None for r in rows],
        "representative_matching_style_ids":[list(dict.fromkeys(
            x["style_id"] for x in (r["active"] or r["inactive"])["matching_css_rules"] if x["style_id"]
        )) for r in rows],
        "page_errors":[r["page_errors"] for r in rows]
    },indent=2),flush=True)

if __name__=="__main__":
    main()

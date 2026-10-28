import pathlib,re,subprocess,hashlib,json
Q=pathlib.Path(__file__).resolve().parent
root=Q.parents[1]
raw=(Q/'base.html').read_bytes() if (Q/'base.html').exists() else subprocess.check_output(['git','show','2a59cca38ac9b4b9dc09164dbd83c1fc9864b2be:game/gcc_v8_product_candidate.html'],cwd=root)
assert hashlib.sha256(raw).hexdigest()=='40e2cf7eb0065f2a29e312b6dc89897c105dc8a87c44c21b007edd3ada799bbc'
base=raw.decode()
orig=re.findall(r'<script\b[^>]*>(.*?)</script>',base,re.S); scripts=orig.copy()
s=scripts[15];a=s.index('  return X.heading(',s.index(' X.ballReveal=()=>'));b=s.index('\n };',a);s=s[:a]+(Q/'live-tail.txt').read_text().rstrip()+s[b:];scripts[15]=s+'\n'+(Q/'experience.js').read_text()
s=scripts[17];s=re.sub(r'<div class="g8matchphoto" aria-hidden="true">.*?</div>','',s)
a=s.index('+X.ruleNote(s.year===2008?');b=s.index("+X.disclosure('Season format'",a);s=s[:a]+s[b:]
s=s.replace('+resultCard(r)+continuation+', '+resultCard(r)+X.matchAwards(r)+X.matchWorm(r)+continuation+')
a=s.index('+X.resultSummary(r)');b=s.index('\n };',a)-1;s=s[:a]+s[b:];scripts[17]=s
s=scripts[19];a=s.index(' function showUndrafted(){');b=s.index(' function completeDraft(){',a);s=s[:a]+s[b:]
a=s.index("ui.teamReturn='season';setView('team');if(s.year>2008)");b=s.index('\n }',a);s=s[:a]+"ui.teamReturn='season';setView('team');announce('Squad confirmed. Review your opening XI.',true,true);return true;"+s[b:]
s=s.replace(" bind('undrafted',['team'],showUndrafted);\n",'').replace("else if(back==='undrafted')showUndrafted();",'')
a=s.index(' function scorecard(r){');b=s.index(' function trade(',a);s=s[:a]+" function scorecard(r){assert(r?.scorecard,'This match has no scorebook.');modal('Match scorecard',X.matchScorecard(r),'scorecard');}\n"+s[b:]
s=s.replace('const guideIntro=(eyebrow,title,copy)=>','const guideIntro=(eyebrow,title,copy,opening=null)=>').replace("${copy?`<p>${copy}</p>`:''}</header>","${copy?`<p>${copy}</p>`:''}${opening?`<p class=\"g8storyopening\">${opening}</p>`:''}</header>")
s=s.replace("who runs it.')}<p class=\"g8storyopening\">Eight clubs", "who runs it.','Eight clubs").replace('lists are another matter.</p><div class="g8storychapters">', 'lists are another matter.\')}<div class="g8storychapters">')
scripts[19]=s
for i,s in enumerate(scripts):
 p=Q/f'final-{i}.js';p.write_text(s);subprocess.run(['node','--check',str(p)],check=True,capture_output=True)
it=iter(scripts);out=re.sub(r'(<script\b[^>]*>)(.*?)(</script>)',lambda m:m[1]+next(it)+m[3],base,flags=re.S)
out=out.replace('</head>','<style>\n'+(Q/'solid.css').read_text()+'\n</style></head>')
(Q/'candidate.html').write_text(out)
report={'sha256':hashlib.sha256(out.encode()).hexdigest(),'bytes':len(out.encode()),'changed_scripts':[i for i,(a,b) in enumerate(zip(orig,scripts)) if a!=b],'syntax_checked':len(scripts)}
(Q/'build.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))

import pathlib,re,hashlib,subprocess,json
q=pathlib.Path(__file__).resolve().parent;root=q.parents[1]
p=root.parent/'story-current/GCC_v8_Career_Clarity.html'
raw=p.read_bytes() if p.exists() else subprocess.check_output(['git','show','c2abe7840a6fbad8aec6f4141f02e69318e24eb9:game/gcc_v8_product_candidate.html'],cwd=root)
assert hashlib.sha256(raw).hexdigest()=='8b7e386590c49f3bd64eb15b13a20a4f5d14f5505a2354e56725233cc1eb2b84'
base=raw.decode();old=re.findall(r'<script\b[^>]*>(.*?)</script>',base,re.S);a=old.copy();a[16]+='\n'+(q/'story.js').read_text()
s=a[17];start=s.index('const fixture=fx?');mid=s.index(':`<section class="g8fixturehero g8seasoncomplete"',start);s=s[:start]+"const fixture=fx?X.storyFixture(fx,conditions,problem)"+s[mid:]
s=s.replace("'Starting XI','')+`<section", "'Starting XI','')+X.storyPanel(true)+`<section")
s=s.replace('return X.ballReveal();','return X.storyLive()+X.ballReveal();')
s=s.replace('+resultCard(r)+X.matchAwards(r)', '+resultCard(r)+X.storyResult(r)+X.matchAwards(r)');a[17]=s
s=a[19];s=s.replace('closeDialog();G.playNextRound();assert(s.round===round', 'const storyContext=X.storyBefore();closeDialog();G.playNextRound();assert(s.round===round').replace('ui.result=s.results.at(-1);beginMatch(ui.result);','ui.result=s.results.at(-1);X.storyAfter(storyContext,ui.result);beginMatch(ui.result);');a[19]=s
for n,js in enumerate(a):
 p=q/f'final-{n}.js';p.write_text(js);subprocess.run(['node','--check',str(p)],check=True,capture_output=True)
it=iter(a);out=re.sub(r'(<script\b[^>]*>)(.*?)(</script>)',lambda m:m[1]+next(it)+m[3],base,flags=re.S);out=out.replace('</head>','<style>'+(q/'story.css').read_text()+'</style></head>');(q/'candidate.html').write_text(out)
r={'sha256':hashlib.sha256(out.encode()).hexdigest(),'bytes':len(out.encode()),'changed_scripts':[i for i in range(20) if old[i]!=a[i]],'syntax_checked':20};(q/'build.json').write_text(json.dumps(r,indent=2));print(r)

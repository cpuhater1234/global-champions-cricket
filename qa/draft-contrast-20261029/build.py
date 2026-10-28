import pathlib,re,subprocess,hashlib,json
q=pathlib.Path(__file__).resolve().parent;root=q.parents[1]
base=(root.parent/'contrast-current/GCC_v8_Career_Clarity.html').read_text() if (root.parent/'contrast-current/GCC_v8_Career_Clarity.html').exists() else subprocess.check_output(['git','show','d905166de71afc65133092e8b05457916b5f1512:game/gcc_v8_product_candidate.html'],cwd=root).decode()
assert hashlib.sha256(base.encode()).hexdigest()=='00509ba76941006480cd145a2349a8968e86086312d592ffb1118be13bfada25'
a=re.findall(r'<script\b[^>]*>(.*?)</script>',base,re.S);s=a[13]
for before,after in [('Openers','Opening batting'),('Top order','Top-order batting'),('Middle order','Middle-order batting'),('Finishers','Finishing'),('Keepers','Keeping'),('All-rounders','All-round play'),('Pace bowlers','Pace bowling'),('Spin bowlers','Spin bowling')]:
 s=s.replace("['"+before+"',", "['"+after+"',")
s=s.replace('aria-label="Picked squad options. Players can cover more than one role.">','aria-label="Squad skill coverage"><p class="g8coveragecaption">Skill coverage · one player can cover several skills.</p>')
s=s.replace('<span>${esc(label)}</span><strong>${ps.length}</strong></div>', '<span class="g8coveragetick" aria-hidden="true">✓</span><span>${esc(label)}</span><strong>${ps.length} ${ps.length===1?\'option\':\'options\'}</strong></div>')
s=s.replace(" X.isFinisher=p=>"," X.allRounderJobs=p=>X.battingJob(p)+' · '+({PACE:'Pace bowling',SPIN:'Spin bowling',DUAL:'Pace & spin bowling'}[R.bowlingStyle(p)]||'Bowling type unavailable');\n X.isFinisher=p=>")
s=s.replace("p.role==='BOWL'?X.bowlingType(p):X.battingJob(p)","p.role==='BOWL'?X.bowlingType(p):p.role==='AR'?X.allRounderJobs(p):X.battingJob(p)")
assert s!=a[13];(q/'roles.js').write_text(s);subprocess.run(['node','--check',str(q/'roles.js')],check=True)
a[11]=a[11].replace("p.role==='BOWL'?window.GCC8.bowlingType(p):window.GCC8.battingJob(p)","p.role==='BOWL'?window.GCC8.bowlingType(p):p.role==='AR'?window.GCC8.allRounderJobs(p):window.GCC8.battingJob(p)")
a[11]=a[11].replace("p.role==='BOWL'?window.GCC8.bowlingType(p):'Bats · '+window.GCC8.battingJob(p)","p.role==='BOWL'?window.GCC8.bowlingType(p):p.role==='AR'?window.GCC8.allRounderJobs(p):'Bats · '+window.GCC8.battingJob(p)")
a[17]=a[17].replace("p.role==='AR'?'All-rounder'","p.role==='AR'?X.allRounderJobs(p)").replace("${esc(X.battingJob(p))}${R.isKeeper(p)","${esc(p.role==='AR'?X.allRounderJobs(p):X.battingJob(p))}${R.isKeeper(p)")
old="${!swap&&s.xi.length===11?btn('Swap'"
a[17]=a[17].replace(old,"<div class=\"g8xiactions\">${!swap?`<div class=\"g8orderarrows\">${btn('↑','move',[id,-1],'g8ghost g8small',i===0).replace('type=\"button\"',`type=\"button\" aria-label=\"Move ${esc(p.name)} up the batting order\"`)}${btn('↓','move',[id,1],'g8ghost g8small',i===order.length-1).replace('type=\"button\"',`type=\"button\" aria-label=\"Move ${esc(p.name)} down the batting order\"`)}</div>`:''}${!swap&&s.xi.length===11?btn('Swap'")
a[17]=a[17].replace("in the XI\"`):''}</li>","in the XI\"`):''}</div></li>")
a[17]=a[17].replace('Select a name to edit batting order.','Use the arrows to set your batting order. Select a name to scout.')
for n in [11,17]:
 (q/f'source-{n}.js').write_text(a[n]);subprocess.run(['node','--check',str(q/f'source-{n}.js')],check=True)
i=iter([s if n==13 else x for n,x in enumerate(a)]);out=re.sub(r'(<script\b[^>]*>)(.*?)(</script>)',lambda m:m[1]+next(i)+m[3],base,flags=re.S);out=out.replace('</head>','<style>'+ (q/'fix.css').read_text()+'</style></head>');(q/'candidate.html').write_text(out)
for n,code in enumerate(re.findall(r'<script\b[^>]*>(.*?)</script>',out,re.S)):
 tmp=q/f'check-{n}.js';tmp.write_text(code);subprocess.run(['node','--check',str(tmp)],check=True,capture_output=True)
report={'sha256':hashlib.sha256(out.encode()).hexdigest(),'bytes':len(out.encode()),'changed_scripts':[11,13,17],'unchanged_scripts':17};(q/'build.json').write_text(json.dumps(report,indent=2));print(report)

import pathlib,re,hashlib,json,subprocess
q=pathlib.Path(__file__).resolve().parent
base=q.parents[2]/'management-current/GCC_v8_Career_Clarity.html'
# This task is pinned to the published v100; do not rebuild against an old workspace alias.
raw=base.read_bytes() if base.exists() else subprocess.check_output(['git','show','fde370cb767ae88406f9667292a1061e3f1309c2:game/gcc_v8_product_candidate.html'],cwd=q.parents[1]);assert hashlib.sha256(raw).hexdigest()=='c1cf40e5e9e75a2e792b6e87d1c7068bb8a0d813c2cbcf50eca0ede5a47c9b45'
s=raw.decode();scripts=list(re.finditer(r'<script\b[^>]*>([\s\S]*?)</script>',s,re.I));parts=[m[1] for m in scripts]
parts[16]+='\n'+(q/'management.js').read_text()
def replace(i,a,b):
 assert parts[i].count(a)==1,(i,a[:100],parts[i].count(a))
 parts[i]=parts[i].replace(a,b)
replace(19,'${X.playerRead(p)}${X.playerPhases(p)}','${X.managementPlayer(p)}${X.playerRead(p)}${X.playerPhases(p)}')
replace(19,'const storyContext=X.storyBefore();','const managementContext=X.managementBefore();')
replace(19,'X.storyAfter(storyContext,ui.result);','X.managementAfter(managementContext,ui.result);')
replace(19,'const stageBefore=s.finals.stage;G.simulateFinals();','const stageBefore=s.finals.stage,managementContext=X.managementBefore();G.simulateFinals();')
replace(19,"beginMatch(r,'finals');","X.managementAfter(managementContext,r);beginMatch(r,'finals');")
replace(19,"bind('inspect','*',inspect);","""bind('inspect','*',inspect);
 bind('manageInspect',['team','season','dynasty','finals'],id=>{assert(roster().some(p=>p.id===Number(id))&&!s.pendingSwapIn,'Choose a player in your squad.');inspect(id);});
 bind('managePlayer',['team','season','dynasty','finals'],(id,action)=>{id=Number(id);assert(ui.modal==='player'&&ui.selectedPlayer===id&&!s.pendingSwapIn,'Open this player’s profile first.');X.managementDecide(id,action);inspect(id);announce(action==='rotation'?'Rotation explained. Two fit omissions will not increase selection pressure.':action==='move'?'Request recorded. A transfer still needs an accepted legal trade.':action==='keep'?'You will work to resolve the concern through future opportunities.':'Commitment recorded. Future match selections and role use will be checked.');});
 bind('manageRest',['team'],id=>{id=Number(id);assert(ui.modal==='player'&&ui.selectedPlayer===id&&injury(G.byId(id))&&s.xi.includes(id)&&!s.pendingSwapIn,'Choose a selected injured player.');G.removeXI(id);closeDialog();ui.teamPane='squad';});
 bind('manageTrade',['team','season','dynasty'],id=>{id=Number(id);assert(ui.modal==='player'&&ui.selectedPlayer===id&&X.managementState().players[id]?.seekingMove&&X.managementTradeOpen()&&!s.pendingSwapIn,'Agree to seek a move during an open trade window first.');closeDialog();if(ui.view==='team')setView('season');trade(!s.dynasty?.offseason,id);});""")
# Add pulse to both roster name buttons, preserving all existing role information.
replace(17,"${injury(p)?' · '+esc(injury(p).status):''}</small></button><div class=\"g8xiactions\">","${injury(p)?' · '+esc(injury(p).status):''}</small>${X.managementTag(p)}</button><div class=\"g8xiactions\">")
replace(17,"${injury(p)?' · '+esc(injury(p).status):''}</small></button><strong class=\"g8benchrating\"","${injury(p)?' · '+esc(injury(p).status):''}</small>${X.managementTag(p)}</button><strong class=\"g8benchrating\"")
replace(17,'<section class="g8selectionground" aria-label="Home ground"><span>${X.icon(\'building-stadium\')}</span><div><span class="g8eyebrow">HOME GROUND</span><strong>${esc(s.userClub.ground)}</strong><p>${esc(s.userClub.trait)}</p></div></section>','${X.managementGround()}')
replace(17,"))+content+`<div class=\"g8decisionbar\">","))+content+(pending?X.managementBrief(): '')+`<div class=\"g8decisionbar\">")
for i in reversed(range(len(scripts))):
 m=scripts[i];s=s[:m.start(1)]+parts[i]+s[m.end(1):]
s=s.replace('</head>','<style>\n'+(q/'management.css').read_text()+'\n</style></head>')
(q/'candidate.html').write_text(s)
for i,p in enumerate(parts):
 f=q/f'final-{i}.js';f.write_text(p);subprocess.run(['node','--check',str(f)],check=True,capture_output=True)
result={'sha256':hashlib.sha256(s.encode()).hexdigest(),'bytes':len(s.encode()),'changedScripts':[i for i,p in enumerate(parts) if p!=scripts[i][1]],'syntaxChecked':len(parts)}
(q/'build.json').write_text(json.dumps(result,indent=2));print(result)

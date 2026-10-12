// Capture generated HTML strings, not pixels or a browser DOM.
import fs from 'node:fs';
import vm from 'node:vm';
import {loadGame} from './offline_game_host.mjs';
import {foundation,selectXI} from './offline_game_scenarios.mjs';
const file=process.argv[2]||'game/global_champions_cricket_v7_9_2_audited_candidate.html';
const h=loadGame(file,151,new Map(),{strictIds:true}),G=h.G,D=h.context.Dynasty,s=G.state,stages=[];
function capture(name){stages.push({name,fragments:[...h.elements].filter(([,e])=>e._html||e.classList.contains('screen')).map(([id,e])=>({id,html:e._html,className:e.className,parent:e.parentNode?.id||null})),api:{GCC:Object.keys(G).filter(k=>typeof G[k]==='function'),Dynasty:Object.keys(D).filter(k=>typeof D[k]==='function')}});}
capture('launcher');foundation(h);capture('XI');G.startSeason();G.playNextRound();capture('season-overview');
for(const view of ['fixtures','ladder','analysis','players']){G.setSeasonView(view);capture('season-'+view);}
G.openScorecard(1);capture('scorecard');G.closeModal();
while(s.round<14){selectXI(G);G.playNextRound();}G.proceedPostSeason();if(s.finals){G.enterFinalsFromModal();capture('finals');}
G.resolveCpuFinalsOffscreen();G.openSeasonReview();capture('review');D.openArchive();capture('archive');D.backFromArchive();D.beginOffseason();capture('offseason-market');D.openTradeCentre();capture('trade-room');G.closeModal();D.drawDraftOrder();capture('annual-lottery');D.startAnnualDraft();capture('annual-draft');while(s.dynasty.offseason.phase==='draft'){const used=new Set(Object.values(s.teams).flat()),p=s.pool.find(p=>p.available!==false&&!p.dynastyRetired&&!p.draftedBy&&!used.has(p.id));D.userAnnualDraft(p.id);}capture('final-15');D.finishOffseason();capture('preseason');D.enterTeamRoom();capture('2009-XI');
const output=process.argv[3]||'/tmp/gcc-audit-markup.json';fs.writeFileSync(output,JSON.stringify({source:file,shell:fs.readFileSync(file,'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,''),stages,errors:h.errors}));
console.log(`${stages.length} generated-markup states captured. Browser layout and DOM mutations are not simulated.`);

/* Audit-only private-function exports in a temporary HTML copy. Function bodies stay unchanged. */
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {loadGame} from './offline_game_host.mjs';
export function loadLogicGame(file,seed=4603,storage=new Map()){
 const html=fs.readFileSync(file,'utf8'),dir=fs.mkdtempSync(path.join(os.tmpdir(),'gcc-logic-')),temp=path.join(dir,'inspect.html'),marker='window.Dynasty={beginOffseason',foundation='  window.GCC8_FOUNDATION_READ=';
 if(!html.includes(marker)||!html.includes(foundation))throw Error('Missing audit anchors');
 fs.writeFileSync(temp,html.replace(marker,'window.GCC8_LOGIC_AUDIT={seedArrivalUniverse,applyCareerYear,injuryChance,cpuBalancedXI,cpuSelectionValue,tradeValue,roleNeed,developmentRead,withFitnessContext,cpuReleaseDecisions,fillCpuRoster,ensureCpuRosterShape,cpuDraftPick};'+marker).replace(foundation,'  window.GCC8_MATCH_AUDIT={innings,simulateInningsPair,bowlingPlan,clubXI,phaseScore,allocateRuns,userProfileXI,bestXI};\n'+foundation));
 try{return {...loadGame(temp,seed,storage,{strictIds:true}),dispose:()=>fs.rmSync(dir,{recursive:true,force:true})};}catch(e){fs.rmSync(dir,{recursive:true,force:true});throw e;}
}

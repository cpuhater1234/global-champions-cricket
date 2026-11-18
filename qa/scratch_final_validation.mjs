/**
 * Final validation: full official audit runner on the final candidate,
 * 3 seeds x 300 matches. Writes per-seed report JSONs via the runner itself.
 * Run: node qa/scratch_final_validation.mjs
 */
import { execSync } from 'node:child_process';

for (const seed of [8301, 8311, 8312]) {
  const out = execSync(`node qa/v116_gameplay_authenticity.mjs "qa/results/v116-authenticity-candidate.html" --seed=${seed} --matches=300`, { encoding: 'utf8', cwd: process.cwd() });
  const ao = /All-Out Innings: ([\d.]+)%/.exec(out)[1];
  const cw = /Chase Win Rate: ([\d.]+)%/.exec(out)[1];
  const f1 = /Mean 1st Innings: ([\d.]+)/.exec(out)[1];
  const aoOK = parseFloat(ao) >= 8 && parseFloat(ao) <= 15;
  const cwOK = parseFloat(cw) >= 46 && parseFloat(cw) <= 55;
  console.log(`seed ${seed}: AO=${ao}% ${aoOK ? 'OK' : '!!'}  CW=${cw}% ${cwOK ? 'OK' : '!!'}  1st=${f1}`);
}
console.log('\nReports: qa/results/v116_gameplay_authenticity_report-v116-authenticity-candidate-html-seed*-m300.json');

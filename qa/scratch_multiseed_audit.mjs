/**
 * Sequential 3-seed x 300-match official audit of the current candidate.
 * Rebuilds the candidate first so the audited artifact is always fresh.
 * Run: node qa/scratch_multiseed_audit.mjs
 */
import { execSync } from 'node:child_process';

console.log('=== Rebuilding candidate ===');
console.log(execSync('node qa/scratch_build_candidate.mjs', { encoding: 'utf8', cwd: process.cwd() }));

for (const seed of [8301, 8311, 8312]) {
  console.log(`\n=== Official audit, seed ${seed}, 300 matches ===`);
  const out = execSync(`node qa/v116_gameplay_authenticity.mjs "qa/results/v116-authenticity-candidate.html" --seed=${seed} --matches=300`, { encoding: 'utf8', cwd: process.cwd() });
  const lines = out.split('\n').filter(l => /All-Out Innings:|Chase Win Rate:|Mean 1st Innings:|Overall Run Rate:/.test(l));
  console.log(lines.join('\n'));
}
console.log('\nDone.');

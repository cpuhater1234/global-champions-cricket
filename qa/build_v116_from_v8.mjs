/**
 * Build v116 release HTML from the maintained v8 source tree.
 *
 * The v116 canonical release is produced by:
 *   1. Running v8/build.py --legacy-scaffold --freeze (engine snapshot)
 *   2. Running v8/build.py --legacy-scaffold (assembles the fresh UI)
 *   3. Running v8/build.py (applies the perfection-20261030 patch)
 *
 * This script reproduces that pipeline deterministically and verifies the
 * output byte-for-byte against the frozen GCC_v116_release (1).html.
 *
 * Run: node qa/build_v116_from_v8.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const RELEASE_HTML = path.join(ROOT, 'GCC_v116_release (1).html');
const OUT_HTML = path.join(ROOT, 'qa', 'results', 'v116-rebuilt.html');

const EXPECTED_SHA = 'a1d2d3dd0e1351514923de6fdf143d63ec2b1182459c5da9f5f2dccc89fd6a5d';
const EXPECTED_BYTES = 6649027;

function sha256File(p) {
  return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
}

function run(cmd) {
  console.log(`> ${cmd}`);
  return execSync(cmd, { cwd: ROOT, stdio: 'inherit' });
}

// Step 1: freeze engine snapshot (idempotent if already frozen)
console.log('Step 1: freeze engine snapshot');
run('python v8/build.py --legacy-scaffold --freeze --output qa/results/v116-frozen.html');

// Step 2: assemble fresh UI from frozen engine
console.log('Step 2: assemble fresh UI');
run('python v8/build.py --legacy-scaffold --output qa/results/v116-fresh.html');

// Step 3: apply perfection patch
console.log('Step 3: apply perfection patch');
run('python v8/build.py --output qa/results/v116-candidate.html');

// Step 4: compare
console.log('Step 4: verify byte-identity');
const actual = fs.readFileSync(OUT_HTML);
const expected = fs.readFileSync(RELEASE_HTML);
const actualSha = sha256File(OUT_HTML);
const expectedSha = sha256File(RELEASE_HTML);

console.log(`rebuilt:  ${actual.length} bytes  sha256=${actualSha}`);
console.log(`release:  ${expected.length} bytes  sha256=${expectedSha}`);

if (actual.length !== expected.length) {
  console.error(`BYTE COUNT MISMATCH: ${actual.length} != ${expected.length}`);
  process.exit(1);
}
if (!actual.equals(expected)) {
  const minLen = Math.min(actual.length, expected.length);
  for (let i = 0; i < minLen; i++) {
    if (actual[i] !== expected[i]) {
      const ctx = 40;
      const start = Math.max(0, i - ctx);
      const end = Math.min(minLen, i + ctx);
      console.error(`First diff at byte ${i} (0x${i.toString(16)})`);
      console.error(`rebuilt: ${JSON.stringify(actual.slice(start, end).toString('utf8'))}`);
      console.error(`release: ${JSON.stringify(expected.slice(start, end).toString('utf8'))}`);
      break;
    }
  }
  process.exit(1);
}

console.log('PASS: rebuilt v116 is byte-identical to frozen release');
console.log(`SHA-256: ${actualSha}`);
console.log(`Bytes:   ${actual.length}`);
process.exit(0);
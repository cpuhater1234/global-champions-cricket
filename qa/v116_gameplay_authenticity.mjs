// v116 Gameplay Authenticity Audit - recovered UTF-8 source.
// The uploaded copy contained a partial configuration and statistics helper only.
// No gameplay audit runner was present. Direct execution must not report an audit pass.
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const SEED_COUNT = parseInt(process.env.SEED_COUNT || '100', 10);
export const MAX_DURATION = 600000;
export const seedPaths = [];
// Recovered configuration; these local result folders have not been verified.
// The broken eight-club path expression is reconstructed as club folders 0..7.
export const roots = [
  'qa/logic/final-career-5603',
  'qa/logic/final-career-5701',
  ...Array.from({ length: 8 }, (_, i) => `qa/logic/final-clubs/${i}`),
];

export function describe(values) {
  assert(Array.isArray(values), 'Statistics samples must be an array.');
  assert(values.every(value => typeof value === 'number' && Number.isFinite(value)),
    'Statistics samples must contain only finite numbers.');
  values = [...values].sort((a, b) => a - b);
  if (!values.length) return null;
  const min = values[0];
  const max = values[values.length - 1];
  // Preserve the uploaded helper's floor-index percentile convention.
  const p10 = values[Math.floor(values.length * 0.1)];
  const p25 = values[Math.floor(values.length * 0.25)];
  const p75 = values[Math.floor(values.length * 0.75)];
  const p90 = values[Math.floor(values.length * 0.9)];
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return { min, max, mean, p10, p25, p75, p90 };
}

// Retain the name reported by Cline as an alias of the actual recovered helper.
export const describe_visual_scoring_effectiveness = describe;

function selfTest() {
  assert.equal(describe([]), null);
  assert.deepEqual(describe([7]), { min: 7, max: 7, mean: 7, p10: 7, p25: 7, p75: 7, p90: 7 });
  const input = [4, 1, 3, 2];
  assert.deepEqual(describe(input), { min: 1, max: 4, mean: 2.5, p10: 1, p25: 2, p75: 4, p90: 4 });
  assert.deepEqual(input, [4, 1, 3, 2]);
  assert.deepEqual(describe([-3, -1, 2]), { min: -3, max: 2, mean: -2 / 3, p10: -3, p25: -3, p75: 2, p90: 2 });
  assert.equal(describe_visual_scoring_effectiveness, describe);
  assert.throws(() => describe([NaN]), /finite numbers/);
  assert.throws(() => describe([Infinity]), /finite numbers/);
  assert.throws(() => describe('1,2'), /array/);
  console.log(JSON.stringify({ status: 'PASS', checks: 9, scope: 'Recovered statistics helper only; no gameplay authenticity certification.' }));
}

const direct = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (direct) {
  if (process.argv.includes('--self-test')) {
    selfTest();
  } else {
    console.error('INCOMPLETE_AUDIT: the uploaded source contained no gameplay audit runner. Only its configuration and statistics helper were recoverable. Use --self-test to verify the helper; this does not audit the game.');
    process.exitCode = 2;
  }
}

/** Diagnose: load candidate in offline host with checkpoint save, inspect ui/screen state. */
import fs from 'node:fs';
import { loadGame } from './offline_game_host.mjs';

const raw = fs.readFileSync('qa/results/whole-ui-career/checkpoint-2009.json', 'utf8');
const host = loadGame('qa/results/v116-authenticity-candidate.html', 202, new Map([['gcc_dynasty_v8', raw]]), { strictIds: true });
const X = host.context.GCC8;
console.log('continue:', X.dispatch('continue'));
console.log('ui.view:', JSON.stringify(X.ui.view));
console.log('screen():', JSON.stringify(X.screen()));
console.log('dynasty.offseason:', JSON.stringify(host.G.state.dynasty?.offseason));
console.log('year:', host.G.state.year, 'round:', host.G.state.round);

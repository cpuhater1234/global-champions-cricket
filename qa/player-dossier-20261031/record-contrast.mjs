import fs from 'node:fs';import assert from 'node:assert/strict';
const css=fs.readFileSync('v8/ui/decision-ui.css','utf8');
assert.match(css,/#g8dialog\[data-prompt=player\] \.g8gccrecord\{[^}]*background:#282828!important/,'record panel must override legacy pale background');
assert.match(css,/#g8dialog\[data-prompt=player\] \.g8recordstats>div\{[^}]*background:#333!important/,'record stat cells must override legacy pale background');
console.log('PASS: record panel and cells override legacy pale backgrounds');

// Runs before the production build (deploy.yml): the privacy policy may only go live with the log period read from
// Plesk. A missing value is a refusal, not a guess.
import { readFileSync } from 'node:fs';

const legal = readFileSync(new URL('../src/config/legal.ts', import.meta.url), 'utf8');
const m = /logRetentionDays:\s*(\d+|null)/.exec(legal);
if (!m || m[1] === 'null') {
  console.error('src/config/legal.ts: logRetentionDays is not set. Read the log rotation of bautask.yinside.de in Plesk first.');
  process.exit(1);
}
console.log(`log retention: ${m[1]} days`);

/** Checks every culture link still answers (`npm run links:check`). 401/403/429 (bot protection) are reported, not failed. */
import { CULTURE } from '../src/data/culture.ts';

const UA = 'Mozilla/5.0 (compatible; Aqboken-linkcheck/1.0; +https://will-corbett.github.io/Aqboken/)';
let failed = 0;
for (const l of CULTURE) {
  try {
    const r = await fetch(l.url, { headers: { 'User-Agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(20000) });
    const soft = [401, 403, 429].includes(r.status);
    if (!r.ok && !soft) failed++;
    console.log(`${r.ok ? 'ok ' : soft ? '?  ' : 'BAD'} ${r.status} ${l.url}`);
  } catch (e) {
    failed++;
    console.log(`BAD ${(e as Error).message} ${l.url}`);
  }
}
process.exit(failed ? 1 : 0);

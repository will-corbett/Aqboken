/** Fetches each Reading text from Wikisource at its pinned revision into data-raw/reading/<id>.wiki. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { TEXTS } from '../src/data/reading.ts';

const UA = 'Aqboken-build/0.1 (Kazakh learning site; https://github.com/will-corbett/Aqboken)';
mkdirSync('data-raw/reading', { recursive: true });
for (const t of TEXTS) {
  const url = `https://wikisource.org/w/api.php?${new URLSearchParams({ action: 'query', prop: 'revisions', revids: String(t.revid), rvprop: 'content|ids', rvslots: 'main', format: 'json', formatversion: '2' })}`;
  const d = (await (await fetch(url, { headers: { 'User-Agent': UA } })).json()) as { query: { pages: { title: string; revisions: { revid: number; slots: { main: { content: string } } }[] }[] } };
  const page = d.query.pages[0]!;
  if (page.title !== t.source) throw new Error(`${t.id}: revision ${t.revid} is “${page.title}”, expected “${t.source}”`);
  writeFileSync(`data-raw/reading/${t.id}.wiki`, page.revisions[0]!.slots.main.content);
  console.log(`${t.id}: ${page.title} @ ${t.revid}`);
  await new Promise((r) => setTimeout(r, 300));
}

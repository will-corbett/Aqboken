/**
 * Builds the Reading texts (src/data/reading.ts) from data-raw/reading/<id>.wiki: cleans the wikitext (author line,
 * categories, <br>, footnotes kept as notes), applies the listed corrections, splits paragraphs and words, and
 * explains every word (scripts/lib/explainer.ts). A text with any unexplained word fails the build. Writes
 * src/data/reading/<id>.json (committed: review the diff) and reports/reading.md.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { TEXTS } from '../src/data/reading.ts';
import { READING_GLOSSES } from '../src/data/reading-glosses.ts';
import { buildExplainer, type Explanation } from './lib/explainer.ts';

const WORD = /[А-Яа-яЁёӘәҒғҚқҢңӨөҰұҮүҺһІі]+(?:-[А-Яа-яЁёӘәҒғҚқҢңӨөҰұҮүҺһІі]+)*/g;

export interface ReadingData {
  id: string;
  /** Paragraphs; each a list of plain text pieces and word indices. */
  paragraphs: (string | number)[][];
  words: { t: string; lemma: string; en: string; form: string; source: Explanation['source']; ours?: boolean }[];
  notes: string[];
  wordCount: number;
}

function clean(wiki: string): { text: string; notes: string[] } {
  const notes: string[] = [];
  let t = wiki.replace(/<ref>([\s\S]*?)<\/ref>/g, (_, n: string) => {
    notes.push(n.trim());
    return ' ';
  });
  t = t
    .replace(/^''.*Алтынсарин.*''\s*$/m, '')
    .replace(/\[\[Category:[^\]]*\]\]/g, '')
    .replace(/<references\s*\/?>/g, '')
    .replace(/<br\s*\/?>/g, '')
    .replace(/\{\{[^}]*\}\}/g, '')
    .replace(/\[\[(?:[^|\]]*\|)?([^\]]*)\]\]/g, '$1')
    .replace(/[ \t]+/g, ' ')
    .replace(/ +([.,;:!?])/g, '$1');
  return { text: t.trim(), notes };
}

const missing: string[] = [];
const explain = await buildExplainer('data-raw/kaikki-kazakh.jsonl', READING_GLOSSES);
mkdirSync('src/data/reading', { recursive: true });
const report: string[] = ['# Reading texts', '', 'Every word of each text, with its explanation and source. Built by `npm run data:reading`.', ''];
for (const def of TEXTS) {
  const file = `data-raw/reading/${def.id}.wiki`;
  if (!existsSync(file)) throw new Error(`${file} is missing: run npm run data:fetch-reading`);
  let { text, notes } = clean(readFileSync(file, 'utf8'));
  for (const c of def.corrections) {
    if (!text.includes(c.from)) throw new Error(`${def.id}: correction “${c.from}” not found`);
    text = text.replaceAll(c.from, c.to);
  }
  const words: ReadingData['words'] = [];
  const paragraphs = text
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const out: (string | number)[] = [];
      let last = 0;
      for (const m of p.matchAll(WORD)) {
        if (m.index! > last) out.push(p.slice(last, m.index!));
        const local = def.glosses?.[m[0].toLowerCase()];
        const e: Explanation | undefined = local ? { ...local, form: local.form ?? '', source: 'hand' } : explain(m[0]);
        if (!e) missing.push(`${def.id}: ${m[0]}`);
        words.push({ t: m[0], lemma: e?.lemma ?? '', en: e?.en ?? '', form: e?.form ?? '', source: e?.source ?? 'hand', ...(e?.ours ? { ours: true } : {}) });
        out.push(words.length - 1);
        last = m.index! + m[0].length;
      }
      if (last < p.length) out.push(p.slice(last));
      return out;
    });
  const data: ReadingData = { id: def.id, paragraphs, words, notes, wordCount: words.length };
  writeFileSync(`src/data/reading/${def.id}.json`, JSON.stringify(data) + '\n');
  report.push(`## ${def.title} (${def.en})`, '', '| Word | Dictionary form | Meaning | Form | Source |', '|---|---|---|---|---|');
  for (const w of words) report.push(`| ${w.t} | ${w.lemma} | ${w.en.replace(/\|/g, '/')} | ${w.form.replace(/\|/g, '/')} | ${w.source} |`);
  report.push('');
  const by = words.reduce<Record<string, number>>((a, w) => ((a[w.source] = (a[w.source] ?? 0) + 1), a), {});
  console.log(`${def.id}: ${words.length} words`, by);
}
writeFileSync('reports/reading.md', report.join('\n'));
if (missing.length) {
  console.error(`Unexplained (add to src/data/reading-glosses.ts):\n  ${missing.join('\n  ')}`);
  process.exit(1);
}

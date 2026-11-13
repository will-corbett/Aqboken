/**
 * The native-speaker review: everything on Aqböken written by us rather than taken from a source, in one Markdown file
 * a Kazakh speaker can work through and annotate: reports/for-review.md (`npm run review`). Regenerate after any
 * content change. Items are numbered so comments can refer to them ("W12: …").
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { ADJECTIVES, THEMES } from '../src/data/words.ts';
import { comparative } from '../src/shared/kazakh.ts';
import { LEARN_WORDS, NOT_IN_WIKTIONARY } from '../src/data/exceptions.ts';
import { TOPICS } from '../src/lib/topics.ts';
import { pool, type Question } from '../src/lib/questions.ts';
import { defaults } from '../src/lib/settings.ts';
import { mulberry32, shuffle } from '../src/lib/rng.ts';
import { SITE_URL } from '../src/shared/site.ts';
import sentences from '../src/data/sentences.json' with { type: 'json' };

const KK = /[А-Яа-яЁёӘәҒғҚқҢңӨөҰұҮүҺһІі]/;
const out: string[] = [];
const p = (s = '') => out.push(s);

p('# Aqböken: for review by a Kazakh speaker');
p();
p(`Aqböken (${SITE_URL}) teaches Kazakh to English speakers. Its word forms are made by rule and checked against Wiktionary, but everything listed here was written by us and hasn’t been checked by a native speaker. Please mark anything that is wrong, unnatural, or not how people say it, and give the better version if you can. Comments can refer to item numbers (W12, L3, D40 …).`);
p();
p('What matters most: **is the Kazakh correct and natural?** Is the English meaning right? Would a teacher explain it this way?');
p();

// ── Words ──
p('## 1. Words and their meanings');
p();
p('Our word lists, by theme. Please check the spelling, the meaning, and whether it’s the word people actually use (and not old-fashioned, regional or overly formal).');
let n = 0;
for (const t of THEMES) {
  p();
  p(`### ${t.title} (${t.kkTitle}), ${t.level}`);
  p();
  p('| # | Kazakh | Meaning | Comment |');
  p('|---|---|---|---|');
  for (const w of t.words) p(`| W${++n} | ${w.kk} | ${w.en.replace(/\|/g, '/')} | |`);
}
p();

// ── Learn pages ──
p('## 2. Kazakh in the lessons');
p();
p('Every line of the Learn pages that contains Kazakh, with its English. Tables of forms are made by the rules and not listed (they are checked against Wiktionary).');
n = 0;
for (const f of readdirSync('content/learn').filter((x) => x.endsWith('.md')).sort()) {
  const id = f.replace(/\.md$/, '');
  const lines = readFileSync(`content/learn/${f}`, 'utf8')
    .split('\n')
    .filter((l) => KK.test(l) && !l.startsWith('::') && !l.startsWith('#'))
    .map((l) => l.replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim());
  if (!lines.length) continue;
  p();
  p(`### ${TOPICS.find((t) => t.id === id)?.title ?? id} (${SITE_URL}learn/${id}/)`);
  p();
  for (const l of lines) p(`- **L${++n}** ${l}`);
}
p();

// ── Grammar terms ──
p('## 3. Names of topics and grammar terms');
p();
p('| # | Kazakh | Our English | Comment |');
p('|---|---|---|---|');
n = 0;
for (const t of TOPICS) p(`| T${++n} | ${t.kk} | ${t.title} | |`);
for (const [w, why] of Object.entries(LEARN_WORDS)) p(`| T${++n} | ${w} | ${why.replace(/\|/g, '/')} | |`);
p();

// ── Drills ──
p('## 4. Drill questions and explanations');
p();
p('A sample of each drill: the task, the prompt, the hint, the expected answer, and the explanation shown after answering. Is the answer the natural one? Is any other answer also right (it would be marked wrong)?');
n = 0;
const rng = mulberry32(7);
for (const t of TOPICS) {
  if (t.id === 'alphabet' || t.id === 'vocab' || t.id === 'listen') continue;
  const qs: Question[] = shuffle(rng, pool(t.id, defaults(), rng)).slice(0, 6);
  p();
  p(`### ${t.title} (${SITE_URL}drill/${t.id}/)`);
  p();
  for (const q of qs) {
    const frame = q.frame ? `${q.frame[0]} ___${q.frame[1]}`.trim() : '';
    p(`- **D${++n}** ${q.task}: *${q.prompt}*${q.gloss ? ` (${q.gloss})` : ''}${q.cue ? `; hint “${q.cue}”` : ''}${frame ? `; ${frame}` : ''} → **${q.answer}**. ${q.explain}`);
  }
}
p();

// ── Sentences ──
p('## 5. Example sentences (from Tatoeba)');
p();
p('Sentences written by Tatoeba volunteers, chosen by us as examples. Please flag any that are wrong, unnatural, or a poor example of the word.');
p();
p('| # | Word | Sentence | English | Comment |');
p('|---|---|---|---|---|');
n = 0;
for (const [w, row] of Object.entries(sentences) as [string, [number, string, string]][]) p(`| S${++n} | ${w} | ${row[1]} | ${row[2].replace(/\|/g, '/')} | |`);
p();

// ── Not in Wiktionary ──
p('## 6. Words Wiktionary doesn’t have');
p();
p('We kept these because we believe they’re right; please confirm.');
p();
for (const [w, why] of Object.entries(NOT_IN_WIKTIONARY)) p(`- **${w}**: ${why}`);
p();

// ── Comparatives ──
p('## 7. Comparatives (made by rule only)');
p();
p('Wiktionary has no comparative forms to check against, so these come from the rule (-рақ/-рек, -ырақ/-ірек) alone. Please mark any that are wrong or not used.');
p();
p(ADJECTIVES.map((a) => `${a.kk} → **${comparative(a.kk)}**`).join(' · '));
p();

// ── Audio ──
p('## 8. Audio');
p();
p(`Most words and answers are read by a computer voice (it says so when it plays); 31 words have native recordings. Please listen to a few pages (e.g. ${SITE_URL}vocabulary/family/ and ${SITE_URL}drill/listen/) and say whether the computer voice is understandable and stresses words correctly, or misleads learners.`);
p();

writeFileSync('reports/for-review.md', out.join('\n'));
console.log(`reports/for-review.md: ${out.length} lines.`);

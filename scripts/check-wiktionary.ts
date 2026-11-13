/**
 * Checks Körti's Kazakh against Wiktionary (the kaikki.org extract in data-raw/, `npm run data:fetch`).
 *
 * 1. Every word in our lists (src/data/words.ts) must have a Kazakh Wiktionary entry of the same part of speech
 *    (or be listed in exceptions.ts `notInWiktionary` with a reason).
 * 2. For every noun Wiktionary has a declension table for, our plural and case forms are compared with it; for every
 *    verb with a conjugation table, our present, past and (from the tables) persons. Disagreements on words in our
 *    lists FAIL the check; disagreements on other words are counted and listed in the report (they show where the
 *    rules are weak, and some are Wiktionary errors).
 *
 * Writes reports/wiktionary-check.md. Exit code 1 if anything in our lists fails.
 */
import { createReadStream, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { CASES, PERSONS, POSS_PERSONS, PRONOUN_CASES, caseForm, copula, numberWords, past, pastNeg, plural, possessive, present, presentNeg, type Case, type Person } from '../src/shared/kazakh.ts';
import { ALL_WORDS, type Word } from '../src/data/words.ts';
import { LEARN_WORDS, NOT_IN_WIKTIONARY, WIKTIONARY_ERRORS, nounOptions } from '../src/data/exceptions.ts';

const FILE = 'data-raw/kaikki-kazakh.jsonl';
if (!existsSync(FILE)) {
  console.error(`${FILE} is missing: run npm run data:fetch first.`);
  process.exit(2);
}

interface Form {
  form: string;
  tags?: string[];
  source?: string;
}
interface Entry {
  word: string;
  pos: string;
  forms?: Form[];
  senses?: { form_of?: { word: string }[] }[];
}

const POS_MAP: Record<Word['pos'], string[]> = {
  n: ['noun', 'name'],
  v: ['verb'],
  adj: ['adj', 'noun'],
  adv: ['adv', 'adj', 'noun', 'particle', 'pron', 'conj'],
  pron: ['pron', 'det', 'adv'],
  num: ['num'],
  phr: ['intj', 'phrase', 'adv', 'noun', 'particle', 'adj', 'verb', 'conj', 'postp'],
  post: ['postp', 'adv', 'noun'],
  conj: ['conj', 'particle', 'adv'],
};

const entries = new Map<string, Entry[]>();
/** Every word Wiktionary has a form-of entry pointing at (бар → бару), and every headword and inflected form. */
const formOfTargets = new Set<string>();
const anyForm = new Set<string>();
const rl = createInterface({ input: createReadStream(FILE, 'utf8'), crlfDelay: Infinity });
for await (const line of rl) {
  const d = JSON.parse(line) as Entry;
  anyForm.add(d.word.toLowerCase());
  for (const f of d.forms ?? []) if (!f.tags?.includes('romanization')) anyForm.add(f.form.toLowerCase());
  for (const s of d.senses ?? []) for (const t of s.form_of ?? []) formOfTargets.add(t.word);
  const list = entries.get(d.word) ?? [];
  list.push({ word: d.word, pos: d.pos, forms: d.forms?.filter((f) => f.source === 'declension' || f.source === 'conjugation' || (f.tags && !f.tags.includes('romanization'))) });
  entries.set(d.word, list);
}

const has = (f: Form, ...tags: string[]) => tags.every((t) => f.tags?.includes(t));
const clean = (s: string) => s.normalize('NFC').toLowerCase().trim();

interface Mismatch {
  word: string;
  what: string;
  ours: string;
  wiktionary: string;
}
const ourKeys = new Set(ALL_WORDS.map((w) => `${w.pos}:${w.kk}`));
const ourNouns = new Map(ALL_WORDS.filter((w) => w.pos === 'n').map((w) => [w.kk, w]));
const ourVerbs = new Map(ALL_WORDS.filter((w) => w.pos === 'v').map((w) => [w.kk, w]));

// ── 1. Our words exist ──
// A word passes if Wiktionary has it as that part of speech; a verb also if other entries are forms of it (бар is
// "imperative of бару"); a phrase or two-word noun if each of its words is a Wiktionary headword or form.
const missing: Word[] = [];
const viaForms: Word[] = [];
for (const w of ALL_WORDS) {
  if (NOT_IN_WIKTIONARY[w.kk]) continue;
  const es = entries.get(w.kk) ?? [];
  if (es.some((e) => POS_MAP[w.pos].includes(e.pos))) continue;
  if (w.pos === 'v' && formOfTargets.has(w.kk)) continue;
  if (w.kk.includes(' ') && w.kk.split(' ').every((t) => anyForm.has(t))) {
    viaForms.push(w);
    continue;
  }
  missing.push(w);
}

// ── 2. Noun tables ──
const nounMis: Mismatch[] = [];
let nounsChecked = 0;
let nounFormsChecked = 0;
const nounWordsWrong = new Set<string>();
const ourNounsChecked = new Set<string>();
for (const [word, es] of entries) {
  for (const e of es) {
    if (e.pos !== 'noun' || !e.forms?.length) continue;
    const table = e.forms.filter((f) => CASES.some((c) => has(f, caseTag(c))));
    if (table.length < 10 || word.includes(' ') || /[^а-яёәғқңөұүһі-]/i.test(word)) continue;
    const mine = ourNouns.get(word);
    const o = nounOptions(word);
    nounsChecked++;
    if (mine) ourNounsChecked.add(word);
    for (const f of table) {
      const c = CASES.find((x) => has(f, caseTag(x)))!;
      const number = has(f, 'plural') ? 'pl' : 'sg';
      if (c === 'nom' && number === 'sg') continue;
      const base = number === 'pl' ? plural(word, o) : word;
      const ours = caseForm(base, c, number === 'pl' ? { harmony: o.harmony } : o);
      nounFormsChecked++;
      const theirs = f.form.split(/[,/]/).map(clean);
      if (!theirs.includes(clean(ours)) && !WIKTIONARY_ERRORS[`${word}|${c} ${number}`]) {
        nounMis.push({ word, what: `${c} ${number}`, ours, wiktionary: f.form });
        nounWordsWrong.add(word);
      }
    }
    break;
  }
}

// ── 3. Verb tables ──
const verbMis: Mismatch[] = [];
let verbsChecked = 0;
const verbWordsWrong = new Set<string>();
const ourVerbsChecked = new Set<string>();
const PERSON_TAGS: [Person, string[]][] = [
  ['1sg', ['first-person', 'singular']],
  ['2sg', ['informal', 'second-person', 'singular']],
  ['2sgf', ['formal', 'second-person', 'singular']],
  ['3', ['third-person', 'singular']],
  ['1pl', ['first-person', 'plural']],
  ['2pl', ['informal', 'second-person', 'plural']],
  ['2plf', ['formal', 'second-person', 'plural']],
];
for (const [word, es] of entries) {
  for (const e of es) {
    if (e.pos !== 'verb' || !e.forms?.length) continue;
    const pret3 = e.forms.find((f) => has(f, 'preterite', 'third-person', 'singular'));
    if (!pret3) continue;
    // The stem, from the past 3rd person (тапты → тап); our list gives it directly.
    const mine = ourVerbs.get(word);
    const stem = mine?.stem ?? pret3.form.replace(/(ды|ді|ты|ті)$/, '');
    verbsChecked++;
    if (mine) ourVerbsChecked.add(word);
    for (const [p, tags] of PERSON_TAGS) {
      for (const [tense, fn] of [
        ['aorist', present],
        ['preterite', past],
      ] as const) {
        const f = e.forms.find((x) => has(x, tense, ...tags) && !(p === '1sg' && x.tags?.includes('plural')) && !(p === '1pl' && x.tags?.includes('singular')));
        if (!f) continue;
        // Wiktionary's 2nd person tables don't always say formal/informal for one form: skip if ambiguous.
        const ours = fn(stem, p);
        if (clean(ours) !== clean(f.form)) {
          verbMis.push({ word, what: `${tense === 'aorist' ? 'present' : 'past'} ${p}`, ours, wiktionary: f.form });
          verbWordsWrong.add(word);
        }
      }
    }
    break;
  }
}

function caseTag(c: Case): string {
  return { nom: 'nominative', gen: 'genitive', dat: 'dative', acc: 'accusative', loc: 'locative', abl: 'ablative', ins: 'instrumental' }[c];
}

// ── 4. The Kazakh in Learn pages ──
// Every Kazakh word written in content/learn must be a Wiktionary headword or form, a form the rules make of a word
// in our lists, or listed in exceptions.ts LEARN_WORDS with a reason.
const made = new Set<string>();
const add = (f: string) => f.split(' ').forEach((t) => made.add(t.toLowerCase()));
for (const w of ALL_WORDS) {
  add(w.kk);
  if (w.pos === 'n' || w.pos === 'adj') {
    const o = nounOptions(w.kk);
    const pl = plural(w.kk, o);
    for (const c of CASES) [caseForm(w.kk, c, o), caseForm(pl, c, { harmony: o.harmony })].forEach(add);
    for (const p of POSS_PERSONS) add(possessive(w.kk, p, o));
    for (const p of PERSONS) add(copula(w.kk, p, o));
  }
  if (w.pos === 'v') for (const p of PERSONS) [present, presentNeg, past, pastNeg].forEach((fn) => add(fn(w.stem!, p)));
}
for (const forms of Object.values(PRONOUN_CASES)) Object.values(forms).forEach(add);
for (let i = 0; i <= 1000; i++) add(numberWords(i));
['ма', 'ме', 'ба', 'бе', 'па', 'пе'].forEach(add);
const unknownLearn = new Map<string, Set<string>>();
for (const f of readdirSync('content/learn').filter((x) => x.endsWith('.md'))) {
  const text = readFileSync(`content/learn/${f}`, 'utf8').replace(/^::forms .*$/gm, '').replace(/^::drill .*$/gm, '').replace(/\*+/g, '');
  for (const m of text.matchAll(/[А-Яа-яЁёӘәҒғҚқҢңӨөҰұҮүҺһІі]+/g)) {
    const t = m[0].toLowerCase();
    if (t.length < 2 && !['ә'].includes(t)) continue;
    if (anyForm.has(t) || made.has(t) || LEARN_WORDS[t]) continue;
    // A suffix quoted on its own (-лар, кітап + тар + да) is fine.
    if (/[-+]\s?$/.test(text.slice(Math.max(0, m.index! - 2), m.index!))) continue;
    (unknownLearn.get(t) ?? unknownLearn.set(t, new Set()).get(t)!).add(f);
  }
}

// ── Report ──
const ourNounFails = nounMis.filter((m) => ourNouns.has(m.word));
const ourVerbFails = verbMis.filter((m) => ourVerbs.has(m.word));
const pct = (a: number, b: number) => (b ? ((100 * a) / b).toFixed(1) : '–');
const rows = (ms: Mismatch[], limit = 400) =>
  ms
    .slice(0, limit)
    .map((m) => `| ${m.word} | ${m.what} | ${m.ours} | ${m.wiktionary} |`)
    .join('\n');

const report = `# Wiktionary check

Source: Kazakh Wiktionary entries from kaikki.org (\`${FILE}\`). Run with \`npm run data:check\`.

## Our word lists

- ${ALL_WORDS.length} words; ${missing.length} without a Wiktionary entry of that part of speech${missing.length ? ':' : '.'}
${missing.map((w) => `  - ${w.kk} (${w.pos}, “${w.en}”)`).join('\n')}
- ${viaForms.length} phrases checked word by word: ${viaForms.map((w) => w.kk).join(', ') || 'none'}.
- Listed as not in Wiktionary (with reasons, src/data/exceptions.ts): ${Object.keys(NOT_IN_WIKTIONARY).length}.
- Wiktionary errors set aside: ${Object.entries(WIKTIONARY_ERRORS).map(([k, why]) => `${k} (${why})`).join('; ') || 'none'}.
- ${ourNounsChecked.size} of our ${ourNouns.size} nouns have a Wiktionary declension table; ${new Set(ourNounFails.map((m) => m.word)).size} disagree.
- ${ourVerbsChecked.size} of our ${ourVerbs.size} verbs have a Wiktionary conjugation table; ${new Set(ourVerbFails.map((m) => m.word)).size} disagree.

${ourNounFails.length + ourVerbFails.length ? `### Disagreements on our words (these fail the check)\n\n| Word | Form | Ours | Wiktionary |\n|---|---|---|---|\n${rows([...ourNounFails, ...ourVerbFails])}\n` : ''}
## Kazakh in the Learn pages

${unknownLearn.size ? `${unknownLearn.size} words are neither in Wiktionary nor made by the rules from our lists (these fail the check):\n\n${[...unknownLearn].map(([w, fs]) => `- ${w} (${[...fs].join(', ')})`).join('\n')}` : 'Every word is in Wiktionary or made by the rules from our lists.'}

## The rules against every table

- Nouns: ${nounsChecked} tables, ${nounFormsChecked} forms; ${nounWordsWrong.size} nouns (${pct(nounWordsWrong.size, nounsChecked)}%) have at least one form that differs.
- Verbs: ${verbsChecked} tables; ${verbWordsWrong.size} verbs (${pct(verbWordsWrong.size, verbsChecked)}%) have at least one form that differs.

### Noun differences (first 400)

| Word | Form | Ours | Wiktionary |
|---|---|---|---|
${rows(nounMis)}

### Verb differences

| Word | Form | Ours | Wiktionary |
|---|---|---|---|
${rows(verbMis)}
`;
mkdirSync('reports', { recursive: true });
writeFileSync('reports/wiktionary-check.md', report);

console.log(`Our words: ${ALL_WORDS.length}, missing from Wiktionary: ${missing.length}`);
console.log(`Nouns: ${nounsChecked} tables, ${nounWordsWrong.size} differ (${pct(nounWordsWrong.size, nounsChecked)}%); ours checked ${ourNounsChecked.size}/${ourNouns.size}, failing ${new Set(ourNounFails.map((m) => m.word)).size}`);
console.log(`Verbs: ${verbsChecked} tables, ${verbWordsWrong.size} differ (${pct(verbWordsWrong.size, verbsChecked)}%); ours checked ${ourVerbsChecked.size}/${ourVerbs.size}, failing ${new Set(ourVerbFails.map((m) => m.word)).size}`);
console.log(`Learn pages: ${unknownLearn.size} unknown words${unknownLearn.size ? ': ' + [...unknownLearn.keys()].join(', ') : ''}`);
console.log('Report: reports/wiktionary-check.md');
void ourKeys;
const fail = missing.length + ourNounFails.length + ourVerbFails.length + unknownLearn.size;
process.exit(fail ? 1 : 0);

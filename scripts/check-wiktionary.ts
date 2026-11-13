/**
 * Checks Aqböken's Kazakh against Wiktionary (the kaikki.org extract in data-raw/, `npm run data:fetch`).
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
import { ORDINAL, can, comparative, conditional, habitualPast, ordinalWords, perfect, timeWords, negativeStem, CASES, PERSONS, POSS_PERSONS, POSTPOSITIONS, PRONOUN_CASES, caseForm, continuous, converb, possessiveCase, copula, imperative, intention, numberWords, past, pastNeg, plural, possessive, present, presentNeg, want, type Case, type Person } from '../src/shared/kazakh.ts';
import { ALL_WORDS, THEMES, type Word } from '../src/data/words.ts';
import { TOPICS } from '../src/lib/topics.ts';
import { WRITING } from '../src/data/writing.ts';
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
const formsChecked: Record<string, number> = {};
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
    // The converb, from the renarrative 3rd person (тауыпты → тауып).
    const ren = e.forms.find((f) => has(f, 'renarrative', 'third-person', 'singular'));
    if (ren) {
      formsChecked.converb = (formsChecked.converb ?? 0) + 1;
      const theirs = ren.form.replace(/(ты|ті)$/, '');
      if (clean(converb(stem)) !== clean(theirs)) {
        verbMis.push({ word, what: 'converb', ours: converb(stem), wiktionary: theirs });
        verbWordsWrong.add(word);
      }
    }
    for (const [p, tags] of PERSON_TAGS) {
      // Wiktionary's tag → our form. The imperative rows are tagged "error-unrecognized-form" (the extractor doesn't
      // name them) but are the imperative in person order. Intentive 2nd plurals are left out: Wiktionary repeats
      // the singular there (таппақсың).
      for (const [tense, name, fn] of [
        ['aorist', 'present', present],
        ['preterite', 'past', past],
        ['optative', 'want', want],
        ['error-unrecognized-form', 'imperative', imperative],
        ['intentive', 'intention', intention],
        ['perfect', 'perfect', perfect],
        ['habitual', 'habitual past', habitualPast],
        ['conditional', 'conditional', conditional],
      ] as const) {
        if (tense === 'intentive' && (p === '2pl' || p === '2plf')) continue;
        const f = e.forms.find((x) => has(x, tense, ...tags) && !(p === '1sg' && x.tags?.includes('plural')) && !(p === '1pl' && x.tags?.includes('singular')) && !(p === '3' && x.tags?.includes('plural')));
        if (!f) continue;
        const ours = fn(stem, p);
        formsChecked[name] = (formsChecked[name] ?? 0) + 1;
        if (clean(ours) !== clean(f.form)) {
          verbMis.push({ word, what: `${name} ${p}`, ours, wiktionary: f.form });
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

// ── 3b. Ordinals: every one we use is a Wiktionary headword ──
const missingOrdinals = Object.values(ORDINAL).filter((o) => !(entries.get(o) ?? []).some((e) => e.pos === 'num'));

// ── 4. The Kazakh in Learn pages ──
// Every Kazakh word written in content/learn must be a Wiktionary headword or form, a form the rules make of a word
// in our lists, or listed in exceptions.ts LEARN_WORDS with a reason.
const made = new Set<string>();
const add = (f: string) => f.split(' ').forEach((t) => made.add(t.toLowerCase()));
for (const w of ALL_WORDS) {
  add(w.kk);
  if (w.pos === 'adj' || w.pos === 'adv') add(comparative(w.kk));
  if (w.pos === 'n' || w.pos === 'adj') {
    const o = nounOptions(w.kk);
    const pl = plural(w.kk, o);
    for (const c of CASES) [caseForm(w.kk, c, o), caseForm(pl, c, { harmony: o.harmony })].forEach(add);
    for (const p of POSS_PERSONS) {
      add(possessive(w.kk, p, o));
      for (const c of CASES) add(possessiveCase(w.kk, p, c, o));
    }
    for (const p of PERSONS) add(copula(w.kk, p, o));
  }
  if (w.pos === 'v') {
    for (const p of PERSONS) [present, presentNeg, past, pastNeg, want, imperative, intention, perfect, habitualPast, conditional].forEach((fn) => add(fn(w.stem!, p)));
    for (const p of PERSONS) [can(w.stem!, p), can(w.stem!, p, true)].forEach(add);
    // Negatives built on the negative stem: бармағанмын, бармасам, бармайтынмын.
    for (const p of PERSONS) [perfect, conditional, habitualPast].forEach((fn) => add(fn(negativeStem(w.stem!), p)));
    for (const p of PERSONS) add(continuous(w.stem!, p, { motion: w.motion }));
    add(converb(w.stem!));
    // Negative imperatives: барма, бармаңыз.
    for (const p of PERSONS) add(imperative(negativeStem(w.stem!), p));
  }
}
for (const forms of Object.values(PRONOUN_CASES)) Object.values(forms).forEach(add);
for (let i = 0; i <= 1000; i++) [numberWords(i), ordinalWords(i)].forEach(add);
for (let h = 0; h < 24; h++) for (const m of [0, 30] as const) [timeWords(h, m), timeWords(h, m, true)].forEach(add);
['ма', 'ме', 'ба', 'бе', 'па', 'пе'].forEach(add);
POSTPOSITIONS.forEach((pp) => add(pp.word));
const unknownLearn = new Map<string, Set<string>>();
// Kazakh in the writing checklists.
for (const t of WRITING) for (const c of t.checklist) for (const m of c.text.matchAll(/[А-Яа-яЁёӘәҒғҚқҢңӨөҰұҮүҺһІі]+/g)) {
  const w = m[0].toLowerCase();
  const before = c.text.slice(Math.max(0, m.index! - 2), m.index!);
  if (/[-]\s?$/.test(before) || c.text[m.index! + m[0].length] === '-' || anyForm.has(w) || made.has(w) || LEARN_WORDS[w]) continue;
  (unknownLearn.get(w) ?? unknownLearn.set(w, new Set()).get(w)!).add('writing.ts');
}
// Topic and theme names in Kazakh (shown on every Learn, Drill and Vocabulary page).
for (const [where, name] of [...TOPICS.map((t) => ['topics.ts', t.kk]), ...THEMES.map((t) => ['words.ts', t.kkTitle])]) {
  for (const m of name!.matchAll(/[А-Яа-яЁёӘәҒғҚқҢңӨөҰұҮүҺһІі]+/g)) {
    const t = m[0].toLowerCase();
    if (anyForm.has(t) || made.has(t) || LEARN_WORDS[t]) continue;
    (unknownLearn.get(t) ?? unknownLearn.set(t, new Set()).get(t)!).add(where!);
  }
}
for (const f of readdirSync('content/learn').filter((x) => x.endsWith('.md'))) {
  const text = readFileSync(`content/learn/${f}`, 'utf8').replace(/^::forms .*$/gm, '').replace(/^::drill .*$/gm, '').replace(/\*+/g, '');
  for (const m of text.matchAll(/[А-Яа-яЁёӘәҒғҚқҢңӨөҰұҮүҺһІі]+/g)) {
    const t = m[0].toLowerCase();
    if (t.length < 2 && !['ә'].includes(t)) continue;
    if (anyForm.has(t) || made.has(t) || LEARN_WORDS[t]) continue;
    // A suffix quoted on its own (-лар, кітап + тар + да) is fine.
    if (/[-+]\s?$/.test(text.slice(Math.max(0, m.index! - 2), m.index!))) continue;
    // Part of a quoted suffix like -(ы)ңыз, or a stem quoted with a hyphen after it (барғы-).
    if (/-\([^)]*\)?$/.test(text.slice(Math.max(0, m.index! - 6), m.index!)) || text[m.index! + m[0].length] === '-') continue;
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
- Verbs: ${verbsChecked} tables; ${verbWordsWrong.size} verbs (${pct(verbWordsWrong.size, verbsChecked)}%) have at least one form that differs. Forms compared: ${Object.entries(formsChecked).map(([k, n]) => `${k} ${n}`).join(', ')}.

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
console.log(`Verb forms compared: ${JSON.stringify(formsChecked)}`);
console.log(`Verbs: ${verbsChecked} tables, ${verbWordsWrong.size} differ (${pct(verbWordsWrong.size, verbsChecked)}%); ours checked ${ourVerbsChecked.size}/${ourVerbs.size}, failing ${new Set(ourVerbFails.map((m) => m.word)).size}`);
console.log(`Ordinals: ${Object.keys(ORDINAL).length} in Wiktionary${missingOrdinals.length ? `, missing: ${missingOrdinals.join(', ')}` : ''}`);
console.log(`Learn pages: ${unknownLearn.size} unknown words${unknownLearn.size ? ': ' + [...unknownLearn.keys()].join(', ') : ''}`);
console.log('Report: reports/wiktionary-check.md');
void ourKeys;
const fail = missing.length + ourNounFails.length + ourVerbFails.length + unknownLearn.size + missingOrdinals.length;
process.exit(fail ? 1 : 0);

/**
 * Example sentences from Tatoeba (CC BY 2.0 FR): for each word in our lists, the shortest Kazakh sentence with an
 * English translation that contains one of the word's forms (made by the rules: cases, plurals, possessives, verb
 * forms). Writes src/data/sentences.json (committed: small, and a person can read the diff). Run with
 * `npm run data:sentences` after `npm run data:fetch-tatoeba`.
 *
 * Left out: sentences with Latin letters mixed into the Cyrillic (Бiлемiн), more than 10 words, anything in
 * exceptions.ts TATOEBA_DENY (crude, violent, political, or wrong), and words used in more than one sense where the
 * match could be the other word (a form shared by two of our words isn't used for either).
 */
import { execFileSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { ALL_WORDS, type Word } from '../src/data/words.ts';
import { TATOEBA_SKIP_WORDS, TATOEBA_AMBIGUOUS_FORMS, TATOEBA_DENY, nounOptions } from '../src/data/exceptions.ts';
import {
  CASES,
  PERSONS,
  POSS_PERSONS,
  caseForm,
  continuous,
  converb,
  copula,
  imperative,
  intention,
  past,
  pastNeg,
  plural,
  possessive,
  possessiveCase,
  present,
  presentNeg,
  want,
} from '../src/shared/kazakh.ts';

const DIR = 'data-raw/tatoeba';
for (const f of ['kaz_sentences_detailed.tsv.bz2', 'kaz-eng_links.tsv.bz2', 'eng_sentences.tsv.bz2'])
  if (!existsSync(`${DIR}/${f}`)) {
    console.error(`${DIR}/${f} is missing: run npm run data:fetch-tatoeba first.`);
    process.exit(2);
  }
const bz = (f: string) => execFileSync('bzcat', [`${DIR}/${f}`], { maxBuffer: 1 << 30, encoding: 'utf8' });

const kaz = new Map<string, { text: string; owner: string }>();
for (const line of bz('kaz_sentences_detailed.tsv.bz2').split('\n')) {
  const [id, , text, owner] = line.split('\t');
  if (id && text) kaz.set(id, { text: text.normalize('NFC'), owner: owner === '\\N' ? '' : owner! });
}
const link = new Map<string, string>();
for (const line of bz('kaz-eng_links.tsv.bz2').split('\n')) {
  const [k, e] = line.trim().split(/\s+/);
  if (k && e && !link.has(k)) link.set(k, e);
}
const wantEng = new Set(link.values());
const eng = new Map<string, string>();
for (const line of bz('eng_sentences.tsv.bz2').split('\n')) {
  const tab = line.indexOf('\t');
  const id = line.slice(0, tab);
  if (wantEng.has(id)) eng.set(id, line.slice(line.indexOf('\t', tab + 1) + 1));
}

/** Every form the rules make of a word (lower case). */
function formsOf(w: Word): Set<string> {
  const out = new Set<string>([w.kk.toLowerCase()]);
  const add = (s: string) => out.add(s.toLowerCase());
  if (w.pos === 'adj') for (const p of PERSONS) add(copula(w.kk, p));
  if (w.pos === 'n') {
    const o = nounOptions(w.kk);
    const pl = plural(w.kk, o);
    for (const c of CASES) [caseForm(w.kk, c, o), caseForm(pl, c, { harmony: o.harmony })].forEach(add);
    for (const p of POSS_PERSONS) for (const c of CASES) add(possessiveCase(w.kk, p, c, o));
    for (const p of PERSONS) add(copula(w.kk, p, o));
  }
  if (w.pos === 'v' && !w.stem!.includes(' ')) {
    const s = w.stem!;
    for (const p of PERSONS) for (const fn of [present, presentNeg, past, pastNeg, imperative, intention]) add(fn(s, p));
    for (const p of PERSONS) add(want(s, p).split(' ')[0]!);
    for (const p of PERSONS) add(continuous(s, p, { motion: w.motion }).split(' ')[0]!);
    add(converb(s));
  }
  return out;
}

// A form two of our words share (ат “name/horse” is one word; бар is “there is” and “go!”) is left out for both.
const owners = new Map<string, Set<string>>();
const single = ALL_WORDS.filter((w) => !w.kk.includes(' '));
const skip = new Set(Object.keys(TATOEBA_SKIP_WORDS));
for (const w of single) for (const f of formsOf(w)) (owners.get(f) ?? owners.set(f, new Set()).get(f)!).add(w.kk);

const LATIN = /[a-zƏə0-9]/i;
const words = (s: string) => s.toLowerCase().match(/[а-яёәғқңөұүһі]+/g) ?? [];
type Row = [id: number, kk: string, en: string, owner: string, start: number, end: number];
const best = new Map<string, Row>();
for (const [id, s] of kaz) {
  const e = link.get(id);
  const en = e && eng.get(e);
  if (!en || LATIN.test(s.text) || TATOEBA_DENY[Number(id)] || words(s.text).length > 10) continue;
  for (const m of s.text.matchAll(/[А-Яа-яЁёӘәҒғҚқҢңӨөҰұҮүҺһІі]+/g)) {
    const o = owners.get(m[0].toLowerCase());
    if (!o || o.size !== 1 || TATOEBA_AMBIGUOUS_FORMS[m[0].toLowerCase()]) continue;
    const w = [...o][0]!;
    if (skip.has(w)) continue;
    const row: Row = [Number(id), s.text, en, s.owner, m.index!, m.index! + m[0].length];
    const old = best.get(w);
    // Shortest first, then the lower id (older, so usually more reviewed): deterministic.
    if (!old || s.text.length < old[1].length || (s.text.length === old[1].length && row[0] < old[0])) best.set(w, row);
  }
}
const out = Object.fromEntries([...best].sort(([a], [b]) => a.localeCompare(b)));
writeFileSync('src/data/sentences.json', JSON.stringify(out, null, 1) + '\n');

// Every clean pair (2–10 words, read by a person: TATOEBA_DENY), for Translate and compare and Build the sentence.
const pairs: [number, string, string, string][] = [];
for (const [id, s] of [...kaz].sort(([a], [b]) => Number(a) - Number(b))) {
  const e = link.get(id);
  const en = e && eng.get(e);
  const n = words(s.text).length;
  if (!en || LATIN.test(s.text) || TATOEBA_DENY[Number(id)] || n < 2 || n > 10) continue;
  pairs.push([Number(id), s.text.trim(), en.trim(), s.owner]);
}
writeFileSync('src/data/pairs.json', JSON.stringify(pairs) + '\n');
console.log(`${pairs.length} sentence pairs for the sentence drills.`);
console.log(`${kaz.size} Kazakh sentences, ${[...kaz.keys()].filter((k) => link.has(k)).length} with English; example sentences for ${best.size} of ${ALL_WORDS.length} words.`);

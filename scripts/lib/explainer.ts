/**
 * Explains a Kazakh word form for the Reading texts: its dictionary form, meaning and which form it is. Sources, in
 * order of trust:
 *   1. "ours": a form the rules make of a word in our lists (checked against Wiktionary's tables);
 *   2. "wiktionary": a headword, a form in a Wiktionary table, or a Wiktionary "form of" entry;
 *   3. "rule": a form the rules make of another Wiktionary headword (noun cases, plurals, possessives; verb tenses);
 *   4. "hand": our own gloss, from src/data/reading-glosses.ts (old words, names, set phrases).
 */
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { ALL_WORDS } from '../../src/data/words.ts';
import { nounOptions } from '../../src/data/exceptions.ts';
import {
  CASES,
  PERSONS,
  finalClass,
  POSS_PERSONS,
  caseForm,
  conditional,
  converb,
  copula,
  habitualPast,
  imperative,
  pastParticiple,
  past,
  pastNeg,
  perfect,
  plural,
  possessedCase,
  possessive,
  possessiveCase,
  present,
  presentBase,
  presentNeg,
  negativeStem,
  comparative,
  type Case,
  type Person,
  type NounOptions,
} from '../../src/shared/kazakh.ts';

export type Source = 'ours' | 'wiktionary' | 'rule' | 'hand';
export interface Explanation {
  lemma: string;
  en: string;
  form: string;
  source: Source;
  /** In our word lists (can be added to My words). */
  ours?: boolean;
}

const CASE_LABEL: Record<Case, string> = { nom: '', gen: 'genitive (of, ’s)', dat: 'dative (to)', acc: 'accusative (the …)', loc: 'locative (in, at)', abl: 'ablative (from)', ins: 'instrumental (with)' };
const PERSON_LABEL: Record<Person, string> = { '1sg': 'I', '2sg': 'you', '2sgf': 'you (polite)', '3': 'he/she/they', '1pl': 'we', '2pl': 'you (pl.)', '2plf': 'you (polite pl.)' };
const POSS_LABEL: Record<string, string> = { '1sg': 'my', '2sg': 'your', '2sgf': 'your (polite)', '3': 'his/her/its', '1pl': 'our' };

type Add = (form: string, label: string) => void;

/** Every form of a noun the rules make, with labels. */
function nounForms(n: string, o: NounOptions, add: Add) {
  const pl = plural(n, o);
  for (const c of CASES) {
    add(caseForm(n, c, o), c === 'nom' ? 'dictionary form' : CASE_LABEL[c]);
    add(caseForm(pl, c, { harmony: o.harmony }), c === 'nom' ? 'plural' : `plural, ${CASE_LABEL[c]}`);
  }
  for (const p of POSS_PERSONS)
    for (const c of CASES) add(possessiveCase(n, p, c, o), `${POSS_LABEL[p]} …${c === 'nom' ? '' : `, ${CASE_LABEL[c]}`}`);
  // Plural + 3rd-person possessive: балалары, балаларына.
  for (const c of CASES) add(possessedCase(pl + (o.harmony === 'front' || /[әөүіеэ][^аоұыәөүіеэ]*$/.test(pl) ? 'і' : 'ы'), c), `their/his/her … (plural)${c === 'nom' ? '' : `, ${CASE_LABEL[c]}`}`);
  for (const p of PERSONS) if (p !== '3') add(copula(n, p, o), `“${PERSON_LABEL[p]} am/are …”`);
  const front = /[әөүіе][^аоұыәөүіе]*$/.test(n);
  // -дай/-тай “like a …”: тамақтай, ағаштай, айдай.
  add(n + (finalClass(n) === 'K' ? (front ? 'тей' : 'тай') : front ? 'дей' : 'дай'), 'like a …');
  // Plural + possessive (+ case): сөздерім, сөздеріме, балаларың.
  const plStem = pl + (front ? 'і' : 'ы');
  for (const [p, e] of [['1sg', 'м'], ['2sg', 'ң'], ['2sgf', 'ңыз'], ['1pl', 'мыз']] as const) {
    const f = plStem + (front ? e.replace('ы', 'і') : e);
    for (const c of CASES) add(c === 'nom' ? f : c === 'dat' && (p === '1sg' || p === '2sg') ? f + (front ? 'е' : 'а') : caseForm(f, c), `${POSS_LABEL[p]} … (plural)${c === 'nom' ? '' : `, ${CASE_LABEL[c]}`}`);
  }
  const gy = front ? 'гі' : 'ғы';
  // -дағы “the one in/at …”: үйдегі, қасындағы, төбеңдегі.
  add(caseForm(n, 'loc', o) + gy, 'which is in/at …');
  for (const p of POSS_PERSONS) add(possessiveCase(n, p, 'loc', o) + gy, `which is in/at ${POSS_LABEL[p]} …`);
  // Old instrumental -менен: балаларменен.
  add(caseForm(n, 'ins', o) + 'ен', 'with (old form of -мен)');
  add(caseForm(pl, 'ins', { harmony: o.harmony }) + 'ен', 'plural, with (old form of -мен)');
}

/** Every form of a verb the rules make, with labels. */
function verbForms(stem: string, add: Add) {
  const cv = converb(stem);
  add(cv, '-ып form (and then …, doing …)');
  add(presentBase(stem), '-а form (doing …)');
  add(stem + 'у', 'dictionary form (to …)');
  for (const p of PERSONS) {
    const who = PERSON_LABEL[p];
    add(present(stem, p), `present, ${who}`);
    add(presentNeg(stem, p), `present, negative, ${who}`);
    add(past(stem, p), `past, ${who}`);
    add(pastNeg(stem, p), `past, negative, ${who}`);
    add(imperative(stem, p), `command, ${who}`);
    add(conditional(stem, p), `if ${who} …`);
    add(perfect(stem, p), `have …, ${who}`);
    add(habitualPast(stem, p), `used to, ${who}`);
    // The storyteller's past (“it is said”): -ыпты, -ыпты-мыс; and -ыпты with a person: барыппын.
    add(copula(cv, p).replace(/^(.*п)$/, '$1'), `past (reported), ${who}`);
  }
  const back = !/[әөүіе][^аоұыәөүіе]*$/.test(stem);
  for (const end of back ? ['ты', 'ты-мыс', 'ты-мысты'] : ['ті', 'ті-міс', 'ті-місті']) add(cv + end, 'past (reported: “it is said that …”), he/she/they');
  add(pastParticiple(stem), '-ған form (who/which has …; having …)');
  add(presentBase(stem) + (back ? 'тын' : 'тін'), '-атын form (who/which does …)');
  add(stem + (back ? 'ар' : 'ер'), '-ар form (who/which will …)');
  add(stem + (back ? 'р' : 'р'), '-р form (will …)');
  add(negativeStem(stem), 'negative stem (not …)');
  add(negativeStem(stem) + 'й', 'negative (without …ing)');
  add(stem + (back ? 'ғалы' : 'гелі'), '-ғалы form (in order to …)');
  for (const c of CASES) if (c !== 'nom') add(caseForm(stem + 'у', c), `-у form (…ing), ${CASE_LABEL[c]}`);
  add(stem + 'уге', '-у form, dative (to …)');
  add(pastParticiple(stem) + (back ? 'да' : 'де'), 'when … (-ғанда)');
  add(pastParticiple(stem) + (back ? 'ша' : 'ше'), 'until … (-ғанша)');
  add(pastParticiple(stem) + (back ? 'нан' : 'нен'), 'after/because of … (-ғаннан)');
  // Softened command: айтшы, қарашы.
  add(stem + (back ? 'шы' : 'ші'), 'command, softened (please …)');
  // Agent noun: білуші, оқушы.
  add(stem + (back ? 'ушы' : 'уші'), 'one who …s (-ушы)');
  // -ған as a noun with a possessive and case: айналғанын, қиналғанын, айтқанымды.
  const part = pastParticiple(stem);
  for (const p of POSS_PERSONS) for (const c of CASES) add(possessiveCase(part, p, c), `that ${POSS_LABEL[p].replace('his/her/its', 'he/she')} …ed${c === 'nom' ? '' : ` (${CASE_LABEL[c]})`}`);
  for (const p of POSS_PERSONS) for (const c of CASES) add(possessiveCase(presentBase(stem) + (back ? 'тын' : 'тін'), p, c), `that ${POSS_LABEL[p].replace('his/her/its', 'he/she')} …s${c === 'nom' ? '' : ` (${CASE_LABEL[c]})`}`);
  // Negative of the -ған form and of the converb: келмеген, тынбай.
  add(pastParticiple(negativeStem(stem)), 'who/which has not …');
  // Reported past with a person: отырыпсың, көріппін.
  for (const p of PERSONS) if (p !== '3') add(copula(cv, p), `past (reported), ${PERSON_LABEL[p]}`);
  // -ып + жатыр / отыр / тұр (doing right now), as single tokens when hyphen-free: handled word by word.
  add(presentBase(stem) + (back ? 'й' : 'й'), '-а form');
}

const clean = (s: string) => s.normalize('NFC').toLowerCase();

function adjForms(a: string, add: Add) {
  for (const c of CASES) if (c !== 'nom') add(caseForm(a, c), CASE_LABEL[c]);
  add(comparative(a), 'comparative (more …)');
  for (const p of PERSONS) if (p !== '3') add(copula(a, p), `“${PERSON_LABEL[p]} am/are …”`);
  add(a + (/[әөүіе][^аоұыәөүіе]*$/.test(a) ? 'сі' : 'сы'), 'the … one (-сы)');
}

export async function buildExplainer(kaikkiFile: string, hand: Record<string, { lemma: string; en: string; form?: string }>) {
  const index = new Map<string, Explanation[]>();
  const put = (form: string, e: Explanation) => {
    const k = clean(form);
    const list = index.get(k) ?? [];
    if (!list.some((x) => x.lemma === e.lemma && x.form === e.form)) list.push(e);
    index.set(k, list);
  };

  // 1. Ours.
  for (const w of ALL_WORDS) {
    const base: Omit<Explanation, 'form'> = { lemma: w.kk, en: w.en, source: 'ours', ours: true };
    put(w.kk, { ...base, form: 'dictionary form' });
    if (w.pos === 'n' && !w.kk.includes(' ')) nounForms(w.kk, nounOptions(w.kk), (f, l) => put(f, { ...base, form: l }));
    if (w.pos === 'v' && !w.stem!.includes(' ')) verbForms(w.stem!, (f, l) => put(f, { ...base, form: l }));
    if (w.pos === 'adj') adjForms(w.kk, (f, l) => put(f, { ...base, form: l }));
  }

  // 2 and 3. Wiktionary.
  const ruleNouns: [string, string][] = [];
  const ruleVerbs: [string, string, string][] = [];
  const ruleAdjs: [string, string][] = [];
  const rl = createInterface({ input: createReadStream(kaikkiFile, 'utf8'), crlfDelay: Infinity });
  for await (const line of rl) {
    const d = JSON.parse(line) as {
      word: string;
      pos: string;
      forms?: { form: string; tags?: string[]; source?: string }[];
      senses?: { glosses?: string[]; form_of?: { word: string }[]; tags?: string[] }[];
    };
    const sense = d.senses?.find((s) => s.glosses?.length && !s.form_of);
    const formOf = d.senses?.find((s) => s.form_of?.length);
    if (formOf) {
      put(d.word, { lemma: formOf.form_of![0]!.word, en: '', form: formOf.glosses?.[0] ?? 'a form', source: 'wiktionary' });
      continue;
    }
    if (!sense) continue;
    const en = sense.glosses![0]!.replace(/\s+/g, ' ').slice(0, 80);
    put(d.word, { lemma: d.word, en, form: d.pos === 'verb' ? 'dictionary form (to …)' : 'dictionary form', source: 'wiktionary' });
    for (const f of d.forms ?? []) {
      if (!f.source || !f.tags || f.tags.includes('romanization') || f.tags.includes('error-unrecognized-form') || /[{}]/.test(f.form)) continue;
      put(f.form, { lemma: d.word, en, form: f.tags.filter((t) => !['singular', 'nominative'].includes(t)).join(', ') || 'dictionary form', source: 'wiktionary' });
    }
    if (d.pos === 'noun' && !d.word.includes(' ')) ruleNouns.push([d.word, en]);
    if (d.pos === 'adj' && !d.word.includes(' ')) ruleAdjs.push([d.word, en]);
    if (d.pos === 'verb' && /[уюи]$/.test(d.word)) {
      const pret = d.forms?.find((f) => f.tags?.includes('preterite') && f.tags.includes('third-person'))?.form;
      const stem = pret ? pret.replace(/(ды|ді|ты|ті)$/, '') : d.word.endsWith('ю') ? d.word.slice(0, -1) + 'й' : d.word.slice(0, -1);
      ruleVerbs.push([d.word, stem, en]);
    }
  }
  const ruleOnly = (lemma: string, en: string) => (f: string, l: string) => {
    if (!index.get(clean(f))?.length) put(f, { lemma, en, form: l, source: 'rule' });
  };
  for (const [n, en] of ruleNouns) nounForms(n, {}, ruleOnly(n, en));
  for (const [inf, stem, en] of ruleVerbs) verbForms(stem, ruleOnly(inf, en));
  for (const [a, en] of ruleAdjs) adjForms(a, ruleOnly(a, en));

  // 4. Hand glosses win over everything (they exist because the others were wrong or missing).
  for (const [form, h] of Object.entries(hand)) index.set(clean(form), [{ lemma: h.lemma, en: h.en, form: h.form ?? '', source: 'hand' }]);

  /** The best explanation of a token, if any: ours, then Wiktionary, then rule. Hyphenated words are tried whole, then by their first part. */
  return (token: string): Explanation | undefined => {
    const t = clean(token);
    const pick = (list?: Explanation[]) => list?.find((e) => e.source === 'hand') ?? list?.find((e) => e.source === 'ours') ?? list?.find((e) => e.source === 'wiktionary' && e.en) ?? list?.find((e) => e.source === 'wiktionary') ?? list?.[0];
    const e = pick(index.get(t)) ?? (t.includes('-') ? pick(index.get(t.split('-')[0]!)) : undefined);
    if (e && !e.en) {
      const lemma = index.get(clean(e.lemma))?.find((x) => x.en && x.lemma === e.lemma);
      if (lemma) return { ...e, en: lemma.en };
    }
    return e;
  };
}

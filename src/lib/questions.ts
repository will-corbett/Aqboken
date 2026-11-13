/**
 * Question generators, one per drill. Each builds the whole pool for the chosen settings; a round draws from it
 * (shuffled, seeded). Every question carries its explanation.
 */
import {
  CASES,
  PRONOUN,
  PRONOUN_CASES,
  PRONOUN_GEN,
  SUFFIX,
  caseForm,
  copula,
  finalClass,
  harmonyOf,
  numberWords,
  past,
  pastNeg,
  plural,
  possessive,
  present,
  presentNeg,
  questionParticle,
  voiceFinal,
  POSTPOSITIONS,
  continuous,
  converb,
  imperative,
  intention,
  possessiveCase,
  want,
  type PossPerson,
  type Case,
  type Harmony,
  type Person,
} from '../shared/kazakh.ts';
import { APPROXIMATE, toLatin } from '../shared/script.ts';
import { ADJECTIVES, ALL_WORDS, NOUNS, THEMES, VERBS, type Word } from '../data/words.ts';
import { nounOptions } from '../data/exceptions.ts';
import { CASE_NAME, PERSON_NAME, caseCue, endingText, firstMeaning, harmonyText } from './labels.ts';
import { shuffle, type Rng } from './rng.ts';
import type { Settings } from './settings.ts';
import type { Mode } from './topics.ts';

export interface Question {
  key: string;
  mode: Mode;
  /** What to do, in plain English (with the grammar term). */
  task: string;
  /** The word or text shown. */
  prompt: string;
  promptLang: 'kk' | 'en';
  /** Its meaning. */
  gloss?: string;
  /** Kazakh text around the blank: [before, after]. */
  frame?: [string, string];
  /** An English hint of the form wanted. */
  cue?: string;
  answer: string;
  /** Other answers also right. */
  accept?: string[];
  answerLang: 'kk' | 'en' | 'digits';
  choices?: string[];
  choiceLang?: 'kk' | 'en';
  /** Other forms of the same word, to say what a wrong answer was. */
  others?: { label: string; form: string }[];
  /** Listening: the Kazakh played as the prompt (the prompt itself is hidden until answered). */
  listen?: string;
  /** The part before the ending, to highlight the ending in the answer. */
  base?: string;
  explain: string;
}

const meaning = (w: Word) => firstMeaning(w.en);
const back = (h: Harmony) => (h === 'back' ? 0 : 1);

// ─── Alphabet ──────────────────────────────────────────────────────────────────────────────────────────────

export const ALPHABET = 'аәбвгғдеёжзийкқлмнңоөпрстуұүфхһцчшщъыіьэюя'.split('');
export const KAZAKH_LETTERS = new Set('әғқңөұүһі'.split(''));

function alphabet(s: Settings, rng: Rng): Question[] {
  const letters = ALPHABET.filter((c) => !APPROXIMATE.has(c));
  const latin = (c: string) => `${toLatin(c.toUpperCase())} ${toLatin(c)}`;
  const cyr = (c: string) => `${c.toUpperCase()} ${c}`;
  return letters.map((c) => {
    const special = KAZAKH_LETTERS.has(c) ? ' It is one of the 9 letters special to Kazakh.' : '';
    const shared = letters.filter((x) => x !== c && toLatin(x) === toLatin(c));
    if (s.alphabet.direction === 'toLatin') {
      const wrong = shuffle(rng, letters.filter((x) => toLatin(x) !== toLatin(c))).slice(0, 3);
      return {
        key: `alpha:${c}`,
        mode: 'alphabet',
        task: 'Which Latin letter (2021 alphabet)?',
        prompt: cyr(c),
        promptLang: 'kk',
        answer: latin(c),
        answerLang: 'en',
        choices: [latin(c), ...wrong.map(latin)],
        choiceLang: 'en',
        explain: `${c.toUpperCase()} is written ${toLatin(c.toUpperCase())} in the Latin alphabet of 2021.${shared.length ? ` So is ${shared.map((x) => x.toUpperCase()).join(', ')}.` : ''}${special}`,
      };
    }
    const wrong = shuffle(rng, letters.filter((x) => toLatin(x) !== toLatin(c))).slice(0, 3);
    return {
      key: `alpha:${c}`,
      mode: 'alphabet',
      task: 'Which Cyrillic letter?',
      prompt: latin(c),
      promptLang: 'en',
      answer: cyr(c),
      accept: shared.map(cyr),
      answerLang: 'kk',
      choices: [cyr(c), ...wrong.map(cyr)],
      choiceLang: 'kk',
      explain: `${toLatin(c.toUpperCase())} is ${[c, ...shared].map((x) => x.toUpperCase()).join(' or ')} in Cyrillic.${special}`,
    };
  });
}

// ─── Nouns ─────────────────────────────────────────────────────────────────────────────────────────────────

const drillNouns = () => NOUNS.filter((w) => !w.kk.includes(' ') || w.kk === 'ас үй');

function pluralExplain(w: string, h: Harmony, form: string): string {
  const suf = SUFFIX.plural[finalClass(w)][back(h)];
  return `${w} ${endingText(w)}, and ${harmonyText(w, h)}: -${suf}. ${form}.`;
}

function plurals(): Question[] {
  return drillNouns().map((w) => {
    const o = nounOptions(w.kk);
    const h = o.harmony ?? harmonyOf(w.kk);
    const form = plural(w.kk, o);
    return {
      key: `pl:${w.kk}`,
      mode: 'plural',
      task: 'Make it plural',
      prompt: w.kk,
      promptLang: 'kk',
      gloss: w.en,
      answer: form,
      answerLang: 'kk',
      base: w.kk,
      explain: pluralExplain(w.kk, h, form),
    };
  });
}

/** Vowel harmony: choose between the back and the front form (plural, locative or dative). */
function harmonyQs(): Question[] {
  const kinds = [
    { id: 'plural', name: 'plural', make: (w: string, h: Harmony) => w + SUFFIX.plural[finalClass(w)][back(h)] },
    { id: 'loc', name: 'in / at (locative)', make: (w: string, h: Harmony) => w + SUFFIX.loc[finalClass(w)][back(h)] },
    { id: 'dat', name: 'to (dative)', make: (w: string, h: Harmony) => w + SUFFIX.dat[finalClass(w)][back(h)] },
  ];
  return drillNouns().flatMap((w, i) => {
    const k = kinds[i % kinds.length]!;
    const h = nounOptions(w.kk).harmony ?? harmonyOf(w.kk);
    const right = k.make(w.kk, h);
    const wrong = k.make(w.kk, h === 'back' ? 'front' : 'back');
    if (right === wrong) return [];
    return [
      {
        key: `harm:${w.kk}:${k.id}`,
        mode: 'harmony' as const,
        task: `Which is right? (${k.name})`,
        prompt: w.kk,
        promptLang: 'kk' as const,
        gloss: w.en,
        answer: right,
        answerLang: 'kk' as const,
        choices: [right, wrong],
        choiceLang: 'kk' as const,
        base: w.kk,
        explain: `${w.kk}: ${harmonyText(w.kk, h)}. So ${right}, not ${wrong}.${nounOptions(w.kk).harmony ? ' (This loanword doesn’t follow its spelling; it is pronounced with front vowels.)' : ''}`,
      },
    ];
  });
}

function caseExplain(word: string, c: Case, form: string, h: Harmony, possessedNoun = false): string {
  if (possessedNoun) return `${word} already ends in the possessive -сы (от + басы), so it takes the possessive case endings with н: ${form}.`;
  const suf = SUFFIX[c as Exclude<Case, 'nom'>][finalClass(word)][back(h)];
  const harm = c === 'ins' ? 'the instrumental ending never changes its vowel' : harmonyText(word, h);
  return `${CASE_NAME[c].en} (${CASE_NAME[c].meaning}): ${word} ${endingText(word)}, and ${harm}. So -${suf}: ${form}.`;
}

function cases(s: Settings): Question[] {
  const numbers = s.cases.number === 'both' ? (['sg', 'pl'] as const) : ([s.cases.number] as const);
  const chosen = s.cases.cases.length ? s.cases.cases : CASES.filter((c) => c !== 'nom');
  return drillNouns().flatMap((w) =>
    numbers.flatMap((num) =>
      chosen.map((c) => {
        const o = nounOptions(w.kk);
        const base = num === 'pl' ? plural(w.kk, o) : w.kk;
        const bo = num === 'pl' ? { harmony: o.harmony } : o;
        const h = bo.harmony ?? harmonyOf(base);
        const form = caseForm(base, c, bo);
        return {
          key: `case:${w.kk}:${num}:${c}`,
          mode: 'cases' as const,
          task: `${CASE_NAME[c].en} (${CASE_NAME[c].kk})${num === 'pl' ? ' plural' : ''}: ${CASE_NAME[c].meaning}`,
          prompt: w.kk,
          promptLang: 'kk' as const,
          gloss: w.en,
          cue: caseCue(c, meaning(w), num === 'pl'),
          answer: form,
          answerLang: 'kk' as const,
          base,
          others: CASES.filter((x) => x !== c && x !== 'nom').map((x) => ({ label: `${CASE_NAME[x].en.toLowerCase()}${num === 'pl' ? ' plural' : ''}`, form: caseForm(base, x, bo) })),
          explain: (num === 'pl' ? `Plural first: ${base}; then the case ending goes on the plural. ` : '') + caseExplain(base, c, form, h, !!bo.possessed),
        };
      }),
    ),
  );
}

function possessives(s: Settings): Question[] {
  const persons = s.possessive.persons.length ? s.possessive.persons : (['1sg', '3'] as const);
  return drillNouns()
    .filter((w) => w.theme !== 'people' || ['дос', 'көрші', 'мұғалім', 'дәрігер'].includes(w.kk))
    .filter((w) => !w.possessed && w.kk !== 'ас үй')
    .flatMap((w) =>
      persons.map((p) => {
        const o = nounOptions(w.kk);
        const form = possessive(w.kk, p, o);
        const h = o.harmony ?? harmonyOf(w.kk);
        const vowelEnd = finalClass(w.kk) === 'V';
        const voiced = !vowelEnd && !o.noVoicing && !o.possStem && voiceFinal(w.kk) !== w.kk;
        const why = vowelEnd
          ? `${w.kk} ends in a vowel, so the short ending`
          : `${w.kk} ends in a consonant, so the ending starts with a vowel${voiced ? `, and the final ${w.kk.at(-1)} becomes ${voiceFinal(w.kk).at(-1)} before it` : ''}${o.possStem ? `, and the ${w.kk} loses a vowel before it (${o.possStem}-)` : ''}`;
        return {
          key: `poss:${w.kk}:${p}`,
          mode: 'possessive' as const,
          task: `Possessive: ${PERSON_NAME[p as Person]}`,
          prompt: w.kk,
          promptLang: 'kk' as const,
          gloss: w.en,
          frame: [PRONOUN_GEN[p], ''] as [string, string],
          cue: `${{ '1sg': 'my', '2sg': 'your', '2sgf': 'your', '3': 'his / her', '1pl': 'our' }[p]} ${meaning(w)}`,
          answer: form,
          answerLang: 'kk' as const,
          base: o.possStem ?? (voiced ? voiceFinal(w.kk) : w.kk),
          others: (['1sg', '2sg', '2sgf', '3', '1pl'] as const).filter((x) => x !== p).map((x) => ({ label: `“${PRONOUN_GEN[x]}” form`, form: possessive(w.kk, x, o) })),
          explain: `${why}; ${harmonyText(w.kk, h)}: ${PRONOUN_GEN[p]} ${form}.`,
        };
      }),
    );
}

function copulas(s: Settings): Question[] {
  const persons = s.copula.persons.length ? s.copula.persons : (['1sg'] as const);
  const words = [...NOUNS.filter((w) => w.theme === 'people'), ...ADJECTIVES.filter((w) => ['жас', 'үлкен', 'жақсы', 'әдемі', 'ұзын'].includes(w.kk))];
  return words.flatMap((w) =>
    persons.map((p) => {
      const form = copula(w.kk, p);
      const h = harmonyOf(w.kk);
      const ending = form.slice(w.kk.length);
      return {
        key: `cop:${w.kk}:${p}`,
        mode: 'copula' as const,
        task: `“I am …”: ${PERSON_NAME[p]}`,
        prompt: w.kk,
        promptLang: 'kk' as const,
        gloss: w.en,
        frame: [PRONOUN[p], '.'] as [string, string],
        answer: form,
        answerLang: 'kk' as const,
        base: w.kk,
        explain:
          p === '3'
            ? `With ол (he, she) there is no ending: Ол ${form}.`
            : `${p === '1sg' || p === '1pl' ? `${w.kk} ${endingText(w.kk)}, so -${ending}` : `With ${PRONOUN[p]} the ending is always -${ending}`}; ${harmonyText(w.kk, h)}. ${PRONOUN[p][0]!.toUpperCase()}${PRONOUN[p].slice(1)} ${form}.`,
      };
    }),
  );
}

function pronouns(s: Settings): Question[] {
  const chosen = s.pronouns.cases.length ? s.pronouns.cases : CASES.filter((c) => c !== 'nom');
  const EN: Record<string, string> = { мен: 'I', сен: 'you', сіз: 'you (polite)', ол: 'he / she / it', біз: 'we', олар: 'they' };
  return Object.entries(PRONOUN_CASES).flatMap(([p, forms]) =>
    chosen.map((c) => {
      const form = forms[c];
      const irregular = ['мен', 'сен', 'ол'].includes(p) && ['dat', 'abl', 'ins', 'gen', 'acc', 'loc'].includes(c);
      return {
        key: `pron:${p}:${c}`,
        mode: 'pronouns' as const,
        task: `${CASE_NAME[c].en} (${CASE_NAME[c].kk}): ${CASE_NAME[c].meaning}`,
        prompt: p,
        promptLang: 'kk' as const,
        gloss: EN[p],
        answer: form,
        answerLang: 'kk' as const,
        others: CASES.filter((x) => x !== c && x !== 'nom').map((x) => ({ label: CASE_NAME[x].en.toLowerCase(), form: forms[x] })),
        explain:
          c === 'dat' && ['мен', 'сен', 'ол'].includes(p)
            ? `The dative of мен, сен and ол changes the vowel: маған, саған, оған. Learn them as words.`
            : p === 'ол' && c !== 'gen'
              ? `ол declines on the stem он- (оның, оны, онда, онымен), but the ablative is одан.`
              : irregular && (c === 'ins' || c === 'gen')
                ? `мен and сен take the genitive -нің (менің, сенің) and build the instrumental on it: менімен, сенімен.`
                : `${p} takes the regular ${CASE_NAME[c].en.toLowerCase()} ending: ${form}.`,
      };
    }),
  );
}

// ─── Verbs ─────────────────────────────────────────────────────────────────────────────────────────────────

function presentExplain(stem: string, form: string, neg: boolean): string {
  const last = stem.at(-1)!;
  if (neg) return `Negative: stem ${stem}- + ${form.slice(stem.length, stem.length + 2)} (by the stem’s last sound) + й + the ending: ${form}.`;
  if ('ыі'.includes(last)) return `The stem ${stem}- ends in ${last}; ${last} + й is written и: ${form}.`;
  if ('аәеоөұү'.includes(last)) return `The stem ${stem}- ends in a vowel, so -й- comes before the ending: ${form}.`;
  if (last === 'й') return `The stem ${stem}- ends in й; й + а is written я, й + е stays йе: ${form}.`;
  if (last === 'у' || last === 'и') return `The stem ${stem}- ends in ${last}, so -${harmonyOf(stem) === 'back' ? 'а' : 'е'}- comes before the ending: ${form}.`;
  const voiced = voiceFinal(stem) !== stem ? ` (the final ${last} becomes ${voiceFinal(stem).at(-1)} before a vowel)` : '';
  return `The stem ${stem}- ends in a consonant, so -${harmonyOf(stem) === 'back' ? 'а' : 'е'}- comes before the ending${voiced}: ${form}.`;
}

function verbs(s: Settings, tense: 'present' | 'past'): Question[] {
  const cfg = s[tense];
  const persons = cfg.persons.length ? cfg.persons : (['1sg'] as const);
  const pols = cfg.polarity === 'both' ? [false, true] : [cfg.polarity === 'neg'];
  const fns = tense === 'present' ? [present, presentNeg] : [past, pastNeg];
  return VERBS.flatMap((v) =>
    persons.flatMap((p) =>
      pols.map((neg) => {
        const stem = v.stem!;
        const form = fns[neg ? 1 : 0]!(stem, p);
        const ending = form.slice(stem.length);
        const explain =
          tense === 'present'
            ? presentExplain(stem, form, neg)
            : neg
              ? `Negative past: stem ${stem}- + ${negSuffix(stem)} + ${harmonyOf(stem) === 'back' ? 'ды' : 'ді'} + the ending: ${form}.`
              : `${stem}- ${endingText(stem)}, so the past is -${ending.slice(0, 2)}-; then the ending for ${PRONOUN[p]}: ${form}.`;
        return {
          key: `${tense}:${v.kk}:${p}:${neg ? 'neg' : 'pos'}`,
          mode: tense,
          task: `${tense === 'present' ? 'Present' : 'Past'}${neg ? ', negative' : ''}: ${PERSON_NAME[p]}`,
          prompt: v.kk,
          promptLang: 'kk' as const,
          gloss: v.en,
          frame: [capital(PRONOUN[p]), '.'] as [string, string],
          answer: form,
          answerLang: 'kk' as const,
          base: stem,
          others: [
            ...(['1sg', '2sg', '2sgf', '3', '1pl', '2pl', '2plf'] as const).filter((x) => x !== p).map((x) => ({ label: `form for ${PRONOUN[x]}`, form: fns[neg ? 1 : 0]!(stem, x) })),
            { label: neg ? 'positive form' : 'negative form', form: fns[neg ? 0 : 1]!(stem, p) },
            { label: tense === 'present' ? 'past tense' : 'present tense', form: (tense === 'present' ? (neg ? pastNeg : past) : neg ? presentNeg : present)(stem, p) },
          ],
          explain,
        };
      }),
    ),
  );
}
const negSuffix = (stem: string) => SUFFIX.question[finalClass(stem)][back(harmonyOf(stem))];
const capital = (s: string) => s[0]!.toUpperCase() + s.slice(1);

// ─── More verb forms ──

type VerbFn = (stem: string, p: Person) => string;
const ALL_PERSONS = ['1sg', '2sg', '2sgf', '3', '1pl', '2pl', '2plf'] as const;

function converbWhy(stem: string): string {
  const cv = converb(stem);
  const last = stem.at(-1)!;
  if ('аәеоөұүыі'.includes(last)) return `${stem}- ends in a vowel, so just -п: ${cv}`;
  if (last === 'п' && (cv.endsWith('уып') || cv.endsWith('уіп'))) return `${stem}- ends in п after a vowel, which becomes у before -ып: ${cv}`;
  return `${stem}- ends in a consonant, so -${harmonyOf(stem) === 'back' ? 'ып' : 'іп'}${voiceFinal(stem) !== stem ? ` (and ${last} becomes ${voiceFinal(stem).at(-1)})` : ''}: ${cv}`;
}

const IMP_EN: Record<Person, string> = {
  '1sg': 'let me …',
  '2sg': '(to a friend) …!',
  '2sgf': '(polite) please …',
  '3': 'let him/her …',
  '1pl': 'let’s …',
  '2pl': '(to friends) …!',
  '2plf': '(polite, to several) please …',
};

function verbForms(mode: Mode, persons: readonly Person[], name: string, make: (v: Word) => VerbFn, why: (v: Word, p: Person, form: string) => string, frame: (p: Person) => [string, string]): Question[] {
  return VERBS.flatMap((v) =>
    persons.map((p) => {
      const fn = make(v);
      const form = fn(v.stem!, p);
      return {
        key: `${mode}:${v.kk}:${p}`,
        mode,
        task: `${name}: ${PERSON_NAME[p]}`,
        prompt: v.kk,
        promptLang: 'kk' as const,
        gloss: v.en,
        frame: frame(p),
        answer: form,
        answerLang: 'kk' as const,
        base: v.stem!.includes(' ') ? v.stem! : v.stem!,
        others: ALL_PERSONS.filter((x) => x !== p).map((x) => ({ label: `form for ${PRONOUN[x]}`, form: fn(v.stem!, x) })),
        explain: why(v, p, form),
      };
    }),
  );
}
const withPronoun = (p: Person): [string, string] => [capital(PRONOUN[p]), '.'];

function continuousQs(s: Settings): Question[] {
  return verbForms('continuous', s.continuous.persons.length ? s.continuous.persons : ['1sg'], 'Right now', (v) => (stem, p) => continuous(stem, p, { motion: v.motion }), (v, p, form) =>
    v.motion
      ? `Verbs of going and coming use the -а/-е form before жатыр: ${form.split(' ').slice(-2).join(' ')}.`
      : `${converbWhy(v.stem!.split(' ').at(-1)!)}; then жатыр with the ending for ${PRONOUN[p]}: ${form}.`,
  withPronoun);
}
function futureQs(s: Settings): Question[] {
  return verbForms('future', s.future.persons.length ? s.future.persons : ['1sg'], 'Going to', () => intention, (v, p, form) => {
    const stem = v.stem!;
    const m = form.split(' ').at(-1)!.slice(stem.split(' ').at(-1)!.length, stem.split(' ').at(-1)!.length + 3);
    return `${stem.split(' ').at(-1)}- ${endingText(stem)}, so -${m}; then the “I am” ending for ${PRONOUN[p]}${p === '3' ? ' (none)' : ''}: ${form}.`;
  }, withPronoun);
}
function wantQs(s: Settings): Question[] {
  return verbForms('want', s.want.persons.length ? s.want.persons : ['1sg'], 'Want to', () => want, (v, p, form) => {
    const stem = v.stem!.split(' ').at(-1)!;
    const k = finalClass(stem) === 'K';
    return `${stem}- ${endingText(stem)}, so -${k ? (harmonyOf(stem) === 'back' ? 'қы' : 'кі') : harmonyOf(stem) === 'back' ? 'ғы' : 'гі'}-; then the possessive for ${PRONOUN[p]} and келеді: ${form}.`;
  }, (p) => [capital(PRONOUN_GEN_ALL[p]), '.']);
}
const PRONOUN_GEN_ALL: Record<Person, string> = { '1sg': 'менің', '2sg': 'сенің', '2sgf': 'сіздің', '3': 'оның', '1pl': 'біздің', '2pl': 'сендердің', '2plf': 'сіздердің' };
function imperativeQs(s: Settings): Question[] {
  return verbForms('imperative', s.imperative.persons.length ? s.imperative.persons : ['2sg'], 'Command or request', () => imperative, (v, p, form) => {
    const stem = v.stem!.split(' ').at(-1)!;
    const why: Record<Person, string> = {
      '1sg': `“let me”: the present base + -йын/-ын (-йін/-ін)`,
      '2sg': `to a friend, the bare stem is the command`,
      '2sgf': `polite: -ңыз after a vowel, -ыңыз/-іңіз after a consonant`,
      '3': `“let him/her”: -сын/-сін`,
      '1pl': `“let’s”: the present base + -йық/-ық (-йік/-ік)`,
      '2pl': `to several friends: -ңдар after a vowel, -ыңдар/-іңдер after a consonant`,
      '2plf': `polite, to several people: -(ы)ңыздар/-(і)ңіздер`,
    };
    return `${why[p]}${voiceFinal(stem) !== stem && ['1sg', '1pl', '2sgf', '2pl', '2plf'].includes(p) ? ` (${stem.at(-1)} becomes ${voiceFinal(stem).at(-1)} before a vowel)` : ''}: ${form}.`;
  }, (p) => [`(${PRONOUN[p]})`, '']).map((q) => {
    const v = VERBS.find((x) => x.kk === q.prompt)!;
    const p = q.key.split(':').at(-1) as Person;
    return { ...q, cue: IMP_EN[p].replace('…', firstMeaning(v.en).replace(/^to /, '')) };
  });
}

// ─── Possessive + case, postpositions ──

function posscasesQs(s: Settings): Question[] {
  const persons = s.posscases.persons.length ? s.posscases.persons : (['1sg'] as PossPerson[]);
  const cases = s.posscases.cases.length ? s.posscases.cases : (['loc'] as Case[]);
  const MY: Record<PossPerson, string> = { '1sg': 'my', '2sg': 'your', '2sgf': 'your', '3': 'his/her', '1pl': 'our' };
  return drillNouns()
    .filter((w) => !w.possessed && w.kk !== 'ас үй' && w.theme !== 'people')
    .flatMap((w) =>
      persons.flatMap((p) =>
        cases.map((c) => {
          const o = nounOptions(w.kk);
          const poss = possessive(w.kk, p, o);
          const form = possessiveCase(w.kk, p, c, o);
          const ending = form.slice(poss.length);
          const why =
            p === '3'
              ? `after the 3rd-person possessive, the case ending takes н: -${ending}`
              : c === 'dat' && (p === '1sg' || p === '2sg')
                ? `after -м and -ң of “my”/“your”, the dative is just -${ending}`
                : `${poss} ${endingText(poss)}, so the ${CASE_NAME[c].en.toLowerCase()} is -${ending}`;
          return {
            key: `pc:${w.kk}:${p}:${c}`,
            mode: 'posscases' as const,
            task: `${CASE_NAME[c].en} (${CASE_NAME[c].meaning}) of “${PRONOUN_GEN[p]} …”`,
            prompt: w.kk,
            promptLang: 'kk' as const,
            gloss: w.en,
            frame: [PRONOUN_GEN[p], ''] as [string, string],
            cue: caseCue(c, meaning(w)).replace(' the ', ` ${MY[p]} `),
            answer: form,
            answerLang: 'kk' as const,
            base: poss,
            others: [{ label: 'possessive without the case', form: poss }, ...CASES.filter((x) => x !== c && x !== 'nom').map((x) => ({ label: CASE_NAME[x].en.toLowerCase(), form: possessiveCase(w.kk, p, x, o) }))],
            explain: `First the possessive: ${PRONOUN_GEN[p]} ${poss}. Then ${why}: ${form}.`,
          };
        }),
      ),
    );
}

function postpositionQs(): Question[] {
  const nouns = drillNouns().filter((w) => ['city', 'school', 'time', 'people', 'family', 'home'].includes(w.theme) && !w.possessed && w.kk !== 'ас үй');
  return nouns.flatMap((w) =>
    POSTPOSITIONS.map((pp) => {
      const o = nounOptions(w.kk);
      const form = caseForm(w.kk, pp.case, o);
      return {
        key: `pp:${w.kk}:${pp.word}`,
        mode: 'postpositions' as const,
        task: `Before ${pp.word} (${pp.en})`,
        prompt: w.kk,
        promptLang: 'kk' as const,
        gloss: w.en,
        frame: ['', ` ${pp.word}`] as [string, string],
        cue: `${pp.en.split(',')[0]} the ${meaning(w)}`,
        answer: form,
        answerLang: 'kk' as const,
        base: w.kk,
        others: CASES.filter((x) => x !== pp.case).map((x) => ({ label: x === 'nom' ? 'plain form' : CASE_NAME[x].en.toLowerCase(), form: caseForm(w.kk, x, o) })),
        explain: pp.case === 'nom' ? `${pp.word} takes the plain form: ${form} ${pp.word}.` : `${pp.word} takes the ${CASE_NAME[pp.case].en.toLowerCase()}: ${form} ${pp.word}.`,
      };
    }),
  );
}

// ─── Questions with ма/ме ──────────────────────────────────────────────────────────────────────────────────

const PARTICLES = ['ма', 'ме', 'ба', 'бе', 'па', 'пе'];
const MASS = new Set(['water', 'tea', 'milk', 'meat', 'bread', 'rice', 'sugar', 'salt', 'butter', 'juice', 'honey', 'money', 'paper', 'snow', 'rain', 'wind', 'time', 'work', 'food', 'kumis', 'broth', 'cheese', 'hair', 'transport', 'fish', 'fruit', 'baursak', 'land', 'earth', 'sky', 'steppe']);
const withArticle = (w: string) => (MASS.has(w) ? w : /^[aeiou]/.test(w) ? `an ${w}` : `a ${w}`);

function questionQs(): Question[] {
  const fromNouns = drillNouns()
    .filter((w) => w.theme !== 'people')
    .map((w) => ({ before: `Бұл ${w.kk}`, last: w.kk, en: `Is this ${withArticle(meaning(w))}?`, key: w.kk }));
  const fromVerbs = VERBS.slice(0, 30).flatMap((v, i) => {
    const p = (['2sg', '2sgf', '3'] as const)[i % 3]!;
    const f = present(v.stem!, p);
    return [{ before: `${capital(PRONOUN[p])} ${f}`, last: f, en: `${{ '2sg': 'Do you', '2sgf': 'Do you', '3': 'Does he/she' }[p]} ${firstMeaning(v.en).replace(/^to /, '')}?`, key: `${v.kk}:${p}` }];
  });
  return [...fromNouns, ...fromVerbs].map((x) => {
    const part = questionParticle(x.last);
    return {
      key: `q:${x.key}`,
      mode: 'questions' as const,
      task: 'Add the question particle',
      prompt: x.en,
      promptLang: 'en' as const,
      frame: [x.before, '?'] as [string, string],
      answer: part,
      answerLang: 'kk' as const,
      choices: PARTICLES,
      choiceLang: 'kk' as const,
      explain: `${x.last} ${endingText(x.last)}, and ${harmonyText(x.last)}: ${part}. ${x.before} ${part}?`,
    };
  });
}

// ─── Numbers ───────────────────────────────────────────────────────────────────────────────────────────────

function numbers(s: Settings): Question[] {
  const range: number[] = { to10: range0(0, 10), to100: range0(11, 100), to1000: range0(101, 999), years: range0(1900, 2030) }[s.numbers.range];
  return range.map((n) => {
    const words = numberWords(n);
    const parts = words.split(' ');
    const explain = parts.length > 1 ? `Numbers are said largest part first, each part a word: ${parts.join(' + ')}.` : `${n} is ${words}.`;
    return s.numbers.direction === 'write'
      ? { key: `num:${n}`, mode: 'numbers' as const, task: 'Write the number in words', prompt: String(n), promptLang: 'en' as const, answer: words, answerLang: 'kk' as const, explain }
      : { key: `num:${n}`, mode: 'numbers' as const, task: 'Write the number in digits', prompt: words, promptLang: 'kk' as const, answer: String(n), answerLang: 'digits' as const, explain };
  });
}
function range0(a: number, b: number): number[] {
  return Array.from({ length: b - a + 1 }, (_, i) => a + i);
}

// ─── Vocabulary ────────────────────────────────────────────────────────────────────────────────────────────

/** Each word once, even if two chosen themes list it. */
const uniqueWords = (ws: Word[]) => ws.filter((w, i) => ws.findIndex((x) => x.kk === w.kk) === i);

const meaningItems = (en: string) => en.split(/[;,]/).map((x) => x.replace(/\(.*?\)/g, '').trim().toLowerCase()).filter(Boolean);

export function vocabQs(s: Settings, rng: Rng, words?: Word[]): Question[] {
  const ids = s.vocab.themes.length ? s.vocab.themes : THEMES.map((t) => t.id);
  const pool = uniqueWords(words ?? THEMES.filter((t) => ids.includes(t.id)).flatMap((t) => t.words));
  return pool.map((w) => {
    if (s.vocab.direction === 'recognise') {
      const mine = new Set(meaningItems(w.en));
      const wrong = shuffle(rng, ALL_WORDS.filter((x) => x.pos === w.pos && x.kk !== w.kk && !meaningItems(x.en).some((m) => mine.has(m))))
        .map((x) => x.en)
        .filter((en, i, a) => a.indexOf(en) === i)
        .slice(0, 3);
      return {
        key: `vocab:${w.kk}`,
        mode: 'vocab' as const,
        task: 'What does it mean?',
        prompt: w.kk,
        promptLang: 'kk' as const,
        answer: w.en,
        answerLang: 'en' as const,
        choices: [w.en, ...wrong],
        choiceLang: 'en' as const,
        explain: `${w.kk} means “${w.en}”.`,
      };
    }
    const mine = new Set(meaningItems(w.en));
    const same = ALL_WORDS.filter((x) => x.kk !== w.kk && x.pos === w.pos && meaningItems(x.en).some((m) => mine.has(m)));
    return {
      key: `vocab:${w.kk}`,
      mode: 'vocab' as const,
      task: 'Say it in Kazakh',
      prompt: w.en,
      promptLang: 'en' as const,
      answer: w.kk,
      accept: same.map((x) => x.kk),
      answerLang: 'kk' as const,
      explain: `“${w.en}” is ${w.kk}.${same.length ? ` (${same.map((x) => `${x.kk}, “${x.en}”`).join('; ')} is also right.)` : ''}`,
    };
  });
}

// ─── What to say aloud ──

/**
 * The Kazakh a question's audio says: the answer in its frame (Мен барамын., менің кітабым, Бұл кітап па?), or the
 * Kazakh prompt for questions answered in English or digits. Undefined for the alphabet.
 */
export function speakText(q: Question): string | undefined {
  if (q.mode === 'alphabet') return undefined;
  if (q.listen) return q.listen;
  if (q.mode === 'questions') return `${q.frame![0]} ${q.answer}${q.frame![1]}`;
  if (q.mode === 'imperative') return q.answer;
  if (q.mode === 'postpositions') return `${q.answer}${q.frame![1]}`;
  if (q.answerLang === 'kk') return q.frame ? `${q.frame[0]} ${q.answer}${q.frame[1]}`.trim() : q.answer;
  return q.promptLang === 'kk' ? q.prompt : undefined;
}

// ─── Listening ─────────────────────────────────────────────────────────────────────────────────────────────

function listenQs(s: Settings, rng: Rng): Question[] {
  const ids = s.listen.themes.length ? s.listen.themes : THEMES.map((t) => t.id);
  const words = uniqueWords(THEMES.filter((t) => ids.includes(t.id)).flatMap((t) => t.words));
  if (s.listen.kind === 'dictation') {
    return words.map((w) => ({
      key: `listen:${w.kk}`,
      mode: 'listen' as const,
      task: 'Write what you hear',
      prompt: w.kk,
      promptLang: 'kk' as const,
      listen: w.kk,
      answer: w.kk,
      answerLang: 'kk' as const,
      explain: `You heard ${w.kk}, “${w.en}”.`,
    }));
  }
  return vocabQs({ ...s, vocab: { direction: 'recognise', themes: ids, source: 'themes' } }, rng, words).map((q) => ({
    ...q,
    key: q.key.replace(/^vocab:/, 'listen:'),
    mode: 'listen' as const,
    task: 'What did you hear? Choose the meaning',
    listen: q.prompt,
  }));
}

// ─── Rounds ────────────────────────────────────────────────────────────────────────────────────────────────

export function pool(mode: Mode, s: Settings, rng: Rng, words?: Word[]): Question[] {
  switch (mode) {
    case 'alphabet':
      return alphabet(s, rng);
    case 'harmony':
      return harmonyQs();
    case 'plural':
      return plurals();
    case 'copula':
      return copulas(s);
    case 'possessive':
      return possessives(s);
    case 'cases':
      return cases(s);
    case 'pronouns':
      return pronouns(s);
    case 'present':
      return verbs(s, 'present');
    case 'past':
      return verbs(s, 'past');
    case 'questions':
      return questionQs();
    case 'numbers':
      return numbers(s);
    case 'vocab':
      return vocabQs(s, rng, words);
    case 'listen':
      return listenQs(s, rng);
    case 'continuous':
      return continuousQs(s);
    case 'future':
      return futureQs(s);
    case 'want':
      return wantQs(s);
    case 'imperative':
      return imperativeQs(s);
    case 'posscases':
      return posscasesQs(s);
    case 'postpositions':
      return postpositionQs();
  }
}

/** A drawer: each call returns the next n questions, never repeating one until the pool is used up. */
export function drawer(all: Question[], rng: Rng): (n: number) => Question[] {
  let deck: Question[] = [];
  return (n) => {
    const out: Question[] = [];
    while (out.length < n && all.length) {
      if (!deck.length) deck = shuffle(rng, all);
      out.push(deck.shift()!);
      if (out.length >= all.length && deck.length === 0) break;
    }
    // Choices are shuffled per question, with the same seed.
    return out.map((q) => (q.choices && q.mode !== 'questions' ? { ...q, choices: shuffle(rng, q.choices) } : q));
  };
}

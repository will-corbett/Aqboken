/**
 * Kazakh morphology: the suffix rules (vowel harmony + the sound a word ends in), used by the drills, the Learn
 * tables and the Wiktionary check (scripts/check-wiktionary.ts), which compares every form here with Wiktionary's
 * tables and fails on a disagreement for any word in our lists. Exceptions go in src/data/exceptions.ts.
 *
 * Every suffix has a back-vowel and a front-vowel variant ([back, front]); which consonant it starts with depends on
 * the class of the word's last sound (FinalClass).
 */

export type Harmony = 'back' | 'front';

const BACK_VOWELS = 'аоұыя';
const FRONT_VOWELS = 'әөүіеэё';
const ALL_VOWELS = 'аоұыяәөүіеэёюиу';

/**
 * Back or front: decided by the word's last vowel. и, у and ю after a vowel are glides (күйеу, аю) and are skipped;
 * after a consonant, и counts as front (алфавит → алфавиттер, би → билер) and у as back (минут → минуттар,
 * су → сулар). ё is front (актёр → актёрлер). Against Wiktionary's 4,600 noun tables this gets 98.3% right; the
 * rest are mostly Russian loans (банк → банктер), which take an override (Word.harmony).
 */
export function harmonyOf(word: string): Harmony {
  const w = word.toLowerCase();
  for (let i = w.length - 1; i >= 0; i--) {
    const c = w[i]!;
    if (BACK_VOWELS.includes(c)) return 'back';
    if (FRONT_VOWELS.includes(c)) return 'front';
    if ('иую'.includes(c)) {
      const prev = i > 0 ? w[i - 1]! : '';
      if (prev && ALL_VOWELS.includes(prev)) continue;
      if (c === 'и') return 'front';
      if (c === 'у') return 'back';
    }
  }
  return 'back';
}

/**
 * The class of the last sound, which picks a suffix's first consonant:
 *  V  a vowel (а ә е о ө ұ ү ы і э ю я ё)
 *  G  р й, and final у и (which end in a glide: су /sʊw/, би /bij/)
 *  L  л
 *  N  м н ң
 *  Z  з ж
 *  K  a voiceless consonant (п т к қ с ш ф х ц ч щ, and б в г д ғ, devoiced at the end of a word)
 */
export type FinalClass = 'V' | 'G' | 'L' | 'N' | 'Z' | 'K';

export function finalClass(word: string): FinalClass {
  const w = word.toLowerCase().replace(/[ьъ]+$/, '');
  const c = w[w.length - 1] ?? '';
  if ('аәеоөұүыіэюяё'.includes(c)) return 'V';
  if ('рйуи'.includes(c)) return 'G';
  if (c === 'л') return 'L';
  if ('мнң'.includes(c)) return 'N';
  if ('зж'.includes(c)) return 'Z';
  return 'K';
}

type Pair = readonly [back: string, front: string];
type ByClass = Record<FinalClass, Pair>;

const by = (v: Pair, g: Pair, l: Pair, n: Pair, z: Pair, k: Pair): ByClass => ({ V: v, G: g, L: l, N: n, Z: z, K: k });

/** Suffix tables. Read a row as: after a word ending in class X, add this (back, front). */
export const SUFFIX = {
  plural: by(['лар', 'лер'], ['лар', 'лер'], ['дар', 'дер'], ['дар', 'дер'], ['дар', 'дер'], ['тар', 'тер']),
  gen: by(['ның', 'нің'], ['дың', 'дің'], ['дың', 'дің'], ['ның', 'нің'], ['дың', 'дің'], ['тың', 'тің']),
  acc: by(['ны', 'ні'], ['ды', 'ді'], ['ды', 'ді'], ['ды', 'ді'], ['ды', 'ді'], ['ты', 'ті']),
  dat: by(['ға', 'ге'], ['ға', 'ге'], ['ға', 'ге'], ['ға', 'ге'], ['ға', 'ге'], ['қа', 'ке']),
  loc: by(['да', 'де'], ['да', 'де'], ['да', 'де'], ['да', 'де'], ['да', 'де'], ['та', 'те']),
  abl: by(['дан', 'ден'], ['дан', 'ден'], ['дан', 'ден'], ['нан', 'нен'], ['дан', 'ден'], ['тан', 'тен']),
  ins: by(['мен', 'мен'], ['мен', 'мен'], ['мен', 'мен'], ['мен', 'мен'], ['бен', 'бен'], ['пен', 'пен']),
  /** The question particle (written as a separate word) and the verb negation (-ма-). */
  question: by(['ма', 'ме'], ['ма', 'ме'], ['ма', 'ме'], ['ба', 'бе'], ['ба', 'бе'], ['па', 'пе']),
  /** The past tense (-ды/-ты). */
  past: by(['ды', 'ді'], ['ды', 'ді'], ['ды', 'ді'], ['ды', 'ді'], ['ды', 'ді'], ['ты', 'ті']),
} as const;

export function suffix(table: ByClass, word: string, h: Harmony = harmonyOf(word)): string {
  return table[finalClass(word)][h === 'back' ? 0 : 1];
}

/** Vowel-initial suffixes voice a final п/к/қ: кітап → кітабы, жүрек → жүрегі, шық- → шығады. */
export function voiceFinal(stem: string): string {
  const last = stem[stem.length - 1];
  const map: Record<string, string> = { п: 'б', к: 'г', қ: 'ғ' };
  return last && map[last] ? stem.slice(0, -1) + map[last] : stem;
}

// ─── Nouns ──────────────────────────────────────────────────────────────────────────────────────────────────

export const CASES = ['nom', 'gen', 'dat', 'acc', 'loc', 'abl', 'ins'] as const;
export type Case = (typeof CASES)[number];

export interface NounOptions {
  /** Harmony override for loanwords that don't follow the last vowel. */
  harmony?: Harmony;
  /** A loanword whose final п/к/қ doesn't voice before a vowel (банк → банкі). */
  noVoicing?: boolean;
  /** The stem before a vowel-initial suffix when a vowel drops out: ауыз → аузы, мұрын → мұрны. */
  possStem?: string;
  /** Already a 3rd-person possessive form (отбасы): cases as possessedCase. */
  possessed?: boolean;
}

export function plural(noun: string, o: NounOptions = {}): string {
  return noun + suffix(SUFFIX.plural, noun, o.harmony ?? harmonyOf(noun));
}

/** A case form of a noun (or a plural: pass the plural as `noun`). */
export function caseForm(noun: string, c: Case, o: NounOptions = {}): string {
  if (c === 'nom') return noun;
  if (o.possessed) return possessedCase(noun, c, o.harmony);
  return noun + suffix(SUFFIX[c], noun, o.harmony ?? harmonyOf(noun));
}

/**
 * Cases after the 3rd-person possessive (-ы/-і/-сы/-сі) take an н: кітабы → кітабына, кітабын, кітабында,
 * кітабынан (and the genitive and instrumental as usual: кітабының, кітабымен).
 */
export function possessedCase(form: string, c: Case, h: Harmony = harmonyOf(form)): string {
  const i = h === 'back' ? 0 : 1;
  const table: Record<Case, Pair> = {
    nom: ['', ''],
    gen: ['ның', 'нің'],
    dat: ['на', 'не'],
    acc: ['н', 'н'],
    loc: ['нда', 'нде'],
    abl: ['нан', 'нен'],
    ins: ['мен', 'мен'],
  };
  return form + table[c][i];
}

export const PERSONS = ['1sg', '2sg', '2sgf', '3', '1pl', '2pl', '2plf'] as const;
export type Person = (typeof PERSONS)[number];
/** The persons the possessive drill uses (2nd plural possessives are rare in beginner Kazakh). */
export const POSS_PERSONS = ['1sg', '2sg', '2sgf', '3', '1pl'] as const;
export type PossPerson = (typeof POSS_PERSONS)[number];

export const PRONOUN: Record<Person, string> = {
  '1sg': 'мен',
  '2sg': 'сен',
  '2sgf': 'сіз',
  '3': 'ол',
  '1pl': 'біз',
  '2pl': 'сендер',
  '2plf': 'сіздер',
};
/** The pronoun in the genitive, used before a possessed noun (менің кітабым). */
export const PRONOUN_GEN: Record<PossPerson, string> = {
  '1sg': 'менің',
  '2sg': 'сенің',
  '2sgf': 'сіздің',
  '3': 'оның',
  '1pl': 'біздің',
};

const POSS: Record<PossPerson, { afterVowel: Pair; afterConsonant: Pair }> = {
  '1sg': { afterVowel: ['м', 'м'], afterConsonant: ['ым', 'ім'] },
  '2sg': { afterVowel: ['ң', 'ң'], afterConsonant: ['ың', 'ің'] },
  '2sgf': { afterVowel: ['ңыз', 'ңіз'], afterConsonant: ['ыңыз', 'іңіз'] },
  '3': { afterVowel: ['сы', 'сі'], afterConsonant: ['ы', 'і'] },
  '1pl': { afterVowel: ['мыз', 'міз'], afterConsonant: ['ымыз', 'іміз'] },
};

/** The possessive: бала → балам, кітап → кітабым, үй → үйі. Final у/и/й count as consonants here (суы, үйі). */
export function possessive(noun: string, p: PossPerson, o: NounOptions = {}): string {
  const h = o.harmony ?? harmonyOf(noun);
  const i = h === 'back' ? 0 : 1;
  if (finalClass(noun) === 'V') return noun + POSS[p].afterVowel[i];
  const stem = o.possStem ?? (o.noVoicing ? noun : voiceFinal(noun));
  return stem + POSS[p].afterConsonant[i];
}

// ─── "I am a …": personal endings on nouns and adjectives ────────────────────────────────────────────────────

const COPULA: Record<Person, ByClass | Pair> = {
  '1sg': by(['мын', 'мін'], ['мын', 'мін'], ['мын', 'мін'], ['мын', 'мін'], ['бын', 'бін'], ['пын', 'пін']),
  '2sg': ['сың', 'сің'],
  '2sgf': ['сыз', 'сіз'],
  '3': ['', ''],
  '1pl': by(['мыз', 'міз'], ['мыз', 'міз'], ['мыз', 'міз'], ['мыз', 'міз'], ['быз', 'біз'], ['пыз', 'піз']),
  '2pl': ['сыңдар', 'сіңдер'],
  '2plf': ['сыздар', 'сіздер'],
};

/** Мен мұғаліммін, Сен студентсің, Біз қазақпыз. */
export function copula(word: string, p: Person, o: NounOptions = {}): string {
  const h = o.harmony ?? harmonyOf(word);
  const t = COPULA[p];
  const pair = Array.isArray(t) ? (t as Pair) : (t as ByClass)[finalClass(word)];
  return word + pair[h === 'back' ? 0 : 1];
}

/** The yes/no question particle, a separate word: Бұл кітап па? Сен барасың ба? */
export function questionParticle(word: string, h: Harmony = harmonyOf(word)): string {
  return suffix(SUFFIX.question, word, h);
}

// ─── Verbs ──────────────────────────────────────────────────────────────────────────────────────────────────

export const VERB_PERSONS = PERSONS;

export interface VerbOptions {
  harmony?: Harmony;
}

/** Personal endings of the present (after -а/-е/-й) and of the negative present (after -май). */
const PRESENT_END: Record<Person, Pair> = {
  '1sg': ['мын', 'мін'],
  '2sg': ['сың', 'сің'],
  '2sgf': ['сыз', 'сіз'],
  '3': ['ды', 'ді'],
  '1pl': ['мыз', 'міз'],
  '2pl': ['сыңдар', 'сіңдер'],
  '2plf': ['сыздар', 'сіздер'],
};
/** Personal endings of the past (after -ды/-ты). */
const PAST_END: Record<Person, Pair> = {
  '1sg': ['м', 'м'],
  '2sg': ['ң', 'ң'],
  '2sgf': ['ңыз', 'ңіз'],
  '3': ['', ''],
  '1pl': ['қ', 'к'],
  '2pl': ['ңдар', 'ңдер'],
  '2plf': ['ңыздар', 'ңіздер'],
};

/**
 * The present base, before the personal ending: бар → бара-, кел → келе-, тап → таба-, ойна → ойнай-, оқы → оқи-,
 * жу → жуа-, той → тоя-.
 */
export function presentBase(stem: string, h: Harmony = harmonyOf(stem)): string {
  const a = h === 'back' ? 'а' : 'е';
  const last = stem[stem.length - 1]!;
  if (last === 'ы' || last === 'і') return stem.slice(0, -1) + 'и';
  if ('аәеоөұү'.includes(last)) return stem + 'й';
  // й + а is written я (той- → тояды); й + е stays йе (сүй- → сүйеді).
  if (last === 'й') return h === 'back' ? stem.slice(0, -1) + 'я' : stem + 'е';
  if (last === 'у' || last === 'и') return stem + a;
  return voiceFinal(stem) + a;
}

/** Present (present-future) tense: Мен барамын, Ол оқиды. */
export function present(stem: string, p: Person, o: VerbOptions = {}): string {
  const h = o.harmony ?? harmonyOf(stem);
  return presentBase(stem, h) + PRESENT_END[p][h === 'back' ? 0 : 1];
}

/** The negative stem: бар → барма, кел → келме, айт → айтпа, жаз → жазба. */
export function negativeStem(stem: string, h: Harmony = harmonyOf(stem)): string {
  return stem + suffix(SUFFIX.question, stem, h);
}

/** Negative present: Мен бармаймын, Ол келмейді. */
export function presentNeg(stem: string, p: Person, o: VerbOptions = {}): string {
  const h = o.harmony ?? harmonyOf(stem);
  return negativeStem(stem, h) + 'й' + PRESENT_END[p][h === 'back' ? 0 : 1];
}

/** Past tense: Мен бардым, Ол айтты, Біз келдік. */
export function past(stem: string, p: Person, o: VerbOptions = {}): string {
  const h = o.harmony ?? harmonyOf(stem);
  const i = h === 'back' ? 0 : 1;
  return stem + suffix(SUFFIX.past, stem, h) + PAST_END[p][i];
}

/** Negative past: Мен бармадым, Ол айтпады. */
export function pastNeg(stem: string, p: Person, o: VerbOptions = {}): string {
  const h = o.harmony ?? harmonyOf(stem);
  const i = h === 'back' ? 0 : 1;
  return negativeStem(stem, h) + (h === 'back' ? 'ды' : 'ді') + PAST_END[p][i];
}

// ─── Numbers ────────────────────────────────────────────────────────────────────────────────────────────────

const ONES = ['', 'бір', 'екі', 'үш', 'төрт', 'бес', 'алты', 'жеті', 'сегіз', 'тоғыз'];
const TENS = ['', 'он', 'жиырма', 'отыз', 'қырық', 'елу', 'алпыс', 'жетпіс', 'сексен', 'тоқсан'];

/** A whole number from 0 to 999 999 in words: 25 → жиырма бес, 1991 → бір мың тоғыз жүз тоқсан бір. */
export function numberWords(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 999_999) throw new RangeError(`numberWords: ${n}`);
  if (n === 0) return 'нөл';
  const parts: string[] = [];
  const thousands = Math.floor(n / 1000);
  const rest = n % 1000;
  if (thousands) parts.push(...(thousands === 1 ? ['бір'] : [numberWords(thousands)]), 'мың');
  const hundreds = Math.floor(rest / 100);
  if (hundreds) parts.push(...(hundreds === 1 ? ['жүз'] : [ONES[hundreds]!, 'жүз']));
  const tens = Math.floor((rest % 100) / 10);
  const ones = rest % 10;
  if (tens) parts.push(TENS[tens]!);
  if (ones) parts.push(ONES[ones]!);
  return parts.join(' ');
}

// ─── Personal pronouns (declined irregularly, so listed in full) ────────────────────────────────────────────

export const PRONOUN_CASES: Record<'мен' | 'сен' | 'сіз' | 'ол' | 'біз' | 'олар', Record<Case, string>> = {
  мен: { nom: 'мен', gen: 'менің', dat: 'маған', acc: 'мені', loc: 'менде', abl: 'менен', ins: 'менімен' },
  сен: { nom: 'сен', gen: 'сенің', dat: 'саған', acc: 'сені', loc: 'сенде', abl: 'сенен', ins: 'сенімен' },
  сіз: { nom: 'сіз', gen: 'сіздің', dat: 'сізге', acc: 'сізді', loc: 'сізде', abl: 'сізден', ins: 'сізбен' },
  ол: { nom: 'ол', gen: 'оның', dat: 'оған', acc: 'оны', loc: 'онда', abl: 'одан', ins: 'онымен' },
  біз: { nom: 'біз', gen: 'біздің', dat: 'бізге', acc: 'бізді', loc: 'бізде', abl: 'бізден', ins: 'бізбен' },
  олар: { nom: 'олар', gen: 'олардың', dat: 'оларға', acc: 'оларды', loc: 'оларда', abl: 'олардан', ins: 'олармен' },
};

import { finalClass, harmonyOf, type Case, type Person } from '../shared/kazakh.ts';

export const CASE_NAME: Record<Case, { en: string; kk: string; meaning: string }> = {
  nom: { en: 'Nominative', kk: 'Атау', meaning: 'the plain form' },
  gen: { en: 'Genitive', kk: 'Ілік', meaning: 'of, ’s' },
  dat: { en: 'Dative', kk: 'Барыс', meaning: 'to, towards, for' },
  acc: { en: 'Accusative', kk: 'Табыс', meaning: 'the (definite object)' },
  loc: { en: 'Locative', kk: 'Жатыс', meaning: 'in, at, on' },
  abl: { en: 'Ablative', kk: 'Шығыс', meaning: 'from, out of' },
  ins: { en: 'Instrumental', kk: 'Көмектес', meaning: 'with, by' },
};

/** An English cue for a case form of a noun: dat + “school” → “to the school”. */
export function caseCue(c: Case, en: string, plural = false): string {
  const w = plural ? pluralEn(en) : en;
  switch (c) {
    case 'nom':
      return w;
    case 'gen':
      return `of the ${w}`;
    case 'dat':
      return `to the ${w}`;
    case 'acc':
      return `the ${w} (as the object: I see the ${w})`;
    case 'loc':
      return `in / at the ${w}`;
    case 'abl':
      return `from the ${w}`;
    case 'ins':
      return `with / by the ${w}`;
  }
}

/** The first, plainest meaning: “house; home” → “house”, “a Kazakh” → “Kazakh”, “pupil, schoolchild” → “pupil”. */
export function firstMeaning(en: string): string {
  return en
    .split(/[;,]/)[0]!
    .replace(/\(.*?\)/g, '')
    .replace(/^(an?|the) /, '')
    .trim();
}
function pluralEn(w: string): string {
  if (/(s|sh|ch|x)$/.test(w)) return w + 'es';
  if (/[^aeiou]y$/.test(w)) return w.slice(0, -1) + 'ies';
  if (w === 'child') return 'children';
  if (w === 'person') return 'people';
  if (w === 'woman') return 'women';
  if (w === 'foot') return 'feet';
  if (w === 'tooth') return 'teeth';
  if (w === 'sheep' || w === 'fish') return w;
  return w + 's';
}

export const PERSON_NAME: Record<Person, string> = {
  '1sg': 'мен · I',
  '2sg': 'сен · you (friend)',
  '2sgf': 'сіз · you (polite)',
  '3': 'ол · he, she',
  '1pl': 'біз · we',
  '2pl': 'сендер · you (friends)',
  '2plf': 'сіздер · you (polite, several)',
};

const CLASS_TEXT = {
  V: 'a vowel',
  G: 'a sonorant (р, й, у, и)',
  L: 'л',
  N: 'a nasal (м, н, ң)',
  Z: 'a voiced з or ж',
  K: 'a voiceless consonant',
} as const;

/** “ends in п, a voiceless consonant” */
export function endingText(word: string): string {
  const w = word.replace(/[ьъ]+$/, '');
  const last = w[w.length - 1] ?? '';
  const cls = finalClass(word);
  return cls === 'L' ? 'ends in л' : `ends in ${last}, ${CLASS_TEXT[cls]}`;
}

/** “its last vowel, а, is a back vowel” */
export function harmonyText(word: string, h = harmonyOf(word)): string {
  const v = [...word.toLowerCase()].reverse().find((c) => 'аоұыяәөүіеэёиую'.includes(c));
  return `its last vowel${v ? `, ${v},` : ''} is ${h === 'back' ? 'a back vowel' : 'a front vowel'} (so ${h === 'back' ? 'а/ы' : 'е/і'} in the ending)`;
}

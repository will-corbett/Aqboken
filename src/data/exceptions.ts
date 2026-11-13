/**
 * Exceptions to the rules and to the Wiktionary check. Every entry says why.
 */
import type { NounOptions } from '../shared/kazakh.ts';
import { ALL_WORDS } from './words.ts';

/** Words and phrases Wiktionary has no entry for (as that part of speech), with the reason we keep them. */
export const NOT_IN_WIKTIONARY: Record<string, string> = {
  қай: 'a basic question word (which?) with no English Wiktionary entry yet; it never changes form.',
  'ас үй': 'kitchen, written as two words (ас “food” + үй “house”); үй is in Wiktionary, ас only inside phrases. Its endings follow үй (ас үйде), as the rules give.',
  қайту: 'a basic verb (to return) with no Wiktionary entry yet; regular: stem қайт-, like айту (whose table matches).',
  жуу: 'a basic verb (to wash) with no Wiktionary entry yet; stem жу-, present жуамын like other stems in -у.',
  сөйлесу: 'a basic verb (to talk with) with no Wiktionary entry yet; stem сөйлес-, regular.',
  пісіру: 'a basic verb (to cook) with no Wiktionary entry yet; stem пісір-, regular.',
};

/**
 * Forms where Wiktionary's table is wrong, keyed "word|form" as the report names them. Only clear errors (a typo,
 * a suffix that breaks the language's own rules), each with the reason.
 */
export const WIKTIONARY_ERRORS: Record<string, string> = {
  'немере|dat pl': 'Wiktionary has “немерелердге”, a typo: the dative plural is -ларға/-лерге (немерелерге), as in every other table.',
};

/** Kazakh words used in Learn pages that the check can't find, each with what it is and why it's right. */
export const LEARN_WORDS: Record<string, string> = {
  чемпион: 'a Russian loanword (champion), quoted on the alphabet page for its letter ч.',
  юрист: 'a Russian loanword (lawyer), quoted on the alphabet page for its letter ю.',
  көмектес: 'the Kazakh name of the instrumental case (Көмектес септік).',
  досыммен: 'дос + -ым (my) + -мен (with): the possessive, then the case ending, each by the rules.',
  емеспін: 'емес (not) + -пін, the “I am” ending after a voiceless consonant, by the rules.',
  асқардың: 'Асқар, a man’s name, + the genitive -дың (after р), by the rules.',
  астанасы: 'астана (capital city) + the 3rd-person possessive -сы, by the rules.',
  отырмын: 'отыр- (sit, used as a helper for “right now”) + -мын: “Мен кітап оқып отырмын”.',
};

/** The options a noun's forms are made with (from its entry in words.ts). */
export function nounOptions(kk: string): NounOptions {
  const w = ALL_WORDS.find((x) => x.kk === kk && x.pos === 'n');
  return w ? { harmony: w.harmony, noVoicing: w.noVoicing, possStem: w.possStem, possessed: w.possessed } : {};
}

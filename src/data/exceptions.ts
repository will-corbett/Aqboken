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
  ауыру: 'a basic verb (to hurt, to be ill: басым ауырады) with no Wiktionary entry yet; stem ауыр-, regular.',
  'сатып алу': 'to buy: сатып (the -ып form of сату, sell) + алу (take), the everyday verb; алу is in Wiktionary.',
  әкелу: 'a basic verb (to bring) with no Wiktionary entry yet; stem әкел-, regular.',
  'қоңырау шалу': 'to phone: қоңырау (bell) + шалу (ring); қоңырау is in Wiktionary, шалу not yet.',
};

/**
 * Forms where Wiktionary's table is wrong, keyed "word|form" as the report names them. Only clear errors (a typo,
 * a suffix that breaks the language's own rules), each with the reason.
 */
export const WIKTIONARY_ERRORS: Record<string, string> = {
  'сөмке|gen sg': 'Wiktionary has “сөмкедің”: a noun ending in a vowel takes -нің (сөмкенің), as in every other table.',
  'сөмке|acc sg': 'Wiktionary has “сөмкеді”: a noun ending in a vowel takes -ні (сөмкені), as in every other table.',
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
  // Kazakh grammar terms in topic names (to confirm in the native-speaker review).
  үндестік: 'grammar term: үндестік заңы, the law of (vowel) harmony.',
  заңы: 'заң (law) + the 3rd-person possessive -ы, as in үндестік заңы.',
  жіктік: 'grammar term: жіктік жалғау, the personal ending.',
  тәуелдік: 'grammar term: тәуелдік жалғау, the possessive ending.',
  пен: 'and; the form of мен after a voiceless consonant (тәуелдік пен септік).',
  септеулік: 'grammar term: септеулік шылаулар, postpositions.',
  жіктеу: 'grammar term: жіктеу есімдіктері, personal pronouns.',
  есімдіктері: 'есімдік (pronoun) + -тер + -і, as in жіктеу есімдіктері.',
  сұраулық: 'grammar term: сұраулық шылау, the question particle.',
  тыңдалым: 'listening (as a language skill).',
  мамандықтар: 'мамандық (profession) + the plural -тар.',
  мезгілдері: 'мезгіл (season) + -дер + -і: жыл мезгілдері, the seasons of the year.',
};

/** Tatoeba sentences never shown as examples, by id, with the reason. */
export const TATOEBA_DENY: Record<number, string> = {
  12431210: 'Апыр-ай! is an exclamation, not ай (moon).',
  14026173: 'басқа here is “other”, not the dative of бас (head).',
  5375979: 'қой here is the imperative of қою (put), not қой (sheep).',
  1518486: 'аш here is “hungry”, not the imperative of ашу (open).',
  1534058: 'көкке here is “sky” in an idiom, not көк (blue).',
  10938255: 'ата-анасы is “parents”, a compound, not ата (grandfather).',
  10471341: 'жаста is “at the age of”, a different sense from жас (young).',
  9642359: 'ал- here is the auxiliary “can” (ұйықтай алмаймын), confusing as an example of алу (take).',
  11284830: 'сатып алу is “buy”: confusing as an example of сату (sell).',
  11065634: 'жүр here is an auxiliary, not жүру (walk).',
  2903218: 'political.',
  10875765: '“He is fat”: unkind.',
  7889642: '“You are drunk”.',
  7889643: '“You are drunk”.',
  5262169: '“The pain is killing me”: violent wording.',
  7889507: '“Betting on human stupidity”: not a good learner example.',
  437419: 'an advertising slogan with a misspelling (сатыл ал).',
  3552574: 'misspelt: Қаліңіз for Халіңіз.',
  11071397: 'ал- here is the auxiliary “can” (жей алмайсың).',
  437440: '“You are a toilet!”: an insult.',
  11062265: 'ал- here is the auxiliary “can” (жете аласың).',
  1518392: 'ауыр here is the adjective “hard, heavy”, not ауыру (to hurt).',
  1517404: 'Қазан here is the city of Kazan, not қазан (October; cauldron).',
  8008660: 'қал- and тұр- here are auxiliaries (тұрып қалды, “got stuck”), not қалу or тұру.',
  437364: 'an advertising slogan; өт- is an auxiliary in атап өт.',
  11064451: '“I am the state”: a political quotation.',
};

/**
 * Forms that also spell another, more common word, so a sentence containing them isn't an example of ours:
 * басқа is “other” as well as “to the head”; жаста is “at the age of”; сатып is nearly always сатып алу (buy).
 */
export const TATOEBA_AMBIGUOUS_FORMS: Record<string, string> = {
  басқа: '“other” (басқа), more often than the dative of бас (head).',
  жаста: '“at the age of …”, a different sense from жас (young).',
  сатып: 'nearly always сатып алу (buy), not сату (sell).',
};

/** Words given no Tatoeba example, with the reason. */
export const TATOEBA_SKIP_WORDS: Record<string, string> = {
  алу: 'in these sentences ал- is nearly always the auxiliary “can” (тыныштала алмады), not “take”.',
  қалу: 'in these sentences қал- is nearly always an auxiliary (болып қалды, “became”), not “stay”.',
};

/** The options a noun's forms are made with (from its entry in words.ts). */
export function nounOptions(kk: string): NounOptions {
  const w = ALL_WORDS.find((x) => x.kk === kk && x.pos === 'n');
  return w ? { harmony: w.harmony, noVoicing: w.noVoicing, possStem: w.possStem, possessed: w.possessed } : {};
}

/** Example sentences from Tatoeba (src/data/sentences.json, built by scripts/build-sentences.ts). */
import data from '../data/sentences.json';

/** [Tatoeba id, Kazakh, English, contributor, start, end of the word in the Kazakh]. */
export type SentenceRow = [number, string, string, string, number, number];
export const SENTENCES = data as unknown as Record<string, SentenceRow>;

/** The sentence for a word (by dictionary form). */
export const sentenceFor = (word: string): SentenceRow | undefined => SENTENCES[word];

/** The sentence for a word, only if the word appears in it in exactly this form (as in Krotik). */
export function sentenceWithForm(word: string, form: string): SentenceRow | undefined {
  const s = SENTENCES[word];
  return s && s[1].slice(s[4], s[5]).toLowerCase() === form.toLowerCase() ? s : undefined;
}

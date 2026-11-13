/** Reading texts' built data (src/data/reading/<id>.json), loaded on demand. */
export interface ReadingWord {
  t: string;
  lemma: string;
  en: string;
  form: string;
  source: 'ours' | 'wiktionary' | 'rule' | 'hand';
  ours?: boolean;
}
export interface ReadingData {
  id: string;
  paragraphs: (string | number)[][];
  words: ReadingWord[];
  notes: string[];
  wordCount: number;
}
const files = import.meta.glob('/src/data/reading/*.json', { import: 'default' }) as Record<string, () => Promise<ReadingData>>;
export const loadReading = (id: string): Promise<ReadingData> | undefined => files[`/src/data/reading/${id}.json`]?.();
export const SOURCE_NAME: Record<ReadingWord['source'], string> = {
  ours: 'our word lists',
  wiktionary: 'Wiktionary',
  rule: 'made by the rules from a Wiktionary word',
  hand: 'our explanation',
};

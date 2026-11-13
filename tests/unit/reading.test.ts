import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { TEXTS } from '../../src/data/reading.ts';
import type { ReadingData } from '../../src/lib/reading.ts';

describe.each(TEXTS)('$id', (t) => {
  const d = JSON.parse(readFileSync(`src/data/reading/${t.id}.json`, 'utf8')) as ReadingData;
  it('every word is explained', () => {
    for (const w of d.words) {
      expect(w.lemma, w.t).toBeTruthy();
      expect(w.en || w.form, w.t).toBeTruthy();
    }
  });
  it('paragraphs refer to every word once, in order', () => {
    const idx = d.paragraphs.flat().filter((x): x is number => typeof x === 'number');
    expect(idx).toEqual(d.words.map((_, i) => i));
  });
  it('has well-formed questions of more than one kind', () => {
    expect(t.questions.length).toBeGreaterThanOrEqual(3);
    for (const q of t.questions) {
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(q.options.length);
      expect(new Set(q.options).size).toBe(q.options.length);
      expect(q.why.length).toBeGreaterThan(10);
    }
    expect(t.questions.some((q) => q.kind === 'inference')).toBe(true);
  });
});

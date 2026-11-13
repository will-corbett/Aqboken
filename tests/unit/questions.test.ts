import { describe, expect, it } from 'vitest';
import { pool, type Question } from '../../src/lib/questions.ts';
import { defaults, type Settings } from '../../src/lib/settings.ts';
import { checkAnswer } from '../../src/lib/check.ts';
import { mulberry32 } from '../../src/lib/rng.ts';
import { TOPICS } from '../../src/lib/topics.ts';
import { PERSONS } from '../../src/shared/kazakh.ts';
import { toLatin } from '../../src/shared/script.ts';

/** Every drill under its default settings and a few variants. */
function variants(): [string, Settings][] {
  const out: [string, Settings][] = [];
  for (const t of TOPICS) {
    const s = defaults();
    s.mode = t.id;
    out.push([t.id, s]);
  }
  const all = defaults();
  all.cases.number = 'both';
  all.present = { persons: [...PERSONS], polarity: 'both' };
  all.past = { persons: [...PERSONS], polarity: 'both' };
  all.copula.persons = [...PERSONS];
  out.push(['cases-both', { ...all, mode: 'cases' }], ['present-all', { ...all, mode: 'present' }], ['past-all', { ...all, mode: 'past' }], ['copula-all', { ...all, mode: 'copula' }]);
  for (const r of ['to10', 'to1000', 'years'] as const) for (const d of ['write', 'read'] as const) out.push([`numbers-${r}-${d}`, { ...defaults(), mode: 'numbers', numbers: { range: r, direction: d } }]);
  out.push(['vocab-recall', { ...defaults(), mode: 'vocab', vocab: { direction: 'recall', themes: [], source: 'themes' } }], ['alphabet-back', { ...defaults(), mode: 'alphabet', alphabet: { direction: 'toCyrillic' } }]);
  return out;
}

describe.each(variants())('%s', (_, s) => {
  const qs: Question[] = pool(s.mode, s, mulberry32(1));
  it('has questions', () => expect(qs.length).toBeGreaterThan(5));
  it('every question is well-formed', () => {
    const keys = new Set<string>();
    for (const q of qs) {
      const text = JSON.stringify(q);
      expect(text, q.key).not.toMatch(/undefined|NaN|\[object/);
      expect(q.answer, q.key).toBeTruthy();
      expect(q.explain.length, q.key).toBeGreaterThan(5);
      expect(keys.has(q.key), `duplicate ${q.key}`).toBe(false);
      keys.add(q.key);
      if (q.choices) {
        expect(q.choices, q.key).toContain(q.answer);
        expect(new Set(q.choices).size, q.key).toBe(q.choices.length);
      }
      expect(checkAnswer(q, q.answer).correct, q.key).toBe(true);
      // The answer typed in Latin is right too.
      if (!q.choices && q.answerLang === 'kk') expect(checkAnswer(q, toLatin(q.answer)).correct, q.key).toBe(true);
      // No "other form" equals the answer.
      for (const o of q.others ?? []) expect(o.form === q.answer && o.label, q.key).toBeFalsy();
    }
  });
});

import { describe, expect, it } from 'vitest';
import { addDays, addWords, dueWords, review } from '../../src/lib/mywords.ts';

describe('my words', () => {
  it('adds days across months', () => expect(addDays('2026-11-30', 3)).toBe('2026-12-03'));
  it('moves up a box when right, back to 0 when wrong', () => {
    let w = review({}, [{ word: 'кітап', right: true }], '2026-11-13');
    expect(w['кітап']).toEqual({ box: 1, added: '2026-11-13', due: '2026-11-16' });
    w = review(w, [{ word: 'кітап', right: true }], '2026-11-16');
    expect(w['кітап']!.box).toBe(2);
    expect(w['кітап']!.due).toBe('2026-11-23');
    w = review(w, [{ word: 'кітап', right: false }], '2026-11-23');
    expect(w['кітап']).toEqual({ box: 0, added: '2026-11-13', due: '2026-11-24' });
  });
  it('lists due words, most overdue first', () => {
    const w = addWords(review({}, [{ word: 'үй', right: false }], '2026-11-10'), ['су', 'үй'], '2026-11-12');
    expect(w['үй']!.added).toBe('2026-11-10');
    expect(dueWords(w, '2026-11-12')).toEqual(['үй', 'су']);
    expect(dueWords(w, '2026-11-10')).toEqual([]);
  });
});

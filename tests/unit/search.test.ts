import { describe, expect, it } from 'vitest';
import { search } from '../../src/lib/search.ts';

describe('search', () => {
  it('finds a word from one of its forms', () => {
    expect(search('кітабымда')[0]).toMatchObject({ kind: 'Word', title: 'кітап' });
    expect(search('мектептерге')[0]).toMatchObject({ kind: 'Word', title: 'мектеп' });
    expect(search('барамын')[0]).toMatchObject({ kind: 'Word', title: 'бару' });
  });
  it('accepts Latin for Kazakh', () => expect(search('kıtap')[0]).toMatchObject({ kind: 'Word', title: 'кітап' }));
  it('finds English meanings, lessons and culture', () => {
    expect(search('book').some((h) => h.kind === 'Word' && h.title === 'кітап')).toBe(true);
    expect(search('dative').some((h) => h.kind === 'Lesson' && h.title === 'The seven cases')).toBe(true);
    expect(search('podcast').some((h) => h.kind === 'Culture')).toBe(true);
  });
  it('ignores one-letter queries', () => expect(search('a')).toEqual([]));
});

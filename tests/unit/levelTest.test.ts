import { describe, expect, it } from 'vitest';
import { PER_LEVEL, TEST_LEVELS, buildTest, scoreTest } from '../../src/lib/levelTest.ts';
import { mulberry32 } from '../../src/lib/rng.ts';

describe('grammar test', () => {
  for (const seed of [1, 2, 3, 42, 99])
    it(`seed ${seed}: 12 well-formed questions per level`, () => {
      const items = buildTest(mulberry32(seed));
      for (const l of TEST_LEVELS) expect(items.filter((x) => x.level === l)).toHaveLength(PER_LEVEL);
      for (const it of items) {
        expect(it.options).toContain(it.q.answer);
        expect(new Set(it.options).size).toBe(it.options.length);
        expect(it.options).toHaveLength(it.level === 'B1' ? 5 : 4);
        // No wrong option is also an accepted answer.
        for (const o of it.options) if (o !== it.q.answer) expect(it.q.accept ?? []).not.toContain(o);
      }
      // At most 2 per topic per level.
      for (const l of TEST_LEVELS) {
        const counts = new Map<string, number>();
        for (const it of items.filter((x) => x.level === l)) counts.set(it.q.mode, (counts.get(it.q.mode) ?? 0) + 1);
        for (const n of counts.values()) expect(n).toBeLessThanOrEqual(2);
      }
    });
  it('scores levels', () => {
    const items = buildTest(mulberry32(5));
    const all = items.map((x) => x.q.answer);
    expect(scoreTest(items, all).level).toBe('B1');
    const onlyA1 = items.map((x) => (x.level === 'A1' ? x.q.answer : undefined));
    expect(scoreTest(items, onlyA1).level).toBe('A1');
    expect(scoreTest(items, items.map(() => undefined)).level).toBeUndefined();
  });
});

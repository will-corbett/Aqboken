import { describe, expect, it } from 'vitest';
import { WRITING } from '../../src/data/writing.ts';
import { topicById } from '../../src/lib/topics.ts';
import { themeById } from '../../src/data/words.ts';

describe('writing tasks', () => {
  it('three per level', () => {
    for (const l of ['A1', 'A2', 'B1']) expect(WRITING.filter((w) => w.level === l)).toHaveLength(3);
  });
  it('every linked topic has a Learn page and every theme exists', () => {
    for (const w of WRITING) {
      for (const c of w.checklist) if (c.topic) expect(topicById(c.topic)?.learn, `${w.id}: ${c.topic}`).toBe(true);
      for (const t of w.themes) expect(themeById(t), `${w.id}: ${t}`).toBeTruthy();
    }
  });
});

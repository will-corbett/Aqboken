import { describe, expect, it } from 'vitest';
import { PATHS, LEVELS, nextStep, stepDone } from '../../src/lib/paths.ts';
import { THEMES, themeById } from '../../src/data/words.ts';
import { TOPICS, topicById } from '../../src/lib/topics.ts';

const rank = (l: string) => ['A1', 'A2', 'B1'].indexOf(l.slice(0, 2));

describe('learning paths', () => {
  it('has a path per level', () => expect(PATHS.map((p) => p.level)).toEqual(LEVELS));
  it('every step exists and is not from a later level', () => {
    for (const p of PATHS)
      for (const s of p.steps) {
        const level = s.kind === 'topic' ? topicById(s.id)?.level : themeById(s.id)?.level;
        expect(level, `${p.level}: ${s.kind} ${s.id}`).toBeTruthy();
        expect(rank(level!), `${p.level}: ${s.id} is ${level}`).toBeLessThanOrEqual(rank(p.level));
        expect(s.why.length).toBeGreaterThan(5);
      }
  });
  it('every theme is on its own level’s path', () => {
    for (const th of THEMES) expect(PATHS.find((p) => p.level === th.level)!.steps.some((s) => s.kind === 'theme' && s.id === th.id), th.id).toBe(true);
  });
  it('every Learn topic is on some path', () => {
    for (const t of TOPICS.filter((x) => x.learn)) expect(PATHS.some((p) => p.steps.some((s) => s.kind === 'topic' && s.id === t.id)), t.id).toBe(true);
  });
  it('ticks topics once drilled and themes once half their words are added', () => {
    const fam = themeById('family')!;
    const half = Object.fromEntries(fam.words.slice(0, Math.ceil(fam.words.length / 2)).map((w) => [w.kk, { box: 0, added: '2026-11-13', due: '2026-11-13' }]));
    expect(stepDone({ kind: 'theme', id: 'family', why: '' }, {}, half)).toBe(true);
    expect(stepDone({ kind: 'topic', id: 'alphabet', why: '' }, { alphabet: { rounds: 1, last: 80, date: '2026-11-13' } }, {})).toBe(true);
    expect(nextStep('A1', { alphabet: { rounds: 1, last: 80, date: '2026-11-13' } }, {})).toEqual(PATHS[0]!.steps[1]);
  });
});

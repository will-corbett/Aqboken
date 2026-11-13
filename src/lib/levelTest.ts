/**
 * The grammar test: 12 multiple-choice questions at each of A1, A2 and B1, easiest first, drawn from the drills'
 * questions. The wrong options are other real forms of the same word (`Question.others`: another case, person, tense
 * or polarity), so exactly one option fits the task; never a misspelt or invented form. At most 2 questions per topic
 * per level. Kept in memory only.
 *
 * Result: you reach a level with ≥ 9 of 12 there and no lower level under 8 of 12 (`scoreTest`). It measures grammar
 * only, and says so.
 */
import { pool, type Question } from './questions.ts';
import { defaults } from './settings.ts';
import { shuffle, type Rng } from './rng.ts';
import type { Mode } from './topics.ts';
import { PERSONS, POSS_PERSONS } from '../shared/kazakh.ts';
import type { Level } from './paths.ts';

export const TEST_LEVELS: Level[] = ['A1', 'A2', 'B1'];
export const PER_LEVEL = 12;

/** The topics each level draws from. */
export const TEST_TOPICS: Record<Level, Mode[]> = {
  A1: ['copula', 'possessive', 'cases', 'present', 'past', 'questions', 'pronouns'],
  A2: ['posscases', 'postpositions', 'pronouns', 'continuous', 'future', 'want', 'imperative', 'can'],
  B1: ['perfect', 'habitual', 'conditional', 'cases', 'present', 'past'],
};

export interface TestItem {
  level: Level;
  q: Question;
  options: string[];
}

function settingsFor(level: Level) {
  const s = defaults();
  s.cases = { cases: ['gen', 'dat', 'acc', 'loc', 'abl', 'ins'], number: level === 'B1' ? 'pl' : 'sg' };
  s.present = { persons: [...PERSONS], polarity: level === 'B1' ? 'neg' : 'pos' };
  s.past = { persons: [...PERSONS], polarity: level === 'B1' ? 'neg' : 'pos' };
  s.possessive.persons = [...POSS_PERSONS];
  s.can.polarity = 'both';
  return s;
}

/** Options: the answer and other forms of the same word that differ from it (3 wrong at A1–A2, 4 at B1). */
function optionsFor(q: Question, level: Level, rng: Rng): string[] | undefined {
  const wrongCount = level === 'B1' ? 4 : 3;
  const accepted = new Set([q.answer, ...(q.accept ?? [])].map((x) => x.toLowerCase()));
  const pool = q.choices ? q.choices.filter((c) => !accepted.has(c.toLowerCase())) : [...new Set((q.others ?? []).map((o) => o.form))].filter((f) => !accepted.has(f.toLowerCase()));
  if (pool.length < wrongCount) return undefined;
  return shuffle(rng, [q.answer, ...shuffle(rng, pool).slice(0, wrongCount)]);
}

export function buildTest(rng: Rng): TestItem[] {
  const items: TestItem[] = [];
  for (const level of TEST_LEVELS) {
    const s = settingsFor(level);
    const perTopic = new Map<Mode, number>();
    const candidates = shuffle(
      rng,
      TEST_TOPICS[level].flatMap((m) => pool(m, { ...s, mode: m }, rng)),
    );
    // Spread the topics: take round-robin by topic until 12.
    const byTopic = new Map<Mode, Question[]>();
    for (const q of candidates) (byTopic.get(q.mode) ?? byTopic.set(q.mode, []).get(q.mode)!).push(q);
    const topics = shuffle(rng, [...byTopic.keys()]);
    let added = 0;
    for (let round = 0; added < PER_LEVEL && round < 4; round++)
      for (const m of topics) {
        if (added >= PER_LEVEL) break;
        if ((perTopic.get(m) ?? 0) >= 2) continue;
        const list = byTopic.get(m)!;
        while (list.length) {
          const q = list.shift()!;
          const options = optionsFor(q, level, rng);
          if (!options) continue;
          items.push({ level, q, options });
          perTopic.set(m, (perTopic.get(m) ?? 0) + 1);
          added++;
          break;
        }
      }
  }
  return items;
}

export interface TestResult {
  byLevel: Record<Level, { right: number; total: number }>;
  /** The highest level reached, or undefined below A1. */
  level?: Level;
}

export function scoreTest(items: TestItem[], answers: (string | undefined)[]): TestResult {
  const byLevel = Object.fromEntries(TEST_LEVELS.map((l) => [l, { right: 0, total: 0 }])) as TestResult['byLevel'];
  items.forEach((it, i) => {
    byLevel[it.level].total++;
    if (answers[i] === it.q.answer) byLevel[it.level].right++;
  });
  let level: Level | undefined;
  for (const [i, l] of TEST_LEVELS.entries()) {
    const lower = TEST_LEVELS.slice(0, i);
    if (byLevel[l].right >= 9 && lower.every((x) => byLevel[x].right >= 8)) level = l;
  }
  return { byLevel, level };
}

/** What a wrong option was (“the dative”), from the question's other forms. */
export function optionLabel(q: Question, option: string): string | undefined {
  return q.others?.find((o) => o.form === option)?.label;
}

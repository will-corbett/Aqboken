/**
 * Learning paths: for each level, a recommended order of steps (a Learn page and its drill, a vocabulary theme, a
 * listening drill), each with a line on why. A guide, not a gate. With progress on, a topic step is ticked once its
 * drill has been played and a theme once half its words are in my words. Checked by tests/unit/paths.test.ts.
 */
import type { MyWords } from './mywords.ts';
import type { Progress } from './progress.ts';
import { themeById } from '../data/words.ts';
import type { Mode } from './topics.ts';

export type Level = 'A1' | 'A2' | 'B1';
export const LEVELS: Level[] = ['A1', 'A2', 'B1'];

export type Step = { kind: 'topic'; id: Mode; why: string } | { kind: 'theme'; id: string; why: string };

export interface Path {
  level: Level;
  title: string;
  intro: string;
  steps: Step[];
}

const t = (id: Mode, why: string): Step => ({ kind: 'topic', id, why });
const w = (id: string, why: string): Step => ({ kind: 'theme', id, why });

export const PATHS: Path[] = [
  {
    level: 'A1',
    title: 'A1: first steps',
    intro: 'Reading Kazakh, the rules every ending follows, and the words and sentences for introducing yourself, your family and your day.',
    steps: [
      t('alphabet', 'Learn to read the letters first: everything else is written in them.'),
      w('basics', 'Hello, thank you, yes and no.'),
      t('harmony', 'The one rule behind every ending in the language.'),
      w('pronouns', 'I, you, he and she, and the question words.'),
      t('plural', 'Your first ending, and harmony at work.'),
      t('copula', '“I am a teacher”: introduce yourself.'),
      w('people', 'Words to introduce yourself with.'),
      w('family', 'Kazakh has a word for every kind of brother and sister.'),
      t('possessive', 'My mother, your house.'),
      t('cases', 'To, in, from, with: the seven cases.'),
      w('home', 'Rooms and things around you.'),
      w('city', 'Places to go, with the dative: мектепке.'),
      t('present', 'Your first verb tense: барамын, оқимын.'),
      w('verbs', 'The verbs you need most.'),
      t('past', 'What you did: бардым, көрдім.'),
      t('questions', 'Ask yes/no questions with ма.'),
      t('numbers', 'Count, shop and give your age.'),
      w('time', 'Days of the week, today and tomorrow.'),
      w('months', 'The months, for dates.'),
      t('time', 'Tell the time and give a date.'),
      w('food', 'Bread, tea, and Kazakh favourites.'),
      w('describing', 'Big and small, hot and cold, colours.'),
      t('listen', 'Hear the words you’ve learned.'),
      t('build', 'Put real sentences in order: see how Kazakh builds them.'),
    ],
  },
  {
    level: 'A2',
    title: 'A2: everyday Kazakh',
    intro: 'More tenses (right now, going to, can, want), polite requests, and the words for shopping, travel, health and free time.',
    steps: [
      t('pronouns', 'маған, саған, оған: forms to learn by heart.'),
      t('posscases', 'In my house, to your friend: endings in a chain.'),
      t('postpositions', 'Before, after, for, with: and the case each needs.'),
      t('continuous', 'What’s happening right now.'),
      w('travel', 'Buses, trains and tickets.'),
      t('imperative', 'Ask politely, suggest, tell.'),
      t('want', '“I want to …”.'),
      t('can', '“I can …”, “I can’t …”.'),
      w('shopping', 'Prices and paying.'),
      w('clothes', 'What to wear.'),
      t('future', 'Plans: what you’re going to do.'),
      w('freetime', 'Sport, music, films.'),
      w('nature', 'The steppe, mountains and animals.'),
      w('seasons', 'Seasons and weather.'),
      t('comparative', 'Bigger, better, the best.'),
      w('body', 'Head, hands, heart.'),
      w('health', 'At the doctor’s.'),
      w('table', 'At the table: dishes and manners.'),
      w('school', 'Study and work.'),
      w('verbs2', 'Forty more everyday verbs.'),
      t('perfect', '“I have been to …”: experience.'),
      t('fix', 'Spot a verb that doesn’t agree with its subject.'),
      t('translate', 'Translate real sentences, then compare.'),
      t('mixed', 'Mix the topics you’ve learned, as in real use.'),
      t('vocab', 'Review your words.'),
    ],
  },
  {
    level: 'B1',
    title: 'B1: going further',
    intro: 'Talking about the past and possibilities, your feelings and your work.',
    steps: [
      t('habitual', 'What you used to do.'),
      t('conditional', '“If …”.'),
      w('feelings', 'How you feel, what people are like.'),
      w('work', 'Jobs, meetings, salaries.'),
      w('travel2', 'Passports, directions, abroad.'),
      t('listen', 'Write down what you hear (choose “Write what you hear”).'),
      t('vocab', 'Keep your words fresh: review the ones that are due.'),
    ],
  },
];

/** Is a step done? Only with progress on: a topic once drilled, a theme once half its words are in my words. */
export function stepDone(step: Step, progress: Progress, words: MyWords): boolean {
  if (step.kind === 'topic') return !!progress[step.id];
  const th = themeById(step.id);
  if (!th) return false;
  return th.words.filter((x) => words[x.kk]).length * 2 >= th.words.length;
}

/** The first step on a path not done yet. */
export function nextStep(level: Level, progress: Progress, words: MyWords): Step | undefined {
  return PATHS.find((p) => p.level === level)?.steps.find((s) => !stepDone(s, progress, words));
}

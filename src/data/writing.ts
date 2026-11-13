/**
 * Writing tasks: three per level, each with a brief, a checklist of the grammar to use (linked to its Learn page) and
 * the vocabulary themes that help. Nothing typed is stored, and there are no model answers until a native speaker
 * can review them. Tests check every link exists.
 */
import type { Mode } from '../lib/topics.ts';

export interface WritingTask {
  id: string;
  level: 'A1' | 'A2' | 'B1';
  title: string;
  brief: string;
  words: string;
  checklist: { text: string; topic?: Mode }[];
  themes: string[];
}

export const WRITING: WritingTask[] = [
  {
    id: 'about-me',
    level: 'A1',
    title: 'About me',
    brief: 'Introduce yourself: your name, where you’re from, what you do, and where you live.',
    words: '4–6 sentences',
    checklist: [
      { text: 'Your name with the possessive: Менің атым …', topic: 'possessive' },
      { text: 'What you are, with the “I am” ending: Мен студентпін.', topic: 'copula' },
      { text: 'Where you live, with the locative and the present: … -да тұрамын.', topic: 'cases' },
      { text: 'Every ending agrees with its word’s last vowel.', topic: 'harmony' },
    ],
    themes: ['basics', 'people'],
  },
  {
    id: 'my-family',
    level: 'A1',
    title: 'My family',
    brief: 'Write about your family: who is in it, their names, ages and jobs.',
    words: '5–8 sentences',
    checklist: [
      { text: '“My mother, my brother”: possessives on every family word.', topic: 'possessive' },
      { text: '“I have a brother” is “my brother there is”: Менің ағам бар.', topic: 'possessive' },
      { text: 'Ages and how many: numbers, with the noun in the singular (екі аға).', topic: 'numbers' },
      { text: 'Jobs with “he/she is”: Әкем дәрігер.', topic: 'copula' },
    ],
    themes: ['family', 'people'],
  },
  {
    id: 'my-day',
    level: 'A1',
    title: 'My day',
    brief: 'Describe an ordinary day, from getting up to going to bed.',
    words: '6–8 sentences',
    checklist: [
      { text: 'The present tense for what you usually do: тұрамын, барамын, ішемін.', topic: 'present' },
      { text: 'Times with “at”: сағат жетіде.', topic: 'time' },
      { text: 'Where you go, with the dative: жұмысқа, мектепке.', topic: 'cases' },
      { text: 'The verb at the end of each sentence.' },
    ],
    themes: ['verbs', 'time', 'food'],
  },
  {
    id: 'a-trip',
    level: 'A2',
    title: 'A trip',
    brief: 'Write about a journey you made: where you went, how, with whom, and what you did there.',
    words: '6–10 sentences',
    checklist: [
      { text: 'The past tense: бардым, көрдік.', topic: 'past' },
      { text: 'From and to: the ablative and the dative (Алматыдан Астанаға).', topic: 'cases' },
      { text: 'How you travelled, with the instrumental: пойызбен, ұшақпен.', topic: 'cases' },
      { text: '“With my friend”: possessive + case (досыммен).', topic: 'posscases' },
    ],
    themes: ['travel', 'city', 'seasons'],
  },
  {
    id: 'weekend-plans',
    level: 'A2',
    title: 'Weekend plans',
    brief: 'What are you going to do this weekend? What would you like to do, and what can’t you do?',
    words: '6–8 sentences',
    checklist: [
      { text: 'Plans with -мақ: бармақпын, көрмекпін.', topic: 'future' },
      { text: '“I want to …”: барғым келеді.', topic: 'want' },
      { text: '“I can / can’t …”: бара аламын, бара алмаймын.', topic: 'can' },
      { text: 'Days of the week and times.', topic: 'time' },
    ],
    themes: ['freetime', 'time'],
  },
  {
    id: 'invitation',
    level: 'A2',
    title: 'An invitation',
    brief: 'Write a short note inviting a friend (or someone older, politely) to a meal or an outing.',
    words: '4–6 sentences',
    checklist: [
      { text: 'Polite requests: келіңіз, отырыңыз.', topic: 'imperative' },
      { text: 'When: the date and time (он бесінші мамыр, сағат алтыда).', topic: 'time' },
      { text: 'Before or after something: -дан кейін, -ға дейін.', topic: 'postpositions' },
      { text: 'A question with ма: Келесіз бе?', topic: 'questions' },
    ],
    themes: ['table', 'freetime', 'months'],
  },
  {
    id: 'childhood',
    level: 'B1',
    title: 'When I was a child',
    brief: 'Describe where you grew up and what you used to do. What have you done since that you never did then?',
    words: '8–12 sentences',
    checklist: [
      { text: 'What you used to do: баратынмын, ойнайтынбыз.', topic: 'habitual' },
      { text: 'Experience: “I have been, I have done”: барғанмын.', topic: 'perfect' },
      { text: 'Comparisons with then: үлкенірек, -дан гөрі.', topic: 'comparative' },
    ],
    themes: ['family', 'nature', 'freetime'],
  },
  {
    id: 'free-year',
    level: 'B1',
    title: 'A year off',
    brief: 'If you had a whole year free, what would you do, and where would you go?',
    words: '8–12 sentences',
    checklist: [
      { text: '“If …”: the -са conditional (уақытым болса, …).', topic: 'conditional' },
      { text: 'Wishes: -ғым келеді.', topic: 'want' },
      { text: 'Plans: -мақ, and the present for the future.', topic: 'future' },
    ],
    themes: ['travel2', 'work', 'feelings'],
  },
  {
    id: 'retell',
    level: 'B1',
    title: 'Retell a story',
    brief: 'Choose one of the Reading stories and tell it in your own words, then say what you think of its moral.',
    words: '8–12 sentences',
    checklist: [
      { text: 'The storyteller’s past: -ыпты (барыпты, депті), or the plain past.', topic: 'past' },
      { text: 'Linking actions with the -ып form: көріп, алып, кетті.', topic: 'continuous' },
      { text: 'Your opinion: Менің ойымша, …' },
    ],
    themes: ['feelings'],
  },
];

/** The one list of topics (Home, Learn index and Drill page all use it). Within a group: most basic first. */
export type Mode = 'alphabet' | 'harmony' | 'plural' | 'copula' | 'possessive' | 'cases' | 'pronouns' | 'present' | 'past' | 'questions' | 'numbers' | 'vocab' | 'listen' | 'continuous' | 'future' | 'want' | 'imperative' | 'posscases' | 'postpositions';

export interface Topic {
  id: Mode;
  title: string;
  /** The Kazakh name of the topic. */
  kk: string;
  group: string;
  level: string;
  blurb: string;
  /** Has a Learn page. */
  learn: boolean;
}

export const TOPICS: Topic[] = [
  { id: 'alphabet', title: 'The alphabet', kk: 'Әліпби', group: 'Getting started', level: 'A1', blurb: 'The 42 Cyrillic letters, the 9 that are special to Kazakh, and the new Latin alphabet.', learn: true },
  { id: 'harmony', title: 'Vowel harmony', kk: 'Үндестік заңы', group: 'Getting started', level: 'A1', blurb: 'Why endings come in pairs (-лар/-лер): back and front vowels.', learn: true },
  { id: 'plural', title: 'Plurals', kk: 'Көпше түр', group: 'Nouns', level: 'A1', blurb: 'One ending, six shapes: -лар/-лер, -дар/-дер, -тар/-тер.', learn: true },
  { id: 'copula', title: '“I am …”', kk: 'Жіктік жалғау', group: 'Nouns', level: 'A1', blurb: 'Personal endings on nouns: Мен мұғаліммін, Сен студентсің.', learn: true },
  { id: 'possessive', title: 'My, your, his', kk: 'Тәуелдік жалғау', group: 'Nouns', level: 'A1', blurb: 'Possessive endings: кітабым, кітабың, кітабы.', learn: true },
  { id: 'cases', title: 'The seven cases', kk: 'Септіктер', group: 'Nouns', level: 'A1–A2', blurb: 'to, in, from, with, of: endings instead of prepositions.', learn: true },
  { id: 'posscases', title: 'In my house, to your friend', kk: 'Тәуелдік пен септік', group: 'Nouns', level: 'A2', blurb: 'A possessive, then a case: кітабымда, досыңа, үйімізден.', learn: true },
  { id: 'postpositions', title: 'Postpositions', kk: 'Септеулік шылаулар', group: 'Nouns', level: 'A2', blurb: 'үшін, дейін, кейін, бірге: words after the noun, each wanting its own case.', learn: true },
  { id: 'pronouns', title: 'Pronouns in the cases', kk: 'Жіктеу есімдіктері', group: 'Nouns', level: 'A1–A2', blurb: 'маған, саған, оған: the forms of мен, сен, ол that need learning by heart.', learn: true },
  { id: 'present', title: 'Present tense', kk: 'Ауыспалы осы шақ', group: 'Verbs', level: 'A1', blurb: 'барамын, келеді, оқимын, and the negative бармаймын.', learn: true },
  { id: 'past', title: 'Past tense', kk: 'Жедел өткен шақ', group: 'Verbs', level: 'A1', blurb: 'бардым, келдік, айтты, and the negative бармадым.', learn: true },
  { id: 'continuous', title: 'Right now', kk: 'Нақ осы шақ', group: 'Verbs', level: 'A1–A2', blurb: 'Мен кітап оқып жатырмын: what’s happening at this moment.', learn: true },
  { id: 'future', title: 'Going to', kk: 'Мақсатты келер шақ', group: 'Verbs', level: 'A2', blurb: 'Plans and intentions: бармақпын, оқымақпыз.', learn: true },
  { id: 'want', title: 'Want to', kk: 'Қалау рай', group: 'Verbs', level: 'A2', blurb: 'барғым келеді: “I want to go”, built with a possessive.', learn: true },
  { id: 'imperative', title: 'Requests and commands', kk: 'Бұйрық рай', group: 'Verbs', level: 'A2', blurb: 'бар! барыңыз! барайық! — telling, asking and suggesting.', learn: true },
  { id: 'questions', title: 'Yes/no questions', kk: 'Сұраулық шылау', group: 'Sentences', level: 'A1', blurb: 'The particle ма/ме/ба/бе/па/пе: Бұл кітап па?', learn: true },
  { id: 'numbers', title: 'Numbers', kk: 'Сан есім', group: 'Numbers', level: 'A1', blurb: 'From бір to мың, and years: екі мың жиырма алты.', learn: true },
  { id: 'listen', title: 'Listening', kk: 'Тыңдалым', group: 'Listening', level: 'A1–A2', blurb: 'Hear a word, then choose its meaning or write it down.', learn: false },
  { id: 'vocab', title: 'Vocabulary', kk: 'Сөздік', group: 'Words', level: 'A1–A2', blurb: 'The words of the Vocabulary themes, both ways round.', learn: false },
];

export const GROUPS = [...new Set(TOPICS.map((t) => t.group))];
export const topicById = (id: string) => TOPICS.find((t) => t.id === id);
export const isMode = (id: string): id is Mode => TOPICS.some((t) => t.id === id);

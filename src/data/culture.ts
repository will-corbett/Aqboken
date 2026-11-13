/**
 * Culture links: hand-checked, each the creator's or rights holder's own site or channel (no re-uploads), nothing
 * whose main theme is politics or news, links only (no embeds, so no third-party requests or cookies), descriptions
 * in our own words. `checked`: the date a person last opened it and looked at what it actually publishes.
 * `npm run links:check` checks every link still answers.
 */
export type CultureType = 'course' | 'dictionary' | 'podcast' | 'video' | 'books' | 'reading';

export interface CultureLink {
  title: string;
  url: string;
  type: CultureType;
  level: string;
  topic: string;
  about: string;
  /** Anything a reader should know first: sign-up, payment, language of the interface. */
  note?: string;
  checked: string;
}

export const TYPE_NAME: Record<CultureType, string> = {
  course: 'Courses',
  dictionary: 'Dictionaries',
  podcast: 'Podcasts',
  video: 'Video',
  books: 'Books',
  reading: 'Reading',
};

/** A suggested activity for each kind of resource (our own). */
export const TYPE_ACTIVITY: Record<CultureType, string> = {
  course: 'Use a second course alongside Aqböken for more listening and conversation; do a lesson, then drill its grammar here.',
  dictionary: 'Look up words you meet, and add the useful ones to a theme you’re learning.',
  podcast: 'Listen once for the gist, then again and write down five words you caught.',
  video: 'Watch with the sound on and pause after each scene: say one sentence about what happened.',
  books: 'Start with children’s books: short sentences and pictures help, and you’ll meet the same endings again and again.',
  reading: 'Read a short article on a subject you know well; underline every word ending you recognise.',
};

export const CULTURE: CultureLink[] = [
  {
    title: 'Soyle.kz',
    url: 'https://soyle.kz/',
    type: 'course',
    level: 'A1–C2',
    topic: 'language',
    about: 'A full online Kazakh course from A1 up, with lessons, exercises, flashcards, audio and video, from the Qazaq Language Development Fund.',
    note: 'Free, but you register to start. Interface in Russian, English or Turkish; explanations mostly via Russian.',
    checked: '2026-11-13',
  },
  {
    title: 'Tilqural',
    url: 'https://tilqural.kz/',
    type: 'course',
    level: 'A1–C1',
    topic: 'language',
    about: 'An interactive self-study course with lessons, texts, videos, phrases and a dictionary, and a mobile app.',
    note: 'Free; an account keeps your progress. Interface in Kazakh, Russian or English.',
    checked: '2026-11-13',
  },
  {
    title: '50LANGUAGES: Kazakh for English speakers',
    url: 'https://www.goethe-verlag.com/book2/EN/ENKK/ENKK002.HTM',
    type: 'course',
    level: 'A1–A2',
    topic: 'phrases',
    about: '100 short phrasebook lessons, English to Kazakh, each with audio you can download.',
    note: 'Free.',
    checked: '2026-11-13',
  },
  {
    title: 'Sozdik.kz',
    url: 'https://sozdik.kz/',
    type: 'dictionary',
    level: 'all levels',
    topic: 'language',
    about: 'A large Kazakh–Russian and Russian–Kazakh dictionary, with Latin-script spellings.',
    note: 'Russian ↔ Kazakh only (no English).',
    checked: '2026-11-13',
  },
  {
    title: 'Kazakh language with Zhannur',
    url: 'https://podcasts.apple.com/us/podcast/kazakh-language-with-zhannur/id1739766670',
    type: 'podcast',
    level: 'A2–B2',
    topic: 'everyday life',
    about: 'A weekly podcast in Kazakh in two speeds: slow and clear for beginners, natural speed for upper-intermediate learners.',
    note: 'Free; also on other podcast apps.',
    checked: '2026-11-13',
  },
  {
    title: 'Balapan TV',
    url: 'https://www.youtube.com/BalapanTV',
    type: 'video',
    level: 'A1–A2',
    topic: 'children',
    about: 'The national children’s channel: cartoons and programmes for young children, all in Kazakh, including alphabet and counting shows.',
    note: 'YouTube. Made for children under 8: simple language, lots of repetition.',
    checked: '2026-11-13',
  },
  {
    title: 'Kazakhfilm',
    url: 'https://www.youtube.com/@kazakhfilmkz',
    type: 'video',
    level: 'B1+',
    topic: 'film',
    about: 'The official channel of the Kazakhfilm studio (founded 1934): classic Kazakh films and new animated shorts.',
    note: 'YouTube. Many older films are in Russian; the animation is in Kazakh.',
    checked: '2026-11-13',
  },
  {
    title: 'Kitap.kz',
    url: 'https://kitap.kz/',
    type: 'books',
    level: 'A2+',
    topic: 'books',
    about: 'An online library of Kazakh books and audiobooks, including children’s books.',
    note: 'Many books are free (marked тегін); others are paid. You sign in to read.',
    checked: '2026-11-13',
  },
  {
    title: 'Kazakh Wikipedia',
    url: 'https://kk.wikipedia.org/',
    type: 'reading',
    level: 'B1+',
    topic: 'encyclopedia',
    about: 'Wikipedia in Kazakh: read about places and subjects you already know.',
    note: 'Free.',
    checked: '2026-11-13',
  },
  {
    title: 'Tatoeba: Kazakh sentences',
    url: 'https://tatoeba.org/en/sentences/show_all_in/kaz/none',
    type: 'reading',
    level: 'A1–B1',
    topic: 'sentences',
    about: 'Thousands of short Kazakh sentences written by volunteers, many with translations: where our example sentences come from.',
    note: 'Free. Volunteers’ sentences vary in quality.',
    checked: '2026-11-13',
  },
];

/**
 * Reading texts: short stories by Ybyrai Altynsarin (1841–1889) from his Kazakh reader of 1879, public domain,
 * transcribed on Wikisource (multilingual wikisource.org; transcription CC BY-SA 4.0). Each is fetched at a pinned
 * revision (`npm run data:fetch-reading`) and published only when every word is explained (`npm run data:reading`,
 * scripts/build-reading.ts → src/data/reading/<id>.json). The text is never changed, except for the clear
 * transcription slips listed in `corrections`, which the page shows.
 *
 * Questions are in English (no Kazakh of ours until a native speaker reviews it). Kinds: gist, detail, inference
 * (reading between the lines).
 */
export interface ReadingQuestion {
  q: string;
  options: string[];
  /** Index of the right option. */
  answer: number;
  kind: 'gist' | 'detail' | 'inference';
  why: string;
}

export interface ReadingText {
  id: string;
  title: string;
  en: string;
  level: 'A2' | 'B1' | 'B2';
  /** The Wikisource page and the revision we use. */
  source: string;
  revid: number;
  blurb: string;
  corrections: { from: string; to: string; why: string }[];
  /** Glosses for this text only (a word whose sense here differs from the usual). */
  glosses?: Record<string, { lemma: string; en: string; form?: string }>;
  questions: ReadingQuestion[];
}

export const AUTHOR = 'Ybyrai Altynsarin (Ыбырай Алтынсарин, 1841–1889), teacher and writer, from his Kazakh reader (1879)';

export const TEXTS: ReadingText[] = [
  {
    id: 'sauysqan',
    title: 'Сауысқан мен қарға',
    en: 'The magpie and the crow',
    level: 'B1',
    source: 'Сауысқан мен қарға',
    revid: 387235,
    blurb: 'A chattering magpie asks a silent crow why it says nothing. A fable about talk and truth.',
    glosses: { ала: { lemma: 'ала', en: 'pied, black-and-white (ала сауысқан: the magpie)', form: 'adjective' } },
    corrections: [
      { from: 'кұзғын', to: 'құзғын', why: 'typed with к for қ' },
      { from: 'үндемейсін', to: 'үндемейсің', why: 'typed with н for ң (“you are silent”)' },
    ],
    questions: [
      { q: 'What is the magpie doing at the start?', options: ['Sitting quietly', 'Hopping from branch to branch and chattering', 'Looking for food', 'Building a nest'], answer: 1, kind: 'detail', why: 'бір бұтақтан бір бұтаққа шығып, тынбай шиқылдай беріпті: going from branch to branch, chattering without a stop.' },
      { q: 'Why doesn’t the crow believe the magpie?', options: ['The magpie has lied to it before', 'Someone who talks too much makes true words fewer', 'The magpie speaks too quietly', 'It doesn’t understand the magpie'], answer: 1, kind: 'gist', why: 'көп сөйлеген мылжың шын сөзді азайтады: a chatterbox who talks a lot makes true words scarce.' },
      { q: 'What does the story suggest about the crow?', options: ['It is rude', 'Its silence is a kind of wisdom', 'It is shy', 'It is jealous of the magpie'], answer: 1, kind: 'inference', why: 'The crow stays silent and answers thoughtfully: the fable sets its silence against the magpie’s empty chatter.' },
    ],
  },
  {
    id: 'qarga-qurt',
    title: 'Қарға мен құрт',
    en: 'The crow and the worm',
    level: 'A2',
    source: 'Қарға мен құрт',
    revid: 1067795,
    blurb: 'A crow catches a worm; the worm talks its way out.',
    corrections: [{ from: 'жаксы', to: 'жақсы', why: 'typed with к for қ' }],
    glosses: {
      құрт: { lemma: 'құрт', en: 'worm, grub', form: 'dictionary form' },
      құртты: { lemma: 'құрт', en: 'worm, grub', form: 'accusative (the …)' },
    },
    questions: [
      { q: 'How does the worm escape?', options: ['It bites the crow', 'It flatters the crow until it opens its beak', 'Another bird helps it', 'It hides in the grass'], answer: 1, kind: 'gist', why: 'The worm praises the crow’s family; when the pleased crow says “аһ!”, its beak opens and the worm falls.' },
      { q: 'What does the worm say about the crow’s parents?', options: ['They were very good birds', 'They were cruel', 'It never met them', 'They lived far away'], answer: 0, kind: 'detail', why: 'асқан жақсы құстар еді: they were very fine birds.' },
      { q: 'What is the story really about?', options: ['How worms live', 'Vanity makes you careless', 'Crows are clever', 'Families should stay together'], answer: 1, kind: 'inference', why: 'The crow loses its catch because flattery pleases it (масаттанып, swelling with pride).' },
    ],
  },
  {
    id: 'asyl-shop',
    title: 'Асыл шөп',
    en: 'The precious herb',
    level: 'B1',
    source: 'Асыл шөп',
    revid: 993051,
    blurb: 'Two girls carry heavy boxes of fruit to town. One complains; the other laughs. What is her secret?',
    corrections: [],
    glosses: {
      ай: { lemma: 'ай', en: 'oh! (an exclamation)', form: 'exclamation' },
      ауырды: { lemma: 'ауыр', en: 'heavy: the heaviness, the load', form: 'accusative' },
    },
    questions: [
      { q: 'What are the two girls carrying?', options: ['Water', 'A box of fruit each, on their heads', 'Firewood', 'Their little brothers'], answer: 1, kind: 'detail', why: 'төбесіне бір-бір жәшік жеміс көтеріп: each with a box of fruit on her head.' },
      { q: 'What is the “herb” that makes Bätima’s load lighter?', options: ['Mint', 'Patience', 'Laughter', 'Sugar'], answer: 1, kind: 'gist', why: 'Оның аты – «сабыр»: its name is “patience”.' },
      { q: 'Why does Bätima say she is afraid the herb won’t come to Zylikha’s hand?', options: ['The herb is expensive', 'Patience can’t be given, and Zylikha may not have it', 'She wants to keep it secret', 'The herb grows far away'], answer: 1, kind: 'inference', why: 'The “herb” is patience, which nobody can hand over; Bätima gently suggests Zylikha lacks it.' },
    ],
  },
  {
    id: 'tulki-eshki',
    title: 'Түлкі мен ешкі',
    en: 'The fox and the goat',
    level: 'B1',
    source: 'Түлкі мен ешкі',
    revid: 1115158,
    blurb: 'A fox falls into a pit. A thirsty goat comes by…',
    corrections: [],
    questions: [
      { q: 'Why is the fox in the pit?', options: ['It went down to drink', 'It fell in by accident while running', 'The goat pushed it', 'It was hiding'], answer: 1, kind: 'detail', why: 'жүгіріп келе жатып, абайсызда … апанға түсіп кетіпті: running along, it fell in by accident.' },
      { q: 'How does the fox get out?', options: ['It climbs on the goat and jumps from its horns', 'It digs a tunnel', 'The goat pulls it out with a rope', 'It waits for rain'], answer: 0, kind: 'gist', why: 'ешкінің үстіне мініп, онан мүйізіне табан тірепті де, ырғып далаға шығып: it climbed on the goat, pushed off its horns and jumped out.' },
      { q: 'What is the saying at the end about?', options: ['Don’t trust lies, or you’ll land in trouble', 'Always help a friend', 'Goats are foolish', 'Drink water when it’s hot'], answer: 0, kind: 'inference', why: '«Өтірікке алданба, басың бәлеге душар болар»: don’t be fooled by a lie, or your head will meet trouble.' },
    ],
  },
  {
    id: 'meyirimdi-bala',
    title: 'Мейірімді бала',
    en: 'The kind child',
    level: 'B2',
    source: 'Мейірімді бала',
    revid: 1032070,
    blurb: 'An old law says a cheat loses a hand. A nobleman’s daughter goes to the king.',
    corrections: [],
    questions: [
      { q: 'What is the old law?', options: ['A cheat must pay a fine', 'A person found guilty of cheating has a hand cut off', 'Children must obey their parents', 'Nobles cannot be punished'], answer: 1, kind: 'detail', why: 'біреуді алдағандығы мойнына түскен кісінің қолын кесе-тұғын: they would cut off the hand of someone found to have cheated.' },
      { q: 'What does the daughter offer?', options: ['Money', 'Her own hand instead of her father’s', 'To leave the country', 'To work for the king'], answer: 1, kind: 'gist', why: 'осы нашар қолын кесіп … асырайтын қолын атама қалдыруға: cut this weak hand and leave my father the hand that feeds the family.' },
      { q: 'Why does the king forgive the father?', options: ['He finds the father innocent', 'He is moved by the daughter’s love for her father', 'The law is changed', 'The daughter pays for him'], answer: 1, kind: 'inference', why: 'баланың мұнша атасына мейірімділігіне рақымы келіп: moved to mercy by the child’s great love for her father.' },
    ],
  },
  {
    id: 'ormekshi',
    title: 'Өрмекші, құмырсқа, қарлығаш',
    en: 'The spider, the ant and the swallow',
    level: 'B1',
    source: 'Өрмекші, құмырсқа, қарлығаш',
    revid: 953772,
    blurb: 'A father and his ten-year-old son watch three small creatures at work.',
    corrections: [{ from: 'усағын', to: 'ұсағын', why: 'typed with у for ұ (as ұсағы earlier in the story)' }],
    glosses: {
      қара: { lemma: 'қарау', en: 'to look', form: 'command, you (look!)' },
      кесе: { lemma: 'кесе', en: 'across, crosswise (кесе тістеген: held crosswise in its beak)', form: 'adverb' },
    },
    questions: [
      { q: 'What is the ant carrying?', options: ['A leaf', 'A crumb of bread', 'A dead fly', 'A seed'], answer: 1, kind: 'detail', why: 'аузында бір нанның ұсағы бар: it has a crumb of bread in its mouth.' },
      { q: 'What is the swallow doing?', options: ['Catching flies', 'Collecting grass for a nest', 'Singing', 'Resting'], answer: 1, kind: 'detail', why: 'балапандарына ұя істеуге шөп жиып жүр: gathering grass to make a nest for its chicks.' },
      { q: 'Why does the father show his son these three creatures?', options: ['To teach him the names of insects', 'So the boy learns from their hard work', 'Because he is bored on the walk', 'To warn him about spiders'], answer: 1, kind: 'inference', why: 'ол кішкентай жәндіктер саған әбірет: these little creatures are an example for you.' },
      { q: 'What lesson does the father draw?', options: ['Small creatures are dangerous', 'No creature is idle, so you too should get used to work', 'Watch nature carefully', 'Feed the birds'], answer: 1, kind: 'gist', why: 'Жұмыссыз жүрген бір жан жоқ … жұмыс істеуге әдеттену керек: no creature goes without work … you must get used to working.' },
    ],
  },
  {
    id: 'baqsha',
    title: 'Бақша ағаштары',
    en: 'The garden trees',
    level: 'B1',
    source: 'Бақша ағаштары',
    revid: 387169,
    blurb: 'Why does one tree grow straight and another crooked? A father explains.',
    corrections: [],
    glosses: { ана: { lemma: 'ана', en: 'that (one over there)', form: 'pronoun' } },
    questions: [
      { q: 'Why did one tree grow straight?', options: ['It got more sun', 'It was tended: its crooked branches were cut', 'It is a different kind of tree', 'It is younger'], answer: 1, kind: 'gist', why: 'қисық бұтақтары болса, кесіп, бағу-қағумен өсірген: its crooked branches were cut and it was grown with care.' },
      { q: 'What does the father compare his son to?', options: ['A flower', 'A young tree', 'A gardener', 'A branch'], answer: 1, kind: 'detail', why: 'Сен, жас ағашсың: you are a young tree.' },
      { q: 'What does the father mean?', options: ['Trees need water', 'A child grows up well if he accepts correction', 'Gardens are good for children', 'Crooked trees should be cut down'], answer: 1, kind: 'inference', why: 'If the son listens and mends his ways he will grow up straight; left to himself, crooked like the tree.' },
    ],
  },
  {
    id: 'satemir',
    title: 'Сәтемір хан',
    en: 'Sätemir Khan',
    level: 'B2',
    source: 'Сәтемір хан',
    revid: 393303,
    blurb: 'An orphan boy watches a lame ant climb a wall, and changes his life.',
    corrections: [],
    questions: [
      { q: 'How many times does the ant fall before it reaches the top?', options: ['Once', 'Twice', 'Three times', 'It never falls'], answer: 1, kind: 'detail', why: 'It falls halfway, then again higher up; the third time (үшінші рет) it gets to the top.' },
      { q: 'What does Sätemir decide after watching the ant?', options: ['To keep playing', 'To stop idling and go to town to learn', 'To become a farmer', 'To catch the ant'], answer: 1, kind: 'gist', why: 'ойын тастап, қалаға барады: he gives up play and goes to town.' },
      { q: 'What links the ant’s climb to Sätemir’s life?', options: ['Both fall and give up', 'Like the lame ant that kept climbing, his effort takes him to the top', 'The ant shows him the way to town', 'Nothing: it is just a scene'], answer: 1, kind: 'inference', why: 'The lame ant falls twice and still reaches the top; Sätemir works and studies and becomes a great, wise ruler.' },
      { q: 'How does he pay for his lessons?', options: ['With money from his father', 'By sweeping the scholar’s house', 'By selling ants', 'The scholar teaches him for free'], answer: 1, kind: 'detail', why: 'соған үй сыпыруға жалданып, ақысына оқу оқыпты: he was hired to sweep the house and studied in return.' },
    ],
  },
];

export const textById = (id: string) => TEXTS.find((t) => t.id === id);

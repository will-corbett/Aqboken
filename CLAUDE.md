# Aqböken — Kazakh learning site

Static, no-login app (Svelte 5 + Vite + TypeScript strict), the Kazakh sibling of ../Krotik (Russian): same stack,
layout and conventions, much smaller so far. No backend, no analytics. Settings in localStorage `aqboken.settings.v1`;
progress is **opt-in** (`settings.progress`, off by default): per drill only rounds, last score and date
(`aqboken.progress.v1`), and “my words” (`src/lib/mywords.ts`, `aqboken.words.v1`: per word only its Leitner box and the
dates added and due; right first time → next box, 1/3/7/14/30/60 days; wrong → box 0, tomorrow). Words answered in
vocabulary and listening drills are scheduled; themes have “Add all to my words”; the vocabulary drill can take “My
words that are due”; `/progress/` lists both. All deleted when progress is turned off. Never store answers or typed
text, and keep the Settings and progress pages' description of what is kept exact.

## Commands (Node ≥ 22.12)
On this Mac, Node 22 is keg-only: `export PATH=/opt/homebrew/opt/node@22/bin:$PATH` first.
- `npm run dev` (http://localhost:5173/Aqboken/; `.claude/launch.json` uses port 5174), `npm run build`, `npm test`,
  `npm run check`
- `npm run data:fetch` then `npm run data:check` — the Wiktionary check (writes `reports/wiktionary-check.md`, exit 1
  on any failure). Run it after changing the rules, the word lists or a Learn page.

## Decisions (owner, 2026-11-13)
- Scope (2026-11-13): A1–B1 grammar and vocabulary, listening, a grammar test, learning paths, search and culture
  links, reading.
- Script: Cyrillic by default, with a Cyrillic / Latin / Both switch in the header (`settings.script`). Latin = the
  April 2021 alphabet (`src/shared/script.ts`); loan-only letters (ё ц ч щ э ю я ъ ь) have no 2021 letter, so we write
  their sounds and say it's an approximation. Answers are accepted in either script (`sameAnswer`).
- Forms are **made by rule and checked against Wiktionary** (unlike Krotik, which only ships sourced forms):
  `src/shared/kazakh.ts` is the one place rules live. The check must pass: every word in `src/data/words.ts` has a
  Wiktionary entry of its part of speech (verbs also via form-of entries; two-word items word by word) or is in
  `exceptions.ts` `NOT_IN_WIKTIONARY` with a reason; every listed noun/verb with a Wiktionary table matches it form by
  form (clear Wiktionary errors go in `WIKTIONARY_ERRORS` with a reason); every Kazakh word in `content/learn` is a
  Wiktionary form, a form the rules make from our lists, or in `LEARN_WORDS` with a reason. Never add an exception
  just to make the check pass: fix the rule or the word.
- Kazakh hasn't been reviewed by a native speaker yet (the beta note says so). `npm run review` writes
  `reports/for-review.md`: our words and meanings (W), every Kazakh line of the Learn pages (L), topic names and
  grammar terms (T), sample drill questions with explanations (D), the Tatoeba examples (S), words Wiktionary lacks,
  and an audio check. Regenerate it after content changes; apply a reviewer's corrections in the sources, never in
  the report. Our own sentences stay short and
  pattern-based; don't write long Kazakh prose until a reviewer is available.

- Audio (owner's decision 2026-11-13): open native recordings of Kazakh are rare (Wikimedia Commons had 142, 31 of
  our words), so: **native recordings where they exist, else a computer voice, always labelled as such**.
  - Native: `npm run audio:native` (`scripts/fetch-recordings.ts`) takes Lingua Libre / Category:Kazakh pronunciation
    files that record exactly one of our words, CC0 / CC BY / CC BY-SA / public domain only, into
    `public/audio/native/` with credits in `src/data/recordings.json` (both committed; it keeps earlier downloads
    and waits out Commons' rate limits). Credited where it plays and on the About page.
  - Computer voice: Piper with kk_KZ-issai-high (voice MIT; trained on ISSAI KazakhTTS2, CC BY 4.0), speaker 4.
    `npm run audio:texts` lists every vocabulary word and the spoken answer of every drill question
    (`speakText` in questions.ts) in `audio-tts/wanted.tsv`; `scripts/tts.py` voices the missing ones into
    `public/audio/tts/<audioKey>.mp3` (gitignored; 40 kbps mono). File names are a hash of the text
    (`src/shared/audio.ts`), so the app needs no list; bump `VOICE` there to remake every file. Locally: a Python venv
    with `pip install -r scripts/requirements-audio.txt` and the voice in `data-raw/piper/` (see the workflow).
    In CI the files are cached between runs and only new texts are voiced; a failure there never blocks a deploy.
  - `Hear.svelte` plays native first, else the computer voice ("Computer voice, not a native speaker"), and says
    "No audio yet" if the file is missing. Listening drill (`listen`): hear a word, choose its meaning or write it.

- Example sentences (Tatoeba, CC BY 2.0 FR): `npm run data:fetch-tatoeba` then `npm run data:sentences`
  (`scripts/build-sentences.ts`) writes `src/data/sentences.json` (committed; review the diff): for each word, the
  shortest Kazakh sentence with an English translation containing one of the word's forms (adjectives: plain and
  “I am” forms only). Tatoeba's Kazakh is thin (~620 with English, many by one contributor) and uneven, so every
  match is read by a person: `TATOEBA_DENY` (by id: wrong sense, crude, unkind, political, misspelt),
  `TATOEBA_AMBIGUOUS_FORMS` (басқа, жаста, сатып) and `TATOEBA_SKIP_WORDS` (алу) in exceptions.ts, each with its
  reason. Shown under each word on theme pages, in vocabulary/listening feedback, and in other drills only when the
  highlighted word is exactly the answer form. Sentences are voiced too.

- Sentence practice (group "Review"): `src/data/pairs.json` (written by `npm run data:sentences`) holds every
  Kazakh–English Tatoeba pair of 2–10 words that a person has read and not excluded (`TATOEBA_DENY`: slogans, news
  and politics, misspellings or Latin letters in Cyrillic, violence, alcohol, religion, mistranslations, in-jokes).
  **Translate and compare** (`translate`, both directions; `selfMark`: exact match right, otherwise the learner compares
  with the model and marks it; other Kazakh sentences with the same English are accepted). **Build the sentence**
  (`build`, 3–8 words, never shown in order; the original order right, any other self-marked). **Find the mistake**
  (`fix`): a real sentence with a subject pronoun whose present/past verb agrees with it; the verb is swapped for
  another person's form; tap it and type it (changing the pronoun to agree is accepted too); “want to” constructions
  are left out (келеді agrees with the possessive there). **Mixed review** (`mixed`): chosen topics round-robin, each
  with its own settings. Answer comparison strips final punctuation and spaces (“аламын ?”).

- Reading (`/reading/`, `/reading/<id>/`; owner's request 2026-11-13): short stories by Ybyrai Altynsarin (1879,
  public domain) from multilingual Wikisource at pinned revisions (`src/data/reading.ts`: id, title, English, level,
  `revid`, `corrections` for clear typing slips only, each shown on the page, per-text `glosses`, English
  questions with `kind` gist/detail/inference: every text needs an inference question). `npm run data:fetch-reading`
  then `npm run data:reading` (`scripts/build-reading.ts`, explainer in `scripts/lib/explainer.ts`): every word gets
  dictionary form, meaning, form and source (ours > hand > Wiktionary > rule), and the build fails if any word is
  unexplained. Output `src/data/reading/<id>.json` (committed) and `reports/reading.md` (every word). **Read every
  automatic explanation** of a new text: Wiktionary often offers the wrong word or sense (қарға read as қар +
  -ға; ата is “father” in these texts; кешті is “forgave”); fix with `src/data/reading-glosses.ts` (global) or the
  text's `glosses`. Damaged transcriptions (clipped words) are not published. Questions are English only (no
  unreviewed Kazakh). Reading steps are on the A2/B1 paths (never ticked). `tests/unit/reading.test.ts`.

## Layout
- `src/shared/kazakh.ts` — harmony (`harmonyOf`: last vowel; и/у after a consonant count front/back, after a vowel
  they're glides; 98.3% of Wiktionary plurals), last-sound classes (`finalClass`: V G L N Z K), suffix tables
  (`SUFFIX`), plural, cases (+ `possessedCase` for -ы/-сы forms), possessives (voicing п/к/қ → б/г/ғ, `possStem` for
  vowel loss), possessive + case (`possessiveCase`: dative -а/-е after -м/-ң), copula endings, question particle,
  present/past (+ negatives), the -ып converb (тап → тауып), “right now” (converb + жатыр; `motion` verbs бару/келу
  use -а/-е: бара жатыр), “want to” (-ғы + possessive + келеді), the imperative in all persons, the -мақ intention
  future, postpositions with their cases (`POSTPOSITIONS`), the -ған “have done” (`perfect`) and -атын “used to”
  (`habitualPast`) tenses, the -са conditional, “can” (-а/-е form + алу), comparatives (-рақ/-ырақ; rule only, no
  Wiktionary data: listed in the review report), ordinals (`ORDINAL`, taken from Wiktionary's entries, irregulars
  included), the time (24-hour, жарым, locative “at”), numbers, pronoun declension. “We are” is -быз after м/н/ң
  as well as з/ж (мұғалімбіз; Wiktionary's -ған tables confirm it).
- The Wiktionary check compares, for every verb table (~165): present, past, converb (from the renarrative), want
  (optative), imperative (Wiktionary's untagged "error-unrecognized-form" rows, in person order) and intention
  (intentive; its 2nd plurals are skipped, Wiktionary repeats the singular), perfect, habitual past and conditional. The Learn-page check also covers the
  Kazakh topic and theme names; grammar terms Wiktionary lacks are in `LEARN_WORDS` for the native-speaker review.
- `src/data/words.ts` — themes and words (verbs with `stem`; noun options `harmony`, `noVoicing`, `possStem`,
  `possessed`, `noDrill`). Meanings are our own.
- `src/lib/questions.ts` — one generator per drill, each question with its `explain`; `labels.ts` case/person names
  and English cues; `topics.ts` the one topic list; `settings.ts`; `queue.ts`/`rng.ts` copied from Krotik (retry
  rule: wrong → back in 10 cards; `?seed=N` makes rounds reproducible).
- `content/learn/<topic>.md` — Learn pages: Markdown plus `::forms <kind> <words>` (tables drawn by the rules: plural,
  cases, possessive, copula, present, presentNeg, past, pastNeg, pronouns, numbers, alphabet, question, rule
  <suffix>) and `::drill <mode>`. Links: `[text](learn:id)`, `drill:id`, `vocabulary:id`. Cyrillic in the text is
  shown in the reader's script automatically.
- Pages under `/Aqboken/` (`src/shared/site.ts`): `/`, `/start/`, `/paths/`, `/learn/`, `/learn/<topic>/`, `/drill/`,
  `/drill/<topic>/`, `/vocabulary/`, `/vocabulary/<theme>/`, `/test/`, `/culture/`, `/search/`, `/progress/`,
  `/settings/`, `/about/`. Header menu: Learn, Drill, Vocabulary, Reading, Test, Culture, and the search button.
- Start here (`StartPage.svelte`): the beginner's guide. The home page shows a big “New to Kazakh?” card until
  `settings.guideSeen` (opening the guide, starting a drill, or “Got it”), then a small link.
- Grammar test (`/test/`, `src/lib/levelTest.ts`, `LevelTest.svelte`, in the header menu): 12 multiple-choice
  questions each at A1, A2, B1 (`TEST_TOPICS`), drawn from the drills; at most 2 per topic per level. Wrong options
  are only other real forms of the same word (`Question.others`) or a drill's own choices, never invented forms, so
  a drill without `others` can't feed the test. Reach a level with ≥9/12 there and ≥8/12 at each level below
  (`scoreTest`); every wrong answer explained; “Set my learning path to …”. In memory only. Grammar only, and says so.
- Search (`/search/?q=`, `src/lib/search.ts`, header button or “/”): built in the browser from bundled data: lessons
  (full text), drills, themes, every word with its meaning, culture links. Case and script ignored; a Kazakh query
  also matches a word's forms (кітабымда → кітап). Nothing stored or sent; noindex. `tests/unit/search.test.ts`.
- Culture (`/culture/`, `src/data/culture.ts`): hand-checked links only (no embeds), each the creator's or rights
  holder's own site or channel (official YouTube channels confirmed from the organisation's own site: Kazakhfilm is
  @kazakhfilmkz, linked from kazakhfilm.kz; look-alike handles are unofficial), nothing mainly political or news,
  our own descriptions, a `note` on sign-up or payment, and `checked` dates. Each type has a suggested activity.
  `npm run links:check` checks they still answer; re-check what a channel actually posts before adding it.
- Learning paths (`src/lib/paths.ts`, `PathsPage.svelte`): A1, A2 and B1 routes of topic and theme steps, each with a
  why; `settings.pathLevel`. With progress on, a topic is ticked once drilled and a theme once half its words are in
  my words, and the home page shows “Your next step”. `tests/unit/paths.test.ts`: every step exists and isn't from a
  later level, every theme is on its level's path, every Learn topic is on some path. Titles in `src/lib/pageMeta.ts` (app and
  prerender share them).
- Prerendering (`scripts/prerender.ts`, run by `npm run build` after `vite build`): every page gets its own
  `index.html` with title, description, canonical address and its text as plain HTML (Learn pages with their tables
  of forms), plus `sitemap.xml` and `404.html` (the bare app). Drill and settings pages are noindex. A new page type
  needs a case there. Submit the sitemap in Google Search Console (a project site can't have its own robots.txt).
- Deploy: every push to `main` runs `.github/workflows/deploy.yml`: type checks, unit tests, the Wiktionary check
  (extract cached per month; report uploaded as an artifact), build, then GitHub Pages
  (https://will-corbett.github.io/Aqboken/, repo will-corbett/Aqboken). A stuck Pages deployment is retried once.
- Browser tests (`npm run e2e`, Playwright, `tests/e2e/`, desktop + phone; first time `npx playwright install
  chromium`): every page opens with no console errors and no sideways scroll; drill flows (typed, choices, self-marked,
  build, fix, script switch); search, grammar test, progress/my words, reading; axe accessibility scans (WCAG 2.1 AA)
  of every kind of page in the aqboken, light and dark themes. CI runs them before every deploy. Wide tables scroll
  inside a focusable, labelled region (`.table-scroll`).
- Tests: `tests/unit/kazakh.test.ts` (textbook forms, Latin), `tests/unit/questions.test.ts` (every drill and settings
  variant builds well-formed questions whose answers are accepted, in Cyrillic and Latin).

## Conventions
- Theme `aqboken` (default), from the logo (a saiga antelope over the steppe): deep green #014336 for text accents and
  button fills (cream text), sun gold #FDB93C only as fills and highlights (too light for text on cream), cream
  #FAF1EB background. The dark theme uses the same family (green-black background, gold accent). Also system/light.
  Logo files in `public/brand/` (aqboken-logo.webp for the home page; aqboken-32/128/180/192/512.png for icons, cut from
  the original with rounded transparent corners).
- Every answer is explained; a wrong typed form that is another form of the word is named ("which is the dative").
- Accessibility as Krotik: keyboard flow (Enter, 1–n for choices), aria-live feedback, visible focus, no horizontal
  scroll at phone width, reduced motion respected.
- Small, well-named commits. Say why before adding a dependency.

# Körti — Kazakh learning site

Static, no-login app (Svelte 5 + Vite + TypeScript strict), the Kazakh sibling of ../Krotik (Russian): same stack,
layout and conventions, much smaller so far. No backend, no analytics. Settings in localStorage `korti.settings.v1`;
progress is **opt-in** (`settings.progress`, off by default): per drill only rounds, last score and date, under
`korti.progress.v1`, deleted when turned off. Never store answers or typed text.

## Commands (Node ≥ 22.12)
On this Mac, Node 22 is keg-only: `export PATH=/opt/homebrew/opt/node@22/bin:$PATH` first.
- `npm run dev` (http://localhost:5173/Korti/; `.claude/launch.json` uses port 5174), `npm run build`, `npm test`,
  `npm run check`
- `npm run data:fetch` then `npm run data:check` — the Wiktionary check (writes `reports/wiktionary-check.md`, exit 1
  on any failure). Run it after changing the rules, the word lists or a Learn page.

## Decisions (owner, 2026-11-13)
- Scope: core v1 — Learn + drills for the basics, and Vocabulary themes. Reading, listening, a grammar test, paths,
  search, culture come later.
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
- Kazakh hasn't been reviewed by a native speaker yet (the beta note says so). Our own sentences stay short and
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

## Layout
- `src/shared/kazakh.ts` — harmony (`harmonyOf`: last vowel; и/у after a consonant count front/back, after a vowel
  they're glides; 98.3% of Wiktionary plurals), last-sound classes (`finalClass`: V G L N Z K), suffix tables
  (`SUFFIX`), plural, cases (+ `possessedCase` for -ы/-сы forms), possessives (voicing п/к/қ → б/г/ғ, `possStem` for
  vowel loss), possessive + case (`possessiveCase`: dative -а/-е after -м/-ң), copula endings, question particle,
  present/past (+ negatives), the -ып converb (тап → тауып), “right now” (converb + жатыр; `motion` verbs бару/келу
  use -а/-е: бара жатыр), “want to” (-ғы + possessive + келеді), the imperative in all persons, the -мақ intention
  future, postpositions with their cases (`POSTPOSITIONS`), numbers, pronoun declension.
- The Wiktionary check compares, for every verb table (~165): present, past, converb (from the renarrative), want
  (optative), imperative (Wiktionary's untagged "error-unrecognized-form" rows, in person order) and intention
  (intentive; its 2nd plurals are skipped, Wiktionary repeats the singular). The Learn-page check also covers the
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
- Pages under `/Korti/` (`src/shared/site.ts`): `/`, `/learn/`, `/learn/<topic>/`, `/drill/`, `/drill/<topic>/`,
  `/vocabulary/`, `/vocabulary/<theme>/`, `/settings/`, `/about/`. Titles in `src/lib/pageMeta.ts` (app and
  prerender share them).
- Prerendering (`scripts/prerender.ts`, run by `npm run build` after `vite build`): every page gets its own
  `index.html` with title, description, canonical address and its text as plain HTML (Learn pages with their tables
  of forms), plus `sitemap.xml` and `404.html` (the bare app). Drill and settings pages are noindex. A new page type
  needs a case there. Submit the sitemap in Google Search Console (a project site can't have its own robots.txt).
- Deploy: every push to `main` runs `.github/workflows/deploy.yml`: type checks, unit tests, the Wiktionary check
  (extract cached per month; report uploaded as an artifact), build, then GitHub Pages
  (https://will-corbett.github.io/Korti/, repo will-corbett/Korti). A stuck Pages deployment is retried once.
- Tests: `tests/unit/kazakh.test.ts` (textbook forms, Latin), `tests/unit/questions.test.ts` (every drill and settings
  variant builds well-formed questions whose answers are accepted, in Cyrillic and Latin).

## Conventions
- Theme `korti` (default): sky blue fills (`--primary-bg` #2ec4dc, dark text), deep teal text accent #00586a, gold
  #fec50c. Also system/light/dark. Logo: `public/brand/korti.svg`.
- Every answer is explained; a wrong typed form that is another form of the word is named ("which is the dative").
- Accessibility as Krotik: keyboard flow (Enter, 1–n for choices), aria-live feedback, visible focus, no horizontal
  scroll at phone width, reduced motion respected.
- Small, well-named commits. Say why before adding a dependency.

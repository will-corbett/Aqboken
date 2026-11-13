# Aqböken

Learn and practise Kazakh: short grammar lessons with tables of forms, instant drills that explain every answer, and
vocabulary by theme. Cyrillic, Latin (the 2021 alphabet) or both, switchable at any time; answers can be typed in
either. No accounts, no analytics; progress is optional and stays in your browser.

The Kazakh sibling of Krotik (Russian), on the same stack and design.

- **Learn** (`content/learn/*.md`): 11 topics: the alphabet, vowel harmony, plurals, “I am …”, possessives, the
  seven cases, pronouns, present and past tense (with negatives), yes/no questions, numbers.
- **Drill**: one drill per topic, with settings (which cases, persons, positive/negative, number ranges…). A wrong
  answer comes back 10 cards later; a round ends when everything has been answered right once.
- **Vocabulary**: 283 words in 14 themes (A1–A2), each with its forms, practised both ways round.
- **Audio**: every word and every drill answer can be heard: native recordings (Lingua Libre, 31 words so far),
  otherwise a labelled computer voice (Piper, trained on ISSAI's KazakhTTS2). A **Listening** drill: hear a word,
  choose its meaning or write it down.

## How the Kazakh is made and checked

Kazakh endings are regular: vowel harmony plus the word's last sound. `src/shared/kazakh.ts` holds the rules;
`npm run data:check` compares them with Wiktionary's Kazakh tables (kaikki.org) and checks our words and the Kazakh in
the Learn pages. Current result (`reports/wiktionary-check.md`):

- all 283 words found in Wiktionary or listed with a reason; all 159 nouns and 22 verbs with tables match exactly;
- across all 4,617 Wiktionary noun tables, 96.4% of nouns match in every form (most of the rest are Russian loans).

## Run locally

Needs Node 22.12 or newer.

```bash
npm install
npm run dev          # http://localhost:5173/Aqboken/
npm test             # unit tests (engine + every drill's questions)
npm run check        # type checks
npm run data:fetch   # once: the Kazakh Wiktionary extract (38 MB) into data-raw/
npm run data:check   # the Wiktionary check
npm run audio:tts    # computer-voice audio (needs Python with scripts/requirements-audio.txt and the voice in data-raw/piper/)
npm run build        # dist/: the app plus a prerendered HTML file for every page, sitemap.xml, 404.html
```

## Deploy

Every push to `main` runs `.github/workflows/deploy.yml`: type checks, unit tests, the Wiktionary check, the build,
then GitHub Pages: https://will-corbett.github.io/Aqboken/

## Licences

Wiktionary data via kaikki.org is CC BY-SA 4.0 (used to check forms; no Wiktionary text is shipped). Fonts: PT Sans
and PT Serif (OFL).

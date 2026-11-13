/**
 * After `vite build`: write a real HTML file for every page (dist/learn/cases/index.html …), each with its own title,
 * description and canonical address, and the page's text as plain HTML (Learn pages with their tables of forms), so
 * search engines and readers without JavaScript can read it. The app replaces it when it starts. Also writes
 * sitemap.xml and 404.html (the bare app, which shows "not found" for unknown addresses). Drill and settings pages are
 * noindex. Deterministic: same input, same files.
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { parse, type Block } from '../src/lib/markdown.ts';
import { pageTitle } from '../src/lib/pageMeta.ts';
import { href, pathOf, type Route } from '../src/lib/router.ts';
import { GROUPS, TOPICS } from '../src/lib/topics.ts';
import { CASE_NAME } from '../src/lib/labels.ts';
import { ALPHABET } from '../src/lib/questions.ts';
import { ALL_WORDS, THEMES } from '../src/data/words.ts';
import { nounOptions } from '../src/data/exceptions.ts';
import {
  CASES,
  PERSONS,
  POSS_PERSONS,
  PRONOUN,
  PRONOUN_CASES,
  PRONOUN_GEN,
  SUFFIX,
  caseForm,
  copula,
  numberWords,
  past,
  pastNeg,
  plural,
  possessive,
  present,
  presentNeg,
  questionParticle,
  POSTPOSITIONS,
  continuous,
  imperative,
  intention,
  possessiveCase,
  want,
  type Person,
} from '../src/shared/kazakh.ts';
import { toLatin } from '../src/shared/script.ts';
import { SITE_URL } from '../src/shared/site.ts';
import sentences from '../src/data/sentences.json' with { type: 'json' };
const SENT = sentences as unknown as Record<string, [number, string, string]>;

const DIST = 'dist';
const template = readFileSync(join(DIST, 'index.html'), 'utf8');
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const kk = (s: string) => `<span lang="kk">${esc(s)}</span>`;
const en = (w: string) => ALL_WORDS.find((x) => x.kk === w)?.en ?? '';
const stemOf = (inf: string) => ALL_WORDS.find((w) => w.kk === inf && w.pos === 'v')?.stem ?? inf.replace(/у$/, '');

const table = (head: string[], rows: string[][], caption = '') =>
  `<table>${caption ? `<caption>${caption}</caption>` : ''}<thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows
    .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`)
    .join('')}</tbody></table>`;

/** The `::forms` tables as plain HTML (the app draws its own, with the endings highlighted). */
function forms(kind: string, words: string[]): string {
  const motion = (inf: string) => !!ALL_WORDS.find((w) => w.kk === inf)?.motion;
  const VERB: Record<string, (s: string, p: Person) => string> = { present, presentNeg, past, pastNeg, want, imperative, intention };
  switch (kind) {
    case 'plural':
      return table(['Word', 'Meaning', 'Plural'], words.map((w) => [kk(w), esc(en(w)), kk(plural(w, nounOptions(w)))]));
    case 'question':
      return table(['Word', 'Meaning', 'Question'], words.map((w) => [kk(w), esc(en(w)), kk(`Бұл ${w} ${questionParticle(w)}?`)]));
    case 'cases':
      return words
        .map((w) => {
          const o = nounOptions(w);
          const pl = plural(w, o);
          return table(['Case', 'Meaning', 'Singular', 'Plural'], CASES.map((c) => [`${CASE_NAME[c].en} (${kk(CASE_NAME[c].kk)})`, esc(CASE_NAME[c].meaning), kk(caseForm(w, c, o)), kk(caseForm(pl, c, { harmony: o.harmony }))]), `${kk(w)} · ${esc(en(w))}`);
        })
        .join('');
    case 'possessive':
      return table(['', ...words.map(kk)], POSS_PERSONS.map((p) => [kk(PRONOUN_GEN[p]), ...words.map((w) => kk(possessive(w, p, nounOptions(w))))]));
    case 'copula':
      return table(['', ...words.map(kk)], PERSONS.map((p) => [kk(PRONOUN[p]), ...words.map((w) => kk(copula(w, p)))]));
    case 'pronouns':
      return table(['Case', ...Object.keys(PRONOUN_CASES).map(kk)], CASES.map((c) => [CASE_NAME[c].en, ...Object.values(PRONOUN_CASES).map((f) => kk(f[c]))]));
    case 'numbers':
      return table(['Number', 'In words'], words.map((n) => [n, kk(numberWords(Number(n)))]));
    case 'alphabet':
      return table(['Cyrillic', 'Latin (2021)'], ALPHABET.map((c) => [kk(`${c.toUpperCase()} ${c}`), esc(toLatin(c.toUpperCase()) || '–')]));
    case 'continuous':
      return table(['', ...words.map(kk)], PERSONS.map((p) => [kk(PRONOUN[p]), ...words.map((w) => kk(continuous(stemOf(w), p, { motion: motion(w) })))]));
    case 'posscases':
      return words.map((w) => table(['Case', ...POSS_PERSONS.map((p) => kk(PRONOUN_GEN[p]))], CASES.map((c) => [CASE_NAME[c].en, ...POSS_PERSONS.map((p) => kk(possessiveCase(w, p, c, nounOptions(w))))]), `${kk(w)} · ${esc(en(w))}`)).join('');
    case 'postpositions':
      return table(['Postposition', 'Meaning', 'Takes', 'Example'], POSTPOSITIONS.map((pp) => [kk(pp.word), esc(pp.en), pp.case === 'nom' ? 'the plain form' : CASE_NAME[pp.case].en.toLowerCase(), kk(`${caseForm(words[0] ?? 'мектеп', pp.case)} ${pp.word}`)]));
    case 'rule': {
      const t = (SUFFIX as Record<string, Record<string, readonly [string, string]>>)[words[0] ?? ''];
      if (!t) return '';
      const rows: [string, string][] = [['V', 'a vowel'], ['G', 'р, й, у, и'], ['L', 'л'], ['N', 'м, н, ң'], ['Z', 'з, ж'], ['K', 'a voiceless consonant']];
      return table(['After a word ending in…', 'Back vowels', 'Front vowels'], rows.map(([k, label]) => [esc(label), kk('-' + t[k]![0]), kk('-' + t[k]![1])]));
    }
    default:
      if (VERB[kind]) return table(['', ...words.map(kk)], PERSONS.map((p) => [kk(PRONOUN[p]), ...words.map((w) => kk(VERB[kind]!(stemOf(w), p)))]));
      return '';
  }
}

function block(b: Block): string {
  switch (b.type) {
    case 'h2':
    case 'h3':
    case 'p':
      return `<${b.type}>${b.html}</${b.type}>`;
    case 'ul':
      return `<ul>${b.items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
    case 'table':
      return table(b.head, b.rows);
    case 'forms':
      return forms(b.kind, b.words);
    case 'drill':
      return `<p><a href="${href({ page: 'drill', mode: b.mode })}">Practise this</a></p>`;
  }
}

interface Page {
  route: Route;
  description: string;
  body: string;
  index: boolean;
}
const a = (r: Route, text: string) => `<a href="${href(r)}">${text}</a>`;
const nav = `<nav aria-label="Main"><a href="${href({ page: 'home' })}">Aqböken</a> · ${a({ page: 'learn' }, 'Learn')} · ${a({ page: 'drill' }, 'Drill')} · ${a({ page: 'vocabulary' }, 'Vocabulary')}</nav>`;
const topicList = `${GROUPS.map((g) => `<h2>${esc(g)}</h2><ul>${TOPICS.filter((t) => t.group === g)
  .map((t) => `<li>${t.learn ? a({ page: 'learn', topic: t.id }, esc(t.title)) : esc(t.title)} (${kk(t.kk)}, ${t.level}): ${esc(t.blurb)} ${a({ page: 'drill', mode: t.id }, 'Drill')}</li>`)
  .join('')}</ul>`).join('')}`;
const themeList = `<ul>${THEMES.map((t) => `<li>${a({ page: 'vocabulary', theme: t.id }, esc(t.title))} (${kk(t.kkTitle)}, ${t.level}): ${esc(t.blurb)}</li>`).join('')}</ul>`;

const pages: Page[] = [
  {
    route: { page: 'home' },
    description: 'Learn Kazakh grammar and vocabulary: short lessons with tables of forms, instant drills that explain every answer, and words by theme. Cyrillic or Latin script. Free, no login.',
    body: `<h1>Learn Kazakh, one ending at a time</h1><p>Kazakh builds words from a stem and a chain of endings, and each ending follows a handful of sound rules. Aqböken explains the rules simply, shows them at work in tables, and drills them until they’re automatic.</p>${topicList}<h2>Vocabulary</h2>${themeList}`,
    index: true,
  },
  { route: { page: 'learn' }, description: 'Every Kazakh grammar topic on Aqböken, easiest first: the alphabet, vowel harmony, plurals, cases, possessives, verbs and numbers.', body: `<h1>Learn and drill</h1>${topicList}`, index: true },
  { route: { page: 'drill' }, description: 'Drills for every Kazakh grammar topic.', body: `<h1>Drills</h1>${topicList}`, index: false },
  { route: { page: 'vocabulary' }, description: `${ALL_WORDS.length} everyday Kazakh words in ${THEMES.length} themes, with their forms and practice both ways round.`, body: `<h1>Vocabulary</h1>${themeList}`, index: true },
  { route: { page: 'settings' }, description: 'Aqböken settings: script, keyboard, progress and theme.', body: '<h1>Settings</h1>', index: false },
  { route: { page: 'progress' }, description: 'Your progress on Aqböken, kept only in your browser.', body: '<h1>Your progress</h1>', index: false },
  {
    route: { page: 'about' },
    description: 'About Aqböken: how its Kazakh is made by rule and checked against Wiktionary, the Latin alphabet, and sources.',
    body: '<h1>About Aqböken</h1><p>Aqböken makes Kazakh forms with the language’s sound rules and checks them against Wiktionary’s Kazakh tables (via kaikki.org, CC BY-SA 4.0). Meanings, explanations and Learn pages are our own.</p>',
    index: true,
  },
];

for (const f of readdirSync('content/learn').filter((x) => x.endsWith('.md')).sort()) {
  const id = f.replace(/\.md$/, '');
  const t = TOPICS.find((x) => x.id === id);
  if (!t) throw new Error(`content/learn/${f}: no topic "${id}" in topics.ts`);
  const md = parse(readFileSync(join('content/learn', f), 'utf8'), 'cyrl');
  const first = md.blocks.find((b) => b.type === 'p');
  const text = first && 'html' in first ? first.html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : t.blurb;
  pages.push({
    route: { page: 'learn', topic: id },
    description: text.length <= 158 ? text : `${text.slice(0, 155).replace(/\s+\S*$/, '')}…`,
    body: `<h1>${esc(t.title)} <span lang="kk">${esc(t.kk)}</span></h1>${md.blocks.map(block).join('\n')}`,
    index: true,
  });
}
for (const t of TOPICS) pages.push({ route: { page: 'drill', mode: t.id }, description: `Practise ${t.title.toLowerCase()} in Kazakh: ${t.blurb}`, body: `<h1>${esc(t.title)} drill</h1><p>${esc(t.blurb)}</p>`, index: false });
for (const t of THEMES)
  pages.push({
    route: { page: 'vocabulary', theme: t.id },
    description: `${t.title} in Kazakh (${t.kkTitle}): ${t.words.length} words with meanings and forms. ${t.blurb}`.slice(0, 158),
    body: `<h1>${esc(t.title)} <span lang="kk">${esc(t.kkTitle)}</span></h1><p>${esc(t.blurb)}</p>${table(['Kazakh', 'Latin', 'Meaning', 'Example'], t.words.map((w) => [kk(w.kk), esc(toLatin(w.kk)), esc(w.en), SENT[w.kk] ? `${kk(SENT[w.kk]![1])}<br>${esc(SENT[w.kk]![2])} <a href="https://tatoeba.org/en/sentences/show/${SENT[w.kk]![0]}" rel="noopener">Tatoeba</a>` : '']))}`,
    index: true,
  });

function render(p: Page): string {
  const url = SITE_URL + pathOf(p.route);
  const head = [
    `<title>${esc(pageTitle(p.route))}</title>`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:title" content="${esc(pageTitle(p.route))}" />`,
    `<meta property="og:description" content="${esc(p.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    ...(p.index ? [] : ['<meta name="robots" content="noindex" />']),
  ].join('\n    ');
  return template
    .replace(/<title>.*?<\/title>/, head)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${esc(p.description)}" />`)
    .replace('<div id="app"></div>', `<div id="app">${nav}<main>${p.body}</main></div>`);
}

for (const p of pages) {
  const file = join(DIST, pathOf(p.route), 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, render(p));
}
writeFileSync(join(DIST, '404.html'), template.replace(/<title>.*?<\/title>/, '<title>Page not found · Aqböken</title>\n    <meta name="robots" content="noindex" />'));
writeFileSync(
  join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages
    .filter((p) => p.index)
    .map((p) => `  <url><loc>${SITE_URL}${pathOf(p.route)}</loc></url>`)
    .join('\n')}\n</urlset>\n`,
);
console.log(`Prerendered ${pages.length} pages (${pages.filter((p) => p.index).length} in the sitemap).`);

/**
 * Site search (/search/?q=): lessons (title and full text), drills, vocabulary themes, every word with its meaning,
 * and culture links, built in the browser from what is already bundled. Case and script are ignored (a Latin query
 * is compared with the Latin of the Kazakh). A Kazakh query also finds a word from one of its forms: кітабымда and
 * кітаптар find кітап (the word's forms are made by the rules). Nothing is stored or sent.
 */
import { ALL_WORDS, THEMES } from '../data/words.ts';
import { nounOptions } from '../data/exceptions.ts';
import { LEARN } from './learn.ts';
import { href } from './router.ts';
import { TOPICS } from './topics.ts';
import { CULTURE } from '../data/culture.ts';
import { TEXTS } from '../data/reading.ts';
import { CASES, POSS_PERSONS, PERSONS, caseForm, plural, possessive, possessiveCase, present, past, presentNeg, pastNeg } from '../shared/kazakh.ts';
import { toLatin } from '../shared/script.ts';

export interface Hit {
  kind: 'Lesson' | 'Drill' | 'Theme' | 'Word' | 'Culture' | 'Reading';
  title: string;
  kk?: string;
  detail: string;
  href: string;
  score: number;
}

interface Entry extends Omit<Hit, 'score'> {
  /** Searchable text, folded. */
  text: string;
  /** Kazakh forms that lead to this entry (words). */
  forms?: Set<string>;
}

/** Lower case, Latin version too, accents of the English kept: “Кітап” → “кітап kıtap”. */
export const fold = (s: string) => {
  const l = s.normalize('NFC').toLowerCase();
  return /[а-яәғқңөұүһі]/.test(l) ? `${l} ${toLatin(l).toLowerCase()}` : l;
};
const plain = (md: string) => md.replace(/^::.*$/gm, '').replace(/[#*|_`[\]]/g, ' ').replace(/\(([a-z]+:[^)]*|https?:[^)]*)\)/g, ' ');

let index: Entry[] | null = null;
function build(): Entry[] {
  const out: Entry[] = [];
  for (const t of TOPICS) {
    const text = t.learn ? plain(LEARN[t.id] ?? '') : '';
    if (t.learn) out.push({ kind: 'Lesson', title: t.title, kk: t.kk, detail: t.blurb, href: href({ page: 'learn', topic: t.id }), text: fold(`${t.title} ${t.kk} ${t.blurb} ${text}`) });
    out.push({ kind: 'Drill', title: `${t.title} drill`, kk: t.kk, detail: t.blurb, href: href({ page: 'drill', mode: t.id }), text: fold(`${t.title} ${t.kk} ${t.blurb}`) });
  }
  for (const th of THEMES) out.push({ kind: 'Theme', title: th.title, kk: th.kkTitle, detail: `${th.level} · ${th.words.length} words: ${th.blurb}`, href: href({ page: 'vocabulary', theme: th.id }), text: fold(`${th.title} ${th.kkTitle} ${th.blurb} ${th.words.map((w) => `${w.kk} ${w.en}`).join(' ')}`) });
  for (const w of ALL_WORDS) {
    const forms = new Set<string>([w.kk.toLowerCase()]);
    if (w.pos === 'n' && !w.kk.includes(' ')) {
      const o = nounOptions(w.kk);
      const pl = plural(w.kk, o);
      for (const c of CASES) [caseForm(w.kk, c, o), caseForm(pl, c, { harmony: o.harmony })].forEach((f) => forms.add(f));
      for (const p of POSS_PERSONS) for (const c of CASES) forms.add(possessiveCase(w.kk, p, c, o));
      for (const p of POSS_PERSONS) forms.add(possessive(w.kk, p, o));
    }
    if (w.pos === 'v' && !w.stem!.includes(' ')) for (const p of PERSONS) [present, presentNeg, past, pastNeg].forEach((fn) => forms.add(fn(w.stem!, p)));
    const theme = THEMES.find((t) => t.id === w.theme)!;
    out.push({ kind: 'Word', title: w.kk, kk: w.kk, detail: `${w.en} · ${theme.title}`, href: href({ page: 'vocabulary', theme: w.theme }), text: fold(`${w.kk} ${w.en}`), forms: new Set([...forms].flatMap((f) => [f, toLatin(f).toLowerCase()])) });
  }
  for (const t of TEXTS) out.push({ kind: 'Reading', title: t.en, kk: t.title, detail: `${t.level} · ${t.blurb}`, href: href({ page: 'reading', text: t.id }), text: fold(`${t.title} ${t.en} ${t.blurb}`) });
  for (const c of CULTURE) out.push({ kind: 'Culture', title: c.title, detail: `${c.type} · ${c.about}`, href: c.url, text: fold(`${c.title} ${c.type} ${c.about} ${c.topic}`) });
  return out;
}

export function search(query: string, limit = 60): Hit[] {
  const q = query.normalize('NFC').toLowerCase().trim().replace(/\s+/g, ' ');
  if (q.length < 2) return [];
  index ??= build();
  const terms = q.split(' ');
  const hits: Hit[] = [];
  for (const e of index) {
    let score = 0;
    const title = fold(e.title);
    if (e.forms?.has(q)) score += e.title.toLowerCase() === q || toLatin(e.title).toLowerCase() === q ? 100 : 80;
    if (title.split(' ').includes(q)) score += 60;
    else if (title.includes(q)) score += 40;
    if (terms.every((t) => e.text.includes(t))) score += 10 + (e.kind === 'Lesson' ? 5 : 0);
    if (score) hits.push({ kind: e.kind, title: e.title, kk: e.kk, detail: e.detail, href: e.href, score });
  }
  return hits.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title)).slice(0, limit);
}

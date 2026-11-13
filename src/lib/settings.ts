/** UI settings, kept in this browser only (localStorage `aqboken.settings.v1`). */
import { CASES, PERSONS, POSS_PERSONS, type Case, type Person, type PossPerson } from '../shared/kazakh.ts';
import type { Script } from '../shared/script.ts';
import { THEMES } from '../data/words.ts';
import type { Mode } from './topics.ts';

export type Theme = 'aqboken' | 'system' | 'light' | 'dark';

export interface Settings {
  theme: Theme;
  script: Script;
  /** Questions per round; 0 = unlimited. */
  count: number;
  mode: Mode;
  lastDrill?: Mode;
  keyboard: boolean;
  /** Opt-in progress (src/lib/progress.ts). */
  progress: boolean;
  betaNoteHidden: boolean;
  /** The learning path you follow (Paths page, home page). */
  pathLevel: 'A1' | 'A2' | 'B1';
  /** Has opened the guide or started a drill: the home page's big “new here?” card becomes a link. */
  guideSeen: boolean;
  alphabet: { direction: 'toLatin' | 'toCyrillic' };
  cases: { cases: Case[]; number: 'sg' | 'pl' | 'both' };
  possessive: { persons: PossPerson[] };
  copula: { persons: Person[] };
  pronouns: { cases: Case[] };
  present: { persons: Person[]; polarity: 'pos' | 'neg' | 'both' };
  past: { persons: Person[]; polarity: 'pos' | 'neg' | 'both' };
  numbers: { range: 'to10' | 'to100' | 'to1000' | 'years'; direction: 'write' | 'read' };
  vocab: { direction: 'recognise' | 'recall'; themes: string[]; source: 'themes' | 'mine' };
  listen: { kind: 'meaning' | 'dictation'; themes: string[] };
  continuous: { persons: Person[] };
  future: { persons: Person[] };
  want: { persons: Person[] };
  imperative: { persons: Person[] };
  posscases: { persons: PossPerson[]; cases: Case[] };
  perfect: { persons: Person[] };
  habitual: { persons: Person[] };
  conditional: { persons: Person[] };
  can: { persons: Person[]; polarity: 'pos' | 'neg' | 'both' };
  time: { kinds: ('time' | 'at' | 'ordinal' | 'date')[] };
  translate: { direction: 'en-kk' | 'kk-en' | 'both' };
  mixed: { topics: Mode[] };
}

const KEY = 'aqboken.settings.v1';
const BASIC_PERSONS: Person[] = ['1sg', '2sg', '2sgf', '3', '1pl'];

export function defaults(): Settings {
  return {
    theme: 'aqboken',
    script: 'cyrl',
    count: 10,
    mode: 'plural',
    keyboard: false,
    progress: false,
    betaNoteHidden: false,
    pathLevel: 'A1',
    guideSeen: false,
    alphabet: { direction: 'toLatin' },
    cases: { cases: CASES.filter((c) => c !== 'nom'), number: 'sg' },
    possessive: { persons: [...POSS_PERSONS] },
    copula: { persons: BASIC_PERSONS },
    pronouns: { cases: CASES.filter((c) => c !== 'nom') },
    present: { persons: BASIC_PERSONS, polarity: 'pos' },
    past: { persons: BASIC_PERSONS, polarity: 'pos' },
    numbers: { range: 'to100', direction: 'write' },
    vocab: { direction: 'recognise', themes: THEMES.filter((t) => t.level === 'A1').map((t) => t.id), source: 'themes' },
    listen: { kind: 'meaning', themes: THEMES.filter((t) => t.level === 'A1').map((t) => t.id) },
    continuous: { persons: BASIC_PERSONS },
    future: { persons: BASIC_PERSONS },
    want: { persons: BASIC_PERSONS },
    imperative: { persons: ['1sg', '2sg', '2sgf', '3', '1pl'] },
    posscases: { persons: ['1sg', '2sg', '3', '1pl'], cases: ['dat', 'loc', 'abl'] },
    perfect: { persons: BASIC_PERSONS },
    habitual: { persons: BASIC_PERSONS },
    conditional: { persons: BASIC_PERSONS },
    can: { persons: BASIC_PERSONS, polarity: 'both' },
    time: { kinds: ['time', 'at', 'ordinal', 'date'] },
    translate: { direction: 'en-kk' },
    mixed: { topics: ['plural', 'cases', 'possessive', 'present', 'past'] },
  };
}

/** Saved settings over the defaults, one level deep, dropping anything no longer valid. */
export function loadSettings(): Settings {
  const d = defaults();
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Partial<Settings>;
    const out = { ...d } as Record<string, unknown>;
    for (const [k, v] of Object.entries(raw)) {
      const def = (d as unknown as Record<string, unknown>)[k];
      if (def === undefined && k !== 'lastDrill') continue;
      out[k] = def && typeof def === 'object' && !Array.isArray(def) ? { ...def, ...(v as object) } : v;
    }
    const s = out as unknown as Settings;
    // The theme was called "korti" before the site was renamed (index.html also migrates it).
    if ((s.theme as string) === 'korti') s.theme = 'aqboken';
    s.vocab.themes = s.vocab.themes.filter((id) => THEMES.some((t) => t.id === id));
    if (!s.vocab.themes.length) s.vocab.themes = d.vocab.themes;
    s.listen.themes = s.listen.themes.filter((id) => THEMES.some((t) => t.id === id));
    if (!s.listen.themes.length) s.listen.themes = d.listen.themes;
    for (const k of ['copula', 'present', 'past', 'continuous', 'future', 'want', 'imperative', 'perfect', 'habitual', 'conditional', 'can'] as const) s[k].persons = s[k].persons.filter((p) => PERSONS.includes(p));
    return s;
  } catch {
    return d;
  }
}

export function saveSettings(s: Settings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* storage blocked: settings last for this visit only */
  }
}

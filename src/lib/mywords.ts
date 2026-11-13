/**
 * "My words": spaced repetition, opt-in (only with settings.progress on). Per word only its dictionary form, its
 * Leitner box and the dates added and next due, in this browser (localStorage `aqboken.words.v1`); never sent, and
 * deleted when progress is turned off. Right first time → next box (due after 1, 3, 7, 14, 30, then 60 days);
 * wrong → box 0, due tomorrow.
 */
export interface WordState {
  box: number;
  added: string;
  due: string;
}
export type MyWords = Record<string, WordState>;

export const INTERVALS = [1, 3, 7, 14, 30, 60];
const KEY = 'aqboken.words.v1';

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Record answers: each word moves up a box if right first time, or back to box 0. */
export function review(words: MyWords, results: { word: string; right: boolean }[], today: string): MyWords {
  const out = { ...words };
  for (const { word, right } of results) {
    const old = out[word];
    const box = right ? Math.min((old ? old.box + 1 : 1), INTERVALS.length - 1) : 0;
    out[word] = { box, added: old?.added ?? today, due: addDays(today, right ? INTERVALS[box]! : 1) };
  }
  return out;
}

/** Add words without answering them (a theme's "Add all"): due today, box 0. Words already there are kept. */
export function addWords(words: MyWords, list: string[], today: string): MyWords {
  const out = { ...words };
  for (const w of list) out[w] ??= { box: 0, added: today, due: today };
  return out;
}

/** Words due on or before today, most overdue first. */
export function dueWords(words: MyWords, today: string): string[] {
  return Object.entries(words)
    .filter(([, s]) => s.due <= today)
    .sort(([a, x], [b, y]) => x.due.localeCompare(y.due) || a.localeCompare(b))
    .map(([w]) => w);
}

export function loadWords(): MyWords {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as MyWords;
  } catch {
    return {};
  }
}
export function saveWords(w: MyWords): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(w));
  } catch {
    /* storage blocked */
  }
}
export function clearWords(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* storage blocked */
  }
}

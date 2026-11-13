/**
 * Progress, opt-in only (settings.progress, off by default): per drill, the rounds played, the last score and the date
 * last practised, kept in this browser (localStorage `korti.progress.v1`), never sent anywhere, and deleted when
 * progress is turned off. Nothing else (answers, typed text, times) is kept.
 */
import type { Mode } from './topics.ts';

export interface TopicProgress {
  rounds: number;
  last: number;
  date: string;
}
export type Progress = Partial<Record<Mode, TopicProgress>>;

const KEY = 'korti.progress.v1';

export function loadProgress(): Progress {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Progress;
  } catch {
    return {};
  }
}
export function saveProgress(p: Progress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* storage blocked */
  }
}
export function clearProgress(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* storage blocked */
  }
}
export const today = () => new Date().toISOString().slice(0, 10);
export function recordRound(p: Progress, mode: Mode, percent: number): Progress {
  const old = p[mode];
  return { ...p, [mode]: { rounds: (old?.rounds ?? 0) + 1, last: percent, date: today() } };
}

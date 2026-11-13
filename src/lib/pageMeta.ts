/** Page titles and descriptions, shared by the app (document.title) and the prerender script. */
import { themeById } from '../data/words.ts';
import { textById } from '../data/reading.ts';
import type { Route } from './router.ts';
import { topicById } from './topics.ts';

export function pageTitle(r: Route): string {
  switch (r.page) {
    case 'home':
      return 'Aqböken · Learn Kazakh';
    case 'learn':
      return r.topic && topicById(r.topic) ? `${topicById(r.topic)!.title} · Learn Kazakh · Aqböken` : 'Learn and drill · Aqböken';
    case 'drill':
      return r.mode && topicById(r.mode) ? `${topicById(r.mode)!.title} drill · Aqböken` : 'Drills · Aqböken';
    case 'vocabulary':
      return r.theme && themeById(r.theme) ? `${themeById(r.theme)!.title} · Kazakh vocabulary · Aqböken` : 'Kazakh vocabulary · Aqböken';
    case 'settings':
      return 'Settings · Aqböken';
    case 'progress':
      return 'Your progress · Aqböken';
    case 'reading':
      return r.text && textById(r.text) ? `${textById(r.text)!.title} (${textById(r.text)!.en}) · Kazakh reading · Aqböken` : 'Read Kazakh: stories with every word explained · Aqböken';
    case 'culture':
      return 'Kazakh culture: courses, podcasts, films and books · Aqböken';
    case 'search':
      return 'Search · Aqböken';
    case 'test':
      return 'Kazakh grammar test (A1–B1) · Aqböken';
    case 'start':
      return 'Start here: a beginner’s guide to Kazakh · Aqböken';
    case 'paths':
      return 'Learning paths A1–B1 · Aqböken';
    case 'about':
      return 'About and sources · Aqböken';
  }
}

/** Page titles and descriptions, shared by the app (document.title) and the prerender script. */
import { themeById } from '../data/words.ts';
import type { Route } from './router.ts';
import { topicById } from './topics.ts';

export function pageTitle(r: Route): string {
  switch (r.page) {
    case 'home':
      return 'Körti · Learn Kazakh';
    case 'learn':
      return r.topic && topicById(r.topic) ? `${topicById(r.topic)!.title} · Learn Kazakh · Körti` : 'Learn and drill · Körti';
    case 'drill':
      return r.mode && topicById(r.mode) ? `${topicById(r.mode)!.title} drill · Körti` : 'Drills · Körti';
    case 'vocabulary':
      return r.theme && themeById(r.theme) ? `${themeById(r.theme)!.title} · Kazakh vocabulary · Körti` : 'Kazakh vocabulary · Körti';
    case 'settings':
      return 'Settings · Körti';
    case 'progress':
      return 'Your progress · Körti';
    case 'about':
      return 'About and sources · Körti';
  }
}

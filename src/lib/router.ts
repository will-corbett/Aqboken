/**
 * Page addresses: real paths under SITE_BASE.
 *   /                 Home                 /learn/  /learn/<topic>/
 *   /drill/           Choose a drill       /drill/<topic>/  that drill's settings
 *   /vocabulary/      Themes               /vocabulary/<theme>/
 *   /settings/  /progress/ (opt-in, this browser only)  /about/
 */
import { SITE_BASE } from '../shared/site.ts';

export type Route =
  | { page: 'home' }
  | { page: 'learn'; topic?: string }
  | { page: 'drill'; mode?: string }
  | { page: 'vocabulary'; theme?: string }
  | { page: 'settings' }
  | { page: 'progress' }
  | { page: 'start' }
  | { page: 'test' }
  | { page: 'culture' }
  | { page: 'search' }
  | { page: 'paths' }
  | { page: 'about' };

export function parsePath(pathname: string): Route {
  if (!pathname.startsWith(SITE_BASE)) return { page: 'home' };
  const [a, b] = pathname.slice(SITE_BASE.length).split('/').filter(Boolean).map(decodeURIComponent);
  switch (a) {
    case 'learn':
      return b ? { page: 'learn', topic: b } : { page: 'learn' };
    case 'drill':
      return b ? { page: 'drill', mode: b } : { page: 'drill' };
    case 'vocabulary':
      return b ? { page: 'vocabulary', theme: b } : { page: 'vocabulary' };
    case 'settings':
      return { page: 'settings' };
    case 'progress':
      return { page: 'progress' };
    case 'start':
      return { page: 'start' };
    case 'test':
      return { page: 'test' };
    case 'culture':
      return { page: 'culture' };
    case 'search':
      return { page: 'search' };
    case 'paths':
      return { page: 'paths' };
    case 'about':
      return { page: 'about' };
    default:
      return { page: 'home' };
  }
}

export function pathOf(r: Route): string {
  switch (r.page) {
    case 'home':
      return '';
    case 'learn':
      return r.topic ? `learn/${r.topic}/` : 'learn/';
    case 'drill':
      return r.mode ? `drill/${r.mode}/` : 'drill/';
    case 'vocabulary':
      return r.theme ? `vocabulary/${r.theme}/` : 'vocabulary/';
    case 'settings':
      return 'settings/';
    case 'progress':
      return 'progress/';
    case 'start':
      return 'start/';
    case 'test':
      return 'test/';
    case 'culture':
      return 'culture/';
    case 'search':
      return 'search/';
    case 'paths':
      return 'paths/';
    case 'about':
      return 'about/';
  }
}
export const href = (r: Route): string => SITE_BASE + pathOf(r);

/** Go to a page without reloading; ?seed= (reproducible rounds) carries over unless the target has its own query. */
export function navigate(target: string, replace = false): void {
  const url = new URL(target, location.href);
  const seed = new URLSearchParams(location.search).get('seed');
  const next = url.pathname + (url.search || (seed ? `?seed=${seed}` : '')) + url.hash;
  if (replace) history.replaceState(null, '', next);
  else history.pushState(null, '', next);
  dispatchEvent(new PopStateEvent('popstate'));
}

import { useEffect, useState } from 'react';

export type ScreenId =
  | 'plan'
  | 'study'
  | 'exam'
  | 'tickets'
  | 'marathon'
  | 'mistakes'
  | 'favorites'
  | 'search'
  | 'rules'
  | 'bookmarks'
  | 'guide'
  | 'stats'
  | 'reset';

export interface Route {
  screen: ScreenId;
  param: string | null;
}

const DEFAULT: Route = { screen: 'plan', param: null };

function parse(hash: string): Route {
  const clean = hash.replace(/^#\/?/, '').trim();
  if (!clean) return DEFAULT;
  const [screen, ...rest] = clean.split('/');
  const param = rest.length ? decodeURIComponent(rest.join('/')) : null;
  const known: ScreenId[] = [
    'plan',
    'study',
    'exam',
    'tickets',
    'marathon',
    'mistakes',
    'favorites',
    'search',
    'rules',
    'bookmarks',
    'guide',
    'stats',
    'reset',
  ];
  if (known.includes(screen as ScreenId)) return { screen: screen as ScreenId, param };
  return DEFAULT;
}

export function navigate(screen: ScreenId, param?: string | null): void {
  const next = param ? `#/${screen}/${encodeURIComponent(param)}` : `#/${screen}`;
  if (window.location.hash !== next) window.location.hash = next;
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parse(window.location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parse(window.location.hash));
    window.addEventListener('hashchange', onChange);
    // нормализуем пустой hash к #/plan для предсказуемости
    if (!window.location.hash) window.location.hash = '#/plan';
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

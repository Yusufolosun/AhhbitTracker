import { useState, useEffect, useCallback } from 'react';

const ROUTES = ['dashboard', 'pool', 'create-habit', 'habits'] as const;
export type Route = (typeof ROUTES)[number];

function parseHash(): Route {
  const raw = window.location.hash.replace('#', '');
  return (ROUTES as readonly string[]).includes(raw) ? (raw as Route) : 'dashboard';
}

/**
 * Lightweight hash-based router.
 * Listens to `hashchange` and returns the current route + a navigate helper.
 */
export function useHashRoute() {
  const [route, setRoute] = useState<Route>(parseHash);

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback((target: Route) => {
    window.location.hash = target;
  }, []);

  return { route, navigate };
}

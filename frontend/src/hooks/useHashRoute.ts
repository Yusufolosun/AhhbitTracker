/**
 * @module useHashRoute
 * Lightweight hash-based routing for single-page navigation.
 */
import { useState, useEffect, useCallback } from 'react';

/** Valid route identifiers for the application. */
const ROUTES = ['dashboard', 'pool', 'create-habit', 'habits'] as const;

/** Union type of all valid routes. */
export type Route = (typeof ROUTES)[number];

/**
 * Parse the current URL hash into a valid route.
 * Falls back to 'dashboard' if the hash is unrecognized.
 *
 * @returns The parsed route
 */
function parseHash(): Route {
  // Strip any query-string portion before matching so that URLs like
  // `#habits?tab=completed` still resolve to the 'habits' route.
  const raw = window.location.hash.replace('#', '').split('?')[0];
  return (ROUTES as readonly string[]).includes(raw) ? (raw as Route) : 'dashboard';
}

/**
 * Lightweight hash-based router hook.
 *
 * Listens to `hashchange` events and provides the current route along with
 * a navigate helper function.
 *
 * @returns Object containing the current route and navigate function
 * @example
 * ```tsx
 * function App() {
 *   const { route, navigate } = useHashRoute();
 *   return (
 *     <nav>
 *       <button onClick={() => navigate('dashboard')}>Home</button>
 *       <button onClick={() => navigate('habits')}>Habits</button>
 *     </nav>
 *   );
 * }
 * ```
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

/**
 * @module useHashParam
 * Hook for reading and writing query parameters within the URL hash.
 */
import { useState, useEffect, useCallback } from 'react';

/**
 * Reads and writes a single query-string param that lives inside the URL hash.
 *
 * Useful for preserving UI state (like active tabs) in the URL without
 * affecting the main route.
 *
 * @param key - The parameter name to track
 * @param defaultValue - Value to return when parameter is not present
 * @returns Tuple of [currentValue, setterFunction]
 *
 * @example
 * ```tsx
 * // For URL: #habits?tab=completed
 * const [tab, setTab] = useHashParam('tab', 'active');
 * // tab = 'completed'
 *
 * setTab('active'); // URL becomes: #habits
 * setTab('completed'); // URL becomes: #habits?tab=completed
 * ```
 */
export function useHashParam(key: string, defaultValue: string): [string, (v: string) => void] {
  const readParam = useCallback((): string => {
    const hash = window.location.hash.replace('#', '');
    const qIndex = hash.indexOf('?');
    if (qIndex === -1) return defaultValue;
    const params = new URLSearchParams(hash.slice(qIndex + 1));
    return params.get(key) ?? defaultValue;
  }, [key, defaultValue]);

  const [value, setValue] = useState<string>(readParam);

  useEffect(() => {
    const onHashChange = () => setValue(readParam());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [readParam]);

  const setParam = useCallback(
    (newValue: string) => {
      const hash = window.location.hash.replace('#', '');
      const qIndex = hash.indexOf('?');
      const route = qIndex === -1 ? hash : hash.slice(0, qIndex);
      const params = new URLSearchParams(qIndex === -1 ? '' : hash.slice(qIndex + 1));

      if (newValue === defaultValue) {
        params.delete(key);
      } else {
        params.set(key, newValue);
      }

      const qs = params.toString();
      window.location.hash = qs ? `${route}?${qs}` : route;
    },
    [key, defaultValue],
  );

  return [value, setParam];
}

/**
 * General-purpose time formatting helpers.
 *
 * Useful for displaying timestamps and relative dates in any
 * Stacks dApp frontend.
 */

/**
 * Format a UNIX timestamp (ms) to a localised date string.
 *
 * @param timestamp - Milliseconds since epoch.
 * @param locale    - BCP-47 locale tag (default: `"en-US"`).
 * @returns E.g. `"Mar 4, 2026"`.
 */
export function formatDate(timestamp: number, locale = 'en-US'): string {
  return new Date(timestamp).toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Return a concise "time ago" string.
 *
 * @param timestamp - Milliseconds since epoch.
 * @returns E.g. `"just now"`, `"5m ago"`, `"3h ago"`, `"2d ago"`.
 */
export function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

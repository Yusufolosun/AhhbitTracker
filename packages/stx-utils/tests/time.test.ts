import { describe, it, expect, vi, afterEach } from 'vitest';
import { formatDate, timeAgo } from '../src/time';

describe('formatDate', () => {
  it('formats a timestamp to a date string', () => {
    // 2026-03-04 UTC
    const ts = new Date('2026-03-04T12:00:00Z').getTime();
    const result = formatDate(ts);
    expect(result).toContain('Mar');
    expect(result).toContain('2026');
  });
});

describe('timeAgo', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns "just now" for recent timestamps', () => {
    expect(timeAgo(Date.now() - 10_000)).toBe('just now');
  });

  it('returns minutes', () => {
    expect(timeAgo(Date.now() - 5 * 60_000)).toBe('5m ago');
  });

  it('returns hours', () => {
    expect(timeAgo(Date.now() - 3 * 3_600_000)).toBe('3h ago');
  });

  it('returns days', () => {
    expect(timeAgo(Date.now() - 2 * 86_400_000)).toBe('2d ago');
  });
});

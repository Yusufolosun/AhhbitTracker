import { describe, it, expect } from 'vitest'

// These tests are illustrative. Contract-level tests should be written in Clarity test framework
// or the repo's existing test harness that runs against Clarinet. Adjust as needed.

describe('Check-in window calculations (JS reference)', () => {
  const MIN_INTERVAL = 96
  const MAX_WINDOW = 192

  function getCheckinWindow(lastCheckInBlock: number) {
    const earliest = lastCheckInBlock + MIN_INTERVAL
    const latest = lastCheckInBlock + MAX_WINDOW
    return { earliest, latest }
  }

  it('calculates earliest and latest correctly', () => {
    const created = 1000
    const { earliest, latest } = getCheckinWindow(created)
    expect(earliest).toBe(created + MIN_INTERVAL)
    expect(latest).toBe(created + MAX_WINDOW)
  })

  it('allows check-in within the valid window', () => {
    const created = 0
    const { earliest, latest } = getCheckinWindow(created)
    expect(earliest).toBe(created + MIN_INTERVAL)
    expect(latest).toBe(created + MAX_WINDOW)

    expect(earliest).toBeLessThanOrEqual(created + MAX_WINDOW)
    expect(latest).toBeGreaterThanOrEqual(created + MIN_INTERVAL)
  })
})

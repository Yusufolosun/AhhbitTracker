import { describe, it, expect } from 'vitest'

// These tests are illustrative. Contract-level tests should be written in Clarity test framework
// or the repo's existing test harness that runs against Clarinet. Adjust as needed.

describe('Check-in window calculations (JS reference)', () => {
  const BLOCKS_PER_HOUR = 6
  const BLOCKS_PER_DAY = 144
  const EARLY_GRACE = 48
  const LATE_GRACE = 48

  function getCheckinWindow(createdAtBlock: number) {
    const nominalLatest = createdAtBlock + BLOCKS_PER_DAY
    const earliest = Math.max(0, nominalLatest - EARLY_GRACE)
    const latest = nominalLatest + LATE_GRACE
    return { earliest, latest }
  }

  it('calculates earliest and latest correctly', () => {
    const created = 1000
    const { earliest, latest } = getCheckinWindow(created)
    expect(earliest).toBe((created + BLOCKS_PER_DAY) - EARLY_GRACE)
    expect(latest).toBe((created + BLOCKS_PER_DAY) + LATE_GRACE)
  })

  it('allows check-in within grace window', () => {
    const created = 0
    const { earliest, latest } = getCheckinWindow(created)
    expect(earliest).toBe((0 + BLOCKS_PER_DAY) - EARLY_GRACE)
    expect(latest).toBe((0 + BLOCKS_PER_DAY) + LATE_GRACE)

    // within early window
    expect(earliest).toBeLessThanOrEqual((created + BLOCKS_PER_DAY) - 10)

    // within late window
    expect(latest).toBeGreaterThanOrEqual((created + BLOCKS_PER_DAY) + 10)
  })
})

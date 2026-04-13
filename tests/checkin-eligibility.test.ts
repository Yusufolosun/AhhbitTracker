import { describe, expect, it } from 'vitest';
import { evaluateDailyCheckInEligibility } from '../scripts/shared/checkin-eligibility.ts';

describe('evaluateDailyCheckInEligibility', () => {
  it('returns eligible when block is within the valid daily window', () => {
    const result = evaluateDailyCheckInEligibility(
      {
        isActive: true,
        isCompleted: false,
        lastCheckInBlock: 1000,
      },
      1125,
    );

    expect(result.eligible).toBe(true);
    expect(result.reason).toBe('eligible');
    expect(result.blocksElapsed).toBe(125);
  });

  it('returns too-early before minimum interval', () => {
    const result = evaluateDailyCheckInEligibility(
      {
        isActive: true,
        isCompleted: false,
        lastCheckInBlock: 1000,
      },
      1100,
    );

    expect(result.eligible).toBe(false);
    expect(result.reason).toBe('too-early');
    expect(result.blocksUntilEligible).toBe(20);
  });

  it('returns window-expired after check-in window', () => {
    const result = evaluateDailyCheckInEligibility(
      {
        isActive: true,
        isCompleted: false,
        lastCheckInBlock: 1000,
      },
      1145,
    );

    expect(result.eligible).toBe(false);
    expect(result.reason).toBe('window-expired');
  });

  it('returns completed when habit is completed', () => {
    const result = evaluateDailyCheckInEligibility(
      {
        isActive: true,
        isCompleted: true,
        lastCheckInBlock: 1000,
      },
      1125,
    );

    expect(result.eligible).toBe(false);
    expect(result.reason).toBe('completed');
  });

  it('returns inactive when habit is inactive', () => {
    const result = evaluateDailyCheckInEligibility(
      {
        isActive: false,
        isCompleted: false,
        lastCheckInBlock: 1000,
      },
      1125,
    );

    expect(result.eligible).toBe(false);
    expect(result.reason).toBe('inactive');
  });

  it('guards against invalid block height regressions', () => {
    const result = evaluateDailyCheckInEligibility(
      {
        isActive: true,
        isCompleted: false,
        lastCheckInBlock: 2000,
      },
      1999,
    );

    expect(result.eligible).toBe(false);
    expect(result.reason).toBe('invalid-block-height');
  });
});

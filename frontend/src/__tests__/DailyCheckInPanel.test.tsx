import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DailyCheckInPanel } from '../components/DailyCheckInPanel';
import type { Habit } from '../types/habit';

const baseHabit: Habit = {
  habitId: 1,
  name: 'Morning Run',
  owner: 'SP2ABC123',
  stakeAmount: 1_000_000,
  lastCheckInBlock: 80,
  createdAtBlock: 50,
  currentStreak: 4,
  isActive: true,
  isCompleted: false,
  bonusClaimed: false,
};

describe('DailyCheckInPanel', () => {
  it('disables the action when no habits are eligible', () => {
    const notify = vi.fn();
    const runDailyCheckIn = vi.fn();
    const habit = { ...baseHabit, lastCheckInBlock: 190 };

    render(
      <DailyCheckInPanel
        habits={[habit]}
        currentBlock={200}
        isRunningDailyCheckIn={false}
        runDailyCheckIn={runDailyCheckIn}
        notify={notify}
      />,
    );

    expect(screen.getByRole('button', { name: 'Run Daily Check-In' })).toBeDisabled();
    expect(runDailyCheckIn).not.toHaveBeenCalled();
    expect(notify).not.toHaveBeenCalled();
  });

  it('submits eligible habits and reports success and failure', async () => {
    const notify = vi.fn();
    const runDailyCheckIn = vi.fn().mockResolvedValue({
      attempted: 2,
      submitted: 1,
      failed: 1,
      entries: [
        { habitId: 1, txId: 'tx-1' },
        { habitId: 2, error: 'Network error' },
      ],
    });

    const habits = [
      { ...baseHabit, habitId: 1, lastCheckInBlock: 70 },
      { ...baseHabit, habitId: 2, lastCheckInBlock: 60 },
    ];

    render(
      <DailyCheckInPanel
        habits={habits}
        currentBlock={200}
        isRunningDailyCheckIn={false}
        runDailyCheckIn={runDailyCheckIn}
        notify={notify}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Run Daily Check-In' }));

    await waitFor(() => {
      expect(runDailyCheckIn).toHaveBeenCalledWith([1, 2]);
    });

    expect(notify).toHaveBeenCalledWith('Submitted 1 check-in transaction(s).', 'success');
    expect(notify).toHaveBeenCalledWith('1 check-in(s) failed. Network error', 'error');
  });
});

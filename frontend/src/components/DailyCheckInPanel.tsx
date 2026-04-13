import { useMemo, useState } from 'react';
import { Habit } from '../types/habit';
import { useToast } from '../context/ToastContext';
import {
  getEligibleDailyCheckInHabitIds,
  getCheckInWindowState,
} from '../utils/habitStatus';
import type { DailyCheckInResult } from '../hooks/useHabits';

interface DailyCheckInPanelProps {
  habits: Habit[];
  currentBlock: number | null;
  isRunningDailyCheckIn: boolean;
  runDailyCheckIn: (habitIds: number[]) => Promise<DailyCheckInResult>;
}

export function DailyCheckInPanel({
  habits,
  currentBlock,
  isRunningDailyCheckIn,
  runDailyCheckIn,
}: DailyCheckInPanelProps) {
  const { showToast } = useToast();
  const [lastResult, setLastResult] = useState<DailyCheckInResult | null>(null);

  const eligibleHabitIds = useMemo(
    () => getEligibleDailyCheckInHabitIds(habits, currentBlock),
    [habits, currentBlock],
  );

  const urgentCount = useMemo(
    () => habits.filter((habit) => getCheckInWindowState(habit, currentBlock) === 'urgent').length,
    [habits, currentBlock],
  );

  if (habits.length === 0) {
    return null;
  }

  const handleDailyCheckIn = async () => {
    if (eligibleHabitIds.length === 0) {
      showToast('No habits are currently eligible for check-in.', 'info');
      return;
    }

    const result = await runDailyCheckIn(eligibleHabitIds);
    setLastResult(result);

    if (result.submitted > 0) {
      showToast(`Submitted ${result.submitted} check-in transaction(s).`, 'success');
    }

    if (result.failed > 0) {
      const firstError = result.entries.find((entry) => entry.error)?.error;
      showToast(
        firstError
          ? `${result.failed} check-in(s) failed. ${firstError}`
          : `${result.failed} check-in transaction(s) failed.`,
        'error',
      );
    }
  };

  return (
    <div className="card bg-primary-50 border-primary-200 dark:bg-primary-500/10 dark:border-primary-500/20">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white">Daily Check-In</h3>
          <p className="text-sm text-surface-600 dark:text-surface-300">
            {eligibleHabitIds.length} habit{eligibleHabitIds.length !== 1 ? 's are' : ' is'} ready now
            {urgentCount > 0 ? ` · ${urgentCount} expiring soon` : ''}
          </p>
        </div>

        <button
          type="button"
          onClick={handleDailyCheckIn}
          disabled={isRunningDailyCheckIn || eligibleHabitIds.length === 0}
          className="btn-primary"
        >
          {isRunningDailyCheckIn ? 'Submitting Daily Check-Ins...' : 'Run Daily Check-In'}
        </button>
      </div>

      {lastResult ? (
        <p className="mt-3 text-xs text-surface-600 dark:text-surface-300">
          Last run: attempted {lastResult.attempted}, submitted {lastResult.submitted}, failed {lastResult.failed}.
        </p>
      ) : null}
    </div>
  );
}

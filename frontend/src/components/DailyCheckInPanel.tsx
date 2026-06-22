import { useMemo, useState } from 'react';
import { Habit } from '../types/habit';
import { getEligibleDailyCheckInHabitIds, getCheckInWindowState } from '../utils/habitStatus';
import type { DailyCheckInResult } from '../hooks/useHabits';

type NotificationLevel = 'success' | 'error' | 'info';

interface DailyCheckInPanelProps {
  habits: Habit[];
  currentBlock: number | null;
  isRunningDailyCheckIn: boolean;
  runDailyCheckIn: (habitIds: number[]) => Promise<DailyCheckInResult>;
  notify?: (message: string, level: NotificationLevel) => void;
}

export function DailyCheckInPanel({
  habits,
  currentBlock,
  isRunningDailyCheckIn,
  runDailyCheckIn,
  notify,
}: DailyCheckInPanelProps) {
  const [lastResult, setLastResult] = useState<DailyCheckInResult | null>(null);

  const eligibleHabitIds = useMemo(
    () => getEligibleDailyCheckInHabitIds(habits, currentBlock),
    [habits, currentBlock],
  );

  const urgentCount = useMemo(
    () => habits.filter((h) => getCheckInWindowState(h, currentBlock) === 'urgent').length,
    [habits, currentBlock],
  );

  if (habits.length === 0) return null;

  const hasEligible = eligibleHabitIds.length > 0;
  const isUrgent = urgentCount > 0;

  const handleDailyCheckIn = async () => {
    if (!hasEligible) {
      notify?.('No habits are currently eligible for check-in.', 'info');
      return;
    }
    const result = await runDailyCheckIn(eligibleHabitIds);
    setLastResult(result);
    if (result.submitted > 0) {
      notify?.(`Submitted ${result.submitted} check-in transaction(s).`, 'success');
    }
    if (result.failed > 0) {
      const firstError = result.entries.find((e) => e.error)?.error;
      notify?.(
        firstError
          ? `${result.failed} check-in(s) failed. ${firstError}`
          : `${result.failed} check-in transaction(s) failed.`,
        'error',
      );
    }
  };

  return (
    <div
      className={[
        'relative overflow-hidden rounded-2xl border p-5 transition-all duration-300',
        isUrgent
          ? 'bg-amber-50 border-amber-300 dark:bg-amber-500/10 dark:border-amber-500/30 animate-glow-amber'
          : hasEligible
            ? 'bg-primary-50 border-primary-200 dark:bg-primary-500/10 dark:border-primary-500/20'
            : 'bg-surface-50 border-surface-200 dark:bg-surface-800/50 dark:border-surface-700',
      ].join(' ')}
    >
      {/* Urgency glow blob */}
      {isUrgent && (
        <div className="absolute -top-4 -right-4 w-20 h-20 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
      )}

      <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${isUrgent ? 'bg-amber-100 dark:bg-amber-500/20' : hasEligible ? 'bg-primary-100 dark:bg-primary-500/20' : 'bg-surface-200 dark:bg-surface-700'}`}>
            <svg className={`w-5 h-5 ${isUrgent ? 'text-amber-600 dark:text-amber-400' : hasEligible ? 'text-primary-500' : 'text-surface-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <div>
            <h3 className="text-base font-bold text-surface-900 dark:text-white">Daily Check-In</h3>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {hasEligible && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-300">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse" />
                  {eligibleHabitIds.length} ready now
                </span>
              )}
              {isUrgent && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400">
                  ⚠ {urgentCount} expiring soon
                </span>
              )}
              {!hasEligible && (
                <span className="text-xs text-surface-500 dark:text-surface-400">
                  No habits ready right now — check back later.
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDailyCheckIn}
          disabled={isRunningDailyCheckIn || !hasEligible}
          className={[
            'btn-primary flex-shrink-0 md:w-auto w-full',
            hasEligible && !isRunningDailyCheckIn ? 'animate-bounce-subtle' : '',
          ].join(' ')}
        >
          {isRunningDailyCheckIn ? (
            <span className="flex items-center justify-center gap-2">
              <span className="spinner" style={{ width: 16, height: 16 }} />
              Submitting…
            </span>
          ) : (
            'Check In All Eligible'
          )}
        </button>
      </div>

      {lastResult && (
        <p className="mt-3 text-xs text-surface-500 dark:text-surface-400 border-t border-surface-200 dark:border-surface-700 pt-3">
          Last run: attempted {lastResult.attempted} · submitted {lastResult.submitted} · failed {lastResult.failed}
        </p>
      )}
    </div>
  );
}

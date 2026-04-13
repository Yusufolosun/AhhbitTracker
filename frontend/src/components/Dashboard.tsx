import { useMemo } from 'react';
import { Habit } from '../types/habit';
import { StatsCard } from './StatsCard';
import { formatSTX } from '../utils/formatting';
import { useCurrentBlock } from '../hooks/useCurrentBlock';
import { getCheckInWindowState, isEligibleToWithdraw } from '../utils/habitStatus';
import { DailyCheckInPanel } from './DailyCheckInPanel';
import type { DailyCheckInResult } from '../hooks/useHabits';

interface DashboardProps {
  habits: Habit[];
  isRunningDailyCheckIn?: boolean;
  runDailyCheckIn?: (habitIds: number[]) => Promise<DailyCheckInResult>;
  notify?: (message: string, level: 'success' | 'error' | 'info') => void;
}

export function Dashboard({
  habits,
  isRunningDailyCheckIn = false,
  runDailyCheckIn = async () => ({
    attempted: 0,
    submitted: 0,
    failed: 0,
    entries: [],
  }),
  notify,
}: DashboardProps) {
  const currentBlock = useCurrentBlock();

  const stats = useMemo(() => {
    const expiredCount = habits.filter(
      h => getCheckInWindowState(h, currentBlock) === 'expired'
    ).length;
    const expiredStake = habits
      .filter(h => getCheckInWindowState(h, currentBlock) === 'expired')
      .reduce((sum, h) => sum + h.stakeAmount, 0);

    const onChainActive = habits.filter(h => h.isActive).length;
    const activeCount = onChainActive - expiredCount;

    const completedCount = habits.filter(h => h.isCompleted).length;
    const activeHabits = habits.filter(
      h => h.isActive && getCheckInWindowState(h, currentBlock) !== 'expired'
    );
    const totalStaked = activeHabits.reduce((sum, h) => sum + h.stakeAmount, 0);
    const totalStreak = activeHabits.reduce((sum, h) => sum + h.currentStreak, 0);
    const avgStreak = activeCount > 0 ? (totalStreak / activeCount).toFixed(1) : '0';
    const withdrawReady = habits.filter(h => isEligibleToWithdraw(h)).length;

    return {
      total: habits.length,
      active: activeCount,
      completed: completedCount,
      totalStaked,
      avgStreak,
      expiredCount,
      expiredStake,
      withdrawReady,
    };
  }, [habits, currentBlock]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">Dashboard</h2>
        <p className="text-surface-600 dark:text-surface-400">Track your habit-building progress</p>
      </div>

      <DailyCheckInPanel
        habits={habits}
        currentBlock={currentBlock}
        isRunningDailyCheckIn={isRunningDailyCheckIn}
        runDailyCheckIn={runDailyCheckIn}
        notify={notify}
      />

      {/* Empty state — first-time user onboarding */}
      {habits.length === 0 ? (
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-surface-800 dark:text-white mb-2">No habits yet</h3>
          <p className="text-surface-500 dark:text-surface-400 max-w-md mx-auto">
            Create your first on-chain habit below. Stake STX, check in daily, and earn
            rewards from the forfeited pool when you stay consistent.
          </p>
          <a
            href="#create-habit"
            className="inline-block mt-6 btn-primary"
          >
            Create Your First Habit
          </a>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Habits"
          value={stats.total}
          icon={
            <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />

        <StatsCard
          title="Active Habits"
          value={stats.active}
          subtitle={
            stats.expiredCount > 0
              ? `${stats.expiredCount} expired`
              : stats.active > 0
                ? 'Keep it up!'
                : 'Create a habit'
          }
          trend={stats.expiredCount > 0 ? 'down' : stats.active > 0 ? 'up' : 'neutral'}
          icon={
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <StatsCard
          title="Total Staked"
          value={`${formatSTX(stats.totalStaked)} STX`}
          subtitle={stats.expiredCount > 0 ? 'Excludes expired habits' : 'In active habits'}
          icon={
            <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <StatsCard
          title="Avg. Streak"
          value={`${stats.avgStreak} days`}
          subtitle={stats.expiredCount > 0 ? 'Excludes expired habits' : 'Across active habits'}
          icon={
            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            </svg>
          }
        />
      </div>

      {/* Expired window alert */}
      {stats.expiredCount > 0 && (
        <div className="card bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/20">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-red-900 dark:text-red-300">
                {stats.expiredCount} habit{stats.expiredCount > 1 ? 's have' : ' has'} an expired check-in window
              </p>
              <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                {formatSTX(stats.expiredStake)} STX at risk of forfeiture. These habits are no longer counted as active.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal ready alert */}
      {stats.withdrawReady > 0 && (
        <div className="card bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-emerald-900 dark:text-emerald-300">
                {stats.withdrawReady} habit{stats.withdrawReady > 1 ? 's are' : ' is'} ready to withdraw
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                You've reached 7+ consecutive check-ins. Withdraw your stake to complete the habit.
              </p>
            </div>
          </div>
        </div>
      )}

      {stats.completed > 0 && (
        <div className="card bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-emerald-900 dark:text-emerald-300">
                Congratulations! You've completed {stats.completed} habit{stats.completed > 1 ? 's' : ''}!
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                Don't forget to claim your bonuses from the forfeited pool.
              </p>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}

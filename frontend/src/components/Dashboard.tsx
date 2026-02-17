import { useMemo } from 'react';
import { Habit } from '../types/habit';
import { StatsCard } from './StatsCard';
import { formatSTX } from '../utils/formatting';

interface DashboardProps {
  habits: Habit[];
}

export function Dashboard({ habits }: DashboardProps) {
  const stats = useMemo(() => {
    const activeCount = habits.filter(h => h.isActive).length;
    const completedCount = habits.filter(h => h.isCompleted).length;
    const totalStaked = habits
      .filter(h => h.isActive)
      .reduce((sum, h) => sum + h.stakeAmount, 0);
    const totalStreak = habits
      .filter(h => h.isActive)
      .reduce((sum, h) => sum + h.currentStreak, 0);
    const avgStreak = activeCount > 0 ? (totalStreak / activeCount).toFixed(1) : '0';

    return {
      total: habits.length,
      active: activeCount,
      completed: completedCount,
      totalStaked,
      avgStreak,
    };
  }, [habits]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">Track your habit-building progress</p>
      </div>

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
          subtitle={stats.active > 0 ? 'Keep it up!' : 'Create a habit'}
          trend={stats.active > 0 ? 'up' : 'neutral'}
          icon={
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <StatsCard
          title="Total Staked"
          value={`${formatSTX(stats.totalStaked)} STX`}
          subtitle="In active habits"
          icon={
            <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <StatsCard
          title="Avg. Streak"
          value={`${stats.avgStreak} days`}
          subtitle="Across active habits"
          icon={
            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            </svg>
          }
        />
      </div>

      {stats.completed > 0 && (
        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-900">
                Congratulations! You've completed {stats.completed} habit{stats.completed > 1 ? 's' : ''}!
              </p>
              <p className="text-xs text-green-700 mt-1">
                Don't forget to claim your bonuses from the forfeited pool.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

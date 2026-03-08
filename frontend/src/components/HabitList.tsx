import { Habit } from '../types/habit';
import { HabitCard } from './HabitCard';
import { HabitListSkeleton } from './Skeletons';
import { useCurrentBlock } from '../hooks/useCurrentBlock';
import { getCheckInWindowState } from '../utils/habitStatus';

interface HabitListProps {
  habits: Habit[];
  loading: boolean;
}

export function HabitList({ habits, loading }: HabitListProps) {
  if (loading) {
    return <HabitListSkeleton />;
  }

  if (habits.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="w-16 h-16 bg-surface-100 dark:bg-surface-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-surface-900 dark:text-white mb-2">
          No habits yet
        </h3>
        <p className="text-surface-600 dark:text-surface-400 mb-4">
          Create your first habit to start tracking your progress
        </p>
      </div>
    );
  }

  // Separate active and inactive habits
  const activeHabits = habits.filter(h => h.isActive);
  const completedHabits = habits.filter(h => h.isCompleted);
  const inactiveHabits = habits.filter(h => !h.isActive && !h.isCompleted);

  // Sub-group active habits by urgency
  const currentBlock = useCurrentBlock();
  const expiredHabits = activeHabits.filter(
    h => getCheckInWindowState(h, currentBlock) === 'expired'
  );
  const urgentHabits = activeHabits.filter(
    h => getCheckInWindowState(h, currentBlock) === 'urgent'
  );
  const healthyHabits = activeHabits.filter(h => {
    const state = getCheckInWindowState(h, currentBlock);
    return state !== 'expired' && state !== 'urgent';
  });

  return (
    <div className="space-y-6">
      {/* Expired Habits — needs immediate attention */}
      {expiredHabits.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-4">
            Window Expired ({expiredHabits.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {expiredHabits.map((habit) => (
              <HabitCard key={habit.habitId} habit={habit} />
            ))}
          </div>
        </div>
      )}

      {/* Urgent Habits — window closing soon */}
      {urgentHabits.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-400 mb-4">
            Expiring Soon ({urgentHabits.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {urgentHabits.map((habit) => (
              <HabitCard key={habit.habitId} habit={habit} />
            ))}
          </div>
        </div>
      )}

      {/* Healthy Active Habits */}
      {healthyHabits.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
            Active Habits ({healthyHabits.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {healthyHabits.map((habit) => (
              <HabitCard key={habit.habitId} habit={habit} />
            ))}
          </div>
        </div>
      )}

      {/* Completed Habits */}
      {completedHabits.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
            Completed Habits ({completedHabits.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedHabits.map((habit) => (
              <HabitCard key={habit.habitId} habit={habit} />
            ))}
          </div>
        </div>
      )}

      {/* Inactive Habits */}
      {inactiveHabits.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
            Forfeited Habits ({inactiveHabits.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
            {inactiveHabits.map((habit) => (
              <HabitCard key={habit.habitId} habit={habit} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { Habit } from '../types/habit';
import { HabitCard } from './HabitCard';
import { ErrorBoundary, HabitCardErrorFallback } from './ErrorBoundary';
import { HabitListSkeleton } from './Skeletons';
import { useCurrentBlock } from '../hooks/useCurrentBlock';
import { useHashParam } from '../hooks/useHashParam';
import { getCheckInWindowState } from '../utils/habitStatus';

type Tab = 'active' | 'completed' | 'all';

const TABS: { id: Tab; label: string }[] = [
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
  { id: 'all', label: 'All' },
];

interface HabitListProps {
  habits: Habit[];
  loading: boolean;
}

export function HabitList({ habits, loading }: HabitListProps) {
  // Hooks must be called unconditionally — keep them above all early returns
  // to satisfy the Rules of Hooks (see #124).
  const [tab, setTab] = useHashParam('tab', 'active') as [Tab, (v: Tab) => void];
  const currentBlock = useCurrentBlock();

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

  // Separate habits by status
  const activeHabits = habits.filter(h => h.isActive);
  const completedHabits = habits.filter(h => h.isCompleted);
  const inactiveHabits = habits.filter(h => !h.isActive && !h.isCompleted);

  // Sub-group active habits by urgency
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

  const activeCount = activeHabits.length;
  const completedCount = completedHabits.length + inactiveHabits.length;

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-surface-200 dark:border-surface-700" role="tablist" aria-label="Habit filter">
        {TABS.map(({ id, label }) => {
          const count =
            id === 'active' ? activeCount :
            id === 'completed' ? completedCount :
            habits.length;
          const isSelected = tab === id;
          return (
            <button
              key={id}
              role="tab"
              aria-selected={isSelected}
              onClick={() => setTab(id)}
              className={[
                'px-4 py-2 text-sm font-medium rounded-t transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                isSelected
                  ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10'
                  : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800',
              ].join(' ')}
            >
              {label}
              <span className="ml-1.5 text-xs tabular-nums opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Active tab */}
      {tab === 'active' && (
        <>
          {expiredHabits.length === 0 && urgentHabits.length === 0 && healthyHabits.length === 0 && (
            <p className="text-surface-500 dark:text-surface-400 text-sm text-center py-8">
              No active habits. Head over to <strong>Create Habit</strong> to get started.
            </p>
          )}

          {expiredHabits.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-4">
                Window Expired ({expiredHabits.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {expiredHabits.map((habit) => (
                  <ErrorBoundary key={habit.habitId} fallback={<HabitCardErrorFallback habitId={habit.habitId} />}>
                    <HabitCard habit={habit} />
                  </ErrorBoundary>
                ))}
              </div>
            </div>
          )}

          {urgentHabits.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-400 mb-4">
                Expiring Soon ({urgentHabits.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {urgentHabits.map((habit) => (
                  <ErrorBoundary key={habit.habitId} fallback={<HabitCardErrorFallback habitId={habit.habitId} />}>
                    <HabitCard habit={habit} />
                  </ErrorBoundary>
                ))}
              </div>
            </div>
          )}

          {healthyHabits.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
                Active Habits ({healthyHabits.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {healthyHabits.map((habit) => (
                  <ErrorBoundary key={habit.habitId} fallback={<HabitCardErrorFallback habitId={habit.habitId} />}>
                    <HabitCard habit={habit} />
                  </ErrorBoundary>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Completed tab */}
      {tab === 'completed' && (
        <>
          {completedHabits.length === 0 && inactiveHabits.length === 0 && (
            <p className="text-surface-500 dark:text-surface-400 text-sm text-center py-8">
              No completed habits yet — keep going!
            </p>
          )}

          {completedHabits.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
                Completed ({completedHabits.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedHabits.map((habit) => (
                  <ErrorBoundary key={habit.habitId} fallback={<HabitCardErrorFallback habitId={habit.habitId} />}>
                    <HabitCard habit={habit} />
                  </ErrorBoundary>
                ))}
              </div>
            </div>
          )}

          {inactiveHabits.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
                Forfeited ({inactiveHabits.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
                {inactiveHabits.map((habit) => (
                  <ErrorBoundary key={habit.habitId} fallback={<HabitCardErrorFallback habitId={habit.habitId} />}>
                    <HabitCard habit={habit} />
                  </ErrorBoundary>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* All tab */}
      {tab === 'all' && (
        <>
          {expiredHabits.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-4">
                Window Expired ({expiredHabits.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {expiredHabits.map((habit) => (
                  <ErrorBoundary key={habit.habitId} fallback={<HabitCardErrorFallback habitId={habit.habitId} />}>
                    <HabitCard habit={habit} />
                  </ErrorBoundary>
                ))}
              </div>
            </div>
          )}

          {urgentHabits.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-400 mb-4">
                Expiring Soon ({urgentHabits.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {urgentHabits.map((habit) => (
                  <ErrorBoundary key={habit.habitId} fallback={<HabitCardErrorFallback habitId={habit.habitId} />}>
                    <HabitCard habit={habit} />
                  </ErrorBoundary>
                ))}
              </div>
            </div>
          )}

          {healthyHabits.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
                Active ({healthyHabits.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {healthyHabits.map((habit) => (
                  <ErrorBoundary key={habit.habitId} fallback={<HabitCardErrorFallback habitId={habit.habitId} />}>
                    <HabitCard habit={habit} />
                  </ErrorBoundary>
                ))}
              </div>
            </div>
          )}

          {completedHabits.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
                Completed ({completedHabits.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedHabits.map((habit) => (
                  <ErrorBoundary key={habit.habitId} fallback={<HabitCardErrorFallback habitId={habit.habitId} />}>
                    <HabitCard habit={habit} />
                  </ErrorBoundary>
                ))}
              </div>
            </div>
          )}

          {inactiveHabits.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
                Forfeited ({inactiveHabits.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
                {inactiveHabits.map((habit) => (
                  <ErrorBoundary key={habit.habitId} fallback={<HabitCardErrorFallback habitId={habit.habitId} />}>
                    <HabitCard habit={habit} />
                  </ErrorBoundary>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

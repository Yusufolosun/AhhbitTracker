import { Habit } from '../types/habit';
import { HabitCard } from './HabitCard';
import { ErrorBoundary, HabitCardErrorFallback } from './ErrorBoundary';
import { HabitListSkeleton } from './Skeletons';
import { useCurrentBlock } from '../hooks/useCurrentBlock';
import { useHashParam } from '../hooks/useHashParam';
import { getCheckInWindowState } from '../utils/habitStatus';
import { EmptyStateCard } from './ui';

type Tab = 'active' | 'completed' | 'all';

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'active',    label: 'Active',    emoji: '⚡' },
  { id: 'completed', label: 'Completed', emoji: '✅' },
  { id: 'all',       label: 'All',       emoji: '📋' },
];

interface HabitListProps {
  habits: Habit[];
  loading: boolean;
}

function HabitGroup({ title, habits, colorClass }: { title: string; habits: Habit[]; colorClass?: string }) {
  return (
    <div>
      <div className={`flex items-center gap-2 mb-4 pl-3 border-l-2 ${colorClass ?? 'border-surface-300 dark:border-surface-600'}`}>
        <h3 className="text-sm font-bold text-surface-700 dark:text-surface-300 uppercase tracking-widest">
          {title}
        </h3>
        <span className="text-xs text-surface-500 dark:text-surface-400 font-mono bg-surface-100 dark:bg-surface-800 px-2 py-0.5 rounded-full">
          {habits.length}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {habits.map((habit) => (
          <ErrorBoundary key={habit.habitId} fallback={<HabitCardErrorFallback habitId={habit.habitId} />}>
            <HabitCard habit={habit} />
          </ErrorBoundary>
        ))}
      </div>
    </div>
  );
}

export function HabitList({ habits, loading }: HabitListProps) {
  const [tab, setTab] = useHashParam('tab', 'active') as [Tab, (v: Tab) => void];
  const currentBlock = useCurrentBlock();

  if (loading) return <HabitListSkeleton />;

  if (habits.length === 0) {
    return (
      <EmptyStateCard
        title="No habits yet"
        description="Create your first habit to start tracking your progress"
        icon={
          <svg className="w-10 h-10 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        }
      />
    );
  }

  const activeHabits    = habits.filter((h) => h.isActive);
  const completedHabits = habits.filter((h) => h.isCompleted);
  const inactiveHabits  = habits.filter((h) => !h.isActive && !h.isCompleted);

  const expiredHabits = activeHabits.filter((h) => getCheckInWindowState(h, currentBlock) === 'expired');
  const urgentHabits  = activeHabits.filter((h) => getCheckInWindowState(h, currentBlock) === 'urgent');
  const healthyHabits = activeHabits.filter((h) => {
    const s = getCheckInWindowState(h, currentBlock);
    return s !== 'expired' && s !== 'urgent';
  });

  const activeCount    = activeHabits.length;
  const completedCount = completedHabits.length + inactiveHabits.length;

  return (
    <div className="space-y-8">
      {/* ── Pill Tab Bar ── */}
      <div
        className="flex gap-1.5 p-1 bg-surface-100 dark:bg-surface-800 rounded-2xl w-fit"
        role="tablist"
        aria-label="Habit filter"
      >
        {TABS.map(({ id, label, emoji }) => {
          const count    = id === 'active' ? activeCount : id === 'completed' ? completedCount : habits.length;
          const isActive = tab === id;
          return (
            <button
              key={id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setTab(id)}
              className={[
                'flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                isActive
                  ? 'bg-white dark:bg-surface-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white',
              ].join(' ')}
            >
              <span className="text-base leading-none">{emoji}</span>
              {label}
              <span className="text-xs tabular-nums opacity-70 bg-surface-100 dark:bg-surface-600 rounded-full px-1.5 py-0.5">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Active tab ── */}
      {tab === 'active' && (
        <div className="space-y-8">
          {expiredHabits.length === 0 && urgentHabits.length === 0 && healthyHabits.length === 0 && (
            <p className="text-surface-500 dark:text-surface-400 text-sm text-center py-12">
              No active habits. Head to <strong>New Habit</strong> to get started.
            </p>
          )}
          {expiredHabits.length > 0 && <HabitGroup title="Window Expired" habits={expiredHabits} colorClass="border-red-400 dark:border-red-500" />}
          {urgentHabits.length > 0  && <HabitGroup title="Expiring Soon"   habits={urgentHabits}  colorClass="border-amber-400 dark:border-amber-500" />}
          {healthyHabits.length > 0 && <HabitGroup title="Active"          habits={healthyHabits} colorClass="border-emerald-400 dark:border-emerald-500" />}
        </div>
      )}

      {/* ── Completed tab ── */}
      {tab === 'completed' && (
        <div className="space-y-8">
          {completedHabits.length === 0 && inactiveHabits.length === 0 && (
            <p className="text-surface-500 dark:text-surface-400 text-sm text-center py-12">
              No completed habits yet — keep going!
            </p>
          )}
          {completedHabits.length > 0 && <HabitGroup title="Completed" habits={completedHabits} colorClass="border-blue-400 dark:border-blue-500" />}
          {inactiveHabits.length > 0  && (
            <div className="opacity-60">
              <HabitGroup title="Forfeited" habits={inactiveHabits} colorClass="border-surface-400" />
            </div>
          )}
        </div>
      )}

      {/* ── All tab ── */}
      {tab === 'all' && (
        <div className="space-y-8">
          {expiredHabits.length > 0   && <HabitGroup title="Window Expired" habits={expiredHabits}   colorClass="border-red-400 dark:border-red-500" />}
          {urgentHabits.length > 0    && <HabitGroup title="Expiring Soon"   habits={urgentHabits}   colorClass="border-amber-400 dark:border-amber-500" />}
          {healthyHabits.length > 0   && <HabitGroup title="Active"          habits={healthyHabits}  colorClass="border-emerald-400 dark:border-emerald-500" />}
          {completedHabits.length > 0 && <HabitGroup title="Completed"       habits={completedHabits} colorClass="border-blue-400 dark:border-blue-500" />}
          {inactiveHabits.length > 0  && (
            <div className="opacity-60">
              <HabitGroup title="Forfeited" habits={inactiveHabits} colorClass="border-surface-400" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

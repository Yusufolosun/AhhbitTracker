import { Habit } from '../types/habit';
import { HabitCard } from './HabitCard';

interface HabitListProps {
  habits: Habit[];
  loading: boolean;
}

export function HabitList({ habits, loading }: HabitListProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="spinner w-12 h-12"></div>
      </div>
    );
  }

  if (habits.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No habits yet
        </h3>
        <p className="text-gray-600 mb-4">
          Create your first habit to start tracking your progress
        </p>
      </div>
    );
  }

  // Separate active and inactive habits
  const activeHabits = habits.filter(h => h.isActive);
  const completedHabits = habits.filter(h => h.isCompleted);
  const inactiveHabits = habits.filter(h => !h.isActive && !h.isCompleted);

  return (
    <div className="space-y-6">
      {/* Active Habits */}
      {activeHabits.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Active Habits ({activeHabits.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeHabits.map((habit) => (
              <HabitCard key={habit.habitId} habit={habit} />
            ))}
          </div>
        </div>
      )}

      {/* Completed Habits */}
      {completedHabits.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
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

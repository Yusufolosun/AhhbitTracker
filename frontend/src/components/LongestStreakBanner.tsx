interface LongestStreakBannerProps {
  longestStreak: number;
  habitName?: string;
  hasHabits: boolean;
  isLoading: boolean;
}

export function LongestStreakBanner({
  longestStreak,
  habitName,
  hasHabits,
  isLoading,
}: LongestStreakBannerProps) {
  if (isLoading) {
    return (
      <section className="rounded-2xl border border-primary-200 dark:border-primary-500/20 bg-white dark:bg-surface-900 p-4 sm:p-5 animate-pulse">
        <div className="h-4 w-40 bg-surface-200 dark:bg-surface-700 rounded" />
        <div className="mt-3 h-10 w-32 bg-surface-200 dark:bg-surface-700 rounded" />
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-primary-200 dark:border-primary-500/20 bg-gradient-to-r from-primary-50 to-amber-50 dark:from-primary-500/10 dark:to-amber-500/10 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs sm:text-sm font-semibold tracking-wide uppercase text-primary-700 dark:text-primary-300">
            Longest Streak
          </p>
          <p className="mt-1 text-3xl sm:text-4xl font-bold text-surface-900 dark:text-white">
            {longestStreak} day{longestStreak === 1 ? '' : 's'}
          </p>
          {hasHabits ? (
            <p className="mt-1 text-sm text-surface-700 dark:text-surface-300">
              {habitName ? `Best run: ${habitName}` : 'Keep building momentum.'}
            </p>
          ) : (
            <p className="mt-1 text-sm text-surface-700 dark:text-surface-300">
              Create your first habit to start your streak.
            </p>
          )}
        </div>

        <div className="w-12 h-12 rounded-xl bg-white/70 dark:bg-surface-800/80 border border-primary-200 dark:border-primary-500/20 flex items-center justify-center">
          <svg className="w-6 h-6 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3l2.4 4.86 5.36.78-3.88 3.78.92 5.34L12 15.77 7.2 17.76l.92-5.34L4.24 8.64l5.36-.78L12 3z"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
import { SurfaceCard } from './ui';

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
      <div className="rounded-2xl border border-surface-200 dark:border-surface-700 p-6 shimmer-bg h-24" />
    );
  }

  const hasStreak = longestStreak > 0;
  const isHot = longestStreak >= 7;

  return (
    <div
      className={[
        'relative overflow-hidden rounded-2xl border p-5 sm:p-6',
        isHot
          ? 'bg-gradient-to-br from-primary-500/15 via-amber-500/10 to-primary-500/5 border-primary-300 dark:border-primary-500/30 animate-glow-pulse'
          : 'bg-gradient-to-br from-primary-50 to-amber-50 dark:from-primary-500/10 dark:to-amber-500/10 border-primary-200 dark:border-primary-500/20',
      ].join(' ')}
    >
      {/* Decorative glow blob */}
      {isHot && (
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
      )}

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xxs sm:text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400 mb-1">
            🏆 Longest Streak
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl sm:text-5xl font-black text-surface-900 dark:text-white leading-none">
              {longestStreak}
            </p>
            <p className="text-lg font-bold text-surface-500 dark:text-surface-400">
              {longestStreak === 1 ? 'day' : 'days'}
            </p>
          </div>
          <p className="mt-1.5 text-sm text-surface-600 dark:text-surface-300">
            {hasHabits
              ? habitName
                ? `Best run: ${habitName}`
                : 'Keep building momentum.'
              : 'Create your first habit to start your streak.'}
          </p>
        </div>

        <div className="flex-shrink-0 flex flex-col items-center gap-1">
          {/* Flame icon */}
          <span
            className={[
              'text-5xl sm:text-6xl select-none',
              hasStreak ? 'animate-streak-flame' : 'opacity-30 grayscale',
            ].join(' ')}
            aria-hidden="true"
          >
            🔥
          </span>
          {isHot && (
            <span className="text-xxs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
              On Fire!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

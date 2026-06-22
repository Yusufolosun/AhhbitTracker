import { useRewards } from '../hooks/useRewards';
import { useHabits } from '../hooks/useHabits';
import { useToast } from '../context/ToastContext';
import { SurfaceCard } from './ui';
import { Habit } from '../types/habit';

const MILESTONES = [7, 14, 30, 60, 90];

const MILESTONE_LABELS: Record<number, string> = {
  7: '1 Week', 14: '2 Weeks', 30: '1 Month', 60: '2 Months', 90: '3 Months',
};

export function MilestoneRewards() {
  const { habits } = useHabits();
  const { claimReward, pendingRewardClaims } = useRewards();
  const { showToast } = useToast();

  const handleClaim = async (habitId: number, milestone: number) => {
    try {
      await claimReward({ habitId, milestone });
      showToast(`Milestone ${milestone} reward claim signed!`, 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : String(err), 'error');
    }
  };

  const claimableHabits = habits.filter((h) => h.isActive || h.isCompleted);
  if (claimableHabits.length === 0) return null;

  return (
    <SurfaceCard>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-500/20 dark:to-amber-500/10 flex items-center justify-center">
          <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-surface-900 dark:text-white">Milestone Rewards</h3>
          <p className="text-xs text-surface-500 dark:text-surface-400">Earn STX rewards when habits reach major milestones</p>
        </div>
      </div>

      <div className="space-y-6 mt-5">
        {claimableHabits.map((habit: Habit) => (
          <div
            key={habit.habitId}
            className="border-t border-surface-200 dark:border-surface-700 pt-5 first:border-0 first:pt-0"
          >
            <h4 className="text-sm font-semibold text-surface-800 dark:text-surface-200 mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center text-xxs font-black text-primary-600 dark:text-primary-400">
                {habit.habitId}
              </span>
              {habit.name}
              <span className="ml-auto text-xxs font-semibold text-surface-400 dark:text-surface-500 tabular-nums">
                Streak: {habit.currentStreak}
              </span>
            </h4>

            {/* Horizontal scroll container for mobile */}
            <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
              {MILESTONES.map((milestone) => {
                const isReached = habit.currentStreak >= milestone;
                const isPending = pendingRewardClaims.has(`${habit.habitId}-${milestone}`);

                return (
                  <div
                    key={milestone}
                    className={[
                      'flex-shrink-0 w-24 p-3 rounded-xl border flex flex-col items-center text-center transition-all duration-200',
                      isReached
                        ? 'bg-gradient-to-b from-emerald-50 to-emerald-100/50 border-emerald-300 dark:from-emerald-500/15 dark:to-emerald-500/5 dark:border-emerald-500/30 shadow-sm'
                        : 'bg-surface-50 border-surface-200 dark:bg-surface-800 dark:border-surface-700 opacity-50',
                    ].join(' ')}
                  >
                    {/* Lock / unlock icon */}
                    <span className={`text-lg mb-1 ${isReached ? '' : 'grayscale'}`}>
                      {isReached ? '🏅' : '🔒'}
                    </span>
                    <span className="text-xxs font-bold text-surface-500 dark:text-surface-400 uppercase tracking-widest">
                      Day
                    </span>
                    <span className="text-xl font-black text-surface-900 dark:text-white leading-none">
                      {milestone}
                    </span>
                    <span className="text-xxs text-surface-400 dark:text-surface-500 mb-2">
                      {MILESTONE_LABELS[milestone]}
                    </span>

                    {isReached ? (
                      <button
                        onClick={() => handleClaim(habit.habitId, milestone)}
                        disabled={isPending}
                        className="text-xxs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:underline disabled:opacity-50 transition-colors uppercase tracking-wider"
                      >
                        {isPending ? 'Claiming…' : 'Claim'}
                      </button>
                    ) : (
                      <span className="text-xxs font-bold text-surface-300 dark:text-surface-600 uppercase tracking-wider">
                        Locked
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </SurfaceCard>
  );
}

import { useRewards } from '../hooks/useRewards';
import { useHabits } from '../hooks/useHabits';
import { useToast } from '../context/ToastContext';
import { SurfaceCard, ActionButton } from './ui';
import { Habit } from '../types/habit';

export function MilestoneRewards() {
  const { habits } = useHabits();
  const { claimReward, pendingRewardClaims } = useRewards();
  const { showToast } = useToast();

  const milestones = [7, 30, 90, 365];

  const handleClaim = async (habitId: number, milestone: number) => {
    try {
      await claimReward({ habitId, milestone });
      showToast(`Milestone ${milestone} reward claim signed!`, 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : String(err), 'error');
    }
  };

  const claimableHabits = habits.filter(h => h.isActive || h.isCompleted);

  if (claimableHabits.length === 0) return null;

  return (
    <SurfaceCard>
      <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-4">
        Milestone Rewards
      </h3>
      <p className="text-sm text-surface-600 dark:text-surface-400 mb-6">
        Earn extra STX rewards when your habits reach major milestones.
      </p>

      <div className="space-y-6">
        {claimableHabits.map((habit: Habit) => (
          <div key={habit.habitId} className="border-t border-surface-200 dark:border-surface-700 pt-4 first:border-0 first:pt-0">
            <h4 className="text-sm font-semibold mb-3">{habit.name} (#{habit.habitId})</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {milestones.map(milestone => {
                const isReached = habit.currentStreak >= milestone;
                const isPending = pendingRewardClaims.has(`${habit.habitId}-${milestone}`);
                
                return (
                  <div key={milestone} className={`p-3 rounded-lg border flex flex-col items-center justify-center text-center ${
                    isReached 
                      ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20' 
                      : 'bg-surface-50 border-surface-200 dark:bg-surface-800 dark:border-surface-700 opacity-60'
                  }`}>
                    <span className="text-xs font-bold text-surface-500 dark:text-surface-400 uppercase">Day</span>
                    <span className="text-lg font-bold">{milestone}</span>
                    {isReached ? (
                      <button
                        onClick={() => handleClaim(habit.habitId, milestone)}
                        disabled={isPending}
                        className="mt-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase hover:underline disabled:opacity-50"
                      >
                        {isPending ? 'Claiming...' : 'Claim Now'}
                      </button>
                    ) : (
                      <span className="mt-2 text-[10px] font-bold text-surface-400 uppercase">Locked</span>
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

import { useState } from 'react';
import { useAccountability } from '../hooks/useAccountability';
import { useHabits } from '../hooks/useHabits';
import { useToast } from '../context/ToastContext';
import { ActionButton, SurfaceCard } from './ui';
import { trackEvent } from '../analytics';

export function AccountabilityPanel() {
  const { habits } = useHabits();
  const { createGroup, userGroups, isLoadingGroups } = useAccountability();
  const { showToast } = useToast();

  const [selectedHabitId, setSelectedHabitId] = useState<number | ''>('');
  const [stakeAmount, setStakeAmount]           = useState('10');
  const [duration, setDuration]                 = useState('14');

  const activeHabits = habits.filter((h) => h.isActive);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedHabitId === '') return;
    try {
      const amountMicroStx = Number(stakeAmount) * 1_000_000;
      const durationBlocks = Number(duration) * 144;
      await createGroup({ stakeAmount: amountMicroStx, duration: durationBlocks, habitId: selectedHabitId });
      showToast('Accountability group creation signed!', 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : String(err), 'error');
    }
  };

  return (
    <SurfaceCard>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-500/20 dark:to-purple-500/10 flex items-center justify-center">
          <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-surface-900 dark:text-white">Accountability Groups</h3>
          <p className="text-xs text-surface-500 dark:text-surface-400">Stay accountable together with shared stakes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Create group form */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-surface-500 dark:text-surface-400 mb-4">
            Start a New Group
          </h4>
          <form onSubmit={handleCreateGroup} className="space-y-4">
            <div>
              <label htmlFor="acc-habit" className="block text-xs font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Select Habit
              </label>
              <select
                id="acc-habit"
                className="input text-sm"
                value={selectedHabitId}
                onChange={(e) => setSelectedHabitId(Number(e.target.value))}
                required
              >
                <option value="">Choose an active habit…</option>
                {activeHabits.map((h) => (
                  <option key={h.habitId} value={h.habitId}>
                    {h.name} (#{h.habitId})
                  </option>
                ))}
              </select>
              {activeHabits.length === 0 && (
                <p className="text-xxs text-surface-400 dark:text-surface-500 mt-1">
                  You need an active habit to start a group.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="acc-stake" className="block text-xs font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                  Stake (STX)
                </label>
                <input
                  id="acc-stake"
                  type="number"
                  className="input text-sm"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  min="1"
                  required
                />
              </div>
              <div>
                <label htmlFor="acc-duration" className="block text-xs font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                  Duration (Days)
                </label>
                <input
                  id="acc-duration"
                  type="number"
                  className="input text-sm"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  min="7"
                  required
                />
              </div>
            </div>

            <ActionButton
              type="submit"
              className="w-full"
              disabled={selectedHabitId === ''}
              size="sm"
            >
              Create Accountability Group
            </ActionButton>
          </form>
        </div>

        {/* Your groups */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-surface-500 dark:text-surface-400 mb-4">
            Your Groups
          </h4>
          {isLoadingGroups ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-12 rounded-xl shimmer-bg" />
              ))}
            </div>
          ) : userGroups && userGroups.length > 0 ? (
            <div className="space-y-2">
              {userGroups.map((groupId: number) => (
                <div
                  key={groupId}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-500/30 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-600 dark:text-purple-400">
                      #{groupId}
                    </span>
                    <span className="text-sm font-medium text-surface-800 dark:text-surface-200">
                      Group #{groupId}
                    </span>
                  </div>
                  <button
                    className="text-xs font-semibold text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    onClick={() => trackEvent('view_group_clicked', { groupId })}
                  >
                    View →
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <span className="text-3xl mb-2">👥</span>
              <p className="text-sm text-surface-500 dark:text-surface-400">No groups yet.</p>
              <p className="text-xs text-surface-400 dark:text-surface-500 mt-1">
                Create one to keep each other accountable!
              </p>
            </div>
          )}
        </div>
      </div>
    </SurfaceCard>
  );
}

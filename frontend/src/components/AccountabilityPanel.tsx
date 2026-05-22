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
  const [stakeAmount, setStakeAmount] = useState('10');
  const [duration, setDuration] = useState('14');

  const activeHabits = habits.filter((h) => h.isActive);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedHabitId === '') return;

    try {
      const amountMicroStx = Number(stakeAmount) * 1_000_000;
      const durationBlocks = Number(duration) * 144; // 144 blocks per day
      await createGroup({
        stakeAmount: amountMicroStx,
        duration: durationBlocks,
        habitId: selectedHabitId,
      });
      showToast('Accountability group creation signed!', 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : String(err), 'error');
    }
  };

  return (
    <SurfaceCard>
      <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-4">
        Accountability Groups
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-3">
            Start a New Group
          </h4>
          <form onSubmit={handleCreateGroup} className="space-y-4">
            <div>
              <label className="block text-xs text-surface-500 mb-1">Select Habit</label>
              <select
                className="input text-sm"
                value={selectedHabitId}
                onChange={(e) => setSelectedHabitId(Number(e.target.value))}
                required
              >
                <option value="">Select an active habit</option>
                {activeHabits.map((h) => (
                  <option key={h.habitId} value={h.habitId}>
                    {h.name} (#{h.habitId})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-surface-500 mb-1">Stake (STX)</label>
                <input
                  type="number"
                  className="input text-sm"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-surface-500 mb-1">Duration (Days)</label>
                <input
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
              className="w-full text-sm"
              disabled={selectedHabitId === ''}
            >
              Create Group
            </ActionButton>
          </form>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-3">
            Your Groups
          </h4>
          {isLoadingGroups ? (
            <p className="text-xs text-surface-500">Loading groups...</p>
          ) : userGroups && userGroups.length > 0 ? (
            <div className="space-y-2">
              {userGroups.map((groupId: number) => (
                <div
                  key={groupId}
                  className="p-3 bg-surface-50 dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 flex justify-between items-center"
                >
                  <span className="text-sm font-medium">Group #{groupId}</span>
                  <button
                    className="text-xs text-primary-500 hover:underline"
                    onClick={() => trackEvent('view_group_clicked', { groupId })}
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-surface-500">You haven't joined any groups yet.</p>
          )}
        </div>
      </div>
    </SurfaceCard>
  );
}

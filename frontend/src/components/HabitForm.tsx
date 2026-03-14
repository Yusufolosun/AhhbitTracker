import React, { useState } from 'react';
import { useHabits } from '../hooks/useHabits';
import { useToast } from '../context/ToastContext';
import { validateHabitName, validateStakeAmount } from '../utils/validation';
import { toMicroSTX } from '../utils/formatting';

export function HabitForm() {
  const [name, setName] = useState('');
  const [stake, setStake] = useState('0.1');
  const [error, setError] = useState<string | null>(null);
  const { createHabit, isCreatingHabit } = useHabits();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate
    const nameError = validateHabitName(name);
    if (nameError) {
      setError(nameError);
      return;
    }

    const stakeNum = parseFloat(stake);
    const stakeError = validateStakeAmount(stakeNum);
    if (stakeError) {
      setError(stakeError);
      return;
    }

    try {
      const stakeAmount = toMicroSTX(stakeNum);
      await createHabit({ name, stakeAmount });

      setName('');
      setStake('0.1');
      showToast('Transaction signed! Your habit will appear once confirmed on-chain.', 'success');
    } catch (err: any) {
      if (err.message === 'Transaction cancelled') {
        showToast('Transaction was cancelled.', 'error');
      } else {
        showToast(err.message || 'Failed to create habit', 'error');
      }
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-4">
        Create New Habit
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
            Habit Name
          </label>
          <input
            id="name"
            type="text"
            className="input"
            placeholder="e.g., Daily Exercise"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
            required
            disabled={isCreatingHabit}
            aria-describedby={error ? 'form-error' : undefined}
          />
          <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">
            {name.length}/50 characters
          </p>
        </div>

        <div>
          <label htmlFor="stake" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
            Stake Amount (STX)
          </label>
          <input
            id="stake"
            type="number"
            className="input"
            placeholder="0.1"
            value={stake}
            onChange={(e) => setStake(e.target.value)}
            min="0.02"
            max="100"
            step="0.01"
            required
            disabled={isCreatingHabit}
          />
          <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">
            Min 0.02 STX &middot; Max 100 STX
          </p>
        </div>

        {error && (
          <div id="form-error" role="alert" className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <button
          type="submit"
          className="btn-primary w-full"
          disabled={isCreatingHabit}
        >
          {isCreatingHabit ? (
            <span className="flex items-center justify-center">
              <div className="spinner w-5 h-5 mr-2"></div>
              Creating Habit...
            </span>
          ) : (
            'Create Habit'
          )}
        </button>
      </form>

      <div className="mt-4 p-4 bg-primary-50 dark:bg-primary-500/10 rounded-lg border border-primary-200 dark:border-primary-500/20">
        <p className="text-sm text-primary-800 dark:text-primary-300">
          <strong>Tip:</strong> Choose a realistic daily habit. You'll need to check in every 24 hours!
        </p>
      </div>
    </div>
  );
}

import React, { useState, useRef } from 'react';
import { useHabits } from '../hooks/useHabits';
import { useToast } from '../context/ToastContext';
import { validateHabitName, validateStakeAmount } from '../utils/validation';
import { toMicroSTX } from '../utils/formatting';
import { MAX_HABIT_NAME_LENGTH, MAX_STAKE_AMOUNT, MIN_STAKE_AMOUNT } from '../utils/constants';

/** How long (ms) the form stays locked after the wallet signs a transaction.
 *  Long enough to outlive typical mempool propagation; short enough that a
 *  genuine second habit within the same session isn't blocked forever. */
const POST_SIGN_LOCK_MS = 45_000;

/** Type guard to extract error message from unknown error */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unknown error occurred';
}

export function HabitForm() {
  const [name, setName] = useState('');
  const [stake, setStake] = useState((MIN_STAKE_AMOUNT / 1_000_000).toString());
  const [error, setError] = useState<string | null>(null);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const lockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { createHabit, isCreatingHabit } = useHabits();
  const { showToast } = useToast();

  /** True from the moment the user clicks submit until either the lock
   *  expires or the component unmounts. */
  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;
  const isDisabled = isCreatingHabit || isLocked;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDisabled) return;
    setError(null);

    // Trim the name to prevent whitespace-only or leading/trailing spaces
    const trimmedName = name.trim();

    // Validate
    const nameError = validateHabitName(trimmedName);
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
      await createHabit({ name: trimmedName, stakeAmount });

      setName('');
      setStake((MIN_STAKE_AMOUNT / 1_000_000).toString());

      // Lock the form after the wallet signs so the user can't accidentally
      // fire a duplicate transaction before the first one confirms on-chain.
      const until = Date.now() + POST_SIGN_LOCK_MS;
      setLockedUntil(until);
      if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
      lockTimerRef.current = setTimeout(() => setLockedUntil(null), POST_SIGN_LOCK_MS);

      showToast('Transaction signed! Your habit will appear once confirmed on-chain.', 'success');
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      if (message === 'Transaction cancelled') {
        showToast('Transaction was cancelled.', 'error');
      } else {
        showToast(message, 'error');
      }
    }
  };

  const secondsLeft = lockedUntil ? Math.ceil((lockedUntil - Date.now()) / 1000) : 0;

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
            maxLength={MAX_HABIT_NAME_LENGTH}
            required
            disabled={isDisabled}
            aria-describedby={error ? 'form-error' : undefined}
          />
          <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">
            {name.length}/{MAX_HABIT_NAME_LENGTH} characters
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
            placeholder={(MIN_STAKE_AMOUNT / 1_000_000).toString()}
            value={stake}
            onChange={(e) => setStake(e.target.value)}
            min={(MIN_STAKE_AMOUNT / 1_000_000).toString()}
            max={(MAX_STAKE_AMOUNT / 1_000_000).toString()}
            step="0.01"
            required
            disabled={isDisabled}
            aria-describedby="stake-hint"
          />
          <p id="stake-hint" className="mt-1 text-xs text-surface-500 dark:text-surface-400">
            Min {(MIN_STAKE_AMOUNT / 1_000_000).toFixed(2)} STX &middot; Max {(MAX_STAKE_AMOUNT / 1_000_000).toFixed(0)} STX
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
          disabled={isDisabled}
        >
          {isCreatingHabit ? (
            <span className="flex items-center justify-center">
              <div className="spinner w-5 h-5 mr-2"></div>
              Creating Habit...
            </span>
          ) : isLocked ? (
            <span className="flex items-center justify-center">
              <div className="spinner w-5 h-5 mr-2"></div>
              Waiting for confirmation... ({secondsLeft}s)
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

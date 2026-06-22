import React, { useState, useRef } from 'react';
import { useHabits } from '../hooks/useHabits';
import { useToast } from '../context/ToastContext';
import { validateHabitName, validateStakeAmount } from '../utils/validation';
import { toMicroSTX } from '../utils/formatting';
import { MAX_HABIT_NAME_LENGTH, MAX_STAKE_AMOUNT, MIN_STAKE_AMOUNT } from '../utils/constants';
import { ActionButton, SurfaceCard } from './ui';
import { trackEvent } from '../analytics';

/** How long (ms) the form stays locked after the wallet signs a transaction. */
const POST_SIGN_LOCK_MS = 45_000;

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unknown error occurred';
}

export function HabitForm() {
  const minStakeStx = MIN_STAKE_AMOUNT / 1_000_000;
  const maxStakeStx = MAX_STAKE_AMOUNT / 1_000_000;

  const [name, setName]               = useState('');
  const [stake, setStake]             = useState(minStakeStx.toString());
  const [error, setError]             = useState<string | null>(null);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const lockTimerRef                  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { createHabit, isCreatingHabit } = useHabits();
  const { showToast } = useToast();

  const isLocked   = lockedUntil !== null && Date.now() < lockedUntil;
  const isDisabled = isCreatingHabit || isLocked;
  const secondsLeft = lockedUntil ? Math.ceil((lockedUntil - Date.now()) / 1000) : 0;

  const STAKE_PRESETS = [
    { label: '0.02', value: 0.02 },
    { label: '0.5',  value: 0.5  },
    { label: '1',    value: 1    },
    { label: '5',    value: 5    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDisabled) return;
    setError(null);

    const trimmedName = name.trim();
    const nameError   = validateHabitName(trimmedName);
    if (nameError) { setError(nameError); return; }

    const stakeNum  = parseFloat(stake);
    const stakeError = validateStakeAmount(stakeNum);
    if (stakeError) { setError(stakeError); return; }

    try {
      const stakeAmount = toMicroSTX(stakeNum);
      trackEvent('habit_create_submitted', { habitNameLength: trimmedName.length, stakeAmountMicroStx: stakeAmount });

      await createHabit({ name: trimmedName, stakeAmount });

      trackEvent('habit_create_succeeded', { habitNameLength: trimmedName.length, stakeAmountMicroStx: stakeAmount });

      setName('');
      setStake(minStakeStx.toString());

      const until = Date.now() + POST_SIGN_LOCK_MS;
      setLockedUntil(until);
      if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
      lockTimerRef.current = setTimeout(() => setLockedUntil(null), POST_SIGN_LOCK_MS);

      showToast('Transaction signed! Your habit will appear once confirmed on-chain.', 'success');
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      trackEvent('habit_create_failed', { habitNameLength: trimmedName.length, errorMessage: message });
      if (message === 'Transaction cancelled') {
        showToast('Transaction was cancelled.', 'error');
      } else {
        showToast(message, 'error');
      }
    }
  };

  /* Character counter colour */
  const charRatio     = name.length / MAX_HABIT_NAME_LENGTH;
  const charColor     = charRatio > 0.85 ? 'text-red-500' : charRatio > 0.65 ? 'text-amber-500' : 'text-surface-400 dark:text-surface-500';

  return (
    <SurfaceCard animate>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-500/20 dark:to-primary-500/10 flex items-center justify-center">
          <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-surface-900 dark:text-white">Create a New Habit</h2>
          <p className="text-xs text-surface-500 dark:text-surface-400">Stake STX to commit and earn rewards</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Habit name */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="name" className="block text-sm font-medium text-surface-700 dark:text-surface-300">
              Habit Name
            </label>
            <span className={`text-xxs font-semibold tabular-nums ${charColor}`}>
              {name.length}/{MAX_HABIT_NAME_LENGTH}
            </span>
          </div>
          <input
            id="name"
            type="text"
            className="input"
            placeholder="e.g., Morning Run, Read 20 Pages, Meditate…"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={MAX_HABIT_NAME_LENGTH}
            required
            disabled={isDisabled}
            aria-describedby={error ? 'form-error' : undefined}
          />
        </div>

        {/* Stake amount */}
        <div>
          <label htmlFor="stake" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
            Stake Amount (STX)
          </label>

          {/* Quick-select presets */}
          <div className="flex flex-wrap gap-2 mb-2">
            {STAKE_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                disabled={isDisabled}
                onClick={() => setStake(preset.value.toString())}
                className={[
                  'px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-150',
                  stake === preset.value.toString() || parseFloat(stake) === preset.value
                    ? 'bg-primary-500 text-white border-primary-500 shadow-sm shadow-primary-500/20'
                    : 'bg-surface-50 dark:bg-surface-800 text-surface-600 dark:text-surface-400 border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-500/40',
                ].join(' ')}
              >
                {preset.label} STX
              </button>
            ))}
          </div>

          <input
            id="stake"
            type="number"
            className="input"
            placeholder={minStakeStx.toString()}
            value={stake}
            onChange={(e) => setStake(e.target.value)}
            min={minStakeStx.toString()}
            max={maxStakeStx.toString()}
            step="0.01"
            required
            disabled={isDisabled}
            aria-describedby="stake-hint"
          />
          <p id="stake-hint" className="mt-1.5 text-xxs text-surface-400 dark:text-surface-500">
            Min {minStakeStx.toFixed(2)} STX · Max {maxStakeStx.toFixed(0)} STX
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div id="form-error" role="alert" className="flex items-start gap-2.5 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl">
            <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <ActionButton type="submit" className="w-full" disabled={isDisabled} size="lg">
          {isCreatingHabit ? (
            <>Creating Habit…</>
          ) : isLocked ? (
            <>Waiting for confirmation… ({secondsLeft}s)</>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Create Habit on Stacks
            </>
          )}
        </ActionButton>
      </form>

      {/* Tip box */}
      <div className="mt-5 flex items-start gap-3 p-4 bg-primary-50 dark:bg-primary-500/10 rounded-xl border border-primary-200 dark:border-primary-500/20">
        <span className="text-xl flex-shrink-0">💡</span>
        <p className="text-sm text-primary-800 dark:text-primary-300 leading-relaxed">
          <strong>Tip:</strong> Pick a realistic daily habit. You'll need to check in once a day — anytime
          between 16 and 32 hours after your last check-in. Start small and build consistency!
        </p>
      </div>
    </SurfaceCard>
  );
}

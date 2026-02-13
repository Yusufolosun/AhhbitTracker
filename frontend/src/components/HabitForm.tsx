import React, { useState } from 'react';
import { useHabits } from '../hooks/useHabits';
import { validateHabitName, validateStakeAmount } from '../utils/validation';
import { toMicroSTX } from '../utils/formatting';

export function HabitForm() {
  const [name, setName] = useState('');
  const [stake, setStake] = useState('0.1');
  const [error, setError] = useState<string | null>(null);
  const { createHabit, isCreatingHabit } = useHabits();

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
      createHabit({ name, stakeAmount });
      
      // Reset form
      setName('');
      setStake('0.1');
    } catch (err: any) {
      console.error('Failed to create habit:', err);
      setError(err.message || 'Failed to create habit');
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Create New Habit
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
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
            disabled={loading}
          />
          <p className="mt-1 text-xs text-gray-500">
            {name.length}/50 characters
          </p>
        </div>

        <div>isCreatingHabit
          <label htmlFor="stake" className="block text-sm font-medium text-gray-700 mb-2">
            Stake Amount (STX)
          </label>
          <input
            id="stake"
            type="number"
            className="input"
            placeholder="0.1"
            value={stake}
            onChange={(e) => setStake(e.target.value)}
            min="0.1"
            step="0.1"
            required
            disabled={isCreatingHabit}
          />
          <p className="mt-1 text-xs text-gray-500">
            Minimum: 0.1 STX
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
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

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> Choose a realistic daily habit. You'll need to check in every 24 hours!
        </p>
      </div>
    </div>
  );
}

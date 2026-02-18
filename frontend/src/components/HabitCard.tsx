import { useState } from 'react';
import { Habit } from '../types/habit';
import { useHabits } from '../hooks/useHabits';
import { formatSTX } from '../utils/formatting';
import { MIN_STREAK_FOR_WITHDRAWAL } from '../utils/constants';
import { ConfirmationDialog } from './ConfirmationDialog';

interface HabitCardProps {
  habit: Habit;
}

export function HabitCard({ habit }: HabitCardProps) {
  const { checkIn, withdrawStake, claimBonus, isCheckingIn, isWithdrawing, isClaiming } = useHabits();
  const [confirmAction, setConfirmAction] = useState<'withdraw' | 'claim' | null>(null);

  const handleCheckIn = () => {
    checkIn(habit.habitId);
  };

  const handleWithdraw = () => {
    setConfirmAction('withdraw');
  };

  const handleClaimBonus = () => {
    setConfirmAction('claim');
  };

  const executeConfirmedAction = () => {
    if (confirmAction === 'withdraw') {
      withdrawStake({ habitId: habit.habitId, stakeAmount: habit.stakeAmount });
    } else if (confirmAction === 'claim') {
      claimBonus(habit.habitId);
    }
    setConfirmAction(null);
  };

  const canWithdraw = habit.currentStreak >= MIN_STREAK_FOR_WITHDRAWAL && habit.isActive;
  const canClaimBonus = habit.isCompleted;

  return (
    <div className="card hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {habit.name}
          </h3>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${habit.isActive
              ? 'bg-green-100 text-green-800'
              : habit.isCompleted
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
              }`}>
              {habit.isActive ? '🟢 Active' : habit.isCompleted ? '✅ Completed' : '⚫ Inactive'}
            </span>
          </div>
        </div>

        {/* Streak Display */}
        <div className="text-right">
          <div className="text-3xl font-bold text-primary-500">
            {habit.currentStreak}
          </div>
          <div className="text-xs text-gray-500">day streak</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500">Stake</p>
          <p className="text-sm font-semibold text-gray-900">
            {formatSTX(habit.stakeAmount)} STX
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Last Check-in</p>
          <p className="text-sm font-semibold text-gray-900">
            Block {habit.lastCheckInBlock}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col space-y-2">
        {habit.isActive && (
          <button
            onClick={handleCheckIn}
            disabled={isCheckingIn}
            className="btn-primary w-full"
          >
            {isCheckingIn ? 'Checking In...' : 'Check In'}
          </button>
        )}

        {canWithdraw && (
          <button
            onClick={handleWithdraw}
            disabled={isWithdrawing}
            className="btn-secondary w-full"
          >
            {isWithdrawing ? 'Withdrawing...' : 'Withdraw Stake'}
          </button>
        )}

        {canClaimBonus && (
          <button
            onClick={handleClaimBonus}
            disabled={isClaiming}
            className="btn-secondary w-full"
          >
            {isClaiming ? 'Claiming...' : 'Claim Bonus'}
          </button>
        )}
      </div>

      {/* Progress Indicator */}
      {habit.isActive && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-600">Progress to Withdrawal</span>
            <span className="text-xs font-medium text-gray-900">
              {habit.currentStreak}/{MIN_STREAK_FOR_WITHDRAWAL} days
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((habit.currentStreak / MIN_STREAK_FOR_WITHDRAWAL) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Withdraw Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmAction === 'withdraw'}
        title="Withdraw Stake"
        confirmLabel="Withdraw"
        onConfirm={executeConfirmedAction}
        onCancel={() => setConfirmAction(null)}
        isLoading={isWithdrawing}
      >
        <div className="space-y-2">
          <p>You are about to withdraw your stake from:</p>
          <dl className="bg-gray-50 rounded-lg p-3 space-y-1">
            <div className="flex justify-between">
              <dt className="text-gray-500">Habit</dt>
              <dd className="font-medium text-gray-900">{habit.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Stake</dt>
              <dd className="font-medium text-gray-900">{formatSTX(habit.stakeAmount)} STX</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Current Streak</dt>
              <dd className="font-medium text-gray-900">{habit.currentStreak} days</dd>
            </div>
          </dl>
          <p className="text-xs text-amber-600">
            This action is irreversible and will incur a gas fee.
          </p>
        </div>
      </ConfirmationDialog>

      {/* Claim Bonus Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmAction === 'claim'}
        title="Claim Bonus"
        confirmLabel="Claim"
        onConfirm={executeConfirmedAction}
        onCancel={() => setConfirmAction(null)}
        isLoading={isClaiming}
      >
        <div className="space-y-2">
          <p>You are about to claim a bonus reward for:</p>
          <dl className="bg-gray-50 rounded-lg p-3 space-y-1">
            <div className="flex justify-between">
              <dt className="text-gray-500">Habit</dt>
              <dd className="font-medium text-gray-900">{habit.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Final Streak</dt>
              <dd className="font-medium text-gray-900">{habit.currentStreak} days</dd>
            </div>
          </dl>
          <p className="text-xs text-amber-600">
            This action is irreversible and will incur a gas fee.
          </p>
        </div>
      </ConfirmationDialog>
    </div>
  );
}

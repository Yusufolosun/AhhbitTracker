import React, { useState } from 'react';
import { Habit } from '../types/habit';
import { contractService } from '../services/contractService';
import { formatSTX, blocksToTime } from '../utils/formatting';

interface HabitCardProps {
  habit: Habit;
  onUpdate?: () => void;
}

export function HabitCard({ habit, onUpdate }: HabitCardProps) {
  const [loading, setLoading] = useState<'checkin' | 'withdraw' | 'bonus' | null>(null);

  const handleCheckIn = async () => {
    try {
      setLoading('checkin');
      await contractService.checkIn(habit.habitId);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Check-in failed:', err);
    } finally {
      setLoading(null);
    }
  };

  const handleWithdraw = async () => {
    try {
      setLoading('withdraw');
      await contractService.withdrawStake(habit.habitId);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Withdrawal failed:', err);
    } finally {
      setLoading(null);
    }
  };

  const handleClaimBonus = async () => {
    try {
      setLoading('bonus');
      await contractService.claimBonus(habit.habitId);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Claim bonus failed:', err);
    } finally {
      setLoading(null);
    }
  };

  const canWithdraw = habit.currentStreak >= 7 && habit.isActive;
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
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              habit.isActive 
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
            disabled={loading === 'checkin'}
            className="btn-primary w-full"
          >
            {loading === 'checkin' ? 'Checking In...' : 'Check In'}
          </button>
        )}

        {canWithdraw && (
          <button
            onClick={handleWithdraw}
            disabled={loading === 'withdraw'}
            className="btn-secondary w-full"
          >
            {loading === 'withdraw' ? 'Withdrawing...' : 'Withdraw Stake'}
          </button>
        )}

        {canClaimBonus && (
          <button
            onClick={handleClaimBonus}
            disabled={loading === 'bonus'}
            className="btn-secondary w-full"
          >
            {loading === 'bonus' ? 'Claiming...' : 'Claim Bonus'}
          </button>
        )}
      </div>

      {/* Progress Indicator */}
      {habit.isActive && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-600">Progress to Withdrawal</span>
            <span className="text-xs font-medium text-gray-900">
              {habit.currentStreak}/7 days
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((habit.currentStreak / 7) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}

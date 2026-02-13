import React from 'react';

interface HabitCardProps {
  habitId: number;
  name: string;
  streak: number;
  stakeAmount: number;
  isActive: boolean;
}

export function HabitCard({ habitId, name, streak, stakeAmount, isActive }: HabitCardProps) {
  return (
    <div className="habit-card">
      <h3>{name}</h3>
      <div className="habit-stats">
        <span>Streak: {streak} days</span>
        <span>Stake: {(stakeAmount / 1000000).toFixed(2)} STX</span>
      </div>
      <div className="habit-status">
        {isActive ? '🟢 Active' : '⚫ Inactive'}
      </div>
    </div>
  );
}

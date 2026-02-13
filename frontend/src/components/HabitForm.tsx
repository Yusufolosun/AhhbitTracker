import React, { useState } from 'react';

interface HabitFormProps {
  onSubmit: (name: string, stake: number) => void;
}

export function HabitForm({ onSubmit }: HabitFormProps) {
  const [name, setName] = useState('');
  const [stake, setStake] = useState('0.1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const stakeAmount = parseFloat(stake) * 1000000;
    onSubmit(name, stakeAmount);
  };

  return (
    <form onSubmit={handleSubmit} className="habit-form">
      <input
        type="text"
        placeholder="Habit name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={50}
        required
      />
      <input
        type="number"
        placeholder="Stake amount (STX)"
        value={stake}
        onChange={(e) => setStake(e.target.value)}
        min="0.1"
        step="0.1"
        required
      />
      <button type="submit">Create Habit</button>
    </form>
  );
}

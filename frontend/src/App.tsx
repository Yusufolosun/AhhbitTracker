import React from 'react';
import { WalletConnect } from './components/WalletConnect';
import { HabitForm } from './components/HabitForm';
import { useWallet } from './hooks/useWallet';
import { createHabit } from './services/contractService';
import './styles/global.css';

export function App() {
  const { address, isConnected } = useWallet();

  const handleCreateHabit = async (name: string, stake: number) => {
    try {
      await createHabit(name, stake);
      alert('Habit creation submitted!');
    } catch (error) {
      console.error('Failed to create habit:', error);
      alert('Failed to create habit');
    }
  };

  return (
    <div className="app">
      <header>
        <h1>AhhbitTracker</h1>
        {!isConnected && <WalletConnect />}
        {isConnected && <p>Connected: {address}</p>}
      </header>

      <main>
        {isConnected && (
          <>
            <h2>Create New Habit</h2>
            <HabitForm onSubmit={handleCreateHabit} />
          </>
        )}
      </main>
    </div>
  );
}

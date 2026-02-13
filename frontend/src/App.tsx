import React from 'react';
import { WalletProvider, useWallet } from './context/WalletContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { WalletConnect } from './components/WalletConnect';
import { Dashboard } from './components/Dashboard';
import { HabitForm } from './components/HabitForm';
import { HabitList } from './components/HabitList';
import { PoolDisplay } from './components/PoolDisplay';
import { useHabits } from './hooks/useHabits';
import './styles/global.css';

function AppContent() {
  const { address, isConnected } = useWallet();
  const { habits, loading, refetch } = useHabits(address);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <WalletConnect />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Dashboard */}
          <Dashboard habits={habits} />

          {/* Pool Display */}
          <PoolDisplay />

          {/* Create Habit Form */}
          <HabitForm onSuccess={refetch} />

          {/* Habit List */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Habits</h2>
            <HabitList habits={habits} loading={loading} onUpdate={refetch} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <WalletProvider>
        <AppContent />
      </WalletProvider>
    </ErrorBoundary>
  );
}


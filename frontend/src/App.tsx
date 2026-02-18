import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WalletProvider, useWallet } from './context/WalletContext';
import { TransactionProvider } from './context/TransactionContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { WalletConnect } from './components/WalletConnect';
import { Dashboard } from './components/Dashboard';
import { HabitForm } from './components/HabitForm';
import { HabitList } from './components/HabitList';
import { PoolDisplay } from './components/PoolDisplay';
import { TransactionTracker } from './components/TransactionTracker';
import { ToastContainer } from './components/ToastContainer';
import { useHabits } from './hooks/useHabits';
import './styles/global.css';

// Create a react-query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000, // 30 seconds
    },
  },
});

function AppContent() {
  const { walletState } = useWallet();
  const { habits, isLoadingHabits } = useHabits();

  if (!walletState.isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <WalletConnect />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Skip to content link for keyboard/screen-reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:px-4 focus:py-2 focus:rounded focus:shadow-lg focus:text-primary-500"
      >
        Skip to content
      </a>

      <Header />

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Dashboard */}
          <section id="dashboard" className="scroll-mt-20">
            <Dashboard habits={habits} />
          </section>

          {/* Pool Display */}
          <section id="pool" className="scroll-mt-20">
            <PoolDisplay />
          </section>

          {/* Create Habit Form */}
          <section id="create-habit" className="scroll-mt-20">
            <HabitForm />
          </section>

          {/* Habit List */}
          <section id="habits" className="scroll-mt-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Habits</h2>
            <HabitList habits={habits} loading={isLoadingHabits} />
          </section>
        </div>
      </main>

      <Footer />
      <TransactionTracker />
      <ToastContainer />
    </div>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <WalletProvider>
            <TransactionProvider>
              <ToastProvider>
                <AppContent />
              </ToastProvider>
            </TransactionProvider>
          </WalletProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}


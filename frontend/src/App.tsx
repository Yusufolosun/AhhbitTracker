import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense, useMemo } from 'react';
import { emitRateLimitEvent } from './utils/rateLimitEvents';
import { WalletProvider, useWallet } from './context/WalletContext';
import { TransactionProvider } from './context/TransactionContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { WalletConnect } from './components/WalletConnect';
import { RateLimitBanner } from './components/RateLimitBanner';
import { ToastContainer } from './components/ToastContainer';
import { TransactionTracker } from './components/TransactionTracker';
import { LongestStreakBanner } from './components/LongestStreakBanner';
import { useHabits } from './hooks/useHabits';
import { DashboardSkeleton } from './components/Skeletons';
import { useHashRoute } from './hooks/useHashRoute';
import './styles/global.css';

// Code-split route-level components
const Dashboard = lazy(() => import('./components/Dashboard').then(m => ({ default: m.Dashboard })));
const HabitForm = lazy(() => import('./components/HabitForm').then(m => ({ default: m.HabitForm })));
const HabitList = lazy(() => import('./components/HabitList').then(m => ({ default: m.HabitList })));
const PoolDisplay = lazy(() => import('./components/PoolDisplay').then(m => ({ default: m.PoolDisplay })));

/** API error shape for rate limit detection */
interface ApiError {
  status?: number;
  message?: string;
  headers?: { get?: (key: string) => string | null };
}

/** Type guard for checking if an error has API error properties */
function isApiError(error: unknown): error is ApiError {
  return typeof error === 'object' && error !== null;
}

// Create a react-query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error: unknown) => {
        // Stop retrying after 3 attempts
        if (failureCount >= 3) return false;
        // Detect 429 and emit rate-limit event for the banner
        if (isApiError(error)) {
          const is429 = error.status === 429 || error.message?.includes('429');
          if (is429) {
            const retryAfter = parseInt(error.headers?.get?.('Retry-After') ?? '30', 10);
            emitRateLimitEvent(retryAfter);
          }
        }
        return true;
      },
      staleTime: 30000, // 30 seconds
    },
  },
});

function AppContent() {
  const { walletState } = useWallet();
  const { habits, isLoadingHabits } = useHabits();
  const { route } = useHashRoute();

  const longestStreakData = useMemo(() => {
    return habits.reduce(
      (best, habit) => {
        if (habit.currentStreak > best.longestStreak) {
          return {
            longestStreak: habit.currentStreak,
            habitName: habit.name,
          };
        }

        return best;
      },
      { longestStreak: 0, habitName: '' }
    );
  }, [habits]);

  if (!walletState.isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-900 px-4">
        <WalletConnect />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-50 dark:bg-surface-900">
      {/* Skip to content link for keyboard/screen-reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:px-4 focus:py-2 focus:rounded focus:shadow-lg focus:text-primary-500"
      >
        Skip to content
      </a>

      <Header />
      <RateLimitBanner />

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <LongestStreakBanner
            longestStreak={longestStreakData.longestStreak}
            habitName={longestStreakData.habitName}
            hasHabits={habits.length > 0}
            isLoading={isLoadingHabits}
          />

          {/* Route-based rendering with code splitting */}
          <Suspense fallback={<DashboardSkeleton />}>
            {route === 'dashboard' && (
              <section id="dashboard">
                {isLoadingHabits ? <DashboardSkeleton /> : <Dashboard habits={habits} />}
              </section>
            )}

            {route === 'pool' && (
              <section id="pool">
                <PoolDisplay />
              </section>
            )}

            {route === 'create-habit' && (
              <section id="create-habit">
                <HabitForm />
              </section>
            )}

            {route === 'habits' && (
              <section id="habits">
                <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-6">My Habits</h2>
                <HabitList habits={habits} loading={isLoadingHabits} />
              </section>
            )}
          </Suspense>
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


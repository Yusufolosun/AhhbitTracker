import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { demoService } from '../services/demoService';
import { useToast } from '../context/ToastContext';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../utils/queryKeys';

export function DemoSandboxBar() {
  const { isDemoMode, refreshBalance } = useWallet();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [isAdvancing, setIsAdvancing] = useState(false);

  if (!isDemoMode) return null;

  const currentBlock = demoService.getCurrentBlock();

  const handleAdvanceBlocks = (blocks: number, label: string) => {
    setIsAdvancing(true);
    try {
      demoService.advanceBlocks(blocks);
      // Invalidate queries to trigger react-query UI updates
      void queryClient.invalidateQueries();
      void refreshBalance();
      showToast(`Time advanced by ${label} (${blocks} blocks)! Check your habits to see state changes.`, 'info');
    } catch (error) {
      showToast('Error advancing blocks', 'error');
    } finally {
      setIsAdvancing(false);
    }
  };

  const handleAddFunds = () => {
    try {
      const state = demoService.getState();
      state.userBalance += 10_000_000; // 10 STX
      localStorage.setItem('ahhbit_demo_state', JSON.stringify(state));
      void refreshBalance();
      showToast('Added 10 simulated STX to your demo wallet!', 'success');
    } catch {
      showToast('Error adding funds', 'error');
    }
  };

  const handleResetDemo = () => {
    if (window.confirm('Are you sure you want to reset the demo sandbox? This will delete all your simulated habits.')) {
      demoService.disableDemoMode();
      demoService.enableDemoMode();
      void queryClient.invalidateQueries();
      void refreshBalance();
      showToast('Demo sandbox reset to default state.', 'info');
    }
  };

  return (
    <div className="bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/30 dark:border-amber-500/20 rounded-2xl p-4 mb-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Banner Info */}
        <div className="flex items-start gap-3">
          <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-500/20 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </span>
          <div>
            <h4 className="font-semibold text-amber-800 dark:text-amber-300 text-sm md:text-base flex items-center gap-2">
              Interactive Demo Sandbox Active
            </h4>
            <p className="text-xs text-amber-700/80 dark:text-amber-400/80 max-w-xl">
              You are using a simulated blockchain. Use the time-travel buttons below to fast-forward blocks and see how habits, check-in windows, and slashings behave.
            </p>
          </div>
        </div>

        {/* Info stats */}
        <div className="flex flex-wrap items-center gap-3 text-xs bg-white/50 dark:bg-surface-900/40 px-3 py-2 rounded-xl border border-amber-500/10">
          <span className="text-surface-500 dark:text-surface-400">Simulated Blockchain Status:</span>
          <span className="font-mono font-bold text-amber-700 dark:text-amber-400">Block #{currentBlock}</span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-amber-500/20 flex flex-wrap gap-2 items-center justify-between">
        {/* Fast forward controls */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-semibold text-amber-800 dark:text-amber-400 mr-1">Time Travel:</span>
          <button
            type="button"
            disabled={isAdvancing}
            onClick={() => handleAdvanceBlocks(100, '16 Hours (Check-In opens)')}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
            title="Advance 100 blocks to open the check-in window (96+ block cooldown)"
          >
            +16 Hrs (Open Check-In)
          </button>
          <button
            type="button"
            disabled={isAdvancing}
            onClick={() => handleAdvanceBlocks(200, '32 Hours (Miss Check-In)')}
            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
            title="Advance 200 blocks to miss the check-in window (192 blocks maximum)"
          >
            +32 Hrs (Miss & Risk Slash)
          </button>
          <button
            type="button"
            disabled={isAdvancing}
            onClick={() => handleAdvanceBlocks(1000, '7 Days (Goal Completion)')}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
            title="Advance 1000 blocks to simulate a full week"
          >
            +7 Days
          </button>
        </div>

        {/* Sandbox Utilities */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleAddFunds}
            className="px-3 py-1.5 bg-surface-200 dark:bg-surface-800 hover:bg-surface-300 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300 rounded-lg text-xs font-semibold transition-colors"
          >
            +10 STX Demo Funds
          </button>
          <button
            type="button"
            onClick={handleResetDemo}
            className="px-3 py-1.5 border border-red-500/30 hover:bg-red-500/10 text-red-500 rounded-lg text-xs font-semibold transition-colors"
          >
            Reset Sandbox
          </button>
        </div>
      </div>
    </div>
  );
}

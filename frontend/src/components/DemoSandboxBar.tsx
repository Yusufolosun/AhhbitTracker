import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { demoService } from '../services/demoService';
import { useToast } from '../context/ToastContext';
import { useQueryClient } from '@tanstack/react-query';

export function DemoSandboxBar() {
  const { isDemoMode, refreshBalance } = useWallet();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  if (!isDemoMode) return null;

  const currentBlock = demoService.getCurrentBlock();

  const handleAdvanceBlocks = (blocks: number, label: string) => {
    setIsAdvancing(true);
    try {
      demoService.advanceBlocks(blocks);
      void queryClient.invalidateQueries();
      void refreshBalance();
      showToast(`Time advanced by ${label} (${blocks} blocks). Check your habits!`, 'info');
    } catch {
      showToast('Error advancing blocks', 'error');
    } finally {
      setIsAdvancing(false);
    }
  };

  const handleAddFunds = () => {
    try {
      const state = demoService.getState();
      state.userBalance += 10_000_000;
      localStorage.setItem('ahhbit_demo_state', JSON.stringify(state));
      void refreshBalance();
      showToast('Added 10 simulated STX to your demo wallet!', 'success');
    } catch {
      showToast('Error adding funds', 'error');
    }
  };

  const handleResetDemo = () => {
    if (window.confirm('Reset the demo sandbox? This will delete all simulated habits.')) {
      demoService.disableDemoMode();
      demoService.enableDemoMode();
      void queryClient.invalidateQueries();
      void refreshBalance();
      showToast('Demo sandbox reset to default state.', 'info');
    }
  };

  return (
    <div className="rounded-2xl border border-amber-500/30 dark:border-amber-500/20 bg-amber-500/8 dark:bg-amber-500/5 overflow-hidden shadow-sm">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </span>
          <div>
            <span className="text-sm font-bold text-amber-800 dark:text-amber-300">Demo Mode Active</span>
            <span className="ml-2 font-mono text-xs font-bold text-amber-600 dark:text-amber-500 bg-amber-100 dark:bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-500/20">
              Block #{currentBlock}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="p-1.5 rounded-lg text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 transition-colors"
          aria-label={collapsed ? 'Expand sandbox controls' : 'Collapse sandbox controls'}
        >
          <svg className={`w-4 h-4 transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* ── Expandable controls ── */}
      {!collapsed && (
        <div className="border-t border-amber-500/20 px-4 py-4 animate-slide-down">
          <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mb-4">
            You're on a simulated blockchain. Use time-travel to fast-forward blocks and see how habits, check-in windows, and penalties behave.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Time travel controls */}
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <span className="text-xxs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-500">
                Time Travel
              </span>
              {/* Segmented control */}
              <div className="flex rounded-xl border border-amber-300 dark:border-amber-500/30 overflow-hidden bg-white/50 dark:bg-surface-900/40 divide-x divide-amber-200 dark:divide-amber-500/20">
                {[
                  { blocks: 100,  label: '+16 Hrs',  desc: 'Open Check-In', color: 'hover:bg-amber-50 dark:hover:bg-amber-500/10 text-amber-800 dark:text-amber-300' },
                  { blocks: 200,  label: '+32 Hrs',  desc: 'Miss Window',   color: 'hover:bg-red-50 dark:hover:bg-red-500/10 text-red-700 dark:text-red-400' },
                  { blocks: 1000, label: '+7 Days',  desc: 'Full Week',     color: 'hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' },
                ].map((btn) => (
                  <button
                    key={btn.blocks}
                    type="button"
                    disabled={isAdvancing}
                    onClick={() => handleAdvanceBlocks(btn.blocks, btn.desc)}
                    className={`flex-1 flex flex-col items-center py-2 px-3 text-xs font-semibold transition-colors disabled:opacity-50 ${btn.color}`}
                    title={btn.desc}
                  >
                    <span className="font-bold">{btn.label}</span>
                    <span className="text-xxs opacity-70 mt-0.5">{btn.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Utilities */}
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleAddFunds}
                className="flex-1 sm:flex-none px-3 py-2 text-xs font-semibold rounded-xl bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300 transition-colors border border-surface-200 dark:border-surface-700"
              >
                +10 STX
              </button>
              <button
                type="button"
                onClick={handleResetDemo}
                className="flex-1 sm:flex-none px-3 py-2 text-xs font-semibold rounded-xl border border-red-300 dark:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

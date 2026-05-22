import { useWallet } from '../context/WalletContext';
import { ActionButton, SurfaceCard } from './ui';

export function WalletConnect() {
  const { connect, connectDemo, isLoading } = useWallet();

  return (
    <SurfaceCard className="max-w-lg mx-auto text-center p-8 border border-surface-200 dark:border-surface-700 shadow-xl bg-white dark:bg-surface-800 rounded-3xl animate-fade-in">
      <div className="mb-8">
        <img
          src="/logos/full-logo-dark.jpg"
          alt="AhhbitTracker"
          width={110}
          height={75}
          className="h-16 mx-auto mb-6 rounded-2xl shadow-md"
        />
        <h2 className="text-3xl font-extrabold text-surface-900 dark:text-white mb-3 tracking-tight">
          Start Building Habits
        </h2>
        <p className="text-surface-600 dark:text-surface-400 max-w-sm mx-auto text-sm leading-relaxed">
          Lock in small deposits to hold yourself accountable. Reclaim your funds upon completion + earn streaks rewards.
        </p>
      </div>

      <div className="space-y-4 mb-8">
        <ActionButton onClick={connect} isLoading={isLoading} className="w-full py-4 text-base shadow-lg shadow-primary-500/25">
          Connect Stacks Wallet
        </ActionButton>

        <button
          type="button"
          onClick={connectDemo}
          className="w-full btn-secondary py-4 text-base border border-surface-300 dark:border-surface-600 hover:bg-surface-50 dark:hover:bg-surface-700/50 rounded-xl transition-all"
        >
          Try Simulated Sandbox Mode
        </button>
      </div>

      <div className="pt-6 border-t border-surface-200 dark:border-surface-700">
        <h3 className="text-xs font-bold text-surface-400 dark:text-surface-500 tracking-wider uppercase mb-4">
          Need a Stacks Wallet?
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <a
            href="https://leather.io"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center p-3 rounded-xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 hover:border-primary-400 dark:hover:border-primary-500/40 transition-all group"
          >
            <span className="font-semibold text-sm text-surface-950 dark:text-white group-hover:text-primary-500 transition-colors">
              Leather Wallet
            </span>
            <span className="text-xxs text-surface-500 dark:text-surface-400 mt-1">
              Desktop Chrome/Firefox
            </span>
          </a>

          <a
            href="https://xverse.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center p-3 rounded-xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 hover:border-primary-400 dark:hover:border-primary-500/40 transition-all group"
          >
            <span className="font-semibold text-sm text-surface-950 dark:text-white group-hover:text-primary-500 transition-colors">
              Xverse Wallet
            </span>
            <span className="text-xxs text-surface-500 dark:text-surface-400 mt-1">
              Mobile App & Desktop
            </span>
          </a>
        </div>
        <p className="text-xxs text-surface-400 dark:text-surface-500 mt-4 leading-relaxed">
          Installing a wallet takes less than 2 minutes. Once installed, refresh this page to connect.
        </p>
      </div>
    </SurfaceCard>
  );
}

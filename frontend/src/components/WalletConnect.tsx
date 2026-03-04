import { useWallet } from '../context/WalletContext';

export function WalletConnect() {
  const { connect, isLoading } = useWallet();

  return (
    <div className="card max-w-md mx-auto text-center animate-fade-in dark:bg-surface-800 dark:border-surface-700">
      <div className="mb-8">
        <img
          src="/logos/full-logo-dark.jpg"
          alt="AhhbitTracker"
          className="h-16 mx-auto mb-6 rounded-xl"
        />
        <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-3">
          Connect Your Wallet
        </h2>
        <p className="text-surface-600 dark:text-surface-400 leading-relaxed">
          Connect your Stacks wallet to start building better habits with on-chain accountability
        </p>
      </div>

      <button
        onClick={connect}
        disabled={isLoading}
        className="btn-primary w-full mb-6"
      >
        {isLoading ? 'Connecting...' : 'Connect Wallet'}
      </button>

      <div className="text-sm text-surface-500 dark:text-surface-400">
        <p className="mb-2">Supported wallets:</p>
        <div className="flex justify-center space-x-4 text-surface-600 dark:text-surface-300 font-medium">
          <span>Leather</span>
          <span className="text-surface-300 dark:text-surface-600">&middot;</span>
          <span>Xverse</span>
          <span className="text-surface-300 dark:text-surface-600">&middot;</span>
          <span>Asigna</span>
        </div>
      </div>
    </div>
  );
}

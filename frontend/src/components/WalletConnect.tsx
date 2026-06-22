import { useWallet } from '../context/WalletContext';
import { ActionButton, SurfaceCard } from './ui';

export function WalletConnect() {
  const { connect, connectDemo, isLoading } = useWallet();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-surface-50 dark:bg-surface-900">
      {/* Decorative blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/6 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-amber-500/4 rounded-full blur-3xl pointer-events-none" />

      <SurfaceCard
        elevated
        animate
        className="relative w-full max-w-md text-center px-8 py-10 rounded-3xl"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary-500/20 rounded-2xl blur-xl" />
            <img
              src="/logos/full-logo-dark.jpg"
              alt="AhhbitTracker"
              width={110}
              height={75}
              className="relative h-16 mx-auto rounded-2xl shadow-lg"
            />
          </div>
        </div>

        <h2 className="text-3xl font-extrabold text-surface-900 dark:text-white mb-2 tracking-tight">
          Start Building Habits
        </h2>
        <p className="text-surface-500 dark:text-surface-400 max-w-xs mx-auto text-sm leading-relaxed mb-8">
          Lock in small deposits to hold yourself accountable. Reclaim your stake on completion and earn bonus rewards.
        </p>

        <div className="space-y-3 mb-8">
          <ActionButton
            onClick={connect}
            isLoading={isLoading}
            size="lg"
            className="w-full shadow-glow-primary hover:shadow-glow-primary"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Connect Stacks Wallet
          </ActionButton>

          <button
            type="button"
            onClick={connectDemo}
            className="w-full btn-secondary py-4 text-base flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Try Demo Mode
          </button>
        </div>

        <div className="pt-6 border-t border-surface-200 dark:border-surface-700">
          <h3 className="text-xs font-bold text-surface-400 dark:text-surface-500 tracking-widest uppercase mb-4">
            Need a Stacks Wallet?
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'Leather Wallet', url: 'https://leather.io',  sub: 'Desktop · Chrome & Firefox' },
              { name: 'Xverse Wallet',  url: 'https://xverse.app',  sub: 'Mobile & Desktop' },
            ].map((w) => (
              <a
                key={w.name}
                href={w.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center p-3 rounded-xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 hover:border-primary-400 dark:hover:border-primary-500/40 transition-all duration-200"
              >
                <span className="font-semibold text-sm text-surface-900 dark:text-white group-hover:text-primary-500 transition-colors">
                  {w.name}
                </span>
                <span className="text-xxs text-surface-500 dark:text-surface-400 mt-1">{w.sub}</span>
              </a>
            ))}
          </div>
          <p className="text-xxs text-surface-400 dark:text-surface-500 mt-4 leading-relaxed">
            Installing takes under 2 minutes. Once installed, refresh this page to connect.
          </p>
        </div>
      </SurfaceCard>
    </div>
  );
}

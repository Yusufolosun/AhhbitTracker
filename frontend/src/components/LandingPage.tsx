import { useWallet } from '../context/WalletContext';
import { ActionButton, SurfaceCard } from './ui';
import { StakeCalculator } from './StakeCalculator';

const STEPS = [
  {
    number: '01',
    title: 'Set a Habit & Deposit',
    description: 'Pick any daily habit you want to build. Lock in a small deposit of STX tokens as your commitment — as low as 0.02 STX.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Check In Daily',
    description: 'Come back once a day (every 16 to 32 hours) and tap "Check In" to record your progress on the blockchain.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Complete 7 Days & Earn',
    description: 'Hit a 7-day streak to unlock your deposit. Claim bonus payouts from the reward pool funded by people who missed their habits!',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export function LandingPage() {
  const { connect, connectDemo, isLoading } = useWallet();

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-primary-500/10 dark:from-primary-500/10 dark:to-primary-500/5" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center">
          <img
            src="/logos/full-logo-dark.jpg"
            alt="AhhbitTracker"
            width={120}
            height={80}
            className="h-20 mx-auto mb-8 rounded-2xl shadow-lg"
          />

          <h1 className="text-4xl sm:text-5xl font-extrabold text-surface-900 dark:text-white mb-4 tracking-tight leading-tight">
            Build Habits That
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-400"> Actually Stick</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-surface-600 dark:text-surface-300 mb-10 leading-relaxed">
            Put a small deposit on the line. Check in daily. Stay consistent and earn rewards.
            Miss a day? Lose a small portion to the community pool. It is the accountability app powered by real stakes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <ActionButton onClick={connect} isLoading={isLoading} className="px-8 py-4 text-base shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-shadow">
              Connect Wallet & Start
            </ActionButton>
            <button
              type="button"
              onClick={connectDemo}
              className="btn-secondary px-8 py-4 text-base border-2 border-primary-200 dark:border-primary-500/30 hover:border-primary-400 dark:hover:border-primary-500/50 transition-colors"
            >
              Try Interactive Demo
            </button>
          </div>

          <p className="text-sm text-surface-400 dark:text-surface-500">
            No wallet? The demo lets you explore the full app with simulated funds — zero setup required.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-surface-900 dark:text-white mb-4">
          How It Works
        </h2>
        <p className="text-center text-surface-500 dark:text-surface-400 mb-12 max-w-xl mx-auto">
          Three simple steps to start building lasting habits with real accountability.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="group relative bg-white dark:bg-surface-800 rounded-2xl p-6 border border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/5"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-500/10 text-primary-500 group-hover:scale-110 transition-transform duration-300">
                  {step.icon}
                </span>
                <span className="text-xs font-bold text-primary-400 dark:text-primary-500 tracking-widest uppercase">
                  Step {step.number}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">{step.title}</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Penalty Explainer */}
      <section className="bg-white dark:bg-surface-800/50 border-y border-surface-200 dark:border-surface-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white mb-4">
                Why Does It Work?
              </h2>
              <p className="text-surface-600 dark:text-surface-300 mb-6 leading-relaxed">
                Studies show that people are <strong>twice as motivated by loss</strong> than by gain. By putting real tokens on the line,
                your brain treats each check-in like protecting something valuable — not just ticking a box.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <div>
                    <p className="font-medium text-surface-900 dark:text-white">Stay consistent → Get your deposit back + bonus</p>
                    <p className="text-sm text-surface-500 dark:text-surface-400">Complete a 7-day streak to reclaim everything.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </span>
                  <div>
                    <p className="font-medium text-surface-900 dark:text-white">Miss a day → 10% penalty to community pool</p>
                    <p className="text-sm text-surface-500 dark:text-surface-400">Your forfeited funds reward users who stayed consistent.</p>
                  </div>
                </div>
              </div>
            </div>

            <StakeCalculator />
          </div>
        </div>
      </section>

      {/* Wallet Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white mb-4">
          New to Web3?
        </h2>
        <p className="text-surface-500 dark:text-surface-400 mb-8 max-w-xl mx-auto">
          You just need a Stacks wallet. It takes under 2 minutes to set up. These wallets are free browser
          extensions that let you securely manage your STX tokens.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            { name: 'Leather', url: 'https://leather.io', desc: 'Best for desktop browsers' },
            { name: 'Xverse', url: 'https://xverse.app', desc: 'Great on mobile & desktop' },
            { name: 'Asigna', url: 'https://asigna.io', desc: 'Multisig-focused wallet' },
          ].map((wallet) => (
            <SurfaceCard key={wallet.name} className="text-center hover:border-primary-300 dark:hover:border-primary-500/30 transition-colors">
              <h3 className="font-semibold text-surface-900 dark:text-white mb-1">{wallet.name}</h3>
              <p className="text-xs text-surface-500 dark:text-surface-400 mb-3">{wallet.desc}</p>
              <a
                href={wallet.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
              >
                Download →
              </a>
            </SurfaceCard>
          ))}
        </div>
      </section>

      {/* Smart Contract Trust Signals */}
      <section className="bg-surface-100/50 dark:bg-surface-800/30 border-t border-surface-200 dark:border-surface-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-surface-900 dark:text-white">100%</p>
              <p className="text-sm text-surface-500 dark:text-surface-400">Open Source & Auditable</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-900 dark:text-white">No Admin Key</p>
              <p className="text-sm text-surface-500 dark:text-surface-400">Fully decentralized — no one can change the rules</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-900 dark:text-white">Bitcoin-Secured</p>
              <p className="text-sm text-surface-500 dark:text-surface-400">Built on Stacks, anchored to Bitcoin</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

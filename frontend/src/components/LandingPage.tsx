import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { ActionButton, SurfaceCard } from './ui';
import { StakeCalculator } from './StakeCalculator';

/* ─── Static data ─────────────────────────────────────────────── */

const STEPS = [
  {
    number: '01',
    title: 'Set a Habit & Deposit',
    description:
      'Choose a daily habit and lock in a small STX deposit as your commitment. Start with as little as 0.02 STX — no credit card, no middleman.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
    color: 'from-primary-500/20 to-primary-500/5',
    accent: 'text-primary-500',
  },
  {
    number: '02',
    title: 'Check In Daily',
    description:
      'Open the app once a day — anytime between 16 and 32 hours after your last check-in — and tap Check In to log progress on the blockchain.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'from-emerald-500/20 to-emerald-500/5',
    accent: 'text-emerald-500',
  },
  {
    number: '03',
    title: 'Complete 7 Days & Earn',
    description:
      'Hit a 7-day streak to reclaim your full deposit. On top of that, claim a share of the community reward pool funded by missed check-ins.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'from-amber-500/20 to-amber-500/5',
    accent: 'text-amber-500',
  },
];

const TRUST_STATS = [
  { value: '100%', label: 'Open Source', sub: 'Fully auditable on GitHub' },
  { value: 'No Admin', label: 'No Admin Key', sub: 'Rules cannot be changed' },
  { value: 'BTC', label: 'Bitcoin-Secured', sub: 'Anchored to Bitcoin via Stacks' },
  { value: '10%', label: 'Penalty Rate', sub: 'Per missed check-in window' },
];

const WALLETS = [
  { name: 'Leather', url: 'https://leather.io',  desc: 'Best for desktop Chrome / Firefox', emoji: '🦊' },
  { name: 'Xverse',  url: 'https://xverse.app',  desc: 'Great on mobile & desktop',          emoji: '📱' },
  { name: 'Asigna',  url: 'https://asigna.io',   desc: 'Multisig-focused wallet',            emoji: '🔐' },
];

const FAQ_ITEMS = [
  {
    q: 'What is Stacks and why does it matter?',
    a: 'Stacks is a Bitcoin Layer 2 that lets you write smart contracts secured by the Bitcoin blockchain. Your habits are enforced by code — not by a company — and the security comes from Bitcoin mining.',
  },
  {
    q: 'What happens to my deposit if I miss a day?',
    a: '10% of your remaining deposit is moved into the community pool. Your habit stays active and your streak resets, but you keep the remainder. The forfeited funds reward everyone who stayed consistent.',
  },
  {
    q: 'Is the check-in window really 16–32 hours?',
    a: 'Yes. You must check in at least 16 hours after your last check-in (cooldown) and before 32 hours pass (expiry). This maps to roughly "once a day" while allowing flexible timing.',
  },
  {
    q: 'How is the bonus pool divided?',
    a: 'When you complete a 7-day streak, you become eligible to claim a share of the forfeited pool. Shares are weighted by bonus multipliers earned through referrals. More referrals = bigger share.',
  },
  {
    q: 'Do I need cryptocurrency experience to use this?',
    a: 'Not really. Download a free Stacks wallet (Leather or Xverse), fund it with a small amount of STX, and you\'re ready. The demo mode lets you explore the full app with simulated funds first.',
  },
  {
    q: 'Can I run multiple habits at the same time?',
    a: 'Yes. Each habit is an independent on-chain record with its own deposit and streak. The "Check In All" button on the dashboard lets you check in to all eligible habits in one go.',
  },
];

/* ─── Sub-components ──────────────────────────────────────────── */

function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="divide-y divide-surface-200 dark:divide-surface-700 rounded-2xl border border-surface-200 dark:border-surface-700 overflow-hidden">
      {FAQ_ITEMS.map((item, i) => (
        <div key={i} className="bg-white dark:bg-surface-800">
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors duration-150 group"
            aria-expanded={open === i}
          >
            <span className="font-semibold text-surface-900 dark:text-white text-sm sm:text-base pr-4">
              {item.q}
            </span>
            <svg
              className={`w-5 h-5 text-primary-500 flex-shrink-0 transition-transform duration-300 ${open === i ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {open === i && (
            <div className="px-6 pb-5 text-sm text-surface-600 dark:text-surface-300 leading-relaxed animate-fade-in-up">
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────────── */

export function LandingPage() {
  const { connect, connectDemo, isLoading } = useWallet();

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">

      {/* ══════════════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Animated mesh gradient background */}
        <div className="absolute inset-0 bg-surface-50 dark:bg-surface-900">
          <div className="absolute inset-0 opacity-100">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/8 rounded-full blur-3xl animate-float" style={{ animationDelay: '0s' }} />
            <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-primary-400/6 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
            <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
          </div>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          {/* Logo */}
          <div className="inline-flex items-center gap-3 mb-8 px-4 py-2 rounded-full bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm border border-surface-200/60 dark:border-surface-700/50 shadow-sm animate-fade-in-up">
            <img
              src="/logos/icon-only-dark.jpg"
              alt="AhhbitTracker logo"
              width={28}
              height={28}
              className="h-7 w-7 rounded-lg"
            />
            <span className="text-sm font-bold text-surface-700 dark:text-surface-200">
              <span className="text-primary-500">Ahhbit</span>Tracker
            </span>
            <span className="text-xxs font-bold uppercase tracking-widest text-primary-500 bg-primary-50 dark:bg-primary-500/10 px-2 py-0.5 rounded-full border border-primary-200 dark:border-primary-500/20">
              On Stacks
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-black text-surface-900 dark:text-white mb-5 tracking-tight leading-[1.05] animate-fade-in-up"
            style={{ animationDelay: '0.1s' }}
          >
            Build Habits That{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 via-primary-400 to-amber-500 animate-gradient-shift bg-[length:200%_200%]">
              Actually Stick
            </span>
          </h1>

          {/* Subheadline */}
          <p
            className="max-w-2xl mx-auto text-lg sm:text-xl text-surface-600 dark:text-surface-300 mb-10 leading-relaxed animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            Stake a small STX deposit, check in daily, and earn rewards for staying consistent.
            Miss a day? A portion funds a shared pool that pays everyone who showed up.{' '}
            <strong className="text-surface-800 dark:text-surface-200">Real money, real motivation.</strong>
          </p>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-6 animate-fade-in-up"
            style={{ animationDelay: '0.3s' }}
          >
            <ActionButton
              onClick={connect}
              isLoading={isLoading}
              size="lg"
              className="shadow-glow-primary hover:shadow-glow-primary transition-shadow duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Connect Wallet to Start
            </ActionButton>
            <button
              type="button"
              onClick={connectDemo}
              className="btn-secondary px-8 py-4 text-base border-2 border-surface-200 dark:border-surface-600 hover:border-primary-300 dark:hover:border-primary-500/40 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Try Interactive Demo
            </button>
          </div>

          <p
            className="text-xs text-surface-400 dark:text-surface-500 animate-fade-in-up"
            style={{ animationDelay: '0.4s' }}
          >
            No wallet yet? Explore the full app with simulated funds — no setup needed.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          TRUST / SOCIAL PROOF BAR
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-surface-900 dark:bg-surface-950 border-y border-surface-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {TRUST_STATS.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1">
                <p className="text-xl sm:text-2xl font-black text-white">{s.value}</p>
                <p className="text-xs font-bold text-primary-400 uppercase tracking-widest">{s.label}</p>
                <p className="text-xxs text-surface-400 hidden sm:block">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-primary-500 mb-3">Simple Process</p>
          <h2 className="text-3xl sm:text-4xl font-black text-surface-900 dark:text-white mb-4">
            How It Works
          </h2>
          <p className="text-surface-500 dark:text-surface-400 max-w-xl mx-auto text-base">
            Three steps to start building lasting habits with real on-chain accountability.
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Connector line (desktop only) */}
          <div className="hidden md:block absolute top-10 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-surface-300 dark:via-surface-600 to-transparent pointer-events-none" style={{ top: '2.5rem', left: '18%', right: '18%' }} />

          {STEPS.map((step) => (
            <div
              key={step.number}
              className="group relative bg-white dark:bg-surface-800 rounded-2xl p-6 border border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-500/30 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
            >
              {/* Step number badge */}
              <div className="absolute -top-3 -left-2 w-8 h-8 rounded-full bg-surface-900 dark:bg-surface-950 border-2 border-surface-700 dark:border-surface-600 flex items-center justify-center">
                <span className="text-xxs font-black text-primary-400">{step.number}</span>
              </div>

              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 ${step.accent}`}>
                {step.icon}
              </div>
              <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-2">{step.title}</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          WHY IT WORKS (Psychology + Simulator)
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-white dark:bg-surface-800/50 border-y border-surface-200 dark:border-surface-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary-500 mb-3">The Science</p>
              <h2 className="text-3xl sm:text-4xl font-black text-surface-900 dark:text-white mb-4">
                Why Does It Work?
              </h2>

              {/* Big psychology stat */}
              <div className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-primary-50 to-amber-50 dark:from-primary-500/10 dark:to-amber-500/10 border border-primary-200 dark:border-primary-500/20">
                <p className="text-4xl font-black text-primary-500 mb-1">2×</p>
                <p className="text-sm font-semibold text-surface-800 dark:text-surface-200">
                  more motivated by loss than by gain
                </p>
                <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
                  Loss aversion is one of the most replicated findings in behavioural economics.
                </p>
              </div>

              <p className="text-surface-600 dark:text-surface-300 mb-6 leading-relaxed">
                By putting real tokens on the line, your brain treats each check-in like protecting something
                valuable — not just ticking a box. The penalty pool turns other people's missed days into
                your bonus.
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold">✓</span>
                  <div>
                    <p className="font-semibold text-surface-900 dark:text-white text-sm">Stay consistent → Get deposit back + bonus</p>
                    <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">Complete a 7-day streak to reclaim everything.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-sm font-bold">✗</span>
                  <div>
                    <p className="font-semibold text-surface-900 dark:text-white text-sm">Miss a day → 10% penalty to community pool</p>
                    <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">Your forfeited funds reward users who stayed consistent.</p>
                  </div>
                </div>
              </div>
            </div>

            <StakeCalculator />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          WALLETS SECTION
      ══════════════════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-primary-500 mb-3">Getting Started</p>
          <h2 className="text-3xl sm:text-4xl font-black text-surface-900 dark:text-white mb-4">
            Need a Stacks Wallet?
          </h2>
          <p className="text-surface-500 dark:text-surface-400 max-w-xl mx-auto text-base">
            It takes under 2 minutes to set up — free browser extension or mobile app, no personal info required.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto mb-10">
          {WALLETS.map((wallet) => (
            <a
              key={wallet.name}
              href={wallet.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center text-center p-6 rounded-2xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-500/30 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
            >
              <span className="text-4xl mb-3">{wallet.emoji}</span>
              <h3 className="font-bold text-surface-900 dark:text-white mb-1">{wallet.name}</h3>
              <p className="text-xs text-surface-500 dark:text-surface-400 mb-4 leading-relaxed">{wallet.desc}</p>
              <span className="text-sm font-semibold text-primary-500 group-hover:text-primary-600 transition-colors flex items-center gap-1">
                Download free
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </a>
          ))}
        </div>

        <p className="text-center text-sm text-surface-400 dark:text-surface-500">
          Or <button type="button" onClick={connectDemo} className="text-primary-500 font-semibold hover:text-primary-600 transition-colors underline underline-offset-2">try the demo first</button> — no wallet needed, simulated funds included.
        </p>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-surface-100/60 dark:bg-surface-800/30 border-t border-surface-200 dark:border-surface-700">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-primary-500 mb-3">Questions</p>
            <h2 className="text-3xl sm:text-4xl font-black text-surface-900 dark:text-white mb-4">
              Frequently Asked
            </h2>
          </div>
          <FaqAccordion />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FINAL CTA BANNER
      ══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-amber-500 animate-gradient-shift bg-[length:200%_200%]">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-black/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 text-balance">
            Ready to Hold Yourself Accountable?
          </h2>
          <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Start with any habit. Stake as little as 0.02 STX. Prove you mean it — to yourself.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              onClick={connect}
              className="px-8 py-4 text-base font-bold rounded-2xl bg-white text-primary-600 hover:bg-primary-50 shadow-xl shadow-black/20 hover:shadow-black/30 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Connect Wallet — It's Free
            </button>
            <button
              type="button"
              onClick={connectDemo}
              className="px-8 py-4 text-base font-bold rounded-2xl bg-white/10 text-white hover:bg-white/20 border border-white/20 hover:border-white/30 active:scale-[0.98] transition-all duration-200 backdrop-blur-sm flex items-center justify-center gap-2"
            >
              Try Demo First
            </button>
          </div>
          <p className="text-white/60 text-xs mt-6">
            Bitcoin-secured · No admin key · 100% open source
          </p>
        </div>
      </section>
    </div>
  );
}

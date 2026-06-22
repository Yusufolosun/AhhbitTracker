import { useState, useCallback, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { useToast } from '../context/ToastContext';
import { shortenAddress, formatSTX } from '../utils/formatting';
import { addressUrl } from '@yusufolosun/stx-utils';
import { ThemeToggle } from './ThemeToggle';
import { useHashRoute } from '../hooks/useHashRoute';
import { ActionButton } from './ui';
import { trackEvent } from '../analytics';

const NAV_LINKS = [
  { href: '#dashboard',    label: 'Dashboard',     icon: '◈' },
  { href: '#habits',       label: 'My Habits',     icon: '✦' },
  { href: '#create-habit', label: 'New Habit',     icon: '+' },
  { href: '#pool',         label: 'Pool',          icon: '◉' },
];

export function Header() {
  const {
    walletState,
    connect,
    disconnect,
    isLoading,
    isBalanceLoading,
    isDisconnecting,
    isDemoMode,
  } = useWallet();
  const { showToast } = useToast();
  const { route } = useHashRoute();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMenu  = useCallback(() => setMobileMenuOpen((p) => !p), []);
  const closeMenu   = useCallback(() => setMobileMenuOpen(false), []);

  useEffect(() => { setMobileMenuOpen(false); }, [route]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileMenuOpen]);

  const handleDisconnect = async () => {
    trackEvent('wallet_disconnect_clicked', { source: 'header' });
    try {
      await disconnect();
      showToast(isDemoMode ? 'Demo session ended.' : 'Wallet disconnected.', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to disconnect.', 'error');
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/85 dark:bg-surface-950/85 border-b border-surface-200/60 dark:border-surface-700/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* ── Logo ── */}
          <a href="#dashboard" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="relative">
              <img
                src="/logos/icon-only-dark.jpg"
                alt="AhhbitTracker"
                width={36}
                height={36}
                className="h-9 w-9 rounded-xl shadow-sm group-hover:shadow-glow-primary-sm transition-shadow duration-300"
              />
            </div>
            <span className="text-xl font-extrabold tracking-tight hidden sm:block">
              <span className="text-primary-500">Ahhbit</span>
              <span className="text-surface-900 dark:text-white">Tracker</span>
            </span>
          </a>

          {/* ── Desktop Navigation ── */}
          <nav className="hidden md:flex items-center bg-surface-100/70 dark:bg-surface-800/60 rounded-2xl px-1.5 py-1.5 gap-0.5" aria-label="Primary navigation">
            {NAV_LINKS.map((link) => {
              const isActive = link.href === `#${route}`;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={[
                    'relative px-4 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap',
                    isActive
                      ? 'bg-white dark:bg-surface-700 text-primary-500 shadow-sm'
                      : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-surface-700/50',
                  ].join(' ')}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* ── Right side controls ── */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {walletState.isConnected ? (
              <>
                {/* Wallet pill */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm">
                  {isDemoMode ? (
                    <>
                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse flex-shrink-0" />
                      <span className="font-semibold text-amber-600 dark:text-amber-400">Demo</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse flex-shrink-0" />
                      <a
                        href={addressUrl(walletState.address!, 'mainnet')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-surface-700 dark:text-surface-300 hover:text-primary-500 transition-colors"
                        title="View on Stacks Explorer"
                      >
                        {shortenAddress(walletState.address!)}
                      </a>
                    </>
                  )}
                  <span className="text-xs text-surface-400 border-l border-surface-300 dark:border-surface-600 pl-2">
                    {isDemoMode
                      ? `${formatSTX(walletState.balance)} STX`
                      : isBalanceLoading
                        ? '…'
                        : walletState.balance > 0
                          ? `${formatSTX(walletState.balance)} STX`
                          : null}
                  </span>
                </div>

                <ActionButton
                  onClick={() => void handleDisconnect()}
                  isLoading={isDisconnecting}
                  variant="ghost"
                  size="sm"
                  className="text-xs px-3"
                  aria-label="Disconnect wallet"
                >
                  {isDemoMode ? 'Exit Demo' : 'Disconnect'}
                </ActionButton>
              </>
            ) : (
              <ActionButton onClick={connect} isLoading={isLoading} size="sm" className="text-xs px-4">
                Connect Wallet
              </ActionButton>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-xl text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Navigation ── */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-surface-200 dark:border-surface-700 bg-white/95 dark:bg-surface-950/95 backdrop-blur-xl animate-slide-down" aria-label="Mobile navigation">
          <div className="px-4 py-3 space-y-1">
            {NAV_LINKS.map((link) => {
              const isActive = link.href === `#${route}`;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className={[
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-all duration-200',
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
                      : 'text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800',
                  ].join(' ')}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="text-lg leading-none">{link.icon}</span>
                  {link.label}
                </a>
              );
            })}
          </div>

          {walletState.isConnected && (
            <div className="px-4 py-3 border-t border-surface-200 dark:border-surface-700">
              <div className="flex items-center justify-between bg-surface-50 dark:bg-surface-800/60 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isDemoMode ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`} />
                  <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                    {isDemoMode ? 'Demo Mode' : shortenAddress(walletState.address!)}
                  </span>
                </div>
                <span className="text-xs font-semibold text-surface-500">
                  {formatSTX(walletState.balance)} STX
                </span>
              </div>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}

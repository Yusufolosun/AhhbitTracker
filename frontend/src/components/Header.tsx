import { useState, useCallback } from 'react';
import { useWallet } from '../context/WalletContext';
import { shortenAddress, formatSTX } from '../utils/formatting';
import { EXPLORER_ADDRESS_URL } from '../utils/constants';
import { ThemeToggle } from './ThemeToggle';
import { useHashRoute } from '../hooks/useHashRoute';

const NAV_LINKS = [
  { href: '#dashboard', label: 'Dashboard' },
  { href: '#habits', label: 'My Habits' },
  { href: '#create-habit', label: 'New Habit' },
  { href: '#pool', label: 'Pool' },
];

export function Header() {
  const { walletState, connect, disconnect } = useWallet();
  const { route } = useHashRoute();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <header className="bg-white dark:bg-surface-950 border-b border-surface-200 dark:border-surface-700 sticky top-0 z-50 backdrop-blur-sm bg-white/90 dark:bg-surface-950/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <a href="#dashboard" className="flex items-center gap-3 group">
            <img
              src="/logos/icon-only-dark.jpg"
              alt="AhhbitTracker"
              className="h-9 w-9 rounded-lg"
            />
            <span className="text-xl font-bold">
              <span className="text-primary-500">Ahhbit</span>
              <span className="text-surface-900 dark:text-white">Tracker</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {NAV_LINKS.map((link) => {
              const isActive = link.href === `#${route}`;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-primary-500 bg-primary-50 dark:bg-primary-500/10'
                      : 'text-surface-600 dark:text-surface-400 hover:text-primary-500 hover:bg-surface-100 dark:hover:bg-surface-800'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Wallet + Theme + Mobile Toggle */}
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            {walletState.isConnected ? (
              <>
                <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-surface-100 dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <a
                    href={`${EXPLORER_ADDRESS_URL}${walletState.address!}?chain=mainnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-surface-700 dark:text-surface-300 hover:text-primary-500 transition-colors"
                    title="View on Stacks Explorer"
                  >
                    {shortenAddress(walletState.address!)}
                  </a>
                  {walletState.balance > 0 && (
                    <span className="text-xs text-surface-500 border-l border-surface-300 dark:border-surface-600 pl-2">
                      {formatSTX(walletState.balance)} STX
                    </span>
                  )}
                </div>
                <button
                  onClick={disconnect}
                  className="text-sm text-surface-500 hover:text-primary-500 dark:text-surface-400 dark:hover:text-primary-400 transition-colors"
                  aria-label="Disconnect wallet"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button onClick={connect} className="btn-primary text-sm px-4 py-2">
                Connect Wallet
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-lg text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
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

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-950 animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {NAV_LINKS.map((link) => {
              const isActive = link.href === `#${route}`;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className={`block px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                    isActive
                      ? 'text-primary-500 bg-primary-50 dark:bg-primary-500/10'
                      : 'text-surface-700 dark:text-surface-300 hover:text-primary-500 hover:bg-surface-100 dark:hover:bg-surface-800'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </div>

          {/* Mobile wallet info */}
          {walletState.isConnected && (
            <div className="px-4 py-3 border-t border-surface-200 dark:border-surface-700 sm:hidden">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                  {shortenAddress(walletState.address!)}
                </span>
              </div>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}

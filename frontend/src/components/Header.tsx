import React from 'react';
import { useWallet } from '../context/WalletContext';
import { shortenAddress } from '../utils/formatting';

export function Header() {
  const { address, isConnected, connect, disconnect } = useWallet();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary-500">
              AhhbitTracker
            </h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#dashboard" className="text-gray-700 hover:text-primary-500 transition-colors">
              Dashboard
            </a>
            <a href="#habits" className="text-gray-700 hover:text-primary-500 transition-colors">
              My Habits
            </a>
            <a href="#pool" className="text-gray-700 hover:text-primary-500 transition-colors">
              Pool
            </a>
            <a href="#docs" className="text-gray-700 hover:text-primary-500 transition-colors">
              Docs
            </a>
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <>
                <div className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">
                    {shortenAddress(address!)}
                  </span>
                </div>
                <button
                  onClick={disconnect}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={connect}
                className="btn-primary"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

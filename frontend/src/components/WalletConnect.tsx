import React from 'react';
import { useWallet } from '../context/WalletContext';

export function WalletConnect() {
  const { connect, isLoading } = useWallet();

  const handleConnect = () => {
    console.log('Connect button clicked');
    connect();
  };

  return (
    <div className="card max-w-md mx-auto text-center animate-fade-in">
      <div className="mb-6">
        <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Connect Your Wallet
        </h2>
        <p className="text-gray-600">
          Connect your Stacks wallet to start building better habits
        </p>
      </div>

      <button
        onClick={handleConnect}
        disabled={isLoading}
        className="btn-primary w-full mb-4"
      >
        {isLoading ? 'Connecting...' : 'Connect Wallet'}
      </button>

      <div className="text-sm text-gray-500">
        <p className="mb-2">Supported wallets:</p>
        <div className="flex justify-center space-x-4">
          <span>Leather</span>
          <span>•</span>
          <span>Xverse</span>
          <span>•</span>
          <span>Asigna</span>
        </div>
      </div>
    </div>
  );
}

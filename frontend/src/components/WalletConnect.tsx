import React from 'react';
import { showConnect } from '@stacks/connect';

export function WalletConnect() {
  const handleConnect = () => {
    showConnect({
      appDetails: {
        name: 'AhhbitTracker',
        icon: '/logo.png',
      },
      onFinish: () => {
        window.location.reload();
      },
    });
  };

  return (
    <button onClick={handleConnect} className="wallet-connect-btn">
      Connect Wallet
    </button>
  );
}

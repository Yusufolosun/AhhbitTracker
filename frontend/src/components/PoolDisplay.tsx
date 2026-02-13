import React, { useState, useEffect } from 'react';
import { contractService } from '../services/contractService';
import { formatSTX } from '../utils/formatting';

export function PoolDisplay() {
  const [poolBalance, setPoolBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPool() {
      try {
        const balance = await contractService.getPoolBalance();
        setPoolBalance(balance);
      } catch (err) {
        console.error('Failed to fetch pool balance:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPool();

    // Poll every 30 seconds
    const interval = setInterval(fetchPool, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="card">
        <div className="flex justify-center py-8">
          <div className="spinner w-8 h-8"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-primary-700 mb-1">
            Forfeited Pool Balance
          </p>
          <p className="text-3xl font-bold text-primary-900">
            {formatSTX(poolBalance)} STX
          </p>
          <p className="text-xs text-primary-600 mt-1">
            Available for successful users
          </p>
        </div>
        <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      {poolBalance > 0 && (
        <div className="mt-4 pt-4 border-t border-primary-300">
          <p className="text-sm text-primary-700">
            💰 Complete your habits to claim a share of this pool!
          </p>
        </div>
      )}
    </div>
  );
}

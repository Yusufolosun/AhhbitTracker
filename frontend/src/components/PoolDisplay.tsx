import { useState } from 'react';
import { useHabits } from '../hooks/useHabits';
import { useRewards } from '../hooks/useRewards';
import { formatSTX, toMicroSTX } from '../utils/formatting';
import { PoolSkeleton } from './Skeletons';
import { CalloutCard, SurfaceCard, ActionButton } from './ui';

export function PoolDisplay() {
  const { poolBalance, poolError, isLoadingHabits: loading } = useHabits();
  const { rewardPoolBalance, fundRewardPool, isFundingRewardPool } = useRewards();
  const [fundAmount, setFundAmount] = useState('10');

  const handleFund = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fundRewardPool(toMicroSTX(Number(fundAmount)));
      setFundAmount('10');
    } catch (err: unknown) {
      // Error handled by mutation/toast
    }
  };

  if (loading) {
    return <PoolSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SurfaceCard
          tone="accent"
          className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/10"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-700 dark:text-primary-400 mb-1">
                Forfeited Pool Balance
              </p>
              <p className="text-3xl font-bold text-primary-900 dark:text-white">
                {formatSTX(poolBalance)} STX
              </p>
              <p className="text-xs text-primary-600 dark:text-primary-400/70 mt-1">
                From missed check-in penalties
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard
          tone="accent"
          className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/10"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-1">
                Streak Reward Pool
              </p>
              <p className="text-3xl font-bold text-emerald-900 dark:text-white">
                {formatSTX(rewardPoolBalance)} STX
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400/70 mt-1">
                For milestone achievements
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
              </svg>
            </div>
          </div>
        </SurfaceCard>
      </div>

      <SurfaceCard>
        <h3 className="text-lg font-semibold mb-4">Support the Community</h3>
        <p className="text-sm text-surface-600 dark:text-surface-400 mb-6">
          The Streak Reward Pool is community-funded. Contribute STX to help reward consistent habit builders!
        </p>
        
        <form onSubmit={handleFund} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="number"
              className="input pr-12"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
              min="1"
              required
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-surface-400 text-sm">STX</span>
            </div>
          </div>
          <ActionButton
            type="submit"
            disabled={isFundingRewardPool}
            className="whitespace-nowrap"
          >
            {isFundingRewardPool ? 'Funding...' : 'Fund Reward Pool'}
          </ActionButton>
        </form>
      </SurfaceCard>
    </div>
  );
}

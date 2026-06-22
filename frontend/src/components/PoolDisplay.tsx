import { useState } from 'react';
import { useHabits } from '../hooks/useHabits';
import { useRewards } from '../hooks/useRewards';
import { formatSTX, toMicroSTX } from '../utils/formatting';
import { PoolSkeleton } from './Skeletons';
import { SurfaceCard, ActionButton } from './ui';

export function PoolDisplay() {
  const { poolBalance, isLoadingHabits: loading, unclaimedCompletedWeight } = useHabits();
  const { rewardPoolBalance, fundRewardPool, isFundingRewardPool } = useRewards();
  const [fundAmount, setFundAmount] = useState('10');

  const handleFund = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fundRewardPool(toMicroSTX(Number(fundAmount)));
      setFundAmount('10');
    } catch {
      // Error handled by mutation/toast
    }
  };

  if (loading) return <PoolSkeleton />;

  return (
    <div className="space-y-6">
      {/* ── Pool balance cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Forfeited pool */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 p-6 shadow-lg shadow-primary-500/25">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-white/80">Forfeited Pool</p>
              <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-4xl font-black text-white mb-1">{formatSTX(poolBalance)}</p>
            <p className="text-sm font-semibold text-white/70">STX</p>
            <p className="text-xs text-white/50 mt-3">From missed check-in penalties</p>
            <p className="text-xxs text-white/40 mt-0.5">
              {unclaimedCompletedWeight} pending claimant{unclaimedCompletedWeight === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        {/* Streak reward pool */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 shadow-lg shadow-emerald-500/25">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-white/80">Streak Reward Pool</p>
              <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
                </svg>
              </div>
            </div>
            <p className="text-4xl font-black text-white mb-1">{formatSTX(rewardPoolBalance)}</p>
            <p className="text-sm font-semibold text-white/70">STX</p>
            <p className="text-xs text-white/50 mt-3">For milestone achievements</p>
          </div>
        </div>
      </div>

      {/* ── How pools work callout ── */}
      <div className="flex items-start gap-4 p-4 rounded-2xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center text-base">
          💡
        </div>
        <div>
          <p className="text-sm font-semibold text-surface-800 dark:text-surface-200 mb-1">How pools work</p>
          <p className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed">
            Every missed check-in deducts 10% of the habit's stake and moves it to the{' '}
            <strong className="text-surface-700 dark:text-surface-300">Forfeited Pool</strong>. When you complete
            a 7-day streak and claim your bonus, you receive an equal share of this pool. The{' '}
            <strong className="text-surface-700 dark:text-surface-300">Streak Reward Pool</strong> is
            community-funded and pays out on milestone achievements.
          </p>
        </div>
      </div>

      {/* ── Fund reward pool form ── */}
      <SurfaceCard>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-500/20 dark:to-emerald-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-surface-900 dark:text-white">Support the Community</h3>
            <p className="text-xs text-surface-500 dark:text-surface-400">Contribute STX to help reward consistent habit builders</p>
          </div>
        </div>

        <form onSubmit={handleFund} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="number"
              className="input pr-14"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
              min="1"
              required
              aria-label="Amount to fund in STX"
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <span className="text-sm font-semibold text-surface-400">STX</span>
            </div>
          </div>
          <ActionButton type="submit" disabled={isFundingRewardPool} className="whitespace-nowrap sm:w-auto w-full">
            {isFundingRewardPool ? 'Funding…' : 'Fund Reward Pool'}
          </ActionButton>
        </form>
      </SurfaceCard>
    </div>
  );
}

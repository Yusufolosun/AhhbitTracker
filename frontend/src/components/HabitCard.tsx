import { useState } from 'react';
import { Habit } from '../types/habit';
import { useHabits } from '../hooks/useHabits';
import { useWallet } from '../context/WalletContext';
import { useToast } from '../context/ToastContext';
import { formatSTX, blocksAgo, blocksToTime } from '../utils/formatting';
import { useCurrentBlock } from '../hooks/useCurrentBlock';
import { MIN_STREAK_FOR_WITHDRAWAL, CONTRACT_ADDRESS, CONTRACT_NAME } from '../utils/constants';
import { contractUrl } from '@yusufolosun/stx-utils';
import { ConfirmationDialog } from './ConfirmationDialog';
import { getCheckInWindowState, getBlocksRemaining, isEligibleToWithdraw } from '../utils/habitStatus';

interface HabitCardProps {
  habit: Habit;
}

export function HabitCard({ habit }: HabitCardProps) {
  const { checkIn, withdrawStake, claimBonus, slashHabit, poolBalance, pendingCheckIns, pendingWithdrawals, pendingClaims, pendingSlashes } = useHabits();
  const { showToast } = useToast();
  const { walletState } = useWallet();
  const [confirmAction, setConfirmAction] = useState<'withdraw' | 'claim' | 'slash' | null>(null);
  const currentBlock = useCurrentBlock();

  const isCheckingIn = pendingCheckIns.has(habit.habitId);
  const isWithdrawing = pendingWithdrawals.has(habit.habitId);
  const isClaiming = pendingClaims.has(habit.habitId);
  const isSlashing = pendingSlashes.has(habit.habitId);
  const isOwnHabit = walletState.address?.toLowerCase() === habit.owner.toLowerCase();

  const handleCheckIn = async () => {
    try {
      await checkIn(habit.habitId);
      showToast('Check-in signed! It will update once confirmed on-chain.', 'success');
    } catch (err: any) {
      if (err.message === 'Transaction cancelled') {
        showToast('Check-in was cancelled.', 'error');
      } else if (err.message?.includes('u114') || err.message?.includes('ERR-HABIT-AUTO-SLASHED')) {
        showToast('Your habit was forfeited because the check-in window expired.', 'error');
      } else {
        showToast(err.message || 'Check-in failed', 'error');
      }
    }
  };

  const handleWithdraw = () => {
    setConfirmAction('withdraw');
  };

  const handleClaimBonus = () => {
    setConfirmAction('claim');
  };

  const handleSlashHabit = () => {
    setConfirmAction('slash');
  };

  const executeConfirmedAction = async () => {
    const action = confirmAction;
    setConfirmAction(null);
    try {
      if (action === 'withdraw') {
        await withdrawStake({ habitId: habit.habitId, stakeAmount: habit.stakeAmount });
        showToast('Withdrawal signed! Your STX will return once confirmed on-chain.', 'success');
      } else if (action === 'claim') {
        await claimBonus(habit.habitId);
        showToast('Bonus claim signed! It will arrive once confirmed on-chain.', 'success');
      } else if (action === 'slash') {
        await slashHabit(habit.habitId);
        showToast('Habit finalized! Stake will be moved to the pool once confirmed on-chain.', 'success');
      }
    } catch (err: any) {
      if (err.message === 'Transaction cancelled') {
        showToast('Transaction was cancelled.', 'error');
      } else {
        showToast(err.message || 'Transaction failed', 'error');
      }
    }
  };

  const windowState = getCheckInWindowState(habit, currentBlock);
  const canWithdraw = isEligibleToWithdraw(habit);
  const canClaimBonus = habit.isCompleted && !habit.bonusClaimed;
  const blocksRemaining = currentBlock !== null ? getBlocksRemaining(habit, currentBlock) : null;
  const estimatedBonus = Math.min(Math.floor(poolBalance / 100), 1_000_000);

  const getBadge = () => {
    if (habit.isCompleted) return { label: 'Completed', className: 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-400' };
    if (!habit.isActive && !habit.isCompleted) return { label: 'Forfeited', className: 'bg-surface-100 text-surface-600 dark:bg-surface-700 dark:text-surface-400' };
    if (windowState === 'expired') return { label: 'Window Expired', className: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-400' };
    if (windowState === 'urgent') return { label: 'Expiring Soon', className: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400' };
    return { label: 'Active', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400' };
  };

  const badge = getBadge();

  return (
    <div className={`card hover:shadow-md transition-all duration-200 ${
      windowState === 'expired'
        ? 'border-red-300 dark:border-red-500/30 hover:border-red-400 dark:hover:border-red-500/40'
        : windowState === 'urgent'
          ? 'border-amber-300 dark:border-amber-500/30 hover:border-amber-400 dark:hover:border-amber-500/40'
          : 'hover:border-primary-500/30 dark:hover:border-primary-500/20'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-1">
            <span className="text-xs font-normal text-surface-400 dark:text-surface-500 mr-1.5">#{habit.habitId}</span>
            {habit.name}
          </h3>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
              {badge.label}
            </span>
            {canWithdraw && windowState !== 'expired' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400">
                Ready to Withdraw
              </span>
            )}
          </div>
        </div>

        {/* Streak Display */}
        <div className="text-right">
          <div className="text-3xl font-bold text-primary-500">
            {habit.currentStreak}
          </div>
          <div className="text-xs text-gray-500">day streak</div>
        </div>
      </div>

      {/* Window expired warning */}
      {windowState === 'expired' && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 dark:bg-red-500/10 dark:border-red-500/20">
          <p className="text-sm font-medium text-red-800 dark:text-red-300">
            Check-in window has expired
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
            Your {formatSTX(habit.stakeAmount)} STX stake will be forfeited to the pool. This habit cannot be recovered.
          </p>
        </div>
      )}

      {/* Urgent window warning */}
      {windowState === 'urgent' && blocksRemaining !== null && (
        <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
            ~{blocksToTime(blocksRemaining)} remaining to check in
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
            Check in soon or your {formatSTX(habit.stakeAmount)} STX stake will be forfeited.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-surface-500 dark:text-surface-400">Stake</p>
          <p className="text-sm font-semibold text-surface-900 dark:text-white">
            {formatSTX(habit.stakeAmount)} STX
          </p>
        </div>
        <div>
          <p className="text-xs text-surface-500 dark:text-surface-400">Last Check-in</p>
          <p className="text-sm font-semibold text-surface-900 dark:text-white" title={`Block ${habit.lastCheckInBlock}`}>
            {currentBlock
              ? blocksAgo(currentBlock, habit.lastCheckInBlock)
              : `Block ${habit.lastCheckInBlock}`}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col space-y-2">
        {habit.isActive && windowState !== 'expired' && isOwnHabit && (
          <button
            onClick={handleCheckIn}
            disabled={isCheckingIn}
            className="btn-primary w-full"
          >
            {isCheckingIn ? 'Checking In...' : 'Check In'}
          </button>
        )}

        {canWithdraw && isOwnHabit && (
          <button
            onClick={handleWithdraw}
            disabled={isWithdrawing}
            className="btn-secondary w-full"
          >
            {isWithdrawing ? 'Withdrawing...' : 'Withdraw Stake'}
          </button>
        )}

        {canClaimBonus && isOwnHabit && (
          <button
            onClick={handleClaimBonus}
            disabled={isClaiming}
            className="btn-secondary w-full"
          >
            {isClaiming ? 'Claiming...' : 'Claim Bonus'}
          </button>
        )}

        {windowState === 'expired' && !isOwnHabit && habit.isActive && (
          <button
            onClick={handleSlashHabit}
            disabled={isSlashing}
            className="btn-secondary w-full"
          >
            {isSlashing ? 'Finalizing...' : 'Finalize Expired Habit'}
          </button>
        )}
      </div>

      {/* Contract link */}
      <div className="mt-3 pt-3 border-t border-surface-200 dark:border-surface-700 text-right">
        <a
          href={contractUrl(`${CONTRACT_ADDRESS}.${CONTRACT_NAME}`, 'mainnet')}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-surface-400 hover:text-primary-500 transition-colors"
        >
          View on Stacks Explorer &rarr;
        </a>
      </div>

      {/* Progress Indicator */}
      {habit.isActive && (
        <div className="mt-4 pt-4 border-t border-surface-200 dark:border-surface-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-surface-600 dark:text-surface-400">Progress to Withdrawal</span>
            <span className="text-xs font-medium text-surface-900 dark:text-white">
              {habit.currentStreak}/{MIN_STREAK_FOR_WITHDRAWAL} days
            </span>
          </div>
          <div
            className="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-2"
            role="progressbar"
            aria-valuenow={Math.min(habit.currentStreak, MIN_STREAK_FOR_WITHDRAWAL)}
            aria-valuemin={0}
            aria-valuemax={MIN_STREAK_FOR_WITHDRAWAL}
            aria-label={`Streak progress: ${habit.currentStreak} of ${MIN_STREAK_FOR_WITHDRAWAL} days`}
          >
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((habit.currentStreak / MIN_STREAK_FOR_WITHDRAWAL) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Withdraw Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmAction === 'withdraw'}
        title="Withdraw Stake"
        confirmLabel="Withdraw"
        onConfirm={executeConfirmedAction}
        onCancel={() => setConfirmAction(null)}
        isLoading={isWithdrawing}
      >
        <div className="space-y-2">
          <p>You are about to withdraw your stake from:</p>
          <dl className="bg-surface-50 dark:bg-surface-700 rounded-lg p-3 space-y-1">
            <div className="flex justify-between">
              <dt className="text-surface-500 dark:text-surface-400">Habit</dt>
              <dd className="font-medium text-surface-900 dark:text-white">{habit.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-surface-500 dark:text-surface-400">Stake</dt>
              <dd className="font-medium text-surface-900 dark:text-white">{formatSTX(habit.stakeAmount)} STX</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-surface-500 dark:text-surface-400">Current Streak</dt>
              <dd className="font-medium text-surface-900 dark:text-white">{habit.currentStreak} days</dd>
            </div>
          </dl>
          <p className="text-xs text-amber-600 dark:text-amber-400">
            This action is irreversible and will incur a gas fee.
          </p>
        </div>
      </ConfirmationDialog>

      {/* Claim Bonus Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmAction === 'claim'}
        title="Claim Bonus"
        confirmLabel="Claim"
        onConfirm={executeConfirmedAction}
        onCancel={() => setConfirmAction(null)}
        isLoading={isClaiming}
      >
        <div className="space-y-2">
          <p>You are about to claim a bonus reward for:</p>
          <dl className="bg-surface-50 dark:bg-surface-700 rounded-lg p-3 space-y-1">
            <div className="flex justify-between">
              <dt className="text-surface-500 dark:text-surface-400">Habit</dt>
              <dd className="font-medium text-surface-900 dark:text-white">{habit.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-surface-500 dark:text-surface-400">Final Streak</dt>
              <dd className="font-medium text-surface-900 dark:text-white">{habit.currentStreak} days</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-surface-500 dark:text-surface-400">Est. Bonus</dt>
              <dd className="font-medium text-emerald-600 dark:text-emerald-400">{formatSTX(estimatedBonus)} STX</dd>
            </div>
          </dl>
          <p className="text-xs text-surface-500 dark:text-surface-400">
            Bonus is 1% of the current pool, capped at 1 STX. The actual amount may differ slightly if the pool changes before confirmation.
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400">
            This action is irreversible and will incur a gas fee.
          </p>
        </div>
      </ConfirmationDialog>

      {/* Slash Habit Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmAction === 'slash'}
        title="Finalize Expired Habit"
        confirmLabel="Finalize"
        onConfirm={executeConfirmedAction}
        onCancel={() => setConfirmAction(null)}
        isLoading={isSlashing}
      >
        <div className="space-y-2">
          <p>You are about to finalize an expired habit. This will move the forfeited stake to the pool:</p>
          <dl className="bg-surface-50 dark:bg-surface-700 rounded-lg p-3 space-y-1">
            <div className="flex justify-between">
              <dt className="text-surface-500 dark:text-surface-400">Habit</dt>
              <dd className="font-medium text-surface-900 dark:text-white">{habit.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-surface-500 dark:text-surface-400">Owner</dt>
              <dd className="font-medium text-surface-900 dark:text-white truncate max-w-[200px]" title={habit.owner}>{habit.owner}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-surface-500 dark:text-surface-400">Stake Amount</dt>
              <dd className="font-medium text-surface-900 dark:text-white">{formatSTX(habit.stakeAmount)} STX</dd>
            </div>
          </dl>
          <p className="text-xs text-surface-500 dark:text-surface-400">
            Anyone can finalize an expired habit. The stake will be added to the forfeited pool for future bonus claims.
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400">
            This action will incur a gas fee.
          </p>
        </div>
      </ConfirmationDialog>
    </div>
  );
}

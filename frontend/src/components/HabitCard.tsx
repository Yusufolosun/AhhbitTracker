import { useState } from 'react';
import { Habit } from '../types/habit';
import { useHabits } from '../hooks/useHabits';
import { useWallet } from '../context/WalletContext';
import { useToast } from '../context/ToastContext';
import { formatSTX, blocksAgo, blocksToTime } from '../utils/formatting';
import { useCurrentBlock } from '../hooks/useCurrentBlock';
import { MIN_STREAK_FOR_WITHDRAWAL, CONTRACT_ADDRESS, CONTRACT_NAME } from '../utils/constants';
import { contractExplorerUrl } from '../utils/explorer';
import { ConfirmationDialog } from './ConfirmationDialog';
import { Badge, ProgressRing } from './ui';
import {
  getCheckInWindowState,
  getBlocksRemaining,
  getBlocksUntilNextCheckIn,
  isEligibleForDailyCheckIn,
  isEligibleToWithdraw,
} from '../utils/habitStatus';
import { trackEvent } from '../analytics';

interface HabitCardProps {
  habit: Habit;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unknown error occurred';
}

function getFlameEmoji(streak: number): string {
  if (streak >= 30) return '🔥🔥🔥';
  if (streak >= 14) return '🔥🔥';
  if (streak >= 3)  return '🔥';
  return '';
}

export function HabitCard({ habit }: HabitCardProps) {
  const {
    checkIn,
    withdrawStake,
    claimBonus,
    slashHabit,
    estimatedBonusShare,
    unclaimedCompletedHabits,
    pendingCheckIns,
    pendingWithdrawals,
    pendingClaims,
    pendingSlashes,
  } = useHabits();
  const { showToast }     = useToast();
  const { walletState }   = useWallet();
  const [confirmAction, setConfirmAction] = useState<'withdraw' | 'claim' | 'slash' | null>(null);
  const currentBlock = useCurrentBlock();

  const isCheckingIn  = pendingCheckIns.has(habit.habitId);
  const isWithdrawing = pendingWithdrawals.has(habit.habitId);
  const isClaiming    = pendingClaims.has(habit.habitId);
  const isSlashing    = pendingSlashes.has(habit.habitId);
  const isOwnHabit    = walletState.address?.toLowerCase() === habit.owner.toLowerCase();

  const handleCheckIn = async () => {
    trackEvent('habit_check_in_clicked', { habitId: habit.habitId });
    try {
      await checkIn(habit.habitId);
      trackEvent('habit_check_in_succeeded', { habitId: habit.habitId });
      showToast('Check-in signed! It will update once confirmed on-chain.', 'success');
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      trackEvent('habit_check_in_failed', { habitId: habit.habitId, errorMessage: message });
      if (message === 'Transaction cancelled') {
        showToast('Check-in was cancelled.', 'error');
      } else if (message.includes('u114') || message.includes('ERR-HABIT-AUTO-SLASHED')) {
        showToast('Your habit was penalized because the check-in window expired.', 'error');
      } else {
        showToast(message, 'error');
      }
    }
  };

  const executeConfirmedAction = async () => {
    const action = confirmAction;
    setConfirmAction(null);
    try {
      if (action === 'withdraw') {
        await withdrawStake({ habitId: habit.habitId, stakeAmount: habit.stakeAmount });
        trackEvent('habit_withdraw_succeeded', { habitId: habit.habitId });
        showToast('Withdrawal signed! Your STX will return once confirmed on-chain.', 'success');
      } else if (action === 'claim') {
        await claimBonus(habit.habitId);
        trackEvent('habit_claim_succeeded', { habitId: habit.habitId });
        showToast('Bonus claim signed! It will arrive once confirmed on-chain.', 'success');
      } else if (action === 'slash') {
        await slashHabit(habit.habitId);
        trackEvent('habit_finalize_succeeded', { habitId: habit.habitId });
        showToast('Habit finalized! Stake will be moved to the pool once confirmed on-chain.', 'success');
      }
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      if (action === 'withdraw')      trackEvent('habit_withdraw_failed',  { habitId: habit.habitId, errorMessage: message });
      else if (action === 'claim')    trackEvent('habit_claim_failed',     { habitId: habit.habitId, errorMessage: message });
      else if (action === 'slash')    trackEvent('habit_finalize_failed',  { habitId: habit.habitId, errorMessage: message });
      showToast(message === 'Transaction cancelled' ? 'Transaction was cancelled.' : message, 'error');
    }
  };

  const windowState          = getCheckInWindowState(habit, currentBlock);
  const canWithdraw          = isEligibleToWithdraw(habit, currentBlock);
  const canClaimBonus        = habit.isCompleted && !habit.bonusClaimed;
  const blocksRemaining      = currentBlock !== null ? getBlocksRemaining(habit, currentBlock) : null;
  const blocksUntilNextCheckIn = currentBlock !== null ? getBlocksUntilNextCheckIn(habit, currentBlock) : null;
  const canSubmitCheckIn     = isEligibleForDailyCheckIn(habit, currentBlock);

  /* ── Badge variant mapping ── */
  const getBadgeVariant = (): 'active' | 'cooldown' | 'urgent' | 'expired' | 'completed' | 'forfeited' => {
    if (habit.isCompleted)                       return 'completed';
    if (!habit.isActive && !habit.isCompleted)   return 'forfeited';
    if (windowState === 'expired')               return 'expired';
    if (windowState === 'urgent')                return 'urgent';
    if (windowState === 'cooldown')              return 'cooldown';
    return 'active';
  };

  /* ── Card border color based on state ── */
  const cardBorderClass =
    windowState === 'expired'
      ? 'border-red-300 dark:border-red-500/30 shadow-glow-red'
      : windowState === 'urgent'
        ? 'border-amber-300 dark:border-amber-500/30 animate-glow-amber'
        : canWithdraw
          ? 'border-emerald-300 dark:border-emerald-500/30 animate-glow-emerald'
          : 'hover:border-primary-500/30 dark:hover:border-primary-500/20';

  /* ── Progress ring color ── */
  const ringColor =
    windowState === 'expired' ? 'red'
    : windowState === 'urgent' ? 'amber'
    : canWithdraw ? 'emerald'
    : 'primary';

  const flame = getFlameEmoji(habit.currentStreak);

  return (
    <div className={`card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5 ${cardBorderClass}`}>

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0 pr-3">
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant={getBadgeVariant()} />
            {canWithdraw && <Badge variant="completed" label="Ready to Withdraw" />}
          </div>
          <h3 className="text-base font-bold text-surface-900 dark:text-white truncate">
            {habit.name}
          </h3>
          <p className="text-xxs text-surface-400 dark:text-surface-500 mt-0.5">#{habit.habitId}</p>
        </div>

        {/* Progress Ring replaces old streak counter */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <ProgressRing
            value={Math.min(habit.currentStreak, MIN_STREAK_FOR_WITHDRAWAL)}
            max={MIN_STREAK_FOR_WITHDRAWAL}
            size={60}
            strokeWidth={5}
            color={ringColor}
            label={`${habit.currentStreak}`}
          />
          <span className="text-xxs text-surface-500 dark:text-surface-400 whitespace-nowrap">
            {habit.currentStreak === 1 ? 'day' : 'days'} {flame}
          </span>
        </div>
      </div>

      {/* ── Status alerts ── */}
      {windowState === 'expired' && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 dark:bg-red-500/10 dark:border-red-500/20">
          <p className="text-sm font-semibold text-red-800 dark:text-red-300">Check-in window missed</p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
            Late check-ins apply a 10% penalty per missed window and reset your streak.
          </p>
        </div>
      )}
      {windowState === 'urgent' && blocksRemaining !== null && (
        <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            ⚠ ~{blocksToTime(blocksRemaining)} remaining to check in
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
            Check in soon or a 10% penalty will be applied.
          </p>
        </div>
      )}
      {windowState === 'cooldown' && blocksUntilNextCheckIn !== null && (
        <div className="mb-4 p-3 rounded-xl bg-sky-50 border border-sky-200 dark:bg-sky-500/10 dark:border-sky-500/20">
          <p className="text-sm font-semibold text-sky-800 dark:text-sky-300">
            Next check-in in ~{blocksToTime(blocksUntilNextCheckIn)}
          </p>
          <p className="text-xs text-sky-600 dark:text-sky-400 mt-0.5">
            Check-ins accepted between 16 and 32 hours after your last.
          </p>
        </div>
      )}

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 gap-3 mb-4 p-3 rounded-xl bg-surface-50 dark:bg-surface-900/40">
        <div>
          <p className="text-xxs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-widest">Stake</p>
          <p className="text-sm font-bold text-surface-900 dark:text-white mt-0.5">{formatSTX(habit.stakeAmount)} STX</p>
        </div>
        <div>
          <p className="text-xxs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-widest">Last Check-In</p>
          <p className="text-sm font-bold text-surface-900 dark:text-white mt-0.5" title={`Block ${habit.lastCheckInBlock}`}>
            {currentBlock ? blocksAgo(currentBlock, habit.lastCheckInBlock) : `Block ${habit.lastCheckInBlock}`}
          </p>
        </div>
        {habit.isCompleted && habit.bonusWeight && (
          <div>
            <p className="text-xxs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-widest">Bonus Weight</p>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{habit.bonusWeight}x</p>
            <p className="text-xxs text-surface-400 mt-0.5">Boosted by referrals</p>
          </div>
        )}
      </div>

      {/* ── Actions ── */}
      <div className="flex flex-col gap-2">
        {habit.isActive && isOwnHabit && (
          <button
            onClick={handleCheckIn}
            disabled={isCheckingIn || !canSubmitCheckIn}
            className="btn-primary w-full"
          >
            {isCheckingIn
              ? <span className="flex items-center justify-center gap-2"><span className="spinner" style={{width:16,height:16}} />Checking In…</span>
              : canSubmitCheckIn
                ? windowState === 'expired' ? 'Check In (Penalty Applies)' : 'Check In'
                : 'Check-In Opens Soon'}
          </button>
        )}
        {canWithdraw && isOwnHabit && (
          <button onClick={() => { trackEvent('habit_withdraw_clicked', { habitId: habit.habitId }); setConfirmAction('withdraw'); }} disabled={isWithdrawing} className="btn-secondary w-full">
            {isWithdrawing ? <span className="flex items-center justify-center gap-2"><span className="spinner" style={{width:16,height:16}} />Withdrawing…</span> : 'Withdraw Stake'}
          </button>
        )}
        {canClaimBonus && isOwnHabit && (
          <button onClick={() => { trackEvent('habit_claim_clicked', { habitId: habit.habitId }); setConfirmAction('claim'); }} disabled={isClaiming} className="btn-secondary w-full">
            {isClaiming ? <span className="flex items-center justify-center gap-2"><span className="spinner" style={{width:16,height:16}} />Claiming…</span> : 'Claim Bonus'}
          </button>
        )}
        {windowState === 'expired' && !isOwnHabit && habit.isActive && (
          <button onClick={() => { trackEvent('habit_finalize_clicked', { habitId: habit.habitId }); setConfirmAction('slash'); }} disabled={isSlashing} className="btn-secondary w-full">
            {isSlashing ? 'Finalizing…' : 'Finalize Expired Habit'}
          </button>
        )}
      </div>

      {/* ── Contract explorer link ── */}
      <div className="mt-3 pt-3 border-t border-surface-200 dark:border-surface-700 flex justify-end">
        <a
          href={contractExplorerUrl(`${CONTRACT_ADDRESS}.${CONTRACT_NAME}`)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xxs text-surface-400 hover:text-primary-500 transition-colors flex items-center gap-1"
        >
          View on Stacks Explorer
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      {/* ── Confirmation Dialogs ── */}
      <ConfirmationDialog open={confirmAction === 'withdraw'} title="Withdraw Stake" confirmLabel="Withdraw" onConfirm={executeConfirmedAction} onCancel={() => setConfirmAction(null)} isLoading={isWithdrawing}>
        <div className="space-y-2">
          <p>You are about to withdraw your stake from:</p>
          <dl className="bg-surface-50 dark:bg-surface-700 rounded-lg p-3 space-y-1">
            <div className="flex justify-between"><dt className="text-surface-500 dark:text-surface-400">Habit</dt><dd className="font-medium">{habit.name}</dd></div>
            <div className="flex justify-between"><dt className="text-surface-500 dark:text-surface-400">Stake</dt><dd className="font-medium">{formatSTX(habit.stakeAmount)} STX</dd></div>
            <div className="flex justify-between"><dt className="text-surface-500 dark:text-surface-400">Streak</dt><dd className="font-medium">{habit.currentStreak} days</dd></div>
          </dl>
          <p className="text-xs text-amber-600 dark:text-amber-400">This action is irreversible and will incur a gas fee.</p>
        </div>
      </ConfirmationDialog>

      <ConfirmationDialog open={confirmAction === 'claim'} title="Claim Bonus" confirmLabel="Claim" onConfirm={executeConfirmedAction} onCancel={() => setConfirmAction(null)} isLoading={isClaiming}>
        <div className="space-y-2">
          <p>You are about to claim a bonus reward for:</p>
          <dl className="bg-surface-50 dark:bg-surface-700 rounded-lg p-3 space-y-1">
            <div className="flex justify-between"><dt className="text-surface-500 dark:text-surface-400">Habit</dt><dd className="font-medium">{habit.name}</dd></div>
            <div className="flex justify-between"><dt className="text-surface-500 dark:text-surface-400">Final Streak</dt><dd className="font-medium">{habit.currentStreak} days</dd></div>
            <div className="flex justify-between"><dt className="text-surface-500 dark:text-surface-400">Est. Bonus</dt><dd className="font-medium text-emerald-600 dark:text-emerald-400">{formatSTX(estimatedBonusShare)} STX</dd></div>
          </dl>
          <p className="text-xs text-surface-500 dark:text-surface-400">
            Bonus is the current equal-share estimate for {unclaimedCompletedHabits || 0} pending claimant{(unclaimedCompletedHabits || 0) === 1 ? '' : 's'}. Actual amount may differ.
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400">This action is irreversible and will incur a gas fee.</p>
        </div>
      </ConfirmationDialog>

      <ConfirmationDialog open={confirmAction === 'slash'} title="Finalize Expired Habit" confirmLabel="Finalize" onConfirm={executeConfirmedAction} onCancel={() => setConfirmAction(null)} isLoading={isSlashing}>
        <div className="space-y-2">
          <p>Finalizing an expired habit applies the missed-window penalty and moves the forfeited portion to the pool:</p>
          <dl className="bg-surface-50 dark:bg-surface-700 rounded-lg p-3 space-y-1">
            <div className="flex justify-between"><dt className="text-surface-500 dark:text-surface-400">Habit</dt><dd className="font-medium">{habit.name}</dd></div>
            <div className="flex justify-between"><dt className="text-surface-500 dark:text-surface-400">Owner</dt><dd className="font-medium truncate max-w-[160px]" title={habit.owner}>{habit.owner}</dd></div>
            <div className="flex justify-between"><dt className="text-surface-500 dark:text-surface-400">Stake</dt><dd className="font-medium">{formatSTX(habit.stakeAmount)} STX</dd></div>
          </dl>
          <p className="text-xs text-surface-500 dark:text-surface-400">Anyone can finalize an expired habit. The forfeited portion goes to the pool.</p>
          <p className="text-xs text-amber-600 dark:text-amber-400">This action will incur a gas fee.</p>
        </div>
      </ConfirmationDialog>
    </div>
  );
}

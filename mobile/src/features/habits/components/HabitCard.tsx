import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Habit } from '@/core/types';
import { ActionButton, Card, InteractionStatusBanner } from '@/shared/components';
import { useInteractionStatus } from '@/shared/hooks/useInteractionStatus';
import {
  canWithdrawHabit,
  canSubmitMobileDailyCheckIn,
  describeWithdrawHabitStatus,
  formatAddress,
  formatMicroStx,
  formatStreakDays,
  getMobileCheckInWindowState,
} from '@/shared/utils';
import { palette, radius, spacing, typography } from '@/shared/theme';

interface HabitCardProps {
  habit: Habit;
  currentBlock: number | null;
  onCheckInPreview: (habitId: number) => Promise<void> | void;
  onWithdrawPreview: (habitId: number, stakeAmount: number) => Promise<void> | void;
  onClaimPreview: (habitId: number) => Promise<void> | void;
}

type HabitAction = 'check-in' | 'withdraw' | 'claim';

export function HabitCard({
  habit,
  currentBlock,
  onCheckInPreview,
  onWithdrawPreview,
  onClaimPreview,
}: HabitCardProps) {
  const [pendingAction, setPendingAction] = useState<HabitAction | null>(null);
  const { status, showError, showSuccess } = useInteractionStatus();
  const checkInWindowState = getMobileCheckInWindowState(habit, currentBlock);
  const canCheckIn = canSubmitMobileDailyCheckIn(habit, currentBlock);
  const canWithdraw = canWithdrawHabit(habit);
  const withdrawStatus = describeWithdrawHabitStatus(habit);
  const cardTone = !habit.isActive && !habit.isCompleted
    ? 'danger'
    : habit.isCompleted
      ? 'success'
      : checkInWindowState === 'urgent'
        ? 'warning'
        : 'default';

  const runAction = async (
    action: HabitAction,
    callback: () => Promise<void> | void,
    successMessage: string,
  ) => {
    setPendingAction(action);

    try {
      await callback();
      showSuccess(successMessage);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to generate preview.';
      showError(message);
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <Card style={styles.card} tone={cardTone}>
      <Text style={styles.name}>{habit.name}</Text>
      <Text style={styles.meta}>Owner: {formatAddress(habit.owner)}</Text>
      <Text style={styles.meta}>Stake: {formatMicroStx(habit.stakeAmount)}</Text>
      <Text style={styles.meta}>Streak: {formatStreakDays(habit.currentStreak)}</Text>
      <Text style={styles.meta}>Status: {habit.isCompleted ? 'Completed' : habit.isActive ? 'Active' : 'Inactive'}</Text>
      <Text style={styles.meta}>Check-in window: {checkInWindowState}</Text>
      <Text style={styles.meta}>Withdrawal: {withdrawStatus}</Text>

      <InteractionStatusBanner status={status} />

      <View style={styles.actionsRow}>
        <ActionButton
          label={canCheckIn ? 'Check-in' : 'Check-in blocked'}
          disabled={!canCheckIn || pendingAction !== null}
          fullWidth
          loading={pendingAction === 'check-in'}
          loadingLabel="Generating"
          onPress={() =>
            void runAction(
              'check-in',
              () => onCheckInPreview(habit.habitId),
              'Check-in preview generated.',
            )
          }
        />
        <ActionButton
          label={canWithdraw ? 'Withdraw' : 'Withdraw blocked'}
          disabled={!canWithdraw || pendingAction !== null}
          fullWidth
          variant="secondary"
          loading={pendingAction === 'withdraw'}
          loadingLabel="Generating"
          onPress={() =>
            void runAction(
              'withdraw',
              () => onWithdrawPreview(habit.habitId, habit.stakeAmount),
              'Withdraw preview generated.',
            )
          }
        />
        <ActionButton
          fullWidth
          label="Claim"
          variant="secondary"
          disabled={pendingAction !== null}
          loading={pendingAction === 'claim'}
          loadingLabel="Generating"
          onPress={() =>
            void runAction(
              'claim',
              () => onClaimPreview(habit.habitId),
              'Claim preview generated.',
            )
          }
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
  },
  name: {
    color: palette.ink,
    fontSize: typography.heading,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  meta: {
    color: palette.slate,
    fontSize: typography.body,
    marginBottom: spacing.xs,
  },
  actionsRow: {
    flexDirection: 'column',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
});

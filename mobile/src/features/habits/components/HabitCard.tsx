import { StyleSheet, Text, View } from 'react-native';
import type { Habit } from '@/core/types';
import { ActionButton, Card } from '@/shared/components';
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
  onCheckInPreview: (habitId: number) => void;
  onWithdrawPreview: (habitId: number, stakeAmount: number) => void;
  onClaimPreview: (habitId: number) => void;
}

export function HabitCard({
  habit,
  currentBlock,
  onCheckInPreview,
  onWithdrawPreview,
  onClaimPreview,
}: HabitCardProps) {
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

  return (
    <Card style={styles.card} tone={cardTone}>
      <Text style={styles.name}>{habit.name}</Text>
      <Text style={styles.meta}>Owner: {formatAddress(habit.owner)}</Text>
      <Text style={styles.meta}>Stake: {formatMicroStx(habit.stakeAmount)}</Text>
      <Text style={styles.meta}>Streak: {formatStreakDays(habit.currentStreak)}</Text>
      <Text style={styles.meta}>Status: {habit.isCompleted ? 'Completed' : habit.isActive ? 'Active' : 'Inactive'}</Text>
      <Text style={styles.meta}>Check-in window: {checkInWindowState}</Text>
      <Text style={styles.meta}>Withdrawal: {withdrawStatus}</Text>

      <View style={styles.actionsRow}>
        <ActionButton
          label={canCheckIn ? 'Check-in' : 'Check-in blocked'}
          disabled={!canCheckIn}
          fullWidth
          onPress={() => onCheckInPreview(habit.habitId)}
        />
        <ActionButton
          label={canWithdraw ? 'Withdraw' : 'Withdraw blocked'}
          disabled={!canWithdraw}
          fullWidth
          variant="secondary"
          onPress={() => onWithdrawPreview(habit.habitId, habit.stakeAmount)}
        />
        <ActionButton fullWidth label="Claim" variant="secondary" onPress={() => onClaimPreview(habit.habitId)} />
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

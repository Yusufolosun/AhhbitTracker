import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Habit } from '@/core/types';
import { formatAddress, formatMicroStx, formatStreakDays } from '@/shared/utils';
import { palette, radius, spacing, typography } from '@/shared/theme';

interface HabitCardProps {
  habit: Habit;
  onCheckInPreview: (habitId: number) => void;
  onWithdrawPreview: (habitId: number, stakeAmount: number) => void;
  onClaimPreview: (habitId: number) => void;
}

function ActionButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}>
      <Text style={styles.actionButtonText}>{label}</Text>
    </Pressable>
  );
}

export function HabitCard({
  habit,
  onCheckInPreview,
  onWithdrawPreview,
  onClaimPreview,
}: HabitCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{habit.name}</Text>
      <Text style={styles.meta}>Owner: {formatAddress(habit.owner)}</Text>
      <Text style={styles.meta}>Stake: {formatMicroStx(habit.stakeAmount)}</Text>
      <Text style={styles.meta}>Streak: {formatStreakDays(habit.currentStreak)}</Text>
      <Text style={styles.meta}>Status: {habit.isCompleted ? 'Completed' : habit.isActive ? 'Active' : 'Inactive'}</Text>

      <View style={styles.actionsRow}>
        <ActionButton label="Check-in" onPress={() => onCheckInPreview(habit.habitId)} />
        <ActionButton
          label="Withdraw"
          onPress={() => onWithdrawPreview(habit.habitId, habit.stakeAmount)}
        />
        <ActionButton label="Claim" onPress={() => onClaimPreview(habit.habitId)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.card,
    borderColor: palette.cloud,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
    padding: spacing.md,
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
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  actionButton: {
    backgroundColor: palette.surface,
    borderColor: palette.cloud,
    borderRadius: radius.md,
    borderWidth: 1,
    flex: 1,
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  actionButtonText: {
    color: palette.ink,
    fontSize: typography.label,
    fontWeight: '700',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
});

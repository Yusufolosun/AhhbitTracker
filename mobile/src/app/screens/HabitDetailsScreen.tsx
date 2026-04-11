import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RequireAddress } from '@/app/navigation/RequireAddress';
import { MAIN_TAB_ROUTES, type RootStackScreenProps } from '@/app/navigation/types';
import { useAddressState, usePreviewState } from '@/app/state';
import { useUserHabitsQuery } from '@/features/habits';
import {
  buildCheckInPreview,
  buildClaimBonusPreview,
  buildWithdrawStakePreview,
} from '@/features/transactions';
import { EmptyState, ErrorState, LoadingState, Screen, SectionHeader } from '@/shared/components';
import { formatAddress, formatMicroStx, formatStreakDays } from '@/shared/utils';
import { palette, radius, spacing, typography } from '@/shared/theme';

type HabitDetailsScreenProps = RootStackScreenProps<'HabitDetails'>;

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function ActionButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}>
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );
}

export function HabitDetailsScreen({ route, navigation }: HabitDetailsScreenProps) {
  const { habitId } = route.params;
  const { activeAddress } = useAddressState();
  const { setPreview } = usePreviewState();

  const habitsQuery = useUserHabitsQuery(activeAddress);
  const habit = habitsQuery.data?.find((item) => item.habitId === habitId);

  if (habitsQuery.isLoading) {
    return (
      <Screen>
        <SectionHeader title="Habit details" subtitle="Loading habit data" />
        <LoadingState />
      </Screen>
    );
  }

  if (habitsQuery.error) {
    return (
      <Screen>
        <SectionHeader title="Habit details" subtitle="Unable to load habit" />
        <ErrorState message={`Failed to load habit: ${habitsQuery.error.message}`} />
      </Screen>
    );
  }

  if (!habit) {
    return (
      <Screen>
        <SectionHeader title="Habit details" subtitle="Not found" />
        <EmptyState message="The selected habit could not be found for this address." />
      </Screen>
    );
  }

  const navigateToPreview = () => {
    navigation.navigate('MainTabs', { screen: MAIN_TAB_ROUTES.Preview });
  };

  const handleCheckInPreview = () => {
    setPreview(buildCheckInPreview(habit.habitId));
    navigateToPreview();
  };

  const handleWithdrawPreview = () => {
    setPreview(buildWithdrawStakePreview(habit.habitId, habit.stakeAmount));
    navigateToPreview();
  };

  const handleClaimPreview = () => {
    setPreview(buildClaimBonusPreview(habit.habitId));
    navigateToPreview();
  };

  return (
    <RequireAddress
      title="Habit details"
      subtitle="Address required"
      message="Save a Stacks address before viewing habit details."
    >
      <Screen contentContainerStyle={styles.content}>
        <SectionHeader title={habit.name} subtitle={`Habit #${habit.habitId}`} />

        <View style={styles.card}>
          <DetailRow label="Owner" value={formatAddress(habit.owner)} />
          <DetailRow label="Stake" value={formatMicroStx(habit.stakeAmount)} />
          <DetailRow label="Current streak" value={formatStreakDays(habit.currentStreak)} />
          <DetailRow label="Last check-in block" value={String(habit.lastCheckInBlock)} />
          <DetailRow label="Created at block" value={String(habit.createdAtBlock)} />
          <DetailRow label="Status" value={habit.isCompleted ? 'Completed' : habit.isActive ? 'Active' : 'Inactive'} />
          <DetailRow label="Bonus claimed" value={habit.bonusClaimed ? 'Yes' : 'No'} />
        </View>

        <View style={styles.actions}>
          <ActionButton label="Generate check-in preview" onPress={handleCheckInPreview} />
          <ActionButton label="Generate withdraw preview" onPress={handleWithdrawPreview} />
          <ActionButton label="Generate claim preview" onPress={handleClaimPreview} />
        </View>
      </Screen>
    </RequireAddress>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
  },
  card: {
    backgroundColor: palette.card,
    borderColor: palette.cloud,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
  },
  detailRow: {
    marginBottom: spacing.sm,
  },
  detailLabel: {
    color: palette.steel,
    fontSize: typography.label,
    fontWeight: '700',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  detailValue: {
    color: palette.ink,
    fontSize: typography.body,
  },
  actions: {
    gap: spacing.sm,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: palette.accent,
    borderRadius: radius.md,
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: spacing.md,
  },
  actionText: {
    color: palette.card,
    fontSize: typography.body,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
});

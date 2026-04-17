import { StyleSheet, View } from 'react-native';
import { RequireAddress } from '@/app/navigation/RequireAddress';
import { MAIN_TAB_ROUTES, type RootStackScreenProps } from '@/app/navigation/types';
import { useAddressState, usePreviewState } from '@/app/state';
import { useCurrentBlockQuery, useUserHabitsQuery } from '@/features/habits';
import {
  buildCheckInPreview,
  buildClaimBonusPreview,
  buildWithdrawStakePreview,
} from '@/features/transactions';
import { ActionButton, Card, EmptyState, ErrorState, LoadingState, MetricRow, Screen, SectionHeader } from '@/shared/components';
import {
  canWithdrawHabit,
  canSubmitMobileDailyCheckIn,
  describeWithdrawHabitStatus,
  formatAddress,
  formatMicroStx,
  formatStreakDays,
  getMobileCheckInWindowState,
} from '@/shared/utils';
import { spacing } from '@/shared/theme';

type HabitDetailsScreenProps = RootStackScreenProps<'HabitDetails'>;

export function HabitDetailsScreen({ route, navigation }: HabitDetailsScreenProps) {
  const { habitId } = route.params;
  const { activeAddress } = useAddressState();
  const { setPreview } = usePreviewState();

  const habitsQuery = useUserHabitsQuery(activeAddress);
  const currentBlockQuery = useCurrentBlockQuery();
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

  const currentBlock = currentBlockQuery.data ?? null;
  const checkInWindowState = getMobileCheckInWindowState(habit, currentBlock);
  const canCheckIn = canSubmitMobileDailyCheckIn(habit, currentBlock);
  const canWithdraw = canWithdrawHabit(habit);
  const withdrawStatus = describeWithdrawHabitStatus(habit);

  const handleCheckInPreview = () => {
    if (!canCheckIn) {
      return;
    }

    setPreview(buildCheckInPreview(habit.habitId));
    navigateToPreview();
  };

  const handleWithdrawPreview = () => {
    if (!canWithdraw) {
      return;
    }

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

        <Card>
          <MetricRow label="Owner" value={formatAddress(habit.owner)} hint={habit.owner} />
          <MetricRow label="Stake" value={formatMicroStx(habit.stakeAmount)} tone="accent" />
          <MetricRow label="Current streak" value={formatStreakDays(habit.currentStreak)} />
          <MetricRow label="Last check-in block" value={String(habit.lastCheckInBlock)} />
          <MetricRow label="Created at block" value={String(habit.createdAtBlock)} />
          <MetricRow
            label="Status"
            value={habit.isCompleted ? 'Completed' : habit.isActive ? 'Active' : 'Inactive'}
            tone={habit.isCompleted ? 'success' : habit.isActive ? 'accent' : 'danger'}
          />
          <MetricRow label="Check-in window" value={checkInWindowState} />
          <MetricRow label="Withdrawal" value={withdrawStatus} />
          <MetricRow label="Bonus claimed" value={habit.bonusClaimed ? 'Yes' : 'No'} tone={habit.bonusClaimed ? 'success' : 'default'} />
        </Card>

        <View style={styles.actions}>
          <ActionButton
            label={canCheckIn ? 'Generate check-in preview' : 'Check-in preview blocked'}
            disabled={!canCheckIn}
            fullWidth
            onPress={handleCheckInPreview}
          />
          <ActionButton
            label={canWithdraw ? 'Generate withdraw preview' : 'Withdraw preview blocked'}
            disabled={!canWithdraw}
            fullWidth
            variant="secondary"
            onPress={handleWithdrawPreview}
          />
          <ActionButton fullWidth label="Generate claim preview" variant="secondary" onPress={handleClaimPreview} />
        </View>
      </Screen>
    </RequireAddress>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
  },
  actions: {
    gap: spacing.sm,
  },
});

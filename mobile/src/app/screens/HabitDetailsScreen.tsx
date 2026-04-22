import { useState } from 'react';
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
import { ActionButton, Card, EmptyState, ErrorState, InteractionStatusBanner, LoadingState, MetricRow, Screen, SectionHeader } from '@/shared/components';
import { useInteractionStatus } from '@/shared/hooks/useInteractionStatus';
import { useProtectedAction } from '@/shared/hooks/useProtectedAction';
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
import { trackMobileEvent } from '@/analytics';

type HabitDetailsScreenProps = RootStackScreenProps<'HabitDetails'>;

export function HabitDetailsScreen({ route, navigation }: HabitDetailsScreenProps) {
  const { habitId } = route.params;
  const { activeAddress } = useAddressState();
  const { setPreview } = usePreviewState();
  const { runProtectedAction } = useProtectedAction();
  const [pendingAction, setPendingAction] = useState<'check-in' | 'withdraw' | 'claim' | null>(null);
  const { status, showError, showSuccess } = useInteractionStatus();

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
      throw new Error('This habit is not eligible for check-in yet.');
    }

    return runProtectedAction('check-in', () => {
      setPreview(buildCheckInPreview(habit.habitId));
      trackMobileEvent('preview_generated', {
        functionName: 'check-in',
        habitId: habit.habitId,
        source: 'habit-details',
      });
      navigateToPreview();
    });
  };

  const handleWithdrawPreview = () => {
    if (!canWithdraw) {
      throw new Error('This habit is not eligible for withdrawal yet.');
    }

    return runProtectedAction('withdraw-stake', () => {
      setPreview(buildWithdrawStakePreview(habit.habitId, habit.stakeAmount));
      trackMobileEvent('preview_generated', {
        functionName: 'withdraw-stake',
        habitId: habit.habitId,
        source: 'habit-details',
      });
      navigateToPreview();
    });
  };

  const handleClaimPreview = () => {
    return runProtectedAction('claim-bonus', () => {
      setPreview(buildClaimBonusPreview(habit.habitId));
      trackMobileEvent('preview_generated', {
        functionName: 'claim-bonus',
        habitId: habit.habitId,
        source: 'habit-details',
      });
      navigateToPreview();
    });
  };

  const runAction = async (
    action: 'check-in' | 'withdraw' | 'claim',
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

        <InteractionStatusBanner status={status} />

        <View style={styles.actions}>
          <ActionButton
            label={canCheckIn ? 'Generate check-in preview' : 'Check-in preview blocked'}
            disabled={!canCheckIn || pendingAction !== null}
            fullWidth
            loading={pendingAction === 'check-in'}
            loadingLabel="Generating"
            onPress={() => void runAction('check-in', handleCheckInPreview, 'Check-in preview generated.')}
          />
          <ActionButton
            label={canWithdraw ? 'Generate withdraw preview' : 'Withdraw preview blocked'}
            disabled={!canWithdraw || pendingAction !== null}
            fullWidth
            variant="secondary"
            loading={pendingAction === 'withdraw'}
            loadingLabel="Generating"
            onPress={() => void runAction('withdraw', handleWithdrawPreview, 'Withdraw preview generated.')}
          />
          <ActionButton
            fullWidth
            label="Generate claim preview"
            variant="secondary"
            disabled={pendingAction !== null}
            loading={pendingAction === 'claim'}
            loadingLabel="Generating"
            onPress={() => void runAction('claim', handleClaimPreview, 'Claim preview generated.')}
          />
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

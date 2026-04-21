import { StyleSheet, View } from 'react-native';
import { useAddressState, usePreviewState } from '@/app/state';
import { AddressInputCard } from '@/features/address';
import {
  HabitList,
  useCurrentBlockQuery,
  usePoolBalanceQuery,
  useUserHabitsQuery,
  useUserStatsQuery,
} from '@/features/habits';
import { PoolBalanceCard } from '@/features/pool';
import {
  buildCheckInPreview,
  buildClaimBonusPreview,
  buildCreateHabitPreview,
  buildWithdrawStakePreview,
  CreateHabitPreviewCard,
  TransactionPreviewPanel,
} from '@/features/transactions';
import { Card, EmptyState, LoadingState, MetricRow, Screen, SectionHeader } from '@/shared/components';
import { useProtectedAction } from '@/shared/hooks/useProtectedAction';
import { toMicroSTX } from '@/shared/utils';
import { spacing } from '@/shared/theme';

export function DashboardScreen() {
  const { activeAddress, isHydrating, setAddress, clearAddress } = useAddressState();
  const { preview, setPreview } = usePreviewState();
  const { runProtectedAction } = useProtectedAction();

  const habitsQuery = useUserHabitsQuery(activeAddress);
  const currentBlockQuery = useCurrentBlockQuery();
  const poolBalanceQuery = usePoolBalanceQuery();
  const statsQuery = useUserStatsQuery(activeAddress);

  const handleCreatePreview = async (name: string, stakeAmountStx: number) => {
    if (!activeAddress) {
      throw new Error('Save a Stacks address before generating a create-habit preview.');
    }

    await runProtectedAction('create-habit', () => {
      const stakeAmountMicroStx = toMicroSTX(stakeAmountStx);
      setPreview(buildCreateHabitPreview(activeAddress, name, stakeAmountMicroStx));
    });
  };

  const handleCheckInPreview = async (habitId: number) => {
    await runProtectedAction('check-in', () => {
      setPreview(buildCheckInPreview(habitId));
    });
  };

  const handleWithdrawPreview = async (habitId: number, stakeAmount: number) => {
    await runProtectedAction('withdraw-stake', () => {
      setPreview(buildWithdrawStakePreview(habitId, stakeAmount));
    });
  };

  const handleClaimPreview = async (habitId: number) => {
    await runProtectedAction('claim-bonus', () => {
      setPreview(buildClaimBonusPreview(habitId));
    });
  };

  if (isHydrating) {
    return (
      <Screen>
        <SectionHeader title="AhhbitTracker" subtitle="Loading profile state" />
        <LoadingState />
      </Screen>
    );
  }

  return (
    <Screen contentContainerStyle={styles.content}>
      <SectionHeader
        title="AhhbitTracker Mobile"
        subtitle="Preview contract calls before signing in your wallet"
      />

      <AddressInputCard
        initialValue={activeAddress ?? ''}
        onSubmit={setAddress}
        onClear={clearAddress}
      />

      <PoolBalanceCard
        data={poolBalanceQuery.data}
        isLoading={poolBalanceQuery.isLoading}
        error={poolBalanceQuery.error}
      />

      {activeAddress ? (
        <Card style={styles.statsCard}>
          <MetricRow label="Total habits" value={statsQuery.data?.totalHabits ?? 0} tone="accent" />
        </Card>
      ) : (
        <EmptyState message="Save a Stacks address to load habits and stats." />
      )}

      {activeAddress ? <CreateHabitPreviewCard onPreview={handleCreatePreview} /> : null}

      <View style={styles.sectionSpacing}>
        <SectionHeader title="Habits" subtitle="Generate check-in, withdraw, or claim previews" />
        <HabitList
          currentBlock={currentBlockQuery.data ?? null}
          habits={habitsQuery.data ?? []}
          isLoading={habitsQuery.isLoading}
          error={habitsQuery.error}
          onCheckInPreview={handleCheckInPreview}
          onWithdrawPreview={handleWithdrawPreview}
          onClaimPreview={handleClaimPreview}
        />
      </View>

      <TransactionPreviewPanel preview={preview} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
  },
  statsCard: {
    marginTop: spacing.xs,
  },
  sectionSpacing: {
    marginTop: spacing.sm,
  },
});

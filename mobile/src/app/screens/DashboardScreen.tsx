import { StyleSheet, Text, View } from 'react-native';
import { useAddressState, usePreviewState } from '@/app/state';
import {
  AddressInputCard,
} from '@/features/address';
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
import { EmptyState, LoadingState, Screen, SectionHeader } from '@/shared/components';
import { toMicroSTX } from '@/shared/utils';
import { palette, spacing, typography } from '@/shared/theme';


export function DashboardScreen() {
  const { activeAddress, isHydrating, setAddress, clearAddress } = useAddressState();
  const { preview, setPreview } = usePreviewState();

  const habitsQuery = useUserHabitsQuery(activeAddress);
  const currentBlockQuery = useCurrentBlockQuery();
  const poolBalanceQuery = usePoolBalanceQuery();
  const statsQuery = useUserStatsQuery(activeAddress);

  const handleCreatePreview = (name: string, stakeAmountStx: number) => {
    if (!activeAddress) {
      return;
    }

    const stakeAmountMicroStx = toMicroSTX(stakeAmountStx);
    setPreview(buildCreateHabitPreview(activeAddress, name, stakeAmountMicroStx));
  };

  const handleCheckInPreview = (habitId: number) => {
    setPreview(buildCheckInPreview(habitId));
  };

  const handleWithdrawPreview = (habitId: number, stakeAmount: number) => {
    setPreview(buildWithdrawStakePreview(habitId, stakeAmount));
  };

  const handleClaimPreview = (habitId: number) => {
    setPreview(buildClaimBonusPreview(habitId));
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
        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>Total habits</Text>
          <Text style={styles.statsValue}>{statsQuery.data?.totalHabits ?? 0}</Text>
        </View>
      ) : (
        <EmptyState message="Save a Stacks address to load habits and stats." />
      )}

      {activeAddress ? (
        <CreateHabitPreviewCard onPreview={handleCreatePreview} />
      ) : null}

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
  statsRow: {
    alignItems: 'center',
    backgroundColor: palette.card,
    borderColor: palette.cloud,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  statsLabel: {
    color: palette.slate,
    fontSize: typography.body,
    fontWeight: '600',
  },
  statsValue: {
    color: palette.ink,
    fontSize: typography.heading,
    fontWeight: '800',
  },
  sectionSpacing: {
    marginTop: spacing.sm,
  },
});

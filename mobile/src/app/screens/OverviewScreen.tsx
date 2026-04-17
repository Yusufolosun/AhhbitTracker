import { StyleSheet, View } from 'react-native';
import type { MainTabScreenProps } from '@/app/navigation/types';
import { MAIN_TAB_ROUTES, ROOT_ROUTES } from '@/app/navigation/types';
import { useAddressState } from '@/app/state';
import { AddressInputCard } from '@/features/address';
import { useUserStatsQuery, usePoolBalanceQuery } from '@/features/habits';
import { PoolBalanceCard } from '@/features/pool';
import { ActionButton, Card, EmptyState, LoadingState, MetricRow, Screen, SectionHeader } from '@/shared/components';
import { palette, radius, spacing, typography } from '@/shared/theme';

type OverviewScreenProps = MainTabScreenProps<'Overview'>;

export function OverviewScreen({ navigation }: OverviewScreenProps) {
  const { activeAddress, isHydrating, setAddress, clearAddress } = useAddressState();
  const poolBalanceQuery = usePoolBalanceQuery();
  const statsQuery = useUserStatsQuery(activeAddress);

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
        title="Overview"
        subtitle="Manage your tracked address and navigate habit workflows"
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

      <View style={styles.actionsGrid}>
        <ActionButton
          label="Open habits"
          onPress={() => navigation.navigate(MAIN_TAB_ROUTES.Habits)}
          variant="secondary"
          fullWidth
        />
        <ActionButton
          label="Create habit"
          onPress={() => navigation.navigate(ROOT_ROUTES.CreateHabit)}
          variant="secondary"
          fullWidth
        />
        <ActionButton
          label="View previews"
          onPress={() => navigation.navigate(MAIN_TAB_ROUTES.Preview)}
          variant="secondary"
          fullWidth
        />
      </View>
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
  actionsGrid: {
    gap: spacing.sm,
  },
});

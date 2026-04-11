import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MAIN_TAB_ROUTES, ROOT_ROUTES, type MainTabScreenProps } from '@/app/navigation/types';
import { useAddressState } from '@/app/state';
import { AddressInputCard } from '@/features/address';
import { useUserStatsQuery, usePoolBalanceQuery } from '@/features/habits';
import { PoolBalanceCard } from '@/features/pool';
import { EmptyState, LoadingState, Screen, SectionHeader } from '@/shared/components';
import { palette, radius, spacing, typography } from '@/shared/theme';

type OverviewScreenProps = MainTabScreenProps<'Overview'>;

function ActionCard({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.actionCard, pressed && styles.pressed]}>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

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
        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>Total habits</Text>
          <Text style={styles.statsValue}>{statsQuery.data?.totalHabits ?? 0}</Text>
        </View>
      ) : (
        <EmptyState message="Save a Stacks address to load habits and stats." />
      )}

      <View style={styles.actionsGrid}>
        <ActionCard
          label="Open habits"
          onPress={() => navigation.navigate(MAIN_TAB_ROUTES.Habits)}
        />
        <ActionCard
          label="Create habit"
          onPress={() => navigation.navigate(ROOT_ROUTES.CreateHabit)}
        />
        <ActionCard
          label="View previews"
          onPress={() => navigation.navigate(MAIN_TAB_ROUTES.Preview)}
        />
      </View>
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
  actionsGrid: {
    gap: spacing.sm,
  },
  actionCard: {
    alignItems: 'center',
    backgroundColor: palette.card,
    borderColor: palette.cloud,
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  actionLabel: {
    color: palette.ink,
    fontSize: typography.body,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
});

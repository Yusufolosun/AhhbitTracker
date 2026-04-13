import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { MainTabScreenProps } from '@/app/navigation/types';
import { MAIN_TAB_ROUTES, ROOT_ROUTES } from '@/app/navigation/types';
import { RequireAddress } from '@/app/navigation/RequireAddress';
import { useAddressState, usePreviewState } from '@/app/state';
import {
  HabitCard,
  useUserHabitsQuery,
} from '@/features/habits';
import {
  buildCheckInPreview,
  buildClaimBonusPreview,
  buildWithdrawStakePreview,
} from '@/features/transactions';
import { EmptyState, ErrorState, LoadingState, Screen, SectionHeader } from '@/shared/components';
import { palette, radius, spacing, typography } from '@/shared/theme';

type HabitsScreenProps = MainTabScreenProps<'Habits'>;

export function HabitsScreen({ navigation }: HabitsScreenProps) {
  const { activeAddress } = useAddressState();
  const { setPreview } = usePreviewState();
  const habitsQuery = useUserHabitsQuery(activeAddress);

  const openPreviewTab = () => {
    navigation.navigate(MAIN_TAB_ROUTES.Preview);
  };

  const handleCheckInPreview = (habitId: number) => {
    setPreview(buildCheckInPreview(habitId));
    openPreviewTab();
  };

  const handleWithdrawPreview = (habitId: number, stakeAmount: number) => {
    setPreview(buildWithdrawStakePreview(habitId, stakeAmount));
    openPreviewTab();
  };

  const handleClaimPreview = (habitId: number) => {
    setPreview(buildClaimBonusPreview(habitId));
    openPreviewTab();
  };

  return (
    <RequireAddress
      title="Habits"
      subtitle="Load habits by setting a tracked address"
      message="No address selected. Save a Stacks address in the Overview tab."
    >
      <Screen contentContainerStyle={styles.content}>
        <SectionHeader
          title="Habits"
          subtitle="Inspect habits and generate action previews before signing"
        />

        {habitsQuery.isLoading ? <LoadingState /> : null}
        {habitsQuery.error ? <ErrorState message={`Failed to load habits: ${habitsQuery.error.message}`} /> : null}

        {!habitsQuery.isLoading && !habitsQuery.error && !habitsQuery.data?.length ? (
          <EmptyState message="No habits found for this address." />
        ) : null}

        {!habitsQuery.isLoading && !habitsQuery.error
          ? habitsQuery.data?.map((habit) => (
              <View key={habit.habitId} style={styles.habitRow}>
                <HabitCard
                  habit={habit}
                  onCheckInPreview={handleCheckInPreview}
                  onWithdrawPreview={handleWithdrawPreview}
                  onClaimPreview={handleClaimPreview}
                />
                <Pressable
                  onPress={() => navigation.navigate(ROOT_ROUTES.HabitDetails, { habitId: habit.habitId })}
                  style={({ pressed }) => [styles.detailsButton, pressed && styles.pressed]}
                >
                  <Text style={styles.detailsButtonText}>View habit details</Text>
                </Pressable>
              </View>
            ))
          : null}
      </Screen>
    </RequireAddress>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
  },
  habitRow: {
    marginBottom: spacing.sm,
  },
  detailsButton: {
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderColor: palette.cloud,
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: spacing.xs,
    minHeight: 40,
  },
  detailsButtonText: {
    color: palette.ink,
    fontSize: typography.label,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
});

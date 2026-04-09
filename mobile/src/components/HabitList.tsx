import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import type { Habit } from '../types';
import { HabitCard } from './HabitCard';
import { palette, spacing, typography } from '../styles/theme';

interface HabitListProps {
  habits: Habit[];
  isLoading: boolean;
  error: Error | null;
  onCheckInPreview: (habitId: number) => void;
  onWithdrawPreview: (habitId: number, stakeAmount: number) => void;
  onClaimPreview: (habitId: number) => void;
}

export function HabitList({
  habits,
  isLoading,
  error,
  onCheckInPreview,
  onWithdrawPreview,
  onClaimPreview,
}: HabitListProps) {
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={palette.accent} size="large" />
      </View>
    );
  }

  if (error) {
    return <Text style={styles.error}>Failed to load habits: {error.message}</Text>;
  }

  if (!habits.length) {
    return <Text style={styles.empty}>No habits found for this address.</Text>;
  }

  return (
    <FlatList
      data={habits}
      keyExtractor={(item) => String(item.habitId)}
      renderItem={({ item }) => (
        <HabitCard
          habit={item}
          onCheckInPreview={onCheckInPreview}
          onWithdrawPreview={onWithdrawPreview}
          onClaimPreview={onClaimPreview}
        />
      )}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
  },
  error: {
    color: palette.danger,
    fontSize: typography.body,
    marginTop: spacing.md,
  },
  empty: {
    color: palette.steel,
    fontSize: typography.body,
    marginTop: spacing.md,
  },
});

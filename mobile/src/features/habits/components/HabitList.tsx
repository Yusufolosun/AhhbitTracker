import { FlatList } from 'react-native';
import type { Habit } from '@/core/types';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components';
import { HabitCard } from './HabitCard';

interface HabitListProps {
  habits: Habit[];
  currentBlock: number | null;
  isLoading: boolean;
  error: Error | null;
  onCheckInPreview: (habitId: number) => void;
  onWithdrawPreview: (habitId: number, stakeAmount: number) => void;
  onClaimPreview: (habitId: number) => void;
}

export function HabitList({
  habits,
  currentBlock,
  isLoading,
  error,
  onCheckInPreview,
  onWithdrawPreview,
  onClaimPreview,
}: HabitListProps) {
  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={`Failed to load habits: ${error.message}`} />;
  }

  if (!habits.length) {
    return <EmptyState message="No habits found for this address." />;
  }

  return (
    <FlatList
      data={habits}
      keyExtractor={(item) => String(item.habitId)}
      renderItem={({ item }) => (
        <HabitCard
          habit={item}
          currentBlock={currentBlock}
          onCheckInPreview={onCheckInPreview}
          onWithdrawPreview={onWithdrawPreview}
          onClaimPreview={onClaimPreview}
        />
      )}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
    />
  );
}

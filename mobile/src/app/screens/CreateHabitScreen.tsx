import { StyleSheet } from 'react-native';
import { RequireAddress } from '@/app/navigation/RequireAddress';
import type { RootStackScreenProps } from '@/app/navigation/types';
import { navigateToPreview } from '@/app/navigation';
import { useAddressState, usePreviewState } from '@/app/state';
import {
  buildCreateHabitPreview,
  CreateHabitPreviewCard,
} from '@/features/transactions';
import { ActionButton, Screen, SectionHeader } from '@/shared/components';
import { useProtectedAction } from '@/shared/hooks/useProtectedAction';
import { toMicroSTX } from '@/shared/utils';
import { spacing } from '@/shared/theme';

type CreateHabitScreenProps = RootStackScreenProps<'CreateHabit'>;

export function CreateHabitScreen({ navigation }: CreateHabitScreenProps) {
  const { activeAddress } = useAddressState();
  const { setPreview } = usePreviewState();
  const { runProtectedAction } = useProtectedAction();

  const handleCreatePreview = async (name: string, stakeAmountStx: number) => {
    if (!activeAddress) {
      throw new Error('Save a Stacks address before generating a create-habit preview.');
    }

    await runProtectedAction('create-habit', () => {
      setPreview(buildCreateHabitPreview(activeAddress, name, toMicroSTX(stakeAmountStx)));
      navigateToPreview(navigation);
    });
  };

  return (
    <RequireAddress
      title="Create habit"
      subtitle="Address required"
      message="Save a Stacks address in Overview before creating a habit preview."
    >
      <Screen contentContainerStyle={styles.content}>
        <SectionHeader
          title="Create habit"
          subtitle="Generate a create-habit contract call payload"
        />

        <CreateHabitPreviewCard onPreview={handleCreatePreview} />

        <ActionButton
          label="Open transaction preview panel"
          onPress={() => navigateToPreview(navigation)}
          variant="secondary"
          fullWidth
          style={styles.previewLink}
        />
      </Screen>
    </RequireAddress>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
  },
  previewLink: {
    marginTop: spacing.xs,
  },
});

import { StyleSheet } from 'react-native';
import { RequireAddress } from '@/app/navigation/RequireAddress';
import { MAIN_TAB_ROUTES, type RootStackScreenProps } from '@/app/navigation/types';
import { useAddressState, usePreviewState } from '@/app/state';
import {
  buildCreateHabitPreview,
  CreateHabitPreviewCard,
} from '@/features/transactions';
import { ActionButton, Screen, SectionHeader } from '@/shared/components';
import { toMicroSTX } from '@/shared/utils';
import { spacing } from '@/shared/theme';

type CreateHabitScreenProps = RootStackScreenProps<'CreateHabit'>;

export function CreateHabitScreen({ navigation }: CreateHabitScreenProps) {
  const { activeAddress } = useAddressState();
  const { setPreview } = usePreviewState();

  const handleCreatePreview = (name: string, stakeAmountStx: number) => {
    if (!activeAddress) {
      return;
    }

    setPreview(buildCreateHabitPreview(activeAddress, name, toMicroSTX(stakeAmountStx)));

    navigation.navigate('MainTabs', { screen: MAIN_TAB_ROUTES.Preview });
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
          onPress={() => navigation.navigate('MainTabs', { screen: MAIN_TAB_ROUTES.Preview })}
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

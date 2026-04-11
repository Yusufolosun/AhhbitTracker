import { Pressable, StyleSheet, Text } from 'react-native';
import { RequireAddress } from '@/app/navigation/RequireAddress';
import { MAIN_TAB_ROUTES, type RootStackScreenProps } from '@/app/navigation/types';
import { useAddress } from '@/features/address';
import {
  buildCreateHabitPreview,
  CreateHabitPreviewCard,
  usePreview,
} from '@/features/transactions';
import { Screen, SectionHeader } from '@/shared/components';
import { palette, radius, spacing, typography } from '@/shared/theme';

type CreateHabitScreenProps = RootStackScreenProps<'CreateHabit'>;

function stxToMicroStx(stxAmount: number): number {
  return Math.round(stxAmount * 1_000_000);
}

export function CreateHabitScreen({ navigation }: CreateHabitScreenProps) {
  const { activeAddress } = useAddress();
  const { setPreview } = usePreview();

  const handleCreatePreview = (name: string, stakeAmountStx: number) => {
    if (!activeAddress) {
      return;
    }

    setPreview(
      buildCreateHabitPreview(activeAddress, name, stxToMicroStx(stakeAmountStx)),
    );

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

        <Pressable
          onPress={() => navigation.navigate('MainTabs', { screen: MAIN_TAB_ROUTES.Preview })}
          style={({ pressed }) => [styles.previewLink, pressed && styles.pressed]}
        >
          <Text style={styles.previewLinkText}>Open transaction preview panel</Text>
        </Pressable>
      </Screen>
    </RequireAddress>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
  },
  previewLink: {
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderColor: palette.cloud,
    borderRadius: radius.md,
    borderWidth: 1,
    minHeight: 42,
    justifyContent: 'center',
  },
  previewLinkText: {
    color: palette.ink,
    fontSize: typography.label,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
});

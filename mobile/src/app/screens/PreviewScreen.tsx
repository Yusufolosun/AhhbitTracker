import { useEffect } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { type MainTabScreenProps } from '@/app/navigation/types';
import { usePreviewState, useWalletInteractionState } from '@/app/state';
import { WalletInteractionCard, parseWalletInteractionParams } from '@/features/wallet';
import { TransactionPreviewPanel } from '@/features/transactions';
import { Screen, SectionHeader } from '@/shared/components';
import { palette, radius, spacing, typography } from '@/shared/theme';

type PreviewScreenProps = MainTabScreenProps<'Preview'>;

export function PreviewScreen({ route }: PreviewScreenProps) {
  const { preview, clearPreview, setPreview } = usePreviewState();
  const { walletInteraction, setWalletInteraction, clearWalletInteraction } =
    useWalletInteractionState();

  useEffect(() => {
    const routeWalletInteraction = parseWalletInteractionParams(route.params);

    if (!routeWalletInteraction) {
      return;
    }

    setWalletInteraction(routeWalletInteraction);

    if (routeWalletInteraction.preview) {
      setPreview(routeWalletInteraction.preview);
    }
  }, [route.params, setPreview, setWalletInteraction]);

  const handleClear = () => {
    clearPreview();
    clearWalletInteraction();
  };

  return (
    <Screen contentContainerStyle={styles.content}>
      <SectionHeader
        title="Transaction preview"
        subtitle="Review and copy contract call payloads before wallet signing"
      />

      <WalletInteractionCard preview={preview} walletInteraction={walletInteraction} />
      <TransactionPreviewPanel preview={preview} />

      <Pressable
        disabled={!preview}
        onPress={handleClear}
        style={({ pressed }) => [styles.clearButton, !preview && styles.disabled, pressed && styles.pressed]}
      >
        <Text style={styles.clearButtonText}>Clear current preview</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
  },
  clearButton: {
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderColor: palette.cloud,
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 42,
  },
  clearButtonText: {
    color: palette.ink,
    fontSize: typography.label,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.8,
  },
});

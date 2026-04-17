import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import type { MainTabScreenProps } from '@/app/navigation/types';
import { usePreviewState, useWalletInteractionState } from '@/app/state';
import { WalletInteractionCard, parseWalletInteractionParams } from '@/features/wallet';
import { TransactionPreviewPanel } from '@/features/transactions';
import { ActionButton, Screen, SectionHeader } from '@/shared/components';
import { spacing } from '@/shared/theme';

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
        subtitle="Review, copy, and hand off contract call payloads through wallet deep links"
      />

      <WalletInteractionCard preview={preview} walletInteraction={walletInteraction} />
      <TransactionPreviewPanel preview={preview} />

      <ActionButton
        disabled={!preview && !walletInteraction}
        fullWidth
        label="Clear current preview"
        onPress={handleClear}
        variant="secondary"
        style={styles.clearButton}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
  },
  clearButton: {
    marginTop: spacing.xs,
  },
});

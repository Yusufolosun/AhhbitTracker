import { useEffect } from 'react';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import type { MainTabScreenProps } from '@/app/navigation/types';
import { usePreviewState, useWalletInteractionState } from '@/app/state';
import { WalletInteractionCard, parseWalletInteractionParams } from '@/features/wallet';
import { TransactionPreviewPanel } from '@/features/transactions';
import { ActionButton, InteractionStatusBanner, Screen, SectionHeader } from '@/shared/components';
import { useInteractionStatus } from '@/shared/hooks/useInteractionStatus';
import { spacing } from '@/shared/theme';

type PreviewScreenProps = MainTabScreenProps<'Preview'>;

export function PreviewScreen({ route }: PreviewScreenProps) {
  const { preview, clearPreview, setPreview } = usePreviewState();
  const [isClearing, setIsClearing] = useState(false);
  const { status, showError, showSuccess } = useInteractionStatus();
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

  const handleClear = async () => {
    setIsClearing(true);

    try {
      clearPreview();
      clearWalletInteraction();
      showSuccess('Preview and wallet interaction state cleared.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to clear current preview.';
      showError(message);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <Screen contentContainerStyle={styles.content}>
      <SectionHeader
        title="Transaction preview"
        subtitle="Review, copy, and hand off contract call payloads through wallet deep links"
      />

      <InteractionStatusBanner status={status} />

      <WalletInteractionCard preview={preview} walletInteraction={walletInteraction} />
      <TransactionPreviewPanel preview={preview} />

      <ActionButton
        disabled={(!preview && !walletInteraction) || isClearing}
        fullWidth
        label="Clear current preview"
        loading={isClearing}
        loadingLabel="Clearing"
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

import * as Linking from 'expo-linking';
import { StyleSheet, View } from 'react-native';
import { useAddressState } from '@/app/state';
import { useState } from 'react';
import { ActionButton, Card, EmptyState, InteractionStatusBanner, MetricRow, Screen, SectionHeader } from '@/shared/components';
import { useInteractionStatus } from '@/shared/hooks/useInteractionStatus';
import { formatAddress } from '@/shared/utils';
import { spacing } from '@/shared/theme';

export function AccountScreen() {
  const { activeAddress, clearAddress } = useAddressState();
  const [isOpeningExplorer, setIsOpeningExplorer] = useState(false);
  const [isClearingAddress, setIsClearingAddress] = useState(false);
  const { status, showError, showSuccess } = useInteractionStatus();

  const openExplorer = async () => {
    if (!activeAddress) {
      return;
    }

    setIsOpeningExplorer(true);

    try {
      const explorerUrl = `https://explorer.hiro.so/address/${activeAddress}?chain=mainnet`;
      await Linking.openURL(explorerUrl);
      showSuccess('Explorer opened successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to open explorer link.';
      showError(message);
    } finally {
      setIsOpeningExplorer(false);
    }
  };

  const handleClearAddress = async () => {
    setIsClearingAddress(true);

    try {
      await clearAddress();
      showSuccess('Saved address cleared.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to clear saved address.';
      showError(message);
    } finally {
      setIsClearingAddress(false);
    }
  };

  return (
    <Screen contentContainerStyle={styles.content}>
      <SectionHeader
        title="Account"
        subtitle="Manage your tracked address and inspect chain activity"
      />

      <InteractionStatusBanner status={status} />

      {!activeAddress ? (
        <EmptyState message="No address is currently saved. Set one in the Overview tab." />
      ) : (
        <Card>
          <MetricRow label="Tracked address" value={formatAddress(activeAddress)} hint={activeAddress} tone="accent" />

          <View style={styles.actions}>
            <ActionButton
              label="Open in Hiro Explorer"
              loading={isOpeningExplorer}
              loadingLabel="Opening"
              onPress={openExplorer}
              fullWidth
            />
            <ActionButton
              label="Clear saved address"
              onPress={handleClearAddress}
              fullWidth
              variant="secondary"
              loading={isClearingAddress}
              loadingLabel="Clearing"
              disabled={isOpeningExplorer}
            />
          </View>
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});

import * as Linking from 'expo-linking';
import { StyleSheet, View } from 'react-native';
import { useAddressState } from '@/app/state';
import { ActionButton, Card, EmptyState, MetricRow, Screen, SectionHeader } from '@/shared/components';
import { formatAddress } from '@/shared/utils';
import { spacing } from '@/shared/theme';

export function AccountScreen() {
  const { activeAddress, clearAddress } = useAddressState();

  const openExplorer = async () => {
    if (!activeAddress) {
      return;
    }

    const explorerUrl = `https://explorer.hiro.so/address/${activeAddress}?chain=mainnet`;
    await Linking.openURL(explorerUrl);
  };

  return (
    <Screen contentContainerStyle={styles.content}>
      <SectionHeader
        title="Account"
        subtitle="Manage your tracked address and inspect chain activity"
      />

      {!activeAddress ? (
        <EmptyState message="No address is currently saved. Set one in the Overview tab." />
      ) : (
        <Card>
          <MetricRow label="Tracked address" value={formatAddress(activeAddress)} hint={activeAddress} tone="accent" />

          <View style={styles.actions}>
            <ActionButton label="Open in Hiro Explorer" onPress={openExplorer} fullWidth />
            <ActionButton label="Clear saved address" onPress={clearAddress} fullWidth variant="secondary" />
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

import * as Linking from 'expo-linking';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAddress } from '@/features/address';
import { EmptyState, Screen, SectionHeader } from '@/shared/components';
import { formatAddress } from '@/shared/utils';
import { palette, radius, spacing, typography } from '@/shared/theme';

function ActionButton({
  label,
  onPress,
  isPrimary,
}: {
  label: string;
  onPress: () => void | Promise<void>;
  isPrimary?: boolean;
}) {
  return (
    <Pressable
      onPress={() => {
        void onPress();
      }}
      style={({ pressed }) => [
        styles.actionButton,
        isPrimary ? styles.primaryButton : styles.secondaryButton,
        pressed && styles.pressed,
      ]}
    >
      <Text style={isPrimary ? styles.primaryButtonText : styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function AccountScreen() {
  const { activeAddress, clearAddress } = useAddress();

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
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Tracked address</Text>
          <Text style={styles.addressText}>{formatAddress(activeAddress)}</Text>
          <Text style={styles.addressHint}>{activeAddress}</Text>

          <View style={styles.actions}>
            <ActionButton label="Open in Hiro Explorer" onPress={openExplorer} isPrimary />
            <ActionButton label="Clear saved address" onPress={clearAddress} />
          </View>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
  },
  card: {
    backgroundColor: palette.card,
    borderColor: palette.cloud,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
  },
  cardLabel: {
    color: palette.steel,
    fontSize: typography.label,
    fontWeight: '700',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  addressText: {
    color: palette.ink,
    fontSize: typography.heading,
    fontWeight: '800',
  },
  addressHint: {
    color: palette.slate,
    fontSize: typography.body,
    marginTop: spacing.xs,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: radius.md,
    justifyContent: 'center',
    minHeight: 44,
  },
  primaryButton: {
    backgroundColor: palette.accent,
  },
  secondaryButton: {
    backgroundColor: palette.surface,
    borderColor: palette.cloud,
    borderWidth: 1,
  },
  primaryButtonText: {
    color: palette.card,
    fontSize: typography.body,
    fontWeight: '700',
  },
  secondaryButtonText: {
    color: palette.ink,
    fontSize: typography.body,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.82,
  },
});

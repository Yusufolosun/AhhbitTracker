import { Pressable, StyleSheet, Text } from 'react-native';
import { TransactionPreviewPanel, usePreview } from '@/features/transactions';
import { Screen, SectionHeader } from '@/shared/components';
import { palette, radius, spacing, typography } from '@/shared/theme';

export function PreviewScreen() {
  const { preview, clearPreview } = usePreview();

  return (
    <Screen contentContainerStyle={styles.content}>
      <SectionHeader
        title="Transaction preview"
        subtitle="Review and copy contract call payloads before wallet signing"
      />

      <TransactionPreviewPanel preview={preview} />

      <Pressable
        disabled={!preview}
        onPress={clearPreview}
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

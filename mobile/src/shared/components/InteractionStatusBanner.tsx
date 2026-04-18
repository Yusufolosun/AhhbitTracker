import { StyleSheet, Text, View } from 'react-native';
import type { InteractionStatus } from '@/shared/hooks/useInteractionStatus';
import { radius, spacing, typography } from '@/shared/theme';

interface InteractionStatusBannerProps {
  status: InteractionStatus | null;
}

export function InteractionStatusBanner({ status }: InteractionStatusBannerProps) {
  if (!status) {
    return null;
  }

  return (
    <View
      style={[
        styles.base,
        status.tone === 'success' ? styles.success : null,
        status.tone === 'error' ? styles.error : null,
        status.tone === 'info' ? styles.info : null,
      ]}
    >
      <Text style={styles.text}>{status.message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  text: {
    fontSize: typography.body,
    fontWeight: '600',
  },
  success: {
    backgroundColor: '#EAF7F1',
    borderColor: '#B9E2CF',
  },
  error: {
    backgroundColor: '#FDEEEE',
    borderColor: '#F3BCB4',
  },
  info: {
    backgroundColor: '#EEF3FA',
    borderColor: '#C7D4E6',
  },
});

import { StyleSheet, Text } from 'react-native';
import { palette, spacing, typography } from '@/shared/theme';

interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return <Text style={styles.empty}>{message}</Text>;
}

const styles = StyleSheet.create({
  empty: {
    color: palette.steel,
    fontSize: typography.body,
    marginTop: spacing.md,
  },
});

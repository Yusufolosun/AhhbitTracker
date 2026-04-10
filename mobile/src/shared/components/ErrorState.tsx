import { StyleSheet, Text } from 'react-native';
import { palette, spacing, typography } from '@/shared/theme';

interface ErrorStateProps {
  message: string;
}

export function ErrorState({ message }: ErrorStateProps) {
  return <Text style={styles.error}>{message}</Text>;
}

const styles = StyleSheet.create({
  error: {
    color: palette.danger,
    fontSize: typography.body,
    marginTop: spacing.md,
  },
});

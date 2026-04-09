import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { PoolBalance } from '../types';
import { palette, radius, spacing, typography } from '../styles/theme';

interface PoolBalanceCardProps {
  data: PoolBalance | undefined;
  isLoading: boolean;
  error: Error | null;
}

export function PoolBalanceCard({ data, isLoading, error }: PoolBalanceCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Forfeited Pool</Text>
      {isLoading ? (
        <ActivityIndicator color={palette.accent} size="small" />
      ) : null}
      {!isLoading && error ? <Text style={styles.error}>{error.message}</Text> : null}
      {!isLoading && !error ? (
        <Text style={styles.value}>{data ? `${data.stx} STX` : '0.00 STX'}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.ink,
    borderRadius: radius.lg,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  label: {
    color: palette.cloud,
    fontSize: typography.label,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  value: {
    color: palette.card,
    fontSize: typography.heading,
    fontWeight: '700',
  },
  error: {
    color: '#FECACA',
    fontSize: typography.body,
  },
});

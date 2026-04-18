import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { PoolBalance } from '@/core/types';
import { Card } from '@/shared/components';
import { palette, radius, spacing, typography } from '@/shared/theme';

interface PoolBalanceCardProps {
  data: PoolBalance | undefined;
  isLoading: boolean;
  error: Error | null;
}

export function PoolBalanceCard({ data, isLoading, error }: PoolBalanceCardProps) {
  return (
    <Card style={styles.card} tone={error ? 'danger' : 'accent'}>
      <Text style={styles.label}>Forfeited Pool</Text>
      {isLoading ? (
        <ActivityIndicator color={palette.accent} size="small" />
      ) : null}
      {!isLoading && error ? <Text style={styles.error}>{error.message}</Text> : null}
      {!isLoading && !error ? (
        <View>
          <Text style={styles.value}>{data ? `${data.stx} STX` : '0.00 STX'}</Text>
          <Text style={styles.meta}>
            Next bonus est.: {data ? `${data.estimatedBonusShareStx} STX` : '0.00 STX'}
          </Text>
          <Text style={styles.meta}>
            Pending claimants: {data ? data.unclaimedCompletedHabits : 0}
          </Text>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.md,
  },
  label: {
    color: palette.ink,
    fontSize: typography.label,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  value: {
    color: palette.ink,
    fontSize: typography.heading,
    fontWeight: '700',
  },
  meta: {
    color: palette.cloud,
    fontSize: typography.label,
    marginTop: spacing.xs,
  },
  error: {
    color: palette.danger,
    fontSize: typography.body,
  },
});

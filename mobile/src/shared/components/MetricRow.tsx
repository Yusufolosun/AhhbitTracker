import { StyleSheet, Text, View } from 'react-native';
import { palette, spacing, typography } from '@/shared/theme';

type MetricTone = 'default' | 'accent' | 'success' | 'warning' | 'danger';

interface MetricRowProps {
  label: string;
  value: string | number;
  hint?: string;
  tone?: MetricTone;
}

const valueColors: Record<MetricTone, string> = {
  default: palette.ink,
  accent: palette.accent,
  success: palette.success,
  warning: palette.warning,
  danger: palette.danger,
};

export function MetricRow({ label, value, hint, tone = 'default' }: MetricRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.labelWrap}>
        <Text style={styles.label}>{label}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      <Text style={[styles.value, { color: valueColors[tone] }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  labelWrap: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  label: {
    color: palette.steel,
    fontSize: typography.label,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  hint: {
    color: palette.slate,
    fontSize: typography.label,
    marginTop: 2,
  },
  value: {
    fontSize: typography.body,
    fontWeight: '700',
    textAlign: 'right',
  },
});
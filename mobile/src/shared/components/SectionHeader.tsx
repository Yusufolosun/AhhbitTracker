import { StyleSheet, Text, View } from 'react-native';
import { palette, spacing, typography } from '@/shared/theme';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  title: {
    color: palette.ink,
    fontSize: typography.heading,
    fontWeight: '700',
  },
  subtitle: {
    color: palette.steel,
    fontSize: typography.body,
    marginTop: spacing.xs,
  },
});

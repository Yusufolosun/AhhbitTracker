import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { palette, radius, spacing } from '@/shared/theme';

interface CardProps extends PropsWithChildren {
  style?: ViewStyle;
}

export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.card,
    borderColor: palette.cloud,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
  },
});

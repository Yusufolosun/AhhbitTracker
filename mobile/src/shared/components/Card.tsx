import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { palette, radius, spacing } from '@/shared/theme';

type CardTone = 'default' | 'accent' | 'inverse' | 'success' | 'warning' | 'danger';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends PropsWithChildren {
  style?: StyleProp<ViewStyle>;
  tone?: CardTone;
  padding?: CardPadding;
}

const toneStyles: Record<CardTone, ViewStyle> = {
  default: {
    backgroundColor: palette.card,
    borderColor: palette.cloud,
  },
  accent: {
    backgroundColor: '#FFF5ED',
    borderColor: '#F5C6B7',
  },
  inverse: {
    backgroundColor: palette.ink,
    borderColor: '#1E293B',
  },
  success: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  warning: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FCD34D',
  },
  danger: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
};

const paddingStyles: Record<CardPadding, ViewStyle> = {
  none: {
    padding: 0,
  },
  sm: {
    padding: spacing.sm,
  },
  md: {
    padding: spacing.md,
  },
  lg: {
    padding: spacing.lg,
  },
};

export function Card({ children, style, tone = 'default', padding = 'md' }: CardProps) {
  return <View style={[styles.card, toneStyles[tone], paddingStyles[padding], style]}>{children}</View>;
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

import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { palette, radius, spacing, typography } from '@/shared/theme';

type ActionButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';

interface ActionButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  label: string;
  variant?: ActionButtonVariant;
  loading?: boolean;
  loadingLabel?: string;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  leadingIcon?: ReactNode;
}

const variantStyles: Record<ActionButtonVariant, { container: ViewStyle; text: TextStyle; spinner: string }> = {
  primary: {
    container: {
      backgroundColor: palette.accent,
      borderColor: palette.accent,
    },
    text: {
      color: palette.card,
    },
    spinner: palette.card,
  },
  secondary: {
    container: {
      backgroundColor: palette.surface,
      borderColor: palette.cloud,
    },
    text: {
      color: palette.ink,
    },
    spinner: palette.ink,
  },
  ghost: {
    container: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
    },
    text: {
      color: palette.steel,
    },
    spinner: palette.steel,
  },
  destructive: {
    container: {
      backgroundColor: palette.danger,
      borderColor: palette.danger,
    },
    text: {
      color: palette.card,
    },
    spinner: palette.card,
  },
};

export function ActionButton({
  label,
  variant = 'primary',
  loading = false,
  loadingLabel,
  fullWidth = false,
  style,
  textStyle,
  leadingIcon,
  disabled,
  ...pressableProps
}: ActionButtonProps) {
  const resolved = variantStyles[variant];

  return (
    <Pressable
      {...pressableProps}
      accessibilityRole="button"
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        resolved.container,
        fullWidth && styles.fullWidth,
        disabled || loading ? styles.disabled : null,
        pressed && !disabled && !loading ? styles.pressed : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={resolved.spinner} />
      ) : (
        <>
          {leadingIcon ? <>{leadingIcon}</> : null}
          <Text style={[styles.label, resolved.text, textStyle]}>{label}</Text>
        </>
      )}
      {loading && loadingLabel ? <Text style={[styles.loadingLabel, resolved.text]}>{loadingLabel}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  fullWidth: {
    width: '100%',
  },
  label: {
    fontSize: typography.body,
    fontWeight: '700',
  },
  loadingLabel: {
    fontSize: typography.label,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.85,
  },
});
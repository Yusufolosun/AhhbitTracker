import { DefaultTheme, type Theme } from '@react-navigation/native';
import { palette } from '@/shared/theme';

export const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: palette.surface,
    card: palette.card,
    text: palette.ink,
    border: palette.cloud,
    primary: palette.accent,
    notification: palette.danger,
  },
};

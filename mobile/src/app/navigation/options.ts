import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { palette, typography } from '@/shared/theme';

export const stackScreenOptions: NativeStackNavigationOptions = {
  headerShadowVisible: false,
  headerStyle: {
    backgroundColor: palette.card,
  },
  headerTintColor: palette.ink,
  headerTitleStyle: {
    color: palette.ink,
    fontSize: typography.body,
    fontWeight: '700',
  },
  contentStyle: {
    backgroundColor: palette.surface,
  },
};

export const mainTabScreenOptions: BottomTabNavigationOptions = {
  headerShown: false,
  tabBarActiveTintColor: palette.accent,
  tabBarInactiveTintColor: palette.steel,
  tabBarStyle: {
    backgroundColor: palette.card,
    borderTopColor: palette.cloud,
  },
  tabBarLabelStyle: {
    fontSize: 12,
    fontWeight: '700',
    paddingBottom: 2,
  },
};

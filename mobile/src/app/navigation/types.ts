import type {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { WalletInteractionRouteParams } from '@/features/wallet';

export const ROOT_ROUTES = {
  MainTabs: 'MainTabs',
  HabitDetails: 'HabitDetails',
  CreateHabit: 'CreateHabit',
} as const;

export const MAIN_TAB_ROUTES = {
  Overview: 'Overview',
  Habits: 'Habits',
  Notifications: 'Notifications',
  Preview: 'Preview',
  Account: 'Account',
} as const;

export type PreviewRouteParams = WalletInteractionRouteParams;

export type MainTabParamList = {
  Overview: undefined;
  Habits: undefined;
  Notifications: undefined;
  Preview: PreviewRouteParams | undefined;
  Account: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  HabitDetails: { habitId: number };
  CreateHabit: undefined;
};

export type RootStackScreenProps<RouteName extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, RouteName>;

export type MainTabScreenProps<RouteName extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, RouteName>,
    NativeStackScreenProps<RootStackParamList>
  >;
